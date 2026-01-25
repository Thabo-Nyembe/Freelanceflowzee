/**
 * Passkey Registration API
 *
 * POST /api/auth/passkeys/register - Start registration (get options)
 * PUT /api/auth/passkeys/register - Complete registration (verify response)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { webAuthnService } from '@/lib/auth/webauthn-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('auth-api')

/**
 * Start passkey registration - generates WebAuthn options
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile for display name
    const { data: profile } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()

    const userName = profile?.email || user.email || user.id
    const userDisplayName = profile?.name || user.email || 'User'

    // Generate registration options
    const { options, challengeId } = await webAuthnService.generateRegistrationOptions(
      user.id,
      userName,
      userDisplayName
    )

    return NextResponse.json({
      success: true,
      options,
      challengeId
    })
  } catch (error: unknown) {
    logger.error('Passkey registration start error', { error })
    const message = error instanceof Error ? error.message : 'Failed to start registration'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * Complete passkey registration - verifies response and stores credential
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { challengeId, response, deviceName } = body

    if (!challengeId || !response) {
      return NextResponse.json(
        { success: false, error: 'Missing challengeId or response' },
        { status: 400 }
      )
    }

    // Verify registration
    const result = await webAuthnService.verifyRegistration(
      user.id,
      challengeId,
      response,
      deviceName
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      passkeyId: result.passkeyId,
      message: 'Passkey registered successfully'
    })
  } catch (error: unknown) {
    logger.error('Passkey registration complete error', { error })
    const message = error instanceof Error ? error.message : 'Failed to complete registration'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
