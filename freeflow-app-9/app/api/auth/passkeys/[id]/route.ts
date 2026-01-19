/**
 * Individual Passkey Management API
 *
 * PATCH /api/auth/passkeys/[id] - Rename passkey
 * DELETE /api/auth/passkeys/[id] - Delete passkey
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { webAuthnService } from '@/lib/auth/webauthn-service'

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
    console.error('Rename passkey error:', error)
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
    console.error('Delete passkey error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete passkey'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
