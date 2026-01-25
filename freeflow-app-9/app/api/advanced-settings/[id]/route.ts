/**
 * Advanced Settings API - Single Resource Routes
 *
 * GET - Get single export, backup, sync record
 * PUT - Update export, backup, sync record, deletion request
 * DELETE - Delete export, backup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('advanced-settings')
import {
  getUserDataExport,
  updateUserDataExport,
  markExportDownloaded,
  deleteExpiredExports,
  deleteUserDataExport,
  getSettingsBackup,
  updateSettingsBackup,
  restoreSettingsBackup,
  deleteSettingsBackup,
  deleteOldBackups,
  getSettingsSyncRecord,
  updateSettingsSyncRecord,
  completeSettingsSync,
  markSyncFailed,
  cancelAccountDeletionRequest,
  confirmAccountDeletionRequest,
  completeAccountDeletion
} from '@/lib/advanced-settings-queries'

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
    const type = searchParams.get('type') || 'export'

    switch (type) {
      case 'export': {
        const result = await getUserDataExport(id)
        return NextResponse.json({ data: result.data })
      }

      case 'backup': {
        const result = await getSettingsBackup(id)
        return NextResponse.json({ data: result.data })
      }

      case 'sync-record': {
        const result = await getSettingsSyncRecord(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Advanced Settings API error', { error })
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
      case 'export': {
        if (action === 'mark-downloaded') {
          const result = await markExportDownloaded(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'delete-expired') {
          const result = await deleteExpiredExports(user.id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateUserDataExport(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'backup': {
        if (action === 'restore') {
          const result = await restoreSettingsBackup(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'delete-old') {
          const result = await deleteOldBackups(user.id, updates.keep_count)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateSettingsBackup(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'sync-record': {
        if (action === 'complete') {
          const result = await completeSettingsSync(id, updates.had_conflicts, updates.conflicts_resolved)
          return NextResponse.json({ data: result.data })
        } else if (action === 'mark-failed') {
          const result = await markSyncFailed(id, updates.error_message)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateSettingsSyncRecord(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'deletion-request': {
        if (action === 'cancel') {
          const result = await cancelAccountDeletionRequest(user.id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'confirm') {
          const result = await confirmAccountDeletionRequest(user.id, updates.confirmation_token)
          return NextResponse.json({ data: result.data })
        } else if (action === 'complete') {
          const result = await completeAccountDeletion(user.id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for deletion-request' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Advanced Settings API error', { error })
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
    const type = searchParams.get('type') || 'export'

    switch (type) {
      case 'export': {
        await deleteUserDataExport(id)
        return NextResponse.json({ success: true })
      }

      case 'backup': {
        await deleteSettingsBackup(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Advanced Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
