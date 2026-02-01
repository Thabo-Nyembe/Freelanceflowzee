/**
 * Admin Analytics API Routes
 *
 * REST endpoints for Admin Analytics:
 * GET - Revenue data, conversion funnels, traffic sources, insights, metrics, reports, dashboard
 * POST - Create revenue records, insights, metrics, reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('admin-analytics')
import {
  getRevenueData,
  recordRevenueData,
  getRevenueByPeriod,
  getConversionFunnel,
  getFunnelStageData,
  getTrafficSources,
  getTrafficBySource,
  getAnalyticsInsights,
  createInsight,
  getInsightsByCategory,
  getAnalyticsMetrics,
  createMetric,
  getMetricsByType,
  getAnalyticsReports,
  createReport,
  getReportsByStatus,
  getDashboardAnalytics
} from '@/lib/admin-analytics-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard'
    const period = searchParams.get('period') as string | null
    const category = searchParams.get('category') as string | null
    const metricType = searchParams.get('metric_type') as string | null
    const status = searchParams.get('status') as string | null
    const source = searchParams.get('source') as string | null
    const stage = searchParams.get('stage') as string | null
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'revenue': {
        const filters: any = { limit }
        if (startDate) filters.start_date = startDate
        if (endDate) filters.end_date = endDate
        const result = await getRevenueData(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'revenue-by-period': {
        if (!period) {
          return NextResponse.json({ error: 'period required' }, { status: 400 })
        }
        const result = await getRevenueByPeriod(user.id, period)
        return NextResponse.json({ data: result.data })
      }

      case 'conversion-funnel': {
        const result = await getConversionFunnel(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'funnel-stage': {
        if (!stage) {
          return NextResponse.json({ error: 'stage required' }, { status: 400 })
        }
        const result = await getFunnelStageData(user.id, stage)
        return NextResponse.json({ data: result.data })
      }

      case 'traffic-sources': {
        const result = await getTrafficSources(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'traffic-by-source': {
        if (!source) {
          return NextResponse.json({ error: 'source required' }, { status: 400 })
        }
        const result = await getTrafficBySource(user.id, source)
        return NextResponse.json({ data: result.data })
      }

      case 'insights': {
        const filters: any = { limit }
        if (category) filters.category = category
        const result = await getAnalyticsInsights(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'insights-by-category': {
        if (!category) {
          return NextResponse.json({ error: 'category required' }, { status: 400 })
        }
        const result = await getInsightsByCategory(user.id, category)
        return NextResponse.json({ data: result.data })
      }

      case 'metrics': {
        const filters: any = { limit }
        if (metricType) filters.metric_type = metricType
        const result = await getAnalyticsMetrics(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'metrics-by-type': {
        if (!metricType) {
          return NextResponse.json({ error: 'metric_type required' }, { status: 400 })
        }
        const result = await getMetricsByType(user.id, metricType)
        return NextResponse.json({ data: result.data })
      }

      case 'reports': {
        const filters: any = { limit }
        if (status) filters.status = status
        const result = await getAnalyticsReports(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'reports-by-status': {
        if (!status) {
          return NextResponse.json({ error: 'status required' }, { status: 400 })
        }
        const result = await getReportsByStatus(user.id, status)
        return NextResponse.json({ data: result.data })
      }

      case 'dashboard': {
        const result = await getDashboardAnalytics(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Admin Analytics data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Admin Analytics data' },
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
      case 'record-revenue': {
        const result = await recordRevenueData(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-insight': {
        const result = await createInsight(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-metric': {
        const result = await createMetric(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-report': {
        const result = await createReport(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Admin Analytics request', { error })
    return NextResponse.json(
      { error: 'Failed to process Admin Analytics request' },
      { status: 500 }
    )
  }
}
