/**
 * Payment Analytics API
 *
 * Comprehensive financial analytics and reporting
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'
import {
  getRevenueMetrics,
  getPaymentMetrics,
  getClientMetrics,
  getAgingReport,
  getKPIMetrics,
  getCashFlowForecast,
  getRevenueTrends,
  getAnalyticsDashboard,
  type TimePeriod
} from '@/lib/invoicing/payment-analytics-service'
import type { Currency } from '@/lib/invoice-types'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-PaymentAnalytics')

/**
 * GET /api/invoicing/analytics
 * Get analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'dashboard'
    const period = (searchParams.get('period') || 'month') as TimePeriod
    const currency = (searchParams.get('currency') || 'USD') as Currency

    logger.info('Getting analytics', { reportType, period, currency })

    switch (reportType) {
      case 'dashboard': {
        const dashboard = await getAnalyticsDashboard(user.id, period, currency)
        return NextResponse.json({
          success: true,
          type: 'dashboard',
          data: dashboard
        })
      }

      case 'revenue': {
        const revenue = await getRevenueMetrics(user.id, period, currency)
        return NextResponse.json({
          success: true,
          type: 'revenue',
          data: revenue
        })
      }

      case 'payments': {
        const payments = await getPaymentMetrics(user.id, period, currency)
        return NextResponse.json({
          success: true,
          type: 'payments',
          data: payments
        })
      }

      case 'clients': {
        const clients = await getClientMetrics(user.id, period)
        return NextResponse.json({
          success: true,
          type: 'clients',
          data: clients
        })
      }

      case 'aging': {
        const aging = await getAgingReport(user.id, currency)
        return NextResponse.json({
          success: true,
          type: 'aging',
          data: aging
        })
      }

      case 'kpis': {
        const kpis = await getKPIMetrics(user.id, period)
        return NextResponse.json({
          success: true,
          type: 'kpis',
          data: kpis
        })
      }

      case 'forecast': {
        const periods = parseInt(searchParams.get('periods') || '6')
        const periodType = (searchParams.get('periodType') || 'month') as 'week' | 'month'
        const forecast = await getCashFlowForecast(user.id, periods, periodType)
        return NextResponse.json({
          success: true,
          type: 'forecast',
          data: forecast
        })
      }

      case 'trends': {
        const periods = parseInt(searchParams.get('periods') || '12')
        const periodType = (searchParams.get('periodType') || 'month') as 'week' | 'month'
        const trends = await getRevenueTrends(user.id, periods, periodType)
        return NextResponse.json({
          success: true,
          type: 'trends',
          data: trends
        })
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid report type',
            validTypes: ['dashboard', 'revenue', 'payments', 'clients', 'aging', 'kpis', 'forecast', 'trends']
          },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Analytics API error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invoicing/analytics
 * Generate custom reports
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reports, period, currency } = body

    if (!reports || !Array.isArray(reports)) {
      return NextResponse.json(
        { success: false, error: 'reports array is required' },
        { status: 400 }
      )
    }

    const validReports = ['revenue', 'payments', 'clients', 'aging', 'kpis', 'forecast', 'trends']
    const results: Record<string, any> = {}

    for (const report of reports) {
      if (!validReports.includes(report)) continue

      switch (report) {
        case 'revenue':
          results.revenue = await getRevenueMetrics(user.id, period, currency)
          break
        case 'payments':
          results.payments = await getPaymentMetrics(user.id, period, currency)
          break
        case 'clients':
          results.clients = await getClientMetrics(user.id, period)
          break
        case 'aging':
          results.aging = await getAgingReport(user.id, currency)
          break
        case 'kpis':
          results.kpis = await getKPIMetrics(user.id, period)
          break
        case 'forecast':
          results.forecast = await getCashFlowForecast(user.id)
          break
        case 'trends':
          results.trends = await getRevenueTrends(user.id)
          break
      }
    }

    return NextResponse.json({
      success: true,
      reports: results,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Analytics POST error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
