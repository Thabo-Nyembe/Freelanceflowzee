/**
 * Performance Analytics API Routes
 *
 * REST endpoints for Performance Analytics:
 * GET - Get metrics, snapshots, alerts, benchmarks, goals, stats
 * POST - Create metric, snapshot, alert, benchmark, goal
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('performance-analytics')

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
  getPerformanceMetrics,
  createPerformanceMetric,
  getPerformanceSnapshots,
  getLatestSnapshot,
  createPerformanceSnapshot,
  getPerformanceAlerts,
  createPerformanceAlert,
  getPerformanceBenchmarks,
  createPerformanceBenchmark,
  getPerformanceGoals,
  createPerformanceGoal,
  getPerformanceAnalyticsStats,
  getRevenueProgress,
  getEfficiencyTrend,
  getClientMetrics
} from '@/lib/performance-analytics-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'metrics'
    const period = searchParams.get('period') as string | null || 'monthly'
    const category = searchParams.get('category') as string | null
    const startDate = searchParams.get('start_date') || undefined
    const endDate = searchParams.get('end_date') || undefined
    const isRead = searchParams.get('is_read')
    const isResolved = searchParams.get('is_resolved')
    const severity = searchParams.get('severity') || undefined
    const isActive = searchParams.get('is_active')
    const isAchieved = searchParams.get('is_achieved')
    const limit = parseInt(searchParams.get('limit') || '6')

    switch (type) {
      case 'metrics': {
        const { data, error } = await getPerformanceMetrics(user.id, {
          period,
          category,
          startDate,
          endDate
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'snapshots': {
        const { data, error } = await getPerformanceSnapshots(user.id, {
          period,
          limit
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'latest-snapshot': {
        const { data, error } = await getLatestSnapshot(user.id, period)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'alerts': {
        const { data, error } = await getPerformanceAlerts(user.id, {
          is_read: isRead ? isRead === 'true' : undefined,
          is_resolved: isResolved ? isResolved === 'true' : undefined,
          severity
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'benchmarks': {
        const { data, error } = await getPerformanceBenchmarks(user.id, {
          category,
          is_active: isActive ? isActive === 'true' : undefined
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'goals': {
        const { data, error } = await getPerformanceGoals(user.id, {
          category,
          is_achieved: isAchieved ? isAchieved === 'true' : undefined
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'stats': {
        const { data, error } = await getPerformanceAnalyticsStats(user.id, period)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'revenue-progress': {
        const { data, error } = await getRevenueProgress(user.id, period, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'efficiency-trend': {
        const { data, error } = await getEfficiencyTrend(user.id, period, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'client-metrics': {
        const { data, error } = await getClientMetrics(user.id, period, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch performance analytics data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch performance analytics data' },
      { status: 500 }
    )
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
      case 'create-metric': {
        const { data, error } = await createPerformanceMetric(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-snapshot': {
        const { data, error } = await createPerformanceSnapshot(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-alert': {
        const { data, error } = await createPerformanceAlert(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-benchmark': {
        const { data, error } = await createPerformanceBenchmark(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-goal': {
        const { data, error } = await createPerformanceGoal(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process performance analytics request', { error })
    return NextResponse.json(
      { error: 'Failed to process performance analytics request' },
      { status: 500 }
    )
  }
