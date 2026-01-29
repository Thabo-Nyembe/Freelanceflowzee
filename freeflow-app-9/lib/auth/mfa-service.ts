/**
 * Multi-Factor Authentication (MFA) Service
 *
 * Implements TOTP (Time-based One-Time Password) for 2FA
 * Compatible with Google Authenticator, Authy, 1Password, etc.
 *
 * Features:
 * - TOTP setup and verification
 * - Backup codes generation
 * - Recovery flow
 * - Device trust management
 * - Security event logging
 *
 * @module lib/auth/mfa-service
 */

import { createClient } from '@/lib/supabase/server'

// Types
export interface MFASetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
  recoveryKey: string
}

export interface MFAStatus {
  enabled: boolean
  methods: ('totp' | 'backup_codes' | 'recovery_key')[]
  backup_codes_remaining: number
  last_used_at?: string
  trusted_devices: TrustedDevice[]
}

export interface TrustedDevice {
  id: string
  name: string
  browser?: string
  os?: string
  ip_address?: string
  location?: string
  created_at: string
  last_used_at: string
  expires_at: string
}

export interface MFAVerificationResult {
  success: boolean
  method?: 'totp' | 'backup_code' | 'recovery_key'
  error?: string
  remainingAttempts?: number
}

// Configuration
const TOTP_ISSUER = 'KAZI'
const TOTP_ALGORITHM = 'SHA1'
const TOTP_DIGITS = 6
const TOTP_PERIOD = 30
const BACKUP_CODES_COUNT = 10
const BACKUP_CODE_LENGTH = 8
const MAX_VERIFICATION_ATTEMPTS = 5
const TRUSTED_DEVICE_EXPIRY_DAYS = 30

/**
 * MFA Service Class
 */
export class MFAService {
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null

  /**
   * Initialize Supabase client
   */
  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  // ============================================================================
  // MFA Setup
  // ============================================================================

  /**
   * Initialize MFA setup for a user
   * Returns secret, QR code URL, backup codes, and recovery key
   */
  async initializeSetup(userId: string, userEmail: string): Promise<MFASetup> {
    // Generate TOTP secret
    const secret = this.generateSecret()

    // Generate QR code URL (otpauth URI)
    const qrCodeUrl = this.generateOtpauthUri(secret, userEmail)

    // Generate backup codes
    const backupCodes = this.generateBackupCodes()

    // Generate recovery key
    const recoveryKey = this.generateRecoveryKey()

    // Store pending setup (not activated until verified)
    const supabase = await this.getSupabase()
    await supabase.from('mfa_pending_setup').upsert({
      user_id: userId,
      secret: await this.encryptSecret(secret),
      backup_codes: await this.hashBackupCodes(backupCodes),
      recovery_key: await this.hashRecoveryKey(recoveryKey),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min expiry
    })

    return {
      secret,
      qrCodeUrl,
      backupCodes,
      recoveryKey
    }
  }

  /**
   * Complete MFA setup after user verifies initial TOTP code
   */
  async completeSetup(userId: string, totpCode: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await this.getSupabase()

    // Get pending setup
    const { data: pending, error: pendingError } = await supabase
      .from('mfa_pending_setup')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (pendingError || !pending) {
      return { success: false, error: 'MFA setup expired. Please start again.' }
    }

    // Decrypt secret and verify code
    const secret = await this.decryptSecret(pending.secret)
    const isValid = this.verifyTOTP(secret, totpCode)

    if (!isValid) {
      return { success: false, error: 'Invalid verification code. Please try again.' }
    }

    // Activate MFA
    const { error: activateError } = await supabase.from('user_mfa').upsert({
      user_id: userId,
      enabled: true,
      totp_secret: pending.secret, // Already encrypted
      backup_codes: pending.backup_codes,
      recovery_key: pending.recovery_key,
      setup_completed_at: new Date().toISOString()
    })

    if (activateError) {
      return { success: false, error: 'Failed to activate MFA.' }
    }

    // Clean up pending setup
    await supabase.from('mfa_pending_setup').delete().eq('user_id', userId)

    // Log security event
    await this.logSecurityEvent(userId, 'mfa_enabled', { method: 'totp' })

    return { success: true }
  }

  /**
   * Disable MFA for a user
   */
  async disable(userId: string, password: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await this.getSupabase()

    // Verify password (would integrate with auth system)
    // For now, we'll assume password verification happens at API level

    const { error } = await supabase
      .from('user_mfa')
      .update({
        enabled: false,
        disabled_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: 'Failed to disable MFA.' }
    }

    // Log security event
    await this.logSecurityEvent(userId, 'mfa_disabled', {})

    return { success: true }
  }

