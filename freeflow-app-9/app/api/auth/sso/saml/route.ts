/**
 * SAML SSO API
 *
 * GET /api/auth/sso/saml - Get SP metadata
 * POST /api/auth/sso/saml - Initiate SAML login
 * PUT /api/auth/sso/saml - Process SAML response (ACS)
 */

import { NextRequest, NextResponse } from 'next/server'
import { ssoService } from '@/lib/auth/sso-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('auth-api')

/**
 * Get SAML SP Metadata
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get('org')

  const metadata = ssoService.generateSPMetadata(organizationId || undefined)

  return new NextResponse(metadata, {
    headers: {
      'Content-Type': 'application/xml',
      'Content-Disposition': 'attachment; filename="sp-metadata.xml"'
    }
  })
}

/**
 * Initiate SAML Login (SP-initiated SSO)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { idpId, relayState } = body

    if (!idpId) {
      return NextResponse.json(
        { success: false, error: 'Identity provider ID is required' },
        { status: 400 }
      )
    }

    const result = await ssoService.generateSAMLRequest(idpId, relayState)

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error: unknown) {
    logger.error('SAML login initiation error', { error })
    const message = error instanceof Error ? error.message : 'Failed to initiate SAML login'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * Process SAML Response (Assertion Consumer Service)
 * Handles both POST binding and IdP-initiated SSO
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type') || ''

    let samlResponse: string
    let relayState: string | undefined

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      samlResponse = formData.get('SAMLResponse') as string
      relayState = formData.get('RelayState') as string | undefined
    } else {
      const body = await request.json()
      samlResponse = body.SAMLResponse
      relayState = body.RelayState
    }

    if (!samlResponse) {
      return NextResponse.json(
        { success: false, error: 'SAML response is required' },
        { status: 400 }
      )
    }

    const result = await ssoService.processSAMLResponse(samlResponse, relayState)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }

    // Set session cookie and redirect
    const response = NextResponse.json({
      success: true,
      user: result.user,
      redirectUrl: result.redirectUrl
    })

    // Set secure session cookie
    const sessionId = crypto.randomUUID()
    response.cookies.set('ff_sso_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error: unknown) {
    logger.error('SAML response processing error', { error })
    const message = error instanceof Error ? error.message : 'Failed to process SAML response'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
