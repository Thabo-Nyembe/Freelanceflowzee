/**
 * KAZI Email Verification API
 *
 * Handles email verification, password reset, and account recovery.
 */

import { NextRequest, NextResponse } from 'next/server'
import { emailVerificationService } from '@/lib/auth/email-verification'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-VerifyEmail')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'verify'
    const token = searchParams.get('token')

    switch (action) {
      case 'verify': {
        if (!token) {
          return NextResponse.json(
            { success: false, error: 'Token required' },
            { status: 400 }
          )
        }

        const result = await emailVerificationService.verifyEmail(token)

        if (result.success) {
          // Redirect to success page
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          return NextResponse.redirect(`${appUrl}/login?verified=true`)
        }

        return NextResponse.json(result, { status: 400 })
      }

      case 'check-status': {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Not authenticated' },
            { status: 401 }
          )
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('email_verified')
          .eq('id', user.id)
          .single()

        return NextResponse.json({
          success: true,
          verified: profile?.email_verified || false
        })
      }

      case 'verify-reset-token': {
        if (!token) {
          return NextResponse.json(
            { success: false, error: 'Token required' },
            { status: 400 }
          )
        }

        const result = await emailVerificationService.verifyPasswordResetToken(token)
        return NextResponse.json(result, { status: result.success ? 200 : 400 })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Email verification GET error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'send-verification': {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Not authenticated' },
            { status: 401 }
          )
        }

        const result = await emailVerificationService.sendVerificationEmail(
          user.id,
          user.email!
        )

        return NextResponse.json(result, { status: result.success ? 200 : 400 })
      }

      case 'verify-code': {
        const { email, code } = data

        if (!email || !code) {
          return NextResponse.json(
            { success: false, error: 'Email and code required' },
            { status: 400 }
          )
        }

        const result = await emailVerificationService.verifyWithCode(email, code)
        return NextResponse.json(result, { status: result.success ? 200 : 400 })
      }

      case 'forgot-password': {
        const { email } = data

        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email required' },
            { status: 400 }
          )
        }

        const result = await emailVerificationService.sendPasswordResetEmail(email)
        return NextResponse.json(result)
      }

      case 'reset-password': {
        const { token, password } = data

        if (!token || !password) {
          return NextResponse.json(
            { success: false, error: 'Token and password required' },
            { status: 400 }
          )
        }

        // Validate password strength
        if (password.length < 8) {
          return NextResponse.json(
            { success: false, error: 'Password must be at least 8 characters' },
            { status: 400 }
          )
        }

        const result = await emailVerificationService.resetPassword(token, password)
        return NextResponse.json(result, { status: result.success ? 200 : 400 })
      }

      case 'change-email': {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Not authenticated' },
            { status: 401 }
          )
        }

        const { newEmail } = data

        if (!newEmail) {
          return NextResponse.json(
            { success: false, error: 'New email required' },
            { status: 400 }
          )
        }

        const result = await emailVerificationService.sendEmailChangeVerification(
          user.id,
          user.email!,
          newEmail
        )

        return NextResponse.json(result, { status: result.success ? 200 : 400 })
      }

      case 'confirm-email-change': {
        const { token } = data

        if (!token) {
          return NextResponse.json(
            { success: false, error: 'Token required' },
            { status: 400 }
          )
        }

        const result = await emailVerificationService.confirmEmailChange(token)
        return NextResponse.json(result, { status: result.success ? 200 : 400 })
      }

      case 'magic-link': {
        const { email } = data

        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email required' },
            { status: 400 }
          )
        }

        const result = await emailVerificationService.sendMagicLink(email)
        return NextResponse.json(result)
      }

      case 'resend-verification': {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Not authenticated' },
            { status: 401 }
          )
        }

        const result = await emailVerificationService.sendVerificationEmail(
          user.id,
          user.email!
        )

        return NextResponse.json(result, { status: result.success ? 200 : 400 })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Email verification POST error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
