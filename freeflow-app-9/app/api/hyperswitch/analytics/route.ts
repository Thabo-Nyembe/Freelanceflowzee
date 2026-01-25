/**
 * Hyperswitch Analytics API
 *
 * Payment analytics and insights for multi-processor orchestration
 *
 * GET /api/hyperswitch/analytics - Get payment analytics
 * GET /api/hyperswitch/analytics?type=connector - Get connector performance
 * GET /api/hyperswitch/analytics?type=routing - Get routing performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hyperswitchPayments } from '@/lib/payments/hyperswitch'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('hyperswitch-api')

/**
 * Get payment analytics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin permission for org-wide analytics
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .in('role', ['admin', 'owner'])
      .single()

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const connector = searchParams.get('connector')
    const currency = searchParams.get('currency')

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days

    switch (type) {
      case 'overview':
        return await getOverviewAnalytics(supabase, user.id, membership, start, end)

      case 'connector':
        return await getConnectorAnalytics(supabase, user.id, membership, start, end, connector)

      case 'routing':
        return await getRoutingAnalytics(supabase, user.id, membership, start, end)

      case 'trends':
        return await getTrendAnalytics(supabase, user.id, membership, start, end, currency)

      case 'failures':
        return await getFailureAnalytics(supabase, user.id, membership, start, end)

      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Get analytics error', { error })
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}

async function getOverviewAnalytics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  membership: { role: string; organization_id: string } | null,
  startDate: Date,
  endDate: Date
): Promise<NextResponse> {
  // Base query conditions
  const query = membership
    ? supabase.from('payment_intents').select('*').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())
    : supabase.from('payment_intents').select('*').eq('user_id', userId).gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())

  const { data: payments, error } = await query

  if (error) throw error

  // Calculate metrics
  const totalPayments = payments?.length || 0
  const successfulPayments = payments?.filter(p => p.status === 'succeeded' || p.status === 'captured').length || 0
  const failedPayments = payments?.filter(p => p.status === 'failed').length || 0
  const refundedPayments = payments?.filter(p => p.status === 'refunded' || p.status === 'partially_refunded').length || 0
  const disputedPayments = payments?.filter(p => p.status === 'disputed').length || 0

  const totalVolume = payments?.filter(p => p.status === 'succeeded' || p.status === 'captured')
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  const avgTransactionValue = successfulPayments > 0 ? totalVolume / successfulPayments : 0
  const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0

  // Get connector breakdown
  const connectorBreakdown: Record<string, { count: number; volume: number; success: number }> = {}
  payments?.forEach(p => {
    const conn = p.connector || 'unknown'
    if (!connectorBreakdown[conn]) {
      connectorBreakdown[conn] = { count: 0, volume: 0, success: 0 }
    }
    connectorBreakdown[conn].count++
    if (p.status === 'succeeded' || p.status === 'captured') {
      connectorBreakdown[conn].volume += p.amount || 0
      connectorBreakdown[conn].success++
    }
  })

  // Get currency breakdown
  const currencyBreakdown: Record<string, { count: number; volume: number }> = {}
  payments?.filter(p => p.status === 'succeeded' || p.status === 'captured').forEach(p => {
    const curr = p.currency || 'USD'
    if (!currencyBreakdown[curr]) {
      currencyBreakdown[curr] = { count: 0, volume: 0 }
    }
    currencyBreakdown[curr].count++
    currencyBreakdown[curr].volume += p.amount || 0
  })

  // Try to get Hyperswitch analytics
  let hyperswitchAnalytics = null
  try {
    hyperswitchAnalytics = await hyperswitchPayment.getPaymentAnalytics({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    })
  } catch {
    // Hyperswitch analytics may not be available
  }

  return NextResponse.json({
    success: true,
    analytics: {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary: {
        total_payments: totalPayments,
        successful_payments: successfulPayments,
        failed_payments: failedPayments,
        refunded_payments: refundedPayments,
        disputed_payments: disputedPayments,
        total_volume_cents: totalVolume,
        avg_transaction_value_cents: Math.round(avgTransactionValue),
        success_rate: Math.round(successRate * 100) / 100,
      },
      connector_breakdown: Object.entries(connectorBreakdown).map(([name, data]) => ({
        connector: name,
        count: data.count,
        volume_cents: data.volume,
        success_rate: data.count > 0 ? Math.round((data.success / data.count) * 100 * 100) / 100 : 0,
      })),
      currency_breakdown: Object.entries(currencyBreakdown).map(([currency, data]) => ({
        currency,
        count: data.count,
        volume_cents: data.volume,
      })),
      hyperswitch_analytics: hyperswitchAnalytics,
    },
  })
}

async function getConnectorAnalytics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  membership: { role: string; organization_id: string } | null,
  startDate: Date,
  endDate: Date,
  connector?: string | null
): Promise<NextResponse> {
  let query = membership
    ? supabase.from('payment_intents').select('*').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())
    : supabase.from('payment_intents').select('*').eq('user_id', userId).gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())

  if (connector) {
    query = query.eq('connector', connector)
  }

  const { data: payments, error } = await query

  if (error) throw error

  // Group by connector
  const connectorStats: Record<string, {
    total: number
    succeeded: number
    failed: number
    volume: number
    errors: Record<string, number>
    avgLatency: number
    latencies: number[]
  }> = {}

  payments?.forEach(p => {
    const conn = p.connector || 'unknown'
    if (!connectorStats[conn]) {
      connectorStats[conn] = {
        total: 0,
        succeeded: 0,
        failed: 0,
        volume: 0,
        errors: {},
        avgLatency: 0,
        latencies: [],
      }
    }

    connectorStats[conn].total++

    if (p.status === 'succeeded' || p.status === 'captured') {
      connectorStats[conn].succeeded++
      connectorStats[conn].volume += p.amount || 0
    }

    if (p.status === 'failed') {
      connectorStats[conn].failed++
      const errorCode = p.error_code || 'unknown'
      connectorStats[conn].errors[errorCode] = (connectorStats[conn].errors[errorCode] || 0) + 1
    }

    // Track latency if available
    if (p.processing_time_ms) {
      connectorStats[conn].latencies.push(p.processing_time_ms)
    }
  })

  // Calculate averages
  Object.values(connectorStats).forEach(stats => {
    if (stats.latencies.length > 0) {
      stats.avgLatency = stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length
    }
  })

  return NextResponse.json({
    success: true,
    analytics: {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      connectors: Object.entries(connectorStats).map(([name, stats]) => ({
        connector: name,
        total_payments: stats.total,
        successful_payments: stats.succeeded,
        failed_payments: stats.failed,
        volume_cents: stats.volume,
        success_rate: stats.total > 0 ? Math.round((stats.succeeded / stats.total) * 100 * 100) / 100 : 0,
        avg_latency_ms: Math.round(stats.avgLatency),
        top_errors: Object.entries(stats.errors)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([code, count]) => ({ code, count })),
      })),
    },
  })
}

async function getRoutingAnalytics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  membership: { role: string; organization_id: string } | null,
  startDate: Date,
  endDate: Date
): Promise<NextResponse> {
  // Get routing rules
  const { data: rules } = await supabase
    .from('payment_routing_rules')
    .select('*')
    .order('created_at', { ascending: false })

  // Get payments for analysis
  const query = membership
    ? supabase.from('payment_intents').select('*').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())
    : supabase.from('payment_intents').select('*').eq('user_id', userId).gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())

  const { data: payments } = await query

  // Analyze routing effectiveness
  const routingStats = {
    total_routed: 0,
    failover_triggered: 0,
    primary_success: 0,
    fallback_success: 0,
    routing_decisions: [] as Array<{
      connector: string
      count: number
      success_rate: number
    }>,
  }

  // Group by connector and analyze
  const connectorGroups: Record<string, { total: number; success: number }> = {}
  payments?.forEach(p => {
    const conn = p.connector || 'unknown'
    if (!connectorGroups[conn]) {
      connectorGroups[conn] = { total: 0, success: 0 }
    }
    connectorGroups[conn].total++
    if (p.status === 'succeeded' || p.status === 'captured') {
      connectorGroups[conn].success++
    }
    routingStats.total_routed++
  })

  routingStats.routing_decisions = Object.entries(connectorGroups).map(([connector, stats]) => ({
    connector,
    count: stats.total,
    success_rate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100 * 100) / 100 : 0,
  }))

  return NextResponse.json({
    success: true,
    analytics: {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      routing_rules: rules?.map(r => ({
        id: r.id,
        name: r.name,
        algorithm: r.algorithm,
        is_active: r.is_active,
        connectors: r.connectors,
      })),
      routing_stats: routingStats,
    },
  })
}

async function getTrendAnalytics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  membership: { role: string; organization_id: string } | null,
  startDate: Date,
  endDate: Date,
  currency?: string | null
): Promise<NextResponse> {
  let query = membership
    ? supabase.from('payment_intents').select('*').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())
    : supabase.from('payment_intents').select('*').eq('user_id', userId).gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())

  if (currency) {
    query = query.eq('currency', currency)
  }

  const { data: payments, error } = await query

  if (error) throw error

  // Group by day
  const dailyStats: Record<string, { count: number; volume: number; success: number; failed: number }> = {}

  payments?.forEach(p => {
    const day = new Date(p.created_at).toISOString().split('T')[0]
    if (!dailyStats[day]) {
      dailyStats[day] = { count: 0, volume: 0, success: 0, failed: 0 }
    }
    dailyStats[day].count++
    if (p.status === 'succeeded' || p.status === 'captured') {
      dailyStats[day].success++
      dailyStats[day].volume += p.amount || 0
    }
    if (p.status === 'failed') {
      dailyStats[day].failed++
    }
  })

  // Sort by date
  const trends = Object.entries(dailyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({
      date,
      count: stats.count,
      volume_cents: stats.volume,
      success_count: stats.success,
      failed_count: stats.failed,
      success_rate: stats.count > 0 ? Math.round((stats.success / stats.count) * 100 * 100) / 100 : 0,
    }))

  return NextResponse.json({
    success: true,
    analytics: {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      currency: currency || 'all',
      trends,
    },
  })
}

async function getFailureAnalytics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  membership: { role: string; organization_id: string } | null,
  startDate: Date,
  endDate: Date
): Promise<NextResponse> {
  const query = membership
    ? supabase.from('payment_intents').select('*').eq('status', 'failed').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())
    : supabase.from('payment_intents').select('*').eq('user_id', userId).eq('status', 'failed').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())

  const { data: failures, error } = await query

  if (error) throw error

  // Group by error code
  const errorGroups: Record<string, { count: number; connectors: string[]; messages: string[] }> = {}

  failures?.forEach(f => {
    const code = f.error_code || 'unknown'
    if (!errorGroups[code]) {
      errorGroups[code] = { count: 0, connectors: [], messages: [] }
    }
    errorGroups[code].count++
    if (f.connector && !errorGroups[code].connectors.includes(f.connector)) {
      errorGroups[code].connectors.push(f.connector)
    }
    if (f.error_message && !errorGroups[code].messages.includes(f.error_message)) {
      errorGroups[code].messages.push(f.error_message)
    }
  })

  // Sort by count
  const topErrors = Object.entries(errorGroups)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 20)
    .map(([code, stats]) => ({
      error_code: code,
      count: stats.count,
      affected_connectors: stats.connectors,
      sample_messages: stats.messages.slice(0, 3),
    }))

  return NextResponse.json({
    success: true,
    analytics: {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      total_failures: failures?.length || 0,
      top_errors: topErrors,
    },
  })
}
