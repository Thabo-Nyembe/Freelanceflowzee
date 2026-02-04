/**
 * Individual Passkey Management API
 *
 * PATCH /api/auth/passkeys/[id] - Rename passkey
 * DELETE /api/auth/passkeys/[id] - Delete passkey
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { webAuthnService } from '@/lib/auth/webauthn-service'
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

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Rename a passkey
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
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
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const success = await webAuthnService.renamePasskey(user.id, id, name.trim())

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to rename passkey' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Passkey renamed successfully'
    })
  } catch (error: unknown) {
    logger.error('Rename passkey error', { error })
    const message = error instanceof Error ? error.message : 'Failed to rename passkey'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * Delete a passkey
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const success = await webAuthnService.deletePasskey(user.id, id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete passkey' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Passkey deleted successfully'
    })
  } catch (error: unknown) {
    logger.error('Delete passkey error', { error })
    const message = error instanceof Error ? error.message : 'Failed to delete passkey'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