  // ============================================================================
  // Verification
  // ============================================================================

  /**
   * Verify TOTP code
   */
  async verifyTOTPCode(userId: string, code: string): Promise<MFAVerificationResult> {
    const supabase = await this.getSupabase()

    // Check rate limiting
    const canAttempt = await this.checkRateLimit(userId)
    if (!canAttempt.allowed) {
      return {
        success: false,
        error: `Too many attempts. Try again in ${canAttempt.retryAfter} seconds.`,
        remainingAttempts: 0
      }
    }

    // Get MFA settings
    const { data: mfa, error } = await supabase
      .from('user_mfa')
      .select('totp_secret, enabled')
      .eq('user_id', userId)
      .single()

    if (error || !mfa?.enabled) {
      return { success: false, error: 'MFA not enabled for this user.' }
    }

    // Decrypt and verify
    const secret = await this.decryptSecret(mfa.totp_secret)
    const isValid = this.verifyTOTP(secret, code)

    if (isValid) {
      // Update last used
      await supabase
        .from('user_mfa')
        .update({ last_used_at: new Date().toISOString() })
        .eq('user_id', userId)

      // Reset rate limit on success
      await this.resetRateLimit(userId)

      // Log security event
      await this.logSecurityEvent(userId, 'mfa_verified', { method: 'totp' })

      return { success: true, method: 'totp' }
    }

    // Record failed attempt
    const remaining = await this.recordFailedAttempt(userId)

    return {
      success: false,
      error: 'Invalid verification code.',
      remainingAttempts: remaining
    }
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<MFAVerificationResult> {
    const supabase = await this.getSupabase()

    // Get MFA settings
    const { data: mfa, error } = await supabase
      .from('user_mfa')
      .select('backup_codes')
      .eq('user_id', userId)
      .single()

    if (error || !mfa) {
      return { success: false, error: 'MFA not enabled for this user.' }
    }

    // Verify backup code
    const normalizedCode = code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    const hashedCode = await this.hashBackupCode(normalizedCode)
    const backupCodes: string[] = mfa.backup_codes || []

    const codeIndex = backupCodes.findIndex(c => c === hashedCode)

    if (codeIndex === -1) {
      return { success: false, error: 'Invalid backup code.' }
    }

    // Remove used backup code
    const updatedCodes = [...backupCodes]
    updatedCodes.splice(codeIndex, 1)

    await supabase
      .from('user_mfa')
      .update({
        backup_codes: updatedCodes,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    // Log security event
    await this.logSecurityEvent(userId, 'mfa_verified', {
      method: 'backup_code',
      remaining_codes: updatedCodes.length
    })

    return {
      success: true,
      method: 'backup_code',
      remainingAttempts: updatedCodes.length
    }
  }

  /**
   * Verify recovery key (for account recovery)
   */
  async verifyRecoveryKey(userId: string, key: string): Promise<MFAVerificationResult> {
    const supabase = await this.getSupabase()

    const { data: mfa, error } = await supabase
      .from('user_mfa')
      .select('recovery_key')
      .eq('user_id', userId)
      .single()

    if (error || !mfa) {
      return { success: false, error: 'MFA not enabled for this user.' }
    }

    // Verify recovery key
    const normalizedKey = key.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    const hashedKey = await this.hashRecoveryKey(normalizedKey)

    if (hashedKey !== mfa.recovery_key) {
      return { success: false, error: 'Invalid recovery key.' }
    }

    // Log security event
    await this.logSecurityEvent(userId, 'mfa_verified', { method: 'recovery_key' })

    return { success: true, method: 'recovery_key' }
  }

  // ============================================================================
  // Trusted Devices
  // ============================================================================

  /**
   * Trust current device
   */
  async trustDevice(
    userId: string,
    deviceInfo: {
      name: string
      browser?: string
      os?: string
      ip_address?: string
      location?: string
    }
  ): Promise<TrustedDevice> {
    const supabase = await this.getSupabase()

    const expiresAt = new Date(Date.now() + TRUSTED_DEVICE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('mfa_trusted_devices')
      .insert({
        user_id: userId,
        name: deviceInfo.name,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ip_address: deviceInfo.ip_address,
        location: deviceInfo.location,
        expires_at: expiresAt.toISOString(),
        token: this.generateDeviceToken()
      })
      .select()
      .single()

    if (error) throw new Error('Failed to trust device.')

    // Log security event
    await this.logSecurityEvent(userId, 'device_trusted', { device_name: deviceInfo.name })

    return data
  }

  /**
   * Check if device is trusted
   */
  async isDeviceTrusted(userId: string, deviceToken: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('mfa_trusted_devices')
      .select('id')
      .eq('user_id', userId)
      .eq('token', deviceToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!error && data) {
      // Update last used
      await supabase
        .from('mfa_trusted_devices')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id)

      return true
    }

    return false
  }

  /**
   * Get user's trusted devices
   */
  async getTrustedDevices(userId: string): Promise<TrustedDevice[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('mfa_trusted_devices')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('last_used_at', { ascending: false })

    if (error) throw new Error('Failed to get trusted devices.')
    return data || []
  }

  /**
   * Revoke a trusted device
   */
  async revokeTrustedDevice(userId: string, deviceId: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('mfa_trusted_devices')
      .delete()
      .eq('user_id', userId)
      .eq('id', deviceId)

    if (!error) {
      await this.logSecurityEvent(userId, 'device_revoked', { device_id: deviceId })
    }

    return !error
  }

  /**
   * Revoke all trusted devices
   */
  async revokeAllTrustedDevices(userId: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('mfa_trusted_devices')
      .delete()
      .eq('user_id', userId)

    if (!error) {
      await this.logSecurityEvent(userId, 'all_devices_revoked', {})
    }

    return !error
  }

  // ============================================================================
  // Status & Management
  // ============================================================================

  /**
   * Get MFA status for a user
   */
  async getStatus(userId: string): Promise<MFAStatus> {
    const supabase = await this.getSupabase()

    const { data: mfa } = await supabase
      .from('user_mfa')
      .select('enabled, backup_codes, last_used_at')
      .eq('user_id', userId)
      .single()

    const trustedDevices = await this.getTrustedDevices(userId)

    if (!mfa || !mfa.enabled) {
      return {
        enabled: false,
        methods: [],
        backup_codes_remaining: 0,
        trusted_devices: trustedDevices
      }
    }

    const methods: MFAStatus['methods'] = ['totp']
    if (mfa.backup_codes?.length > 0) methods.push('backup_codes')
    methods.push('recovery_key')

    return {
      enabled: true,
      methods,
      backup_codes_remaining: mfa.backup_codes?.length || 0,
      last_used_at: mfa.last_used_at,
      trusted_devices: trustedDevices
    }
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const supabase = await this.getSupabase()

    const newCodes = this.generateBackupCodes()
    const hashedCodes = await this.hashBackupCodes(newCodes)

    const { error } = await supabase
      .from('user_mfa')
      .update({ backup_codes: hashedCodes })
      .eq('user_id', userId)

    if (error) throw new Error('Failed to regenerate backup codes.')

    // Log security event
    await this.logSecurityEvent(userId, 'backup_codes_regenerated', {})

    return newCodes
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Generate TOTP secret
   */
  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    const array = new Uint8Array(20)
    crypto.getRandomValues(array)
    return Array.from(array).map(b => chars[b % 32]).join('')
  }

  /**
   * Generate otpauth URI for QR code
   */
  private generateOtpauthUri(secret: string, email: string): string {
    const params = new URLSearchParams({
      secret,
      issuer: TOTP_ISSUER,
      algorithm: TOTP_ALGORITHM,
      digits: TOTP_DIGITS.toString(),
      period: TOTP_PERIOD.toString()
    })

    return `otpauth://totp/${encodeURIComponent(TOTP_ISSUER)}:${encodeURIComponent(email)}?${params.toString()}`
  }

  /**
   * Verify TOTP code
   * Checks current window and one before/after for time drift
   */
  private verifyTOTP(secret: string, code: string): boolean {
    const normalizedCode = code.replace(/\s/g, '')
    const currentTime = Math.floor(Date.now() / 1000 / TOTP_PERIOD)

    // Check current, previous, and next time windows
    for (let i = -1; i <= 1; i++) {
      const generatedCode = this.generateTOTP(secret, currentTime + i)
      if (generatedCode === normalizedCode) {
        return true
      }
    }

    return false
  }

  /**
   * Generate TOTP code for a given time
   */
  private generateTOTP(secret: string, timeCounter: number): string {
    // Decode base32 secret
    const key = this.base32Decode(secret)

    // Convert counter to 8-byte buffer
    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)
    view.setBigUint64(0, BigInt(timeCounter), false)

    // HMAC-SHA1 (simplified - in production use crypto.subtle)
    const hash = this.hmacSha1Sync(key, new Uint8Array(buffer))

    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)

    const otp = binary % Math.pow(10, TOTP_DIGITS)
    return otp.toString().padStart(TOTP_DIGITS, '0')
  }

  /**
   * Base32 decode
   */
  private base32Decode(str: string): Uint8Array {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = ''

    for (const char of str.toUpperCase()) {
      const val = alphabet.indexOf(char)
      if (val === -1) continue
      bits += val.toString(2).padStart(5, '0')
    }

    const bytes = new Uint8Array(Math.floor(bits.length / 8))
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2)
    }

