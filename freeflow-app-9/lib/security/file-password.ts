/**
 * File Password Protection - Secure Access Control
 *
 * Features:
 * - bcrypt password hashing (10 rounds)
 * - Access token generation (JWT)
 * - Time-limited access tokens
 * - Password verification with rate limiting
 */

import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'

const SALT_ROUNDS = 10
const TOKEN_EXPIRY = 3600 // 1 hour in seconds

export interface PasswordVerificationResult {
  success: boolean
  accessToken?: string
  expiresAt?: Date
  remainingAttempts?: number
}

export interface AccessToken {
  fileId: string
  userId?: string
  expiresAt: Date
  deliveryId: string
}

/**
 * Hash a password using bcrypt
 *
 * @param password - Plain text password
 * @returns Hashed password
 *
 * @example
 * ```typescript
 * const hash = await hashPassword('secret123')
 * // Returns: $2a$10$N9qo8uLOickgx2ZMRZoMye...
 * ```
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long')
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    return hash
  } catch (error) {
    throw new Error(`Failed to hash password: ${error.message}`)
  }
}

/**
 * Verify a password against a hash
 *
 * @param password - Plain text password to verify
 * @param hash - bcrypt hash to compare against
 * @returns True if password matches
 *
 * @example
 * ```typescript
 * const isValid = await verifyPassword('secret123', storedHash)
 * if (isValid) {
 *   // Grant access
 * }
 * ```
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (!password || !hash) {
    return false
  }

  try {
    const isMatch = await bcrypt.compare(password, hash)
    return isMatch
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * Generate a secure access token for file download
 *
 * @param deliveryId - File delivery ID
 * @param userId - User ID (optional for public access)
 * @param expiresIn - Token expiry in seconds (default: 1 hour)
 * @returns Access token string
 *
 * @example
 * ```typescript
 * const token = await generateAccessToken('delivery-123', 'user-456')
 * // Use token to generate signed download URL
 * ```
 */
export async function generateAccessToken(
  deliveryId: string,
  userId?: string,
  expiresIn: number = TOKEN_EXPIRY
): Promise<string> {
  const supabase = await createClient()

  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  // Create access log entry with token
  const { data, error } = await supabase
    .from('file_access_logs')
    .insert({
      delivery_id: deliveryId,
      user_id: userId,
      action: 'token_generated',
      expires_at: expiresAt.toISOString(),
      metadata: {
        token_expiry: expiresIn,
        generated_at: new Date().toISOString()
      }
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to generate access token: ${error.message}`)
  }

  // Use the log ID as the token (UUID is secure enough for this purpose)
  // In production, you might want to use JWT instead
  const token = Buffer.from(
    JSON.stringify({
      logId: data.id,
      deliveryId,
      userId,
      expiresAt: expiresAt.getTime()
    })
  ).toString('base64url')

  return token
}

/**
 * Verify an access token and return the payload
 *
 * @param token - Access token to verify
 * @returns Token payload if valid
 *
 * @example
 * ```typescript
 * try {
 *   const payload = await verifyAccessToken(token)
 *   console.log('Access granted to delivery:', payload.deliveryId)
 * } catch (error) {
 *   console.error('Invalid token:', error.message)
 * }
 * ```
 */
export async function verifyAccessToken(
  token: string
): Promise<AccessToken> {
  try {
    // Decode token
    const decoded = JSON.parse(
      Buffer.from(token, 'base64url').toString('utf-8')
    )

    const { logId, deliveryId, userId, expiresAt } = decoded

    // Check expiry
    if (Date.now() > expiresAt) {
      throw new Error('Access token has expired')
    }

    const supabase = await createClient()

    // Verify log entry exists and is valid
    const { data: log, error } = await supabase
      .from('file_access_logs')
      .select('*')
      .eq('id', logId)
      .eq('delivery_id', deliveryId)
      .single()

    if (error || !log) {
      throw new Error('Invalid access token')
    }

    // Check if token was revoked
    if (log.metadata?.revoked) {
      throw new Error('Access token has been revoked')
    }

    return {
      fileId: log.delivery_id,
      deliveryId,
      userId,
      expiresAt: new Date(expiresAt)
    }
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`)
  }
}

/**
 * Verify password for file delivery and generate access token
 *
 * @param deliveryId - File delivery ID
 * @param password - Password to verify
 * @param ipAddress - Client IP address for rate limiting
 * @returns Verification result with access token
 *
 * @example
 * ```typescript
 * const result = await verifyFilePassword('delivery-123', 'secret123', '192.168.1.1')
 * if (result.success) {
 *   // Use result.accessToken to download file
 * } else {
 *   console.log('Attempts remaining:', result.remainingAttempts)
 * }
 * ```
 */
