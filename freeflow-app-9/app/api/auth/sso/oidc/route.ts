/**
 * OIDC SSO API
 *
 * POST /api/auth/sso/oidc - Initiate OIDC login
 * PUT /api/auth/sso/oidc - Exchange authorization code
 */

import { NextRequest, NextResponse } from 'next/server'
import { ssoService } from '@/lib/auth/sso-service'

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
    console.error('OIDC authorization initiation error:', error)
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
    console.error('OIDC code exchange error:', error)
    const message = error instanceof Error ? error.message : 'Failed to exchange authorization code'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
