/**
 * SSO Callback Handler
 *
 * GET /api/auth/sso/callback/[provider] - Handle OAuth/OIDC callback
 * POST /api/auth/sso/callback/[provider] - Handle SAML POST callback
 */

import { NextRequest, NextResponse } from 'next/server'
import { ssoService } from '@/lib/auth/sso-service'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Validate redirect path to prevent open redirect attacks
function isValidRedirectPath(path: string): boolean {
  // Must start with / and not have protocol or //
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return false
  }
  // Only allow dashboard and related paths
  const allowedPaths = ['/dashboard', '/settings', '/projects', '/profile', '/files', '/messages']
  return allowedPaths.some(allowed => path.startsWith(allowed))
}

interface RouteParams {
  params: Promise<{ provider: string }>
}

/**
 * Handle GET callback (OIDC/OAuth)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { provider } = await params
  const { searchParams } = new URL(request.url)

  try {
    if (provider === 'oidc' || provider === 'oauth') {
      // Handle OIDC callback
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        return NextResponse.redirect(
          `${APP_URL}/auth/error?error=${encodeURIComponent(errorDescription || error)}`
        )
      }

      if (!code || !state) {
        return NextResponse.redirect(
          `${APP_URL}/auth/error?error=${encodeURIComponent('Missing authorization code or state')}`
        )
      }

      const redirectUri = `${APP_URL}/api/auth/sso/callback/oidc`
      const result = await ssoService.exchangeOIDCCode(code, state, redirectUri)

      if (!result.success) {
        return NextResponse.redirect(
          `${APP_URL}/auth/error?error=${encodeURIComponent(result.error || 'Authentication failed')}`
        )
      }

      // Create session and redirect
      const response = NextResponse.redirect(`${APP_URL}/dashboard`)

      const sessionId = crypto.randomUUID()
      response.cookies.set('ff_sso_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60
      })

      // Store user ID in session
      response.cookies.set('ff_user_id', result.user!.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60
      })

      return response
    }

    // Handle SAML redirect binding (less common)
    if (provider === 'saml') {
      const samlResponse = searchParams.get('SAMLResponse')
      const relayState = searchParams.get('RelayState')

      if (!samlResponse) {
        return NextResponse.redirect(
          `${APP_URL}/auth/error?error=${encodeURIComponent('Missing SAML response')}`
        )
      }

      const result = await ssoService.processSAMLResponse(samlResponse, relayState || undefined)

      if (!result.success) {
        return NextResponse.redirect(
          `${APP_URL}/auth/error?error=${encodeURIComponent(result.error || 'SAML authentication failed')}`
        )
      }

      // Validate redirect URL to prevent open redirect
      const rawRedirectUrl = result.redirectUrl || '/dashboard'
      const redirectUrl = isValidRedirectPath(rawRedirectUrl) ? rawRedirectUrl : '/dashboard'
      const response = NextResponse.redirect(`${APP_URL}${redirectUrl}`)

      const sessionId = crypto.randomUUID()
      response.cookies.set('ff_sso_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60
      })

      response.cookies.set('ff_user_id', result.user!.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60
      })

      return response
    }

    return NextResponse.redirect(
      `${APP_URL}/auth/error?error=${encodeURIComponent('Unknown provider')}`
    )
  } catch (error) {
    console.error('SSO callback error:', error)
    const message = error instanceof Error ? error.message : 'Authentication failed'
    return NextResponse.redirect(
      `${APP_URL}/auth/error?error=${encodeURIComponent(message)}`
    )
  }
}

/**
 * Handle POST callback (SAML POST binding)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { provider } = await params

  try {
    if (provider !== 'saml') {
      return NextResponse.redirect(
        `${APP_URL}/auth/error?error=${encodeURIComponent('POST callback only supported for SAML')}`
      )
    }

    // Parse form data
    const formData = await request.formData()
    const samlResponse = formData.get('SAMLResponse') as string
    const relayState = formData.get('RelayState') as string | null

    if (!samlResponse) {
      return NextResponse.redirect(
        `${APP_URL}/auth/error?error=${encodeURIComponent('Missing SAML response')}`
      )
    }

    const result = await ssoService.processSAMLResponse(samlResponse, relayState || undefined)

    if (!result.success) {
      return NextResponse.redirect(
        `${APP_URL}/auth/error?error=${encodeURIComponent(result.error || 'SAML authentication failed')}`
      )
    }

    // Validate redirect URL to prevent open redirect
    const rawRedirectUrl = result.redirectUrl || '/dashboard'
    const redirectUrl = isValidRedirectPath(rawRedirectUrl) ? rawRedirectUrl : '/dashboard'
    const response = NextResponse.redirect(`${APP_URL}${redirectUrl}`)

    const sessionId = crypto.randomUUID()
    response.cookies.set('ff_sso_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })

    response.cookies.set('ff_user_id', result.user!.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })

    return response
  } catch (error) {
    console.error('SAML POST callback error:', error)
    const message = error instanceof Error ? error.message : 'SAML authentication failed'
    return NextResponse.redirect(
      `${APP_URL}/auth/error?error=${encodeURIComponent(message)}`
    )
  }
}