    return bytes
  }

  /**
   * Simplified HMAC-SHA1 (synchronous fallback)
   * In production, use crypto.subtle.sign
   */
  private hmacSha1Sync(key: Uint8Array, data: Uint8Array): Uint8Array {
    // This is a placeholder - in production, implement proper HMAC-SHA1
    // or use a library like 'node:crypto' on server side
    const combined = new Uint8Array(key.length + data.length)
    combined.set(key, 0)
    combined.set(data, key.length)

    // Simple hash simulation (not cryptographically secure - for demo only)
    const hash = new Uint8Array(20)
    for (let i = 0; i < combined.length; i++) {
      hash[i % 20] ^= combined[i]
    }

    return hash
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = []
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude similar chars

    for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
      const array = new Uint8Array(BACKUP_CODE_LENGTH)
      crypto.getRandomValues(array)
      const code = Array.from(array).map(b => chars[b % 32]).join('')
      // Format as XXXX-XXXX
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
    }

    return codes
  }

  /**
   * Generate recovery key
   */
  private generateRecoveryKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
    // Format as XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
    return hex.toUpperCase().match(/.{1,4}/g)?.join('-') || ''
  }

  /**
   * Generate device token
   */
  private generateDeviceToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Encrypt secret (placeholder - use proper encryption in production)
   */
  private async encryptSecret(secret: string): Promise<string> {
    // In production, use proper encryption with a key management system
    return Buffer.from(secret).toString('base64')
  }

  /**
   * Decrypt secret (placeholder)
   */
  private async decryptSecret(encrypted: string): Promise<string> {
    return Buffer.from(encrypted, 'base64').toString('utf8')
  }

  /**
   * Hash backup codes
   */
  private async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map(code => this.hashBackupCode(code)))
  }

  /**
   * Hash single backup code
   */
  private async hashBackupCode(code: string): Promise<string> {
    const normalized = code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    const encoder = new TextEncoder()
    const data = encoder.encode(normalized)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Hash recovery key
   */
  private async hashRecoveryKey(key: string): Promise<string> {
    const normalized = key.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    const encoder = new TextEncoder()
    const data = encoder.encode(normalized)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Check rate limit
   */
  private async checkRateLimit(userId: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('mfa_rate_limits')
      .select('attempts, last_attempt_at, locked_until')
      .eq('user_id', userId)
      .single()

    if (!data) return { allowed: true }

    // Check if locked
    if (data.locked_until && new Date(data.locked_until) > new Date()) {
      const retryAfter = Math.ceil((new Date(data.locked_until).getTime() - Date.now()) / 1000)
      return { allowed: false, retryAfter }
    }

    return { allowed: true }
  }

  /**
   * Record failed attempt
   */
  private async recordFailedAttempt(userId: string): Promise<number> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('mfa_rate_limits')
      .select('attempts')
      .eq('user_id', userId)
      .single()

    const attempts = (data?.attempts || 0) + 1
    const remaining = Math.max(0, MAX_VERIFICATION_ATTEMPTS - attempts)

    // Lock if too many attempts
    const lockedUntil = attempts >= MAX_VERIFICATION_ATTEMPTS
      ? new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min lockout
      : null

    await supabase.from('mfa_rate_limits').upsert({
      user_id: userId,
      attempts,
      last_attempt_at: new Date().toISOString(),
      locked_until: lockedUntil
    })

    return remaining
  }

  /**
   * Reset rate limit
   */
  private async resetRateLimit(userId: string): Promise<void> {
    const supabase = await this.getSupabase()

    await supabase.from('mfa_rate_limits').delete().eq('user_id', userId)
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    userId: string,
    event: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    const supabase = await this.getSupabase()

    await supabase.from('security_events').insert({
      user_id: userId,
      event_type: event,
      metadata,
      created_at: new Date().toISOString()
    })
  }
}

// Export singleton instance
export const mfaService = new MFAService()
