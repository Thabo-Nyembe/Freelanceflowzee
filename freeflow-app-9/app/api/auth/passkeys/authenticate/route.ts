/**
 * Passkey Authentication API
 *
 * POST /api/auth/passkeys/authenticate - Start authentication (get options)
 * PUT /api/auth/passkeys/authenticate - Complete authentication (verify response)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { webAuthnService } from '@/lib/auth/webauthn-service'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('auth-api')

/**
 * Start passkey authentication - generates WebAuthn options
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}))
    const { email } = body

    let userId: string | undefined

    // If email provided, get user's credentials
    if (email) {
      const supabase = await createClient()
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

      if (user) {
        userId = user.id
      }
    }

    // Generate authentication options
    const { options, challengeId } = await webAuthnService.generateAuthenticationOptions(userId)

    return NextResponse.json({
      success: true,
      options,
      challengeId
    })
  } catch (error: unknown) {
    logger.error('Passkey authentication start error', { error })
    const message = error instanceof Error ? error.message : 'Failed to start authentication'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * Complete passkey authentication - verifies response and returns session
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { challengeId, response } = body

    if (!challengeId || !response) {
      return NextResponse.json(
        { success: false, error: 'Missing challengeId or response' },
        { status: 400 }
      )
    }

    // Verify authentication
    const result = await webAuthnService.verifyAuthentication(challengeId, response)

    if (!result.success || !result.userId) {
      return NextResponse.json(
        { success: false, error: result.error || 'Authentication failed' },
        { status: 401 }
      )
    }

    // Create session for the user
    const supabase = await createClient()

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', result.userId)
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Sign in the user using Supabase Auth
    // For passkey auth, we'll use a custom token approach
    // In production, you'd create a session or JWT here

    // Create a session record
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await supabase.from('user_sessions').insert({
      id: sessionId,
      user_id: result.userId,
      auth_method: 'passkey',
      expires_at: expiresAt.toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    // Return session info
    const responseHeaders = new Headers()

    // Set secure session cookie
    responseHeaders.set(
      'Set-Cookie',
      `ff_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    )

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        message: 'Authentication successful'
      },
      { headers: responseHeaders }
    )
  } catch (error: unknown) {
    logger.error('Passkey authentication complete error', { error })
    const message = error instanceof Error ? error.message : 'Failed to complete authentication'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
