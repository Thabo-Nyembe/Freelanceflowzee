/**
 * KAZI Email Verification Service
 *
 * Handles email verification, password reset, and account recovery flows.
 *
 * Features:
 * - Secure token generation
 * - Token expiration
 * - Rate limiting
 * - Email templates
 * - Account recovery
 */

import { createClient } from '@/lib/supabase/server'
import { emailService } from '@/lib/email/email-service'
import { createFeatureLogger } from '@/lib/logger'
import crypto from 'crypto'

const logger = createFeatureLogger('EmailVerification')

// Types
export interface VerificationToken {
  id: string
  user_id: string
  email: string
  token: string
  type: 'email_verification' | 'password_reset' | 'email_change' | 'magic_link'
  expires_at: string
  created_at: string
  used_at?: string
}

export interface SendVerificationResult {
  success: boolean
  message: string
  expiresIn?: number
}

export interface VerifyResult {
  success: boolean
  message: string
  userId?: string
  email?: string
}

// Configuration
const TOKEN_EXPIRY = {
  email_verification: 24 * 60 * 60 * 1000, // 24 hours
  password_reset: 1 * 60 * 60 * 1000, // 1 hour
  email_change: 24 * 60 * 60 * 1000, // 24 hours
  magic_link: 15 * 60 * 1000 // 15 minutes
}

