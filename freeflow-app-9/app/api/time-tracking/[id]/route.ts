/**
 * Time Tracking API - Single Resource Routes
 *
 * GET - Get single time entry
 * PUT - Update, stop, pause, resume time entry
 * DELETE - Delete time entry
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('time-tracking')
import {
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
