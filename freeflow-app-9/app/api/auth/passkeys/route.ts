/**
 * Passkeys Management API
 *
 * GET /api/auth/passkeys - List user's passkeys
 * POST /api/auth/passkeys - Generate backup codes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { webAuthnService } from '@/lib/auth/webauthn-service'

/**
 * List user's passkeys
 */
export async function GET(): Promise<NextResponse> {
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

    // Get passkeys
    const passkeys = await webAuthnService.listUserPasskeys(user.id)

    // Return passkeys without sensitive data
    const safePasskeys = passkeys.map(pk => ({
      id: pk.id,
      name: pk.name,
      deviceType: pk.device_type,
      backedUp: pk.backed_up,
      createdAt: pk.created_at,
      lastUsedAt: pk.last_used_at
    }))

    return NextResponse.json({
      success: true,
      passkeys: safePasskeys,
      count: safePasskeys.length
    })
  } catch (error: unknown) {
    console.error('List passkeys error:', error)
    const message = error instanceof Error ? error.message : 'Failed to list passkeys'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * Generate backup codes
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

    const body = await request.json()
    const { action } = body

    if (action !== 'generate_backup_codes') {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Generate backup codes
    const codes = await webAuthnService.generateBackupCodes(user.id)

    return NextResponse.json({
      success: true,
      backupCodes: codes,
      message: 'Save these codes securely. They will only be shown once.'
    })
  } catch (error: unknown) {
    console.error('Generate backup codes error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate backup codes'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
