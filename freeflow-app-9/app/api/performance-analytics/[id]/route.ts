/**
 * Performance Analytics API - Single Resource Routes
 *
 * GET - Get single metric
 * PUT - Update metric, alert, benchmark, goal
 * DELETE - Delete metric, snapshot, alert, benchmark, goal
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('performance-analytics')
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
  getPerformanceMetric,
  updatePerformanceMetric,
  deletePerformanceMetric,
  deletePerformanceSnapshot,
  updatePerformanceAlert,
  markAlertAsRead,
  resolveAlert,
  deletePerformanceAlert,
  updatePerformanceBenchmark,
  deletePerformanceBenchmark,
  updatePerformanceGoal,
  updateGoalProgress,
  deletePerformanceGoal
} from '@/lib/performance-analytics-queries'

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

    const { data, error } = await getPerformanceMetric(id)
    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: 'Metric not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logger.error('Failed to fetch metric', { error })
    return NextResponse.json(
      { error: 'Failed to fetch metric' },
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

    let result

    switch (type) {
      case 'metric':
        result = await updatePerformanceMetric(id, updates)
        break

      case 'alert':
        if (action === 'mark-read') {
          result = await markAlertAsRead(id)
        } else if (action === 'resolve') {
          result = await resolveAlert(id)
        } else {
          result = await updatePerformanceAlert(id, updates)
        }
        break

      case 'benchmark':
        result = await updatePerformanceBenchmark(id, updates)
        break

      case 'goal':
        if (action === 'update-progress' && updates.current_value !== undefined) {
          result = await updateGoalProgress(id, updates.current_value)
        } else {
          result = await updatePerformanceGoal(id, updates)
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (result?.error) throw result.error

    return NextResponse.json({ data: result?.data })
  } catch (error) {
    logger.error('Failed to update resource', { error })
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
    const type = searchParams.get('type') || 'metric'

    let error

    switch (type) {
      case 'metric':
        ({ error } = await deletePerformanceMetric(id))
        break

      case 'snapshot':
        ({ error } = await deletePerformanceSnapshot(id))
        break

      case 'alert':
        ({ error } = await deletePerformanceAlert(id))
        break

      case 'benchmark':
        ({ error } = await deletePerformanceBenchmark(id))
        break

      case 'goal':
        ({ error } = await deletePerformanceGoal(id))
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete resource', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
