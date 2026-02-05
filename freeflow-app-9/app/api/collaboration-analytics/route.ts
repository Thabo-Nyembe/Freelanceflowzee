/**
 * Collaboration Analytics API Routes
 *
 * REST endpoints for Collaboration Analytics:
 * GET - Analytics, team member stats, collaboration stats, report schedules
 * POST - Export reports, create/cancel report schedules
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('collaboration-analytics')
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
  getCollaborationAnalytics,
  getTeamMemberStats,
  getCollaborationStats,
  exportCollaborationReport,
  upsertReportSchedule,
  getReportSchedule,
  cancelReportSchedule
} from '@/lib/collaboration-analytics-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'analytics'
    const dateRange = (searchParams.get('date_range') || '7days') as '7days' | '30days' | '90days' | 'year'

    switch (type) {
      case 'analytics': {
        const result = await getCollaborationAnalytics(user.id, dateRange)
        return NextResponse.json({ data: result.data })
      }

      case 'team-stats': {
        const result = await getTeamMemberStats(user.id, dateRange)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getCollaborationStats(user.id, dateRange)
        return NextResponse.json({ data: result.data })
      }

      case 'report-schedule': {
        const result = await getReportSchedule(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Collaboration Analytics data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Collaboration Analytics data' },
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
    const { action, ...payload } = body

    switch (action) {
      case 'export-report': {
        const result = await exportCollaborationReport(
          user.id,
          payload.date_range || '7days',
          payload.format || 'csv'
        )
        return NextResponse.json({ data: result.data })
      }

      case 'create-schedule': {
        const result = await upsertReportSchedule(user.id, payload.frequency)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'cancel-schedule': {
        const result = await cancelReportSchedule(user.id)
        return NextResponse.json({ success: !result.error })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Collaboration Analytics request', { error })
    return NextResponse.json(
      { error: 'Failed to process Collaboration Analytics request' },
      { status: 500 }
    )
  }
}
