/**
 * Security Settings API - Single Resource Routes
 *
 * GET - Get single trusted device
 * PUT - Update trusted device, backup code, alert
 * DELETE - Delete trusted device, backup codes, password history, alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  useTwoFactorBackupCode,
  verifyTwoFactorBackupCode,
  deleteUsedBackupCodes,
  getTrustedDevice,
  updateTrustedDevice,
  trustDevice,
  blockDevice,
  removeTrustedDevice,
  checkPasswordHistory,
  cleanOldPasswordHistory,
  markSecurityAlertRead,
  dismissSecurityAlert,
  deleteSecurityAlert
} from '@/lib/security-settings-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'trusted-device'

    switch (type) {
      case 'trusted-device': {
        const result = await getTrustedDevice(id)
        return NextResponse.json({ data: result.data })
      }

      case 'verify-backup-code': {
        const isValid = await verifyTwoFactorBackupCode(user.id, id)
        return NextResponse.json({ data: { is_valid: isValid } })
      }

      case 'check-password-history': {
        const exists = await checkPasswordHistory(user.id, id)
        return NextResponse.json({ data: { exists } })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Security Settings API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'backup-code': {
        if (action === 'use') {
          const result = await useTwoFactorBackupCode(id, updates.ip_address)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for backup-code' }, { status: 400 })
      }

      case 'trusted-device': {
        if (action === 'trust') {
          const result = await trustDevice(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'block') {
          const result = await blockDevice(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateTrustedDevice(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'alert': {
        if (action === 'mark-read') {
          const result = await markSecurityAlertRead(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'dismiss') {
          const result = await dismissSecurityAlert(id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for alert' }, { status: 400 })
      }

      case 'password-history': {
        if (action === 'clean-old') {
          const result = await cleanOldPasswordHistory(user.id, updates.keep_count || 10)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for password-history' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Security Settings API error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'trusted-device'

    switch (type) {
      case 'trusted-device': {
        await removeTrustedDevice(id)
        return NextResponse.json({ success: true })
      }

      case 'used-backup-codes': {
        await deleteUsedBackupCodes(user.id)
        return NextResponse.json({ success: true })
      }

      case 'alert': {
        await deleteSecurityAlert(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Security Settings API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
