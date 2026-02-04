/**
 * Time Tracking API Routes
 *
 * REST endpoints for Time Tracking feature:
 * GET - List time entries, get summary, get running entry
 * POST - Create time entry, start timer
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('time-tracking')

// Demo mode support
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}
import {
  getTimeEntries,
  getRunningTimeEntry,
  createTimeEntry,
  getTimeTrackingSummary,
  getDailyTimeEntries,
  getWeeklyTimeReport,
  exportTimeEntries
} from '@/lib/time-tracking-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Check for demo mode
    const demoMode = isDemoMode(request)

    // Determine user ID - use demo user if in demo mode and not authenticated
    let userId: string

    if (authError || !user) {
      if (demoMode) {
        // Use demo user ID for unauthenticated demo mode
        userId = DEMO_USER_ID
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      // Check if authenticated user is a demo account
      const userEmail = user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'

      if (isDemoAccount || demoMode) {
        userId = DEMO_USER_ID
      } else {
        userId = user.id
      }
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'entries'
    const startDate = searchParams.get('start_date') || undefined
    const endDate = searchParams.get('end_date') || undefined
    const projectId = searchParams.get('project_id') || undefined
    const status = searchParams.get('status') as string | null
    const isBillable = searchParams.get('is_billable')
    const date = searchParams.get('date') || undefined
    const weekStart = searchParams.get('week_start') || undefined

    switch (type) {
      case 'entries': {
        const { data, error } = await getTimeEntries(userId, {
          startDate,
          endDate,
          projectId,
          status,
          isBillable: isBillable ? isBillable === 'true' : undefined
        })
        if (error) throw error
        return NextResponse.json({ data, demo: demoMode || userId === DEMO_USER_ID })
      }

      case 'running': {
        const { data, error } = await getRunningTimeEntry(userId)
        if (error) throw error
        return NextResponse.json({ data, demo: demoMode || userId === DEMO_USER_ID })
      }

      case 'summary': {
        const { data, error } = await getTimeTrackingSummary(userId, startDate, endDate)
        if (error) throw error
        return NextResponse.json({ data, demo: demoMode || userId === DEMO_USER_ID })
      }

      case 'daily': {
        const { data, error } = await getDailyTimeEntries(userId, date)
        if (error) throw error
        return NextResponse.json({ data, demo: demoMode || userId === DEMO_USER_ID })
      }

      case 'weekly': {
        const { data, error } = await getWeeklyTimeReport(userId, weekStart)
        if (error) throw error
        return NextResponse.json({ data, demo: demoMode || userId === DEMO_USER_ID })
      }

      case 'export': {
        const { data, error } = await exportTimeEntries(userId, {
          startDate,
          endDate,
          projectId
        })
        if (error) throw error
        return new NextResponse(data, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="time-entries-${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Time Tracking API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch time tracking data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      project_id,
      project_name,
      task_id,
      task_name,
      description,
      is_billable,
      hourly_rate,
      tags,
      notes,
      metadata
    } = body

    const { data, error } = await createTimeEntry(user.id, {
      project_id,
      project_name,
      task_id,
      task_name,
      description,
      is_billable,
      hourly_rate,
      tags,
      notes,
      metadata
    })

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    logger.error('Time Tracking API error', { error })
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    )
  }
}
