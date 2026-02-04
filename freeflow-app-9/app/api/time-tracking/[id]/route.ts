/**
 * Time Tracking API - Single Resource Routes
 *
 * GET - Get single time entry
 * PUT - Update, stop, pause, resume time entry
 * DELETE - Delete time entry
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('time-tracking')
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
  getTimeEntry,
  updateTimeEntry,
  stopTimeEntry,
  pauseTimeEntry,
  resumeTimeEntry,
  deleteTimeEntry,
  archiveTimeEntry
} from '@/lib/time-tracking-queries'

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

    const { data, error } = await getTimeEntry(id, user.id)
    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logger.error('Time Tracking API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch time entry' },
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
    const { action, ...updates } = body

    let result

    switch (action) {
      case 'stop':
        result = await stopTimeEntry(id, user.id)
        break

      case 'pause':
        result = await pauseTimeEntry(id, user.id)
        break

      case 'resume':
        result = await resumeTimeEntry(id, user.id)
        break

      case 'archive':
        const archiveResult = await archiveTimeEntry(id, user.id)
        return NextResponse.json({ success: archiveResult.success })

      default:
        result = await updateTimeEntry(id, user.id, updates)
    }

    if (result.error) throw result.error

    return NextResponse.json({ data: result.data })
  } catch (error) {
    logger.error('Time Tracking API error', { error })
    return NextResponse.json(
      { error: 'Failed to update time entry' },
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

    const { success, error } = await deleteTimeEntry(id, user.id)
    if (error) throw error

    return NextResponse.json({ success })
  } catch (error) {
    logger.error('Time Tracking API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete time entry' },
      { status: 500 }
    )
  }
}
