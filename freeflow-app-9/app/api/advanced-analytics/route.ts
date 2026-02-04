/**
 * Advanced Analytics API Routes
 *
 * REST endpoints for Advanced Analytics:
 * GET - Metrics, dashboards, widgets, reports, funnels, insights, goals, cohorts, segments, stats
 * POST - Create metrics, dashboards, widgets, filters, reports, funnels, insights, goals, cohorts, segments
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('advanced-analytics')
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
  getAnalyticsMetrics,
  createAnalyticsMetric,
  getAnalyticsDashboards,
  createAnalyticsDashboard,
  getDefaultDashboard,
  getDashboardWidgets,
  createDashboardWidget,
  getDashboardFilters,
  createDashboardFilter,
  getAnalyticsReports,
  createAnalyticsReport,
  getFunnelStages,
  createFunnelStage,
  getAnalyticsInsights,
  createAnalyticsInsight,
  getAnalyticsGoals,
  createAnalyticsGoal,
  getAnalyticsCohorts,
  createAnalyticsCohort,
  getAnalyticsSegments,
  createAnalyticsSegment,
  getAdvancedAnalyticsStats
} from '@/lib/advanced-analytics-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'metrics'
    const metricType = searchParams.get('metric_type') as string | null
    const timeRange = searchParams.get('time_range') as string | null
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const dashboardId = searchParams.get('dashboard_id')
    const reportType = searchParams.get('report_type') as string | null
    const funnelName = searchParams.get('funnel_name')
    const metricDate = searchParams.get('metric_date')
    const insightType = searchParams.get('insight_type') as string | null
    const insightImpact = searchParams.get('insight_impact') as string | null
    const isRead = searchParams.get('is_read')
    const goalStatus = searchParams.get('goal_status') as string | null
    const isPublic = searchParams.get('is_public')

    switch (type) {
      case 'metrics': {
        const filters: any = {}
        if (metricType) filters.metric_type = metricType
        if (timeRange) filters.time_range = timeRange
        if (startDate) filters.startDate = startDate
        if (endDate) filters.endDate = endDate
        const result = await getAnalyticsMetrics(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'dashboards': {
        const filters: any = {}
        if (isPublic !== null) filters.is_public = isPublic === 'true'
        const result = await getAnalyticsDashboards(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'default-dashboard': {
        const result = await getDefaultDashboard(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'widgets': {
        if (!dashboardId) {
          return NextResponse.json({ error: 'dashboard_id required' }, { status: 400 })
        }
        const result = await getDashboardWidgets(dashboardId)
        return NextResponse.json({ data: result.data })
      }

      case 'filters': {
        if (!dashboardId) {
          return NextResponse.json({ error: 'dashboard_id required' }, { status: 400 })
        }
        const result = await getDashboardFilters(dashboardId)
        return NextResponse.json({ data: result.data })
      }

      case 'reports': {
        const filters: any = {}
        if (reportType) filters.type = reportType
        const result = await getAnalyticsReports(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'funnels': {
        if (!funnelName) {
          return NextResponse.json({ error: 'funnel_name required' }, { status: 400 })
        }
        const result = await getFunnelStages(user.id, funnelName, metricDate || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'insights': {
        const filters: any = {}
        if (insightType) filters.type = insightType
        if (insightImpact) filters.impact = insightImpact
        if (isRead !== null) filters.is_read = isRead === 'true'
        const result = await getAnalyticsInsights(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'goals': {
        const filters: any = {}
        if (goalStatus) filters.status = goalStatus
        const result = await getAnalyticsGoals(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'cohorts': {
        const result = await getAnalyticsCohorts(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'segments': {
        const result = await getAnalyticsSegments(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getAdvancedAnalyticsStats(user.id, timeRange || 'month')
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Advanced Analytics data' },
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
    const { action, dashboard_id, ...payload } = body

    switch (action) {
      case 'create-metric': {
        const result = await createAnalyticsMetric(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-dashboard': {
        const result = await createAnalyticsDashboard(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-widget': {
        if (!dashboard_id) {
          return NextResponse.json({ error: 'dashboard_id required' }, { status: 400 })
        }
        const result = await createDashboardWidget(dashboard_id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-filter': {
        if (!dashboard_id) {
          return NextResponse.json({ error: 'dashboard_id required' }, { status: 400 })
        }
        const result = await createDashboardFilter(dashboard_id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-report': {
        const result = await createAnalyticsReport(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-funnel-stage': {
        const result = await createFunnelStage(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-insight': {
        const result = await createAnalyticsInsight(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-goal': {
        const result = await createAnalyticsGoal(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-cohort': {
        const result = await createAnalyticsCohort(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-segment': {
        const result = await createAnalyticsSegment(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
    return NextResponse.json(
      { error: 'Failed to process Advanced Analytics request' },
      { status: 500 }
    )
  }
}
