/**
 * OIDC SSO API
 *
 * POST /api/auth/sso/oidc - Initiate OIDC login
 * PUT /api/auth/sso/oidc - Exchange authorization code
 */

import { NextRequest, NextResponse } from 'next/server'
import { ssoService } from '@/lib/auth/sso-service'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('auth-api')

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Initiate OIDC Authorization
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { idpId, redirectUri, state } = body

    if (!idpId) {
      return NextResponse.json(
        { success: false, error: 'Identity provider ID is required' },
        { status: 400 }
      )
    }

    const callbackUri = redirectUri || `${APP_URL}/api/auth/sso/callback/oidc`

    const result = await ssoService.generateOIDCAuthorizationUrl(
      idpId,
      callbackUri,
      state
    )

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error: unknown) {
    logger.error('OIDC authorization initiation error', { error })
    const message = error instanceof Error ? error.message : 'Failed to initiate OIDC login'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * Exchange OIDC Authorization Code
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { code, state, redirectUri } = body

    if (!code || !state) {
      return NextResponse.json(
        { success: false, error: 'Code and state are required' },
        { status: 400 }
      )
    }

    const callbackUri = redirectUri || `${APP_URL}/api/auth/sso/callback/oidc`

    const result = await ssoService.exchangeOIDCCode(code, state, callbackUri)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: result.user
    })

    const sessionId = crypto.randomUUID()
    response.cookies.set('ff_sso_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })

    return response
  } catch (error: unknown) {
    logger.error('OIDC code exchange error', { error })
    const message = error instanceof Error ? error.message : 'Failed to exchange authorization code'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
