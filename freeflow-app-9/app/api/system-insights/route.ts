/**
 * System Insights API Routes
 *
 * REST endpoints for System Monitoring:
 * GET - Metrics, performance logs, error logs, health, resources, API performance, alerts, dashboard
 * POST - Log metrics, performance, errors, create alerts, update resource usage, update health
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('system-insights')
import {
  getSystemMetrics,
  logMetric,
  getMetricsByType,
  getAverageMetric,
  getMetricsSummary,
  getPerformanceLogs,
  logPerformance,
  getSlowOperations,
  getAverageResponseTimeByEndpoint,
  getErrorLogs,
  logError,
  getCriticalErrors,
  getErrorRate,
  getSystemHealth,
  updateSystemHealth,
  getSystemHealthHistory,
  getResourceUsage,
  updateResourceUsage,
  getAlertingResources,
  getApiPerformance,
  getSlowestEndpoints,
  getActiveAlerts,
  createAlert,
  getAlertHistory,
  getSystemDashboard,
  exportMetrics,
  exportErrorLogs
} from '@/lib/system-insights-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard'
    const metricType = searchParams.get('metric_type') as string | null
    const severity = searchParams.get('severity') as string | null
    const resourceType = searchParams.get('resource_type') as string | null
    const operation = searchParams.get('operation')
    const endpoint = searchParams.get('endpoint')
    const resolved = searchParams.get('resolved')
    const success = searchParams.get('success')
    const acknowledged = searchParams.get('acknowledged')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const timeWindow = (searchParams.get('time_window') || '24h')
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 7
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

    switch (type) {
      case 'dashboard': {
        const data = await getSystemDashboard(user.id)
        return NextResponse.json({ data })
      }

      case 'metrics': {
        const filters: any = {}
        if (metricType) filters.metric_type = metricType
        if (startDate) filters.start_date = new Date(startDate)
        if (endDate) filters.end_date = new Date(endDate)
        const data = await getSystemMetrics(user.id, filters, limit)
        return NextResponse.json({ data })
      }

      case 'metrics-by-type': {
        if (!metricType) {
          return NextResponse.json({ error: 'metric_type required' }, { status: 400 })
        }
        const data = await getMetricsByType(metricType, user.id, limit)
        return NextResponse.json({ data })
      }

      case 'average-metric': {
        if (!metricType) {
          return NextResponse.json({ error: 'metric_type required' }, { status: 400 })
        }
        const data = await getAverageMetric(metricType, timeWindow, user.id)
        return NextResponse.json({ data })
      }

      case 'metrics-summary': {
        const data = await getMetricsSummary(
          user.id,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        )
        return NextResponse.json({ data })
      }

      case 'performance-logs': {
        const filters: any = {}
        if (operation) filters.operation = operation
        if (endpoint) filters.endpoint = endpoint
        if (success !== null) filters.success = success === 'true'
        if (startDate) filters.start_date = new Date(startDate)
        if (endDate) filters.end_date = new Date(endDate)
        const data = await getPerformanceLogs(user.id, filters, limit)
        return NextResponse.json({ data })
      }

      case 'slow-operations': {
        const data = await getSlowOperations(limit)
        return NextResponse.json({ data })
      }

      case 'average-response-by-endpoint': {
        const data = await getAverageResponseTimeByEndpoint(timeWindow)
        return NextResponse.json({ data })
      }

      case 'error-logs': {
        const filters: any = {}
        if (severity) filters.severity = severity
        if (resolved !== null) filters.resolved = resolved === 'true'
        if (startDate) filters.start_date = new Date(startDate)
        if (endDate) filters.end_date = new Date(endDate)
        const data = await getErrorLogs(user.id, filters, limit)
        return NextResponse.json({ data })
      }

      case 'critical-errors': {
        const data = await getCriticalErrors(limit)
        return NextResponse.json({ data })
      }

      case 'error-rate': {
        const data = await getErrorRate(timeWindow)
        return NextResponse.json({ data })
      }

      case 'health': {
        const data = await getSystemHealth()
        return NextResponse.json({ data })
      }

      case 'health-history': {
        const data = await getSystemHealthHistory(days)
        return NextResponse.json({ data })
      }

      case 'resource-usage': {
        const data = await getResourceUsage(user.id, resourceType, limit)
        return NextResponse.json({ data })
      }

      case 'alerting-resources': {
        const data = await getAlertingResources()
        return NextResponse.json({ data })
      }

      case 'api-performance': {
        const data = await getApiPerformance(endpoint || undefined, limit)
        return NextResponse.json({ data })
      }

      case 'slowest-endpoints': {
        const data = await getSlowestEndpoints(limit)
        return NextResponse.json({ data })
      }

      case 'active-alerts': {
        const data = await getActiveAlerts(severity || undefined)
        return NextResponse.json({ data })
      }

      case 'alert-history': {
        const filters: any = {}
        if (severity) filters.severity = severity
        if (resolved !== null) filters.resolved = resolved === 'true'
        if (startDate) filters.start_date = new Date(startDate)
        if (endDate) filters.end_date = new Date(endDate)
        const data = await getAlertHistory(filters, limit)
        return NextResponse.json({ data })
      }

      case 'export-metrics': {
        const data = await exportMetrics(
          user.id,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        )
        return NextResponse.json({ data })
      }

      case 'export-error-logs': {
        const data = await exportErrorLogs(
          user.id,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        )
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch System Insights data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch System Insights data' },
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
      case 'log-metric': {
        const data = await logMetric({ user_id: user.id, ...payload })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'log-performance': {
        const data = await logPerformance({ user_id: user.id, ...payload })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'log-error': {
        const data = await logError({ user_id: user.id, ...payload })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-alert': {
        const data = await createAlert(payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'update-resource-usage': {
        const data = await updateResourceUsage({ user_id: user.id, ...payload })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'update-health': {
        const data = await updateSystemHealth()
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process System Insights request', { error })
    return NextResponse.json(
      { error: 'Failed to process System Insights request' },
      { status: 500 }
    )
  }
}
