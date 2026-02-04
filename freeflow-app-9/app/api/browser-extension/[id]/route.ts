/**
 * Browser Extension API - Single Resource Routes
 *
 * GET - Get single installation, capture, action
 * PUT - Update installation, capture, action, sync status, toggle favorite/archive/enabled
 * DELETE - Delete installation, capture, action, clear syncs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('browser-extension')
import {

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
  getInstallationById,
  updateInstallation,
  deleteInstallation,
  updateInstallationActivity,
  getCaptureById,
  updateCapture,
  deleteCapture,
  toggleCaptureFavorite,
  archiveCapture,
  getActionById,
  updateAction,
  deleteAction,
  incrementActionUsage,
  toggleActionEnabled,
  updateSyncStatus,
  clearCompletedSyncs
} from '@/lib/browser-extension-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'installation'

    switch (type) {
      case 'installation': {
        const result = await getInstallationById(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Installation not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      case 'capture': {
        const result = await getCaptureById(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Capture not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      case 'action': {
        const result = await getActionById(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Action not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Browser Extension API error', { error })
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
      case 'installation': {
        if (action === 'update-activity') {
          const result = await updateInstallationActivity(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateInstallation(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'capture': {
        if (action === 'toggle-favorite') {
          const result = await toggleCaptureFavorite(id, updates.is_favorite)
          return NextResponse.json({ data: result.data })
        } else if (action === 'archive') {
          const result = await archiveCapture(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateCapture(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'action': {
        if (action === 'increment-usage') {
          const result = await incrementActionUsage(id, updates.duration_ms)
          return NextResponse.json({ data: result.data })
        } else if (action === 'toggle-enabled') {
          const result = await toggleActionEnabled(id, updates.is_enabled)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateAction(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'sync': {
        if (action === 'update-status') {
          const result = await updateSyncStatus(
            id,
            updates.sync_status,
            updates.error_message,
            updates.error_code
          )
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for sync' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Browser Extension API error', { error })
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
    const type = searchParams.get('type') || 'installation'
    const olderThanDays = parseInt(searchParams.get('older_than_days') || '7')

    switch (type) {
      case 'installation': {
        await deleteInstallation(id)
        return NextResponse.json({ success: true })
      }

      case 'capture': {
        await deleteCapture(id)
        return NextResponse.json({ success: true })
      }

      case 'action': {
        await deleteAction(id)
        return NextResponse.json({ success: true })
      }

      case 'completed-syncs': {
        // id here is user_id
        await clearCompletedSyncs(id === 'me' ? user.id : id, olderThanDays)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Browser Extension API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
