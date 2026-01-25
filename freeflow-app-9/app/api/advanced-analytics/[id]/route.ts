/**
 * Advanced Analytics API - Single Resource Routes
 *
 * GET - Get single metric, dashboard, widget, report, goal
 * PUT - Update metric, dashboard, widget, filter, report, funnel stage, insight, goal, cohort, segment
 * DELETE - Delete metric, dashboard, widget, filter, report, funnel stage, insight, goal, cohort, segment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('advanced-analytics')
import {
  getAnalyticsMetric,
  updateAnalyticsMetric,
  deleteAnalyticsMetric,
  getAnalyticsDashboard,
  updateAnalyticsDashboard,
  deleteAnalyticsDashboard,
  updateDashboardWidget,
  deleteDashboardWidget,
  updateDashboardFilter,
  deleteDashboardFilter,
  getAnalyticsReport,
  updateAnalyticsReport,
  deleteAnalyticsReport,
  updateFunnelStage,
  deleteFunnelStage,
  updateAnalyticsInsight,
  markInsightAsRead,
  deleteAnalyticsInsight,
  getAnalyticsGoal,
  updateAnalyticsGoal,
  updateGoalCurrentValue,
  deleteAnalyticsGoal,
  updateAnalyticsCohort,
  deleteAnalyticsCohort,
  updateAnalyticsSegment,
  deleteAnalyticsSegment
} from '@/lib/advanced-analytics-queries'

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
    const type = searchParams.get('type') || 'metric'

    switch (type) {
      case 'metric': {
        const result = await getAnalyticsMetric(id)
        return NextResponse.json({ data: result.data })
      }

      case 'dashboard': {
        const result = await getAnalyticsDashboard(id)
        return NextResponse.json({ data: result.data })
      }

      case 'report': {
        const result = await getAnalyticsReport(id)
        return NextResponse.json({ data: result.data })
      }

      case 'goal': {
        const result = await getAnalyticsGoal(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
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
      case 'metric': {
        const result = await updateAnalyticsMetric(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'dashboard': {
        const result = await updateAnalyticsDashboard(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'widget': {
        const result = await updateDashboardWidget(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'filter': {
        const result = await updateDashboardFilter(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'report': {
        const result = await updateAnalyticsReport(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'funnel-stage': {
        const result = await updateFunnelStage(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'insight': {
        if (action === 'mark-read') {
          const result = await markInsightAsRead(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateAnalyticsInsight(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'goal': {
        if (action === 'update-value') {
          const result = await updateGoalCurrentValue(id, updates.current_value)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateAnalyticsGoal(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'cohort': {
        const result = await updateAnalyticsCohort(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'segment': {
        const result = await updateAnalyticsSegment(id, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
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

    switch (type) {
      case 'metric': {
        await deleteAnalyticsMetric(id)
        return NextResponse.json({ success: true })
      }

      case 'dashboard': {
        await deleteAnalyticsDashboard(id)
        return NextResponse.json({ success: true })
      }

      case 'widget': {
        await deleteDashboardWidget(id)
        return NextResponse.json({ success: true })
      }

      case 'filter': {
        await deleteDashboardFilter(id)
        return NextResponse.json({ success: true })
      }

      case 'report': {
        await deleteAnalyticsReport(id)
        return NextResponse.json({ success: true })
      }

      case 'funnel-stage': {
        await deleteFunnelStage(id)
        return NextResponse.json({ success: true })
      }

      case 'insight': {
        await deleteAnalyticsInsight(id)
        return NextResponse.json({ success: true })
      }

      case 'goal': {
        await deleteAnalyticsGoal(id)
        return NextResponse.json({ success: true })
      }

      case 'cohort': {
        await deleteAnalyticsCohort(id)
        return NextResponse.json({ success: true })
      }

      case 'segment': {
        await deleteAnalyticsSegment(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