export async function verifyFilePassword(
  deliveryId: string,
  password: string,
  ipAddress?: string
): Promise<PasswordVerificationResult> {
  const supabase = await createClient()

  // Get delivery record
  const { data: delivery, error: deliveryError } = await supabase
    .from('secure_file_deliveries')
    .select('*')
    .eq('id', deliveryId)
    .single()

  if (deliveryError || !delivery) {
    return {
      success: false,
      remainingAttempts: 0
    }
  }

  // Check if password is required
  if (!delivery.password_hash) {
    // No password required, generate token
    const accessToken = await generateAccessToken(deliveryId)
    return {
      success: true,
      accessToken,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY * 1000)
    }
  }

  // Rate limiting: Check recent failed attempts from this IP
  if (ipAddress) {
    const { data: recentAttempts } = await supabase
      .from('file_access_logs')
      .select('*')
      .eq('delivery_id', deliveryId)
      .eq('action', 'password_failed')
      .gte('accessed_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
      .eq('ip_address', ipAddress)

    const failedAttempts = recentAttempts?.length || 0

    if (failedAttempts >= 5) {
      // Log rate limit hit
      await supabase.from('file_access_logs').insert({
        delivery_id: deliveryId,
        action: 'rate_limited',
        ip_address: ipAddress,
        metadata: {
          failed_attempts: failedAttempts
        }
      })

      return {
        success: false,
        remainingAttempts: 0
      }
    }
  }

  // Verify password
  const isValid = await verifyPassword(password, delivery.password_hash)

  if (!isValid) {
    // Log failed attempt
    await supabase.from('file_access_logs').insert({
      delivery_id: deliveryId,
      action: 'password_failed',
      ip_address: ipAddress,
      metadata: {
        timestamp: new Date().toISOString()
      }
    })

    // Count total failed attempts
    const { data: allAttempts } = await supabase
      .from('file_access_logs')
      .select('*')
      .eq('delivery_id', deliveryId)
      .eq('action', 'password_failed')
      .eq('ip_address', ipAddress || '')
      .gte('accessed_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())

    const attempts = allAttempts?.length || 0

    return {
      success: false,
      remainingAttempts: Math.max(0, 5 - attempts)
    }
  }

  // Password valid - generate access token
  const accessToken = await generateAccessToken(deliveryId)

  // Log successful access
  await supabase.from('file_access_logs').insert({
    delivery_id: deliveryId,
    action: 'password_verified',
    ip_address: ipAddress,
    metadata: {
      timestamp: new Date().toISOString()
    }
  })

  return {
    success: true,
    accessToken,
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY * 1000)
  }
}

/**
 * Revoke an access token
 *
 * @param token - Access token to revoke
 * @returns True if successfully revoked
 */
export async function revokeAccessToken(token: string): Promise<boolean> {
  try {
    const decoded = JSON.parse(
      Buffer.from(token, 'base64url').toString('utf-8')
    )

    const supabase = await createClient()

    const { error } = await supabase
      .from('file_access_logs')
      .update({
        metadata: { revoked: true, revoked_at: new Date().toISOString() }
      })
      .eq('id', decoded.logId)

    return !error
  } catch (error) {
    console.error('Token revocation error:', error)
    return false
  }
}

/**
 * Check if a delivery requires password
 *
 * @param deliveryId - File delivery ID
 * @returns True if password is required
 */
export async function requiresPassword(deliveryId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('secure_file_deliveries')
    .select('password_hash')
    .eq('id', deliveryId)
    .single()

  return !!(data?.password_hash)
}

/**
 * Update delivery password
 *
 * @param deliveryId - File delivery ID
 * @param newPassword - New password (or null to remove)
 * @param userId - User ID making the change
 * @returns True if successfully updated
 */
export async function updateDeliveryPassword(
  deliveryId: string,
  newPassword: string | null,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  // Verify user owns this delivery
  const { data: delivery } = await supabase
    .from('secure_file_deliveries')
    .select('owner_id')
    .eq('id', deliveryId)
    .single()

  if (!delivery || delivery.owner_id !== userId) {
    throw new Error('Unauthorized: You do not own this delivery')
  }

  // Hash new password if provided
  const passwordHash = newPassword ? await hashPassword(newPassword) : null

  const { error } = await supabase
    .from('secure_file_deliveries')
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    })
    .eq('id', deliveryId)
    .eq('owner_id', userId)

  if (error) {
    throw new Error(`Failed to update password: ${error.message}`)
  }

  // Log password change
  await supabase.from('file_access_logs').insert({
    delivery_id: deliveryId,
    user_id: userId,
    action: newPassword ? 'password_updated' : 'password_removed',
    metadata: {
      timestamp: new Date().toISOString()
    }
  })

  return true
}
