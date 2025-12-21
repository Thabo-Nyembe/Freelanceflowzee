/**
 * Supabase Security Email Templates Integration
 *
 * Supabase 2025 Feature: Security Email Templates
 * Notifications for password changes, email changes, MFA status
 *
 * @see https://supabase.com/changelog
 */

import { createClient } from '@/lib/supabase/client'
import { createServerClient } from '@/lib/supabase/server'

// ============================================
// SECURITY EVENT TYPES
// ============================================

export type SecurityEventType =
  | 'password_change'
  | 'email_change'
  | 'phone_change'
  | 'mfa_enrolled'
  | 'mfa_unenrolled'
  | 'identity_linked'
  | 'identity_unlinked'
  | 'new_device_login'
  | 'suspicious_login'
  | 'account_locked'
  | 'account_unlocked'
  | 'session_revoked'
  | 'api_key_created'
  | 'api_key_revoked'

export interface SecurityEventInput {
  userId: string
  eventType: SecurityEventType
  ipAddress?: string
  userAgent?: string
  oldValue?: string
  newValue?: string
  metadata?: Record<string, unknown>
}

// ============================================
// LOG SECURITY EVENTS
// ============================================

/**
 * Log a security event (triggers email notification)
 */
export async function logSecurityEvent(input: SecurityEventInput) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('log_security_email_event', {
    p_user_id: input.userId,
    p_event_type: input.eventType,
    p_ip_address: input.ipAddress || null,
    p_user_agent: input.userAgent || null,
    p_old_value: input.oldValue || null,
    p_new_value: input.newValue || null,
    p_metadata: input.metadata || {},
  })

  if (error) throw error
  return { eventId: data }
}

/**
 * Log password change event
 */
export async function logPasswordChange(
  userId: string,
  ipAddress?: string,
  userAgent?: string
) {
  return logSecurityEvent({
    userId,
    eventType: 'password_change',
    ipAddress,
    userAgent,
    metadata: { changedAt: new Date().toISOString() },
  })
}

/**
 * Log email change event
 */
export async function logEmailChange(
  userId: string,
  oldEmail: string,
  newEmail: string,
  ipAddress?: string
) {
  return logSecurityEvent({
    userId,
    eventType: 'email_change',
    oldValue: maskEmail(oldEmail),
    newValue: maskEmail(newEmail),
    ipAddress,
    metadata: { oldEmail: maskEmail(oldEmail), newEmail: maskEmail(newEmail) },
  })
}

/**
 * Log MFA enrollment event
 */
export async function logMFAEnrollment(
  userId: string,
  method: 'totp' | 'sms' | 'email',
  ipAddress?: string
) {
  return logSecurityEvent({
    userId,
    eventType: 'mfa_enrolled',
    ipAddress,
    metadata: { method },
  })
}

/**
 * Log MFA unenrollment event
 */
export async function logMFAUnenrollment(
  userId: string,
  method: 'totp' | 'sms' | 'email',
  ipAddress?: string
) {
  return logSecurityEvent({
    userId,
    eventType: 'mfa_unenrolled',
    ipAddress,
    metadata: { method },
  })
}

/**
 * Log new device login
 */
export async function logNewDeviceLogin(
  userId: string,
  deviceInfo: {
    deviceType: string
    browser: string
    os: string
    fingerprint: string
  },
  location: {
    country?: string
    city?: string
    region?: string
  },
  ipAddress: string
) {
  return logSecurityEvent({
    userId,
    eventType: 'new_device_login',
    ipAddress,
    metadata: { device: deviceInfo, location },
  })
}

/**
 * Log identity provider linked
 */
export async function logIdentityLinked(
  userId: string,
  provider: string,
  providerEmail: string,
  ipAddress?: string
) {
  return logSecurityEvent({
    userId,
    eventType: 'identity_linked',
    ipAddress,
    metadata: { provider, providerEmail: maskEmail(providerEmail) },
  })
}

// ============================================
// SECURITY PREFERENCES
// ============================================