const RATE_LIMITS = {
  email_verification: { max: 3, window: 60 * 60 * 1000 }, // 3 per hour
  password_reset: { max: 5, window: 60 * 60 * 1000 }, // 5 per hour
  email_change: { max: 2, window: 24 * 60 * 60 * 1000 }, // 2 per day
  magic_link: { max: 10, window: 60 * 60 * 1000 } // 10 per hour
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate a short numeric code
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Email Verification Service
 */
export class EmailVerificationService {
  private static instance: EmailVerificationService

  private constructor() {}

  static getInstance(): EmailVerificationService {
    if (!EmailVerificationService.instance) {
      EmailVerificationService.instance = new EmailVerificationService()
    }
    return EmailVerificationService.instance
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(
    userId: string,
    email: string
  ): Promise<SendVerificationResult> {
    try {
      // Check rate limit
      const canSend = await this.checkRateLimit(email, 'email_verification')
      if (!canSend) {
        return {
          success: false,
          message: 'Too many verification requests. Please try again later.'
        }
      }

      // Generate token
      const token = generateToken()
      const code = generateCode()
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.email_verification)

      // Store token
      const supabase = await createClient()
      const { error } = await supabase.from('verification_tokens').insert({
        user_id: userId,
        email,
        token,
        code,
        type: 'email_verification',
        expires_at: expiresAt.toISOString()
      })

      if (error) {
        logger.error('Failed to store verification token', { error: error.message })
        throw error
      }

      // Send email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const verifyUrl = `${appUrl}/verify-email?token=${token}`

      await emailService.send({
        to: email,
        subject: 'Verify your KAZI account',
        html: this.getVerificationEmailTemplate(verifyUrl, code),
        text: `Welcome to KAZI!\n\nPlease verify your email by clicking this link: ${verifyUrl}\n\nOr use this code: ${code}\n\nThis link expires in 24 hours.`
      })

      logger.info('Verification email sent', { userId, email })

      return {
        success: true,
        message: 'Verification email sent successfully',
        expiresIn: TOKEN_EXPIRY.email_verification
      }
    } catch (error) {
      logger.error('Failed to send verification email', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return {
        success: false,
        message: 'Failed to send verification email'
      }
    }
  }

  /**
   * Verify email token
   */
  async verifyEmail(token: string): Promise<VerifyResult> {
    try {
      const supabase = await createClient()

      // Find token
      const { data: verificationToken, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('type', 'email_verification')
        .is('used_at', null)
        .single()

      if (error || !verificationToken) {
        return {
          success: false,
          message: 'Invalid or expired verification link'
        }
      }

      // Check expiration
      if (new Date(verificationToken.expires_at) < new Date()) {
        return {
          success: false,
          message: 'Verification link has expired'
        }
      }

      // Mark token as used
      await supabase
        .from('verification_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', verificationToken.id)

      // Update user email_verified status
      await supabase
        .from('users')
        .update({
          email_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq('id', verificationToken.user_id)

      // Also update profiles if exists
      await supabase
        .from('profiles')
        .update({ email_verified: true })
        .eq('id', verificationToken.user_id)

      logger.info('Email verified successfully', {
        userId: verificationToken.user_id,
        email: verificationToken.email
      })

      return {
        success: true,
        message: 'Email verified successfully',
        userId: verificationToken.user_id,
        email: verificationToken.email
      }
    } catch (error) {
      logger.error('Email verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return {
        success: false,
        message: 'Email verification failed'
      }
    }
  }

  /**
   * Verify with code
   */
  async verifyWithCode(email: string, code: string): Promise<VerifyResult> {
    try {
      const supabase = await createClient()

      // Find token by code
      const { data: verificationToken, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('type', 'email_verification')
        .is('used_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !verificationToken) {
        return {
          success: false,
          message: 'Invalid verification code'
        }
      }

      // Verify with the token
      return this.verifyEmail(verificationToken.token)
    } catch (error) {
      return {
        success: false,
        message: 'Verification failed'
      }
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<SendVerificationResult> {
    try {
      const supabase = await createClient()

      // Find user by email
      const { data: user } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single()

      if (!user) {
        // Don't reveal if user exists
        return {
          success: true,
          message: 'If an account exists, a reset link will be sent'
        }
      }

      // Check rate limit
      const canSend = await this.checkRateLimit(email, 'password_reset')
      if (!canSend) {
        return {
          success: false,
          message: 'Too many reset requests. Please try again later.'
        }
      }

      // Generate token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.password_reset)

      // Store token
      await supabase.from('verification_tokens').insert({
        user_id: user.id,
        email,
        token,
        type: 'password_reset',
        expires_at: expiresAt.toISOString()
      })

      // Send email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const resetUrl = `${appUrl}/reset-password?token=${token}`

      await emailService.send({
        to: email,
        subject: 'Reset your KAZI password',
        html: this.getPasswordResetEmailTemplate(resetUrl),
        text: `Reset your password by clicking this link: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`
      })

      logger.info('Password reset email sent', { email })

      return {
        success: true,
        message: 'If an account exists, a reset link will be sent',
        expiresIn: TOKEN_EXPIRY.password_reset
      }
    } catch (error) {
      logger.error('Failed to send password reset email', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return {
        success: false,
        message: 'Failed to send reset email'
      }
    }
  }

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<VerifyResult> {
    try {
      const supabase = await createClient()

      const { data: verificationToken, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('type', 'password_reset')
        .is('used_at', null)
        .single()

      if (error || !verificationToken) {
        return {
          success: false,
          message: 'Invalid or expired reset link'
        }
      }

      if (new Date(verificationToken.expires_at) < new Date()) {
        return {
          success: false,
          message: 'Reset link has expired'
        }
      }

      return {
        success: true,
        message: 'Valid reset token',
        userId: verificationToken.user_id,
        email: verificationToken.email
      }
    } catch (error) {
      return {
        success: false,
        message: 'Token verification failed'
      }
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<VerifyResult> {
    try {
      // First verify token
      const verification = await this.verifyPasswordResetToken(token)
      if (!verification.success) {
        return verification
      }

      const supabase = await createClient()

      // Mark token as used
      await supabase
        .from('verification_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token)

      // Update password (hash should be done in the auth system)
      // This assumes the password is already hashed or will be hashed by the update trigger
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      await supabase
        .from('users')
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', verification.userId)

      // Invalidate all other password reset tokens for this user
      await supabase
        .from('verification_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('user_id', verification.userId)
        .eq('type', 'password_reset')
        .is('used_at', null)

      logger.info('Password reset successful', { userId: verification.userId })

      return {
        success: true,
        message: 'Password reset successfully',
        userId: verification.userId
      }
    } catch (error) {
      logger.error('Password reset failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return {
        success: false,
        message: 'Password reset failed'
      }
    }
  }

  /**
   * Send email change verification
   */
  async sendEmailChangeVerification(
    userId: string,
    currentEmail: string,
    newEmail: string
  ): Promise<SendVerificationResult> {
    try {
      // Check rate limit
      const canSend = await this.checkRateLimit(currentEmail, 'email_change')
      if (!canSend) {
        return {
          success: false,
          message: 'Too many email change requests'
        }
      }

      const supabase = await createClient()

      // Check if new email is already taken
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', newEmail)
        .single()

      if (existingUser) {
        return {
          success: false,
          message: 'Email is already in use'
        }
      }

      // Generate token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.email_change)

      // Store token with new email in metadata
      await supabase.from('verification_tokens').insert({
        user_id: userId,
        email: newEmail,
        token,
        type: 'email_change',
        expires_at: expiresAt.toISOString(),
        metadata: { current_email: currentEmail }
      })

      // Send verification to new email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const verifyUrl = `${appUrl}/verify-email-change?token=${token}`

      await emailService.send({
        to: newEmail,
        subject: 'Confirm your new email address - KAZI',
        html: this.getEmailChangeTemplate(verifyUrl),
        text: `Confirm your new email address by clicking this link: ${verifyUrl}\n\nThis link expires in 24 hours.`
      })

      logger.info('Email change verification sent', { userId, newEmail })

      return {
        success: true,
        message: 'Verification email sent to new address',
        expiresIn: TOKEN_EXPIRY.email_change
      }
    } catch (error) {
      logger.error('Failed to send email change verification', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return {
        success: false,
        message: 'Failed to send verification email'
      }
    }
  }

  /**
   * Confirm email change
   */
  async confirmEmailChange(token: string): Promise<VerifyResult> {
    try {
      const supabase = await createClient()

      const { data: verificationToken, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('type', 'email_change')
        .is('used_at', null)
        .single()

      if (error || !verificationToken) {
        return {
          success: false,
          message: 'Invalid or expired verification link'
        }
      }

      if (new Date(verificationToken.expires_at) < new Date()) {
        return {
          success: false,
          message: 'Verification link has expired'
        }
      }

      // Mark token as used
      await supabase
        .from('verification_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', verificationToken.id)

      // Update user email
      await supabase
        .from('users')
        .update({
          email: verificationToken.email,
          email_verified: true,
          email_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', verificationToken.user_id)

      // Update profiles
      await supabase
        .from('profiles')
        .update({ email: verificationToken.email })
        .eq('id', verificationToken.user_id)

      logger.info('Email change confirmed', {
        userId: verificationToken.user_id,
        newEmail: verificationToken.email
      })

      return {
        success: true,
        message: 'Email changed successfully',
        userId: verificationToken.user_id,
        email: verificationToken.email
      }
    } catch (error) {
      logger.error('Email change confirmation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return {
        success: false,
        message: 'Email change failed'
      }
    }
  }

  /**
   * Send magic link for passwordless login
   */
  async sendMagicLink(email: string): Promise<SendVerificationResult> {
    try {
      const supabase = await createClient()

      // Find user
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!user) {
        // Don't reveal if user exists
        return {
          success: true,
          message: 'If an account exists, a magic link will be sent'
        }
      }

      // Check rate limit
      const canSend = await this.checkRateLimit(email, 'magic_link')
      if (!canSend) {
        return {
          success: false,
          message: 'Too many login requests'
        }
      }

      // Generate token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.magic_link)

      // Store token
      await supabase.from('verification_tokens').insert({
        user_id: user.id,
        email,
        token,
        type: 'magic_link',
        expires_at: expiresAt.toISOString()
      })

      // Send email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const loginUrl = `${appUrl}/magic-login?token=${token}`

      await emailService.send({
        to: email,
        subject: 'Your KAZI login link',
        html: this.getMagicLinkTemplate(loginUrl),
        text: `Click this link to log in: ${loginUrl}\n\nThis link expires in 15 minutes.`
      })

      return {
        success: true,
        message: 'If an account exists, a magic link will be sent',
        expiresIn: TOKEN_EXPIRY.magic_link
      }
    } catch (error) {
      logger.error('Failed to send magic link', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return {
        success: false,
        message: 'Failed to send login link'
      }
    }
  }

  /**
   * Check rate limit
   */
  private async checkRateLimit(
    email: string,
    type: keyof typeof RATE_LIMITS
  ): Promise<boolean> {
    try {
      const supabase = await createClient()
      const limit = RATE_LIMITS[type]
      const windowStart = new Date(Date.now() - limit.window)

      const { count } = await supabase
        .from('verification_tokens')
        .select('*', { count: 'exact', head: true })
        .eq('email', email)
        .eq('type', type)
        .gte('created_at', windowStart.toISOString())

      return (count || 0) < limit.max
    } catch (error) {
      // If rate limit check fails, allow the request
      return true
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('verification_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select()

      if (error) throw error

      logger.info('Cleaned up expired tokens', { count: data?.length || 0 })
      return data?.length || 0
    } catch (error) {
      logger.error('Failed to cleanup tokens', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return 0
    }
  }

  // ============================================================================
  // Email Templates
  // ============================================================================

  private getVerificationEmailTemplate(verifyUrl: string, code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email - KAZI</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to KAZI</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin-top: 0;">Verify your email address</h2>
      <p style="color: #666; line-height: 1.6;">
        Thank you for signing up! Please verify your email address to get started.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; display: inline-block; font-weight: 600;">
          Verify Email
        </a>
      </div>
      <p style="color: #666; text-align: center; font-size: 14px;">
        Or enter this code: <strong style="font-size: 20px; letter-spacing: 2px;">${code}</strong>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Password Reset</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin-top: 0;">Reset your password</h2>
      <p style="color: #666; line-height: 1.6;">
        We received a request to reset your password. Click the button below to create a new password.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; display: inline-block; font-weight: 600;">
          Reset Password
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`
  }

  private getEmailChangeTemplate(verifyUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Confirm Email Change</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin-top: 0;">Confirm your new email</h2>
      <p style="color: #666; line-height: 1.6;">
        You requested to change your email address to this one. Click the button below to confirm.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; display: inline-block; font-weight: 600;">
          Confirm Email
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This link expires in 24 hours. If you didn't request this change, please contact support.
      </p>
    </div>
  </div>
</body>
</html>`
  }

  private getMagicLinkTemplate(loginUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Login to KAZI</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin-top: 0;">Your magic login link</h2>
      <p style="color: #666; line-height: 1.6;">
        Click the button below to log in to your account. No password needed!
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; display: inline-block; font-weight: 600;">
          Log In
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This link expires in 15 minutes and can only be used once.
      </p>
    </div>
  </div>
</body>
</html>`
  }
}

// Export singleton
export const emailVerificationService = EmailVerificationService.getInstance()