export interface SecurityPreferences {
  notifyPasswordChange: boolean
  notifyEmailChange: boolean
  notifyPhoneChange: boolean
  notifyMfaChange: boolean
  notifyNewDevice: boolean
  notifySuspiciousActivity: boolean
  notifyIdentityChanges: boolean
  requireMfaForSensitive: boolean
  sessionTimeoutMinutes: number
  maxSessions: number
}

/**
 * Get user's security preferences
 */
export async function getSecurityPreferences(userId: string): Promise<SecurityPreferences | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_security_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  if (!data) return null

  return {
    notifyPasswordChange: data.notify_password_change,
    notifyEmailChange: data.notify_email_change,
    notifyPhoneChange: data.notify_phone_change,
    notifyMfaChange: data.notify_mfa_change,
    notifyNewDevice: data.notify_new_device,
    notifySuspiciousActivity: data.notify_suspicious_activity,
    notifyIdentityChanges: data.notify_identity_changes,
    requireMfaForSensitive: data.require_mfa_for_sensitive,
    sessionTimeoutMinutes: data.session_timeout_minutes,
    maxSessions: data.max_sessions,
  }
}

/**
 * Update user's security preferences
 */
export async function updateSecurityPreferences(
  userId: string,
  preferences: Partial<SecurityPreferences>
) {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (preferences.notifyPasswordChange !== undefined) {
    updateData.notify_password_change = preferences.notifyPasswordChange
  }
  if (preferences.notifyEmailChange !== undefined) {
    updateData.notify_email_change = preferences.notifyEmailChange
  }
  if (preferences.notifyPhoneChange !== undefined) {
    updateData.notify_phone_change = preferences.notifyPhoneChange
  }
  if (preferences.notifyMfaChange !== undefined) {
    updateData.notify_mfa_change = preferences.notifyMfaChange
  }
  if (preferences.notifyNewDevice !== undefined) {
    updateData.notify_new_device = preferences.notifyNewDevice
  }
  if (preferences.notifySuspiciousActivity !== undefined) {
    updateData.notify_suspicious_activity = preferences.notifySuspiciousActivity
  }
  if (preferences.notifyIdentityChanges !== undefined) {
    updateData.notify_identity_changes = preferences.notifyIdentityChanges
  }
  if (preferences.requireMfaForSensitive !== undefined) {
    updateData.require_mfa_for_sensitive = preferences.requireMfaForSensitive
  }
  if (preferences.sessionTimeoutMinutes !== undefined) {
    updateData.session_timeout_minutes = preferences.sessionTimeoutMinutes
  }
  if (preferences.maxSessions !== undefined) {
    updateData.max_sessions = preferences.maxSessions
  }

  const { error } = await supabase
    .from('user_security_preferences')
    .upsert({
      user_id: userId,
      ...updateData,
    }, {
      onConflict: 'user_id',
    })

  if (error) throw error
  return { success: true }
}

// ============================================
// KNOWN DEVICES
// ============================================

export interface KnownDevice {
  id: string
  deviceName: string
  deviceType: string
  browser: string
  os: string
  isTrusted: boolean
  trustLevel: 'unknown' | 'recognized' | 'trusted' | 'blocked'
  firstSeenAt: string
  lastSeenAt: string
  lastIpAddress: string
  lastLocation?: {
    country?: string
    city?: string
    region?: string
  }
  loginCount: number
}

/**
 * Get user's known devices
 */
export async function getKnownDevices(userId: string): Promise<KnownDevice[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_known_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_seen_at', { ascending: false })

  if (error) throw error

  return (data || []).map(d => ({
    id: d.id,
    deviceName: d.device_name || 'Unknown Device',
    deviceType: d.device_type || 'unknown',
    browser: d.browser || 'Unknown',
    os: d.os || 'Unknown',
    isTrusted: d.is_trusted,
    trustLevel: d.trust_level,
    firstSeenAt: d.first_seen_at,
    lastSeenAt: d.last_seen_at,
    lastIpAddress: d.last_ip_address,
    lastLocation: d.last_location,
    loginCount: d.login_count,
  }))
}

/**
 * Trust or block a device
 */
export async function updateDeviceTrust(
  deviceId: string,
  trustLevel: 'trusted' | 'blocked'
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_known_devices')
    .update({
      trust_level: trustLevel,
      is_trusted: trustLevel === 'trusted',
    })
    .eq('id', deviceId)

  if (error) throw error
  return { success: true }
}

/**
 * Remove a known device
 */
export async function removeKnownDevice(deviceId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_known_devices')
    .delete()
    .eq('id', deviceId)

  if (error) throw error
  return { success: true }
}

/**
 * Register a new device
 */
export async function registerDevice(
  userId: string,
  deviceInfo: {
    fingerprint: string
    deviceName?: string
    deviceType?: string
    browser?: string
    os?: string
  },
  ipAddress?: string,
  location?: { country?: string; city?: string; region?: string }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_known_devices')
    .upsert({
      user_id: userId,
      device_fingerprint: deviceInfo.fingerprint,
      device_name: deviceInfo.deviceName,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      last_ip_address: ipAddress,
      last_location: location,
      last_seen_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,device_fingerprint',
    })
    .select('id, is_trusted, trust_level')
    .single()

  if (error) throw error

  // Check if this is a new device
  const isNewDevice = data.trust_level === 'unknown'

  return {
    deviceId: data.id,
    isTrusted: data.is_trusted,
    isNewDevice,
  }
}

// ============================================
// SECURITY EVENTS HISTORY
// ============================================

/**
 * Get user's security events history
 */
export async function getSecurityEvents(
  userId: string,
  options: {
    limit?: number
    offset?: number
    eventTypes?: SecurityEventType[]
  } = {}
) {
  const supabase = createClient()

  let query = supabase
    .from('security_email_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options.eventTypes?.length) {
    query = query.in('event_type', options.eventTypes)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(event => ({
    id: event.id,
    eventType: event.event_type as SecurityEventType,
    status: event.event_status,
    ipAddress: event.ip_address,
    userAgent: event.user_agent,
    location: event.location,
    metadata: event.metadata,
    emailSentAt: event.email_sent_at,
    createdAt: event.created_at,
    acknowledgedAt: event.acknowledged_at,
  }))
}

/**
 * Acknowledge a security event
 */
export async function acknowledgeSecurityEvent(eventId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('security_email_events')
    .update({
      event_status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', eventId)

  if (error) throw error
  return { success: true }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Mask email for display (e.g., "t***@example.com")
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'

  const maskedLocal = local.charAt(0) + '***'
  return `${maskedLocal}@${domain}`
}

/**
 * Get device info from user agent
 */
export function parseUserAgent(userAgent: string): {
  browser: string
  os: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
} {
  // Basic user agent parsing
  let browser = 'Unknown'
  let os = 'Unknown'
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop'

  // Browser detection
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'
  else if (userAgent.includes('Opera')) browser = 'Opera'

  // OS detection
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac OS')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) os = 'iOS'

  // Device type detection
  if (userAgent.includes('Mobile')) deviceType = 'mobile'
  else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) deviceType = 'tablet'

  return { browser, os, deviceType }
}

/**
 * Generate device fingerprint (basic implementation)
 */
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return ''

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ]

  // Simple hash
  let hash = 0
  const str = components.join('|')
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return Math.abs(hash).toString(16)
}

// ============================================
// EXPORT TYPES
// ============================================

export interface SecurityEvent {
  id: string
  eventType: SecurityEventType
  status: 'pending' | 'email_sent' | 'email_failed' | 'acknowledged'
  ipAddress?: string
  userAgent?: string
  location?: {
    country?: string
    city?: string
    region?: string
  }
  metadata?: Record<string, unknown>
  emailSentAt?: string
  createdAt: string
  acknowledgedAt?: string
}
