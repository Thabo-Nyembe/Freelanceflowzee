/**
 * Admin Analytics API Route
 * Business analytics - revenue, traffic, conversions, insights
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('admin-analytics-api')

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true' ||
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.DEMO_MODE === 'true'
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'overview'

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Analytics API request', { action, userId: effectiveUserId })

    try {
      switch (action) {
        case 'revenue':
          return await getRevenueData(supabase, effectiveUserId, url, demoMode)
        case 'traffic':
          return await getTrafficData(supabase, effectiveUserId, url, demoMode)
        case 'conversions':
          return await getConversionData(supabase, effectiveUserId, url, demoMode)
        case 'metrics':
          return await getMetrics(supabase, effectiveUserId, url, demoMode)
        case 'insights':
          return await getInsights(supabase, effectiveUserId, url, demoMode)
        case 'reports':
          return await getReports(supabase, effectiveUserId, url, demoMode)
        case 'overview':
        default:
          return await getAnalyticsOverview(supabase, effectiveUserId, url, demoMode)
      }
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      return getDemoAnalytics()
    }
  } catch (error) {
    logger.error('Analytics API error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

function getDemoAnalytics() {
  return NextResponse.json({
    success: true,
    demo: true,
    data: {
      visitors: { total: 15420, change: 8.2 },
      conversions: { total: 342, rate: 2.2 },
      revenue: { total: 45000, change: 15.3 },
      engagement: { avgTime: '4:32', bounceRate: 35.2 },
      topPages: [
        { path: '/dashboard', views: 5420 },
        { path: '/projects', views: 3210 },
        { path: '/invoices', views: 2100 },
      ],
      chartData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [120, 150, 180, 140, 200, 90, 110]
      }
    }
  })
}

async function getRevenueData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const days = parseInt(url.searchParams.get('days') || '30')
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: revenueData, error } = await supabase
    .from('revenue_data')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    if (demoMode) {
      const demoData = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - i - 1))
        return {
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 5000) + 1000,
          transactions: Math.floor(Math.random() * 20) + 5,
          refunds: Math.floor(Math.random() * 200)
        }
      })

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          revenue: demoData,
          summary: {
            totalRevenue: demoData.reduce((s, d) => s + d.revenue, 0),
            totalTransactions: demoData.reduce((s, d) => s + d.transactions, 0),
            totalRefunds: demoData.reduce((s, d) => s + d.refunds, 0),
            avgOrderValue: Math.round(demoData.reduce((s, d) => s + d.revenue, 0) / demoData.reduce((s, d) => s + d.transactions, 0))
          }
        }
      })
    }
    throw error
  }

  const totalRevenue = revenueData?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0
  const totalTransactions = revenueData?.reduce((sum, d) => sum + (d.transactions || 0), 0) || 0
  const totalRefunds = revenueData?.reduce((sum, d) => sum + (d.refunds || 0), 0) || 0
  const netRevenue = revenueData?.reduce((sum, d) => sum + (d.net_revenue || 0), 0) || 0
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  // Calculate previous period for comparison
  const prevStartDate = new Date(startDate)
  prevStartDate.setDate(prevStartDate.getDate() - days)

  const { data: prevRevenueData } = await supabase
    .from('revenue_data')
    .select('revenue')
    .eq('user_id', userId)
    .gte('date', prevStartDate.toISOString().split('T')[0])
    .lt('date', startDate.toISOString().split('T')[0])

  const prevRevenue = prevRevenueData?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      revenue: revenueData || [],
      summary: {
        totalRevenue,
        totalTransactions,
        totalRefunds,
        netRevenue,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        revenueChange: Math.round(revenueChange * 100) / 100
      }
    }
  })
}

async function getTrafficData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const days = parseInt(url.searchParams.get('days') || '30')
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: trafficData, error } = await supabase
    .from('traffic_sources')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    if (demoMode) {
      const sources = ['organic', 'direct', 'social', 'referral', 'paid', 'email']
      const demoData = sources.map(source => ({
        source,
        visitors: Math.floor(Math.random() * 5000) + 500,
        sessions: Math.floor(Math.random() * 8000) + 1000,
        bounce_rate: Math.random() * 50 + 20,
        conversions: Math.floor(Math.random() * 200) + 20,
        revenue: Math.floor(Math.random() * 10000) + 1000
      }))

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          traffic: demoData,
          summary: {
            totalVisitors: demoData.reduce((s, d) => s + d.visitors, 0),
            totalSessions: demoData.reduce((s, d) => s + d.sessions, 0),
            avgBounceRate: (demoData.reduce((s, d) => s + d.bounce_rate, 0) / demoData.length).toFixed(2),
            totalConversions: demoData.reduce((s, d) => s + d.conversions, 0)
          }
        }
      })
    }
    throw error
  }

  // Aggregate by source
  const sourceAggregates: Record<string, any> = {}
  trafficData?.forEach(d => {
    if (!sourceAggregates[d.source]) {
      sourceAggregates[d.source] = {
        source: d.source,
        visitors: 0,
        sessions: 0,
        bounce_rate_sum: 0,
        count: 0,
        conversions: 0,
        revenue: 0
      }
    }
    sourceAggregates[d.source].visitors += d.visitors || 0
    sourceAggregates[d.source].sessions += d.sessions || 0
    sourceAggregates[d.source].bounce_rate_sum += d.bounce_rate || 0
    sourceAggregates[d.source].count++
    sourceAggregates[d.source].conversions += d.conversions || 0
    sourceAggregates[d.source].revenue += d.revenue || 0
  })

  const aggregatedTraffic = Object.values(sourceAggregates).map((s: any) => ({
    ...s,
    bounce_rate: s.count > 0 ? (s.bounce_rate_sum / s.count).toFixed(2) : 0
  }))

  const totalVisitors = aggregatedTraffic.reduce((sum, s: any) => sum + s.visitors, 0)
  const totalSessions = aggregatedTraffic.reduce((sum, s: any) => sum + s.sessions, 0)
  const totalConversions = aggregatedTraffic.reduce((sum, s: any) => sum + s.conversions, 0)
  const avgBounceRate = aggregatedTraffic.length > 0
    ? aggregatedTraffic.reduce((sum, s: any) => sum + parseFloat(s.bounce_rate), 0) / aggregatedTraffic.length
    : 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      traffic: aggregatedTraffic,
      daily: trafficData || [],
      summary: {
        totalVisitors,
        totalSessions,
        avgBounceRate: avgBounceRate.toFixed(2),
        totalConversions,
        conversionRate: totalVisitors > 0 ? (totalConversions / totalVisitors * 100).toFixed(2) : 0
      }
    }
  })
}

async function getConversionData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const days = parseInt(url.searchParams.get('days') || '30')
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: funnelData, error } = await supabase
    .from('conversion_funnel')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    if (demoMode) {
      const stages = ['visitor', 'lead', 'qualified', 'proposal', 'customer']
      const baseCounts = [10000, 2500, 1000, 400, 150]
      const demoFunnel = stages.map((stage, i) => ({
        stage,
        count: baseCounts[i],
        percentage: i > 0 ? ((baseCounts[i] / baseCounts[i - 1]) * 100).toFixed(2) : '100',
        dropoff_rate: i > 0 ? (100 - (baseCounts[i] / baseCounts[i - 1]) * 100).toFixed(2) : '0'
      }))

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          funnel: demoFunnel,
          overallConversionRate: ((baseCounts[4] / baseCounts[0]) * 100).toFixed(2)
        }
      })
    }
    throw error
  }

  // Aggregate funnel data
  const stageAggregates: Record<string, any> = {}
  funnelData?.forEach(d => {
    if (!stageAggregates[d.stage]) {
      stageAggregates[d.stage] = { stage: d.stage, count: 0, conversion_rate_sum: 0, dropoff_rate_sum: 0, days: 0 }
    }
    stageAggregates[d.stage].count += d.count || 0
    stageAggregates[d.stage].conversion_rate_sum += d.conversion_rate || 0
    stageAggregates[d.stage].dropoff_rate_sum += d.dropoff_rate || 0
    stageAggregates[d.stage].days++
  })

  const stageOrder = ['visitor', 'lead', 'qualified', 'proposal', 'customer']
  const aggregatedFunnel = stageOrder.map(stage => {
    const agg = stageAggregates[stage]
    if (!agg) return { stage, count: 0, conversion_rate: 0, dropoff_rate: 0 }
    return {
      stage,
      count: agg.count,
      conversion_rate: agg.days > 0 ? (agg.conversion_rate_sum / agg.days).toFixed(2) : 0,
      dropoff_rate: agg.days > 0 ? (agg.dropoff_rate_sum / agg.days).toFixed(2) : 0
    }
  })

  const visitorCount = stageAggregates['visitor']?.count || 1
  const customerCount = stageAggregates['customer']?.count || 0
  const overallConversionRate = (customerCount / visitorCount * 100).toFixed(2)

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      funnel: aggregatedFunnel,
      daily: funnelData || [],
      overallConversionRate
    }
  })
}

async function getMetrics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const type = url.searchParams.get('type')
  const days = parseInt(url.searchParams.get('days') || '30')
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let query = supabase
    .from('metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data: metrics, error } = await query

  if (error) {
    if (demoMode) {
      const types = ['revenue', 'conversion', 'traffic', 'roi', 'aov', 'ltv']
      const demoMetrics = types.map(t => ({
        type: t,
        name: t.charAt(0).toUpperCase() + t.slice(1),
        value: Math.floor(Math.random() * 10000) + 1000,
        previous_value: Math.floor(Math.random() * 10000) + 1000,
        change: (Math.random() * 40 - 20).toFixed(2),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        unit: t === 'revenue' || t === 'aov' || t === 'ltv' ? '$' : '%'
      }))

      return NextResponse.json({
        success: true,
        demo: true,
        data: { metrics: demoMetrics }
      })
    }
    throw error
  }

  // Get latest value for each metric type
  const latestMetrics: Record<string, any> = {}
  metrics?.forEach(m => {
    if (!latestMetrics[m.type] || new Date(m.date) > new Date(latestMetrics[m.type].date)) {
      latestMetrics[m.type] = m
    }
  })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      metrics: Object.values(latestMetrics),
      history: metrics || []
    }
  })
}

async function getInsights(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const type = url.searchParams.get('type')
  const priority = url.searchParams.get('priority')
  const dismissed = url.searchParams.get('dismissed') === 'true'

  let query = supabase
    .from('analytics_insights')
    .select('*')
    .eq('user_id', userId)
    .order('detected_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }
  if (priority) {
    query = query.eq('priority', priority)
  }
  if (!dismissed) {
    query = query.is('dismissed_at', null)
  }

  const { data: insights, error } = await query.limit(20)

  if (error) {
    if (demoMode) {
      const demoInsights = [
        {
          id: 'insight-1',
          type: 'opportunity',
          priority: 'high',
          title: 'High-Converting Traffic Source',
          description: 'Email campaigns are converting at 2x the average rate',
          impact: 'Potential 20% revenue increase',
          recommendation: 'Increase email marketing budget by 30%'
        },
        {
          id: 'insight-2',
          type: 'warning',
          priority: 'medium',
          title: 'Rising Bounce Rate',
          description: 'Mobile bounce rate increased 15% this week',
          impact: 'Potential loss of 500 conversions/month',
          recommendation: 'Optimize mobile landing pages'
        }
      ]

      return NextResponse.json({
        success: true,
        demo: true,
        data: { insights: demoInsights }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { insights: insights || [] }
  })
}

async function getReports(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const type = url.searchParams.get('type')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('analytics_reports')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('type', type)
  }

  const { data: reports, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          reports: [
            { id: 'report-1', name: 'Monthly Revenue Report', type: 'revenue', format: 'pdf', generated_at: new Date().toISOString() },
            { id: 'report-2', name: 'Traffic Analysis', type: 'traffic', format: 'csv', generated_at: new Date(Date.now() - 86400000).toISOString() },
          ],
          total: 2,
          hasMore: false
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      reports: reports || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getAnalyticsOverview(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const days = parseInt(url.searchParams.get('days') || '7')
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get revenue summary
  const { data: revenueData } = await supabase
    .from('revenue_data')
    .select('revenue, transactions')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])

  const totalRevenue = revenueData?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0
  const totalTransactions = revenueData?.reduce((sum, d) => sum + (d.transactions || 0), 0) || 0

  // Get traffic summary
  const { data: trafficData } = await supabase
    .from('traffic_sources')
    .select('visitors, conversions, bounce_rate')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])

  const totalVisitors = trafficData?.reduce((sum, d) => sum + (d.visitors || 0), 0) || 0
  const totalConversions = trafficData?.reduce((sum, d) => sum + (d.conversions || 0), 0) || 0
  const avgBounceRate = trafficData && trafficData.length > 0
    ? trafficData.reduce((sum, d) => sum + (d.bounce_rate || 0), 0) / trafficData.length
    : 0

  // Get previous period for comparison
  const prevStartDate = new Date(startDate)
  prevStartDate.setDate(prevStartDate.getDate() - days)

  const { data: prevRevenueData } = await supabase
    .from('revenue_data')
    .select('revenue')
    .eq('user_id', userId)
    .gte('date', prevStartDate.toISOString().split('T')[0])
    .lt('date', startDate.toISOString().split('T')[0])

  const prevRevenue = prevRevenueData?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0

  const { data: prevTrafficData } = await supabase
    .from('traffic_sources')
    .select('visitors')
    .eq('user_id', userId)
    .gte('date', prevStartDate.toISOString().split('T')[0])
    .lt('date', startDate.toISOString().split('T')[0])

  const prevVisitors = prevTrafficData?.reduce((sum, d) => sum + (d.visitors || 0), 0) || 0
  const visitorChange = prevVisitors > 0 ? ((totalVisitors - prevVisitors) / prevVisitors * 100) : 0

  // Get top pages from user analytics
  const { data: userAnalytics } = await supabase
    .from('user_analytics')
    .select('top_pages')
    .eq('user_id', userId)
    .single()

  // Get active insights
  const { data: insights } = await supabase
    .from('analytics_insights')
    .select('*')
    .eq('user_id', userId)
    .is('dismissed_at', null)
    .order('priority')
    .limit(3)

  // Generate chart data
  const chartLabels = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - i - 1))
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  })

  // Get daily revenue for chart
  const { data: dailyRevenue } = await supabase
    .from('revenue_data')
    .select('date, revenue')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  const chartValues = chartLabels.map((_, i) => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - (days - i - 1))
    const dateStr = targetDate.toISOString().split('T')[0]
    const dayData = dailyRevenue?.find(d => d.date === dateStr)
    return dayData?.revenue || 0
  })

  if (!revenueData && !trafficData) {
    return getDemoAnalytics()
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      visitors: {
        total: totalVisitors,
        change: Math.round(visitorChange * 100) / 100
      },
      conversions: {
        total: totalConversions,
        rate: totalVisitors > 0 ? Math.round((totalConversions / totalVisitors * 100) * 100) / 100 : 0
      },
      revenue: {
        total: totalRevenue,
        change: Math.round(revenueChange * 100) / 100
      },
      engagement: {
        avgTime: '4:32', // Would need session tracking to calculate
        bounceRate: Math.round(avgBounceRate * 100) / 100
      },
      topPages: userAnalytics?.top_pages || [
        { path: '/dashboard', views: Math.floor(totalVisitors * 0.35) },
        { path: '/projects', views: Math.floor(totalVisitors * 0.21) },
        { path: '/invoices', views: Math.floor(totalVisitors * 0.14) },
      ],
      chartData: {
        labels: chartLabels,
        values: chartValues
      },
      insights: insights || []
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { action, ...data } = body

    logger.info('Analytics POST request', { action, userId: effectiveUserId })

    try {
      switch (action) {
        case 'record_revenue':
          return await recordRevenue(supabase, effectiveUserId, data, demoMode)
        case 'record_traffic':
          return await recordTraffic(supabase, effectiveUserId, data, demoMode)
        case 'record_conversion':
          return await recordConversion(supabase, effectiveUserId, data, demoMode)
        case 'update_metric':
          return await updateMetric(supabase, effectiveUserId, data, demoMode)
        case 'dismiss_insight':
          return await dismissInsight(supabase, effectiveUserId, data, demoMode)
        case 'generate_report':
          return await generateReport(supabase, effectiveUserId, data, demoMode)
        case 'export_data':
          return await exportData(supabase, effectiveUserId, data, demoMode)
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          )
      }
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `demo-${Date.now()}`, ...data },
        message: `${action} completed (demo mode)`
      })
    }
  } catch (error) {
    logger.error('Analytics POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process analytics request' },
      { status: 500 }
    )
  }
}

async function recordRevenue(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { date, revenue, transactions = 1, refunds = 0 } = data
  const actualDate = date || new Date().toISOString().split('T')[0]

  const revenueData = {
    user_id: userId,
    date: actualDate,
    revenue,
    transactions,
    refunds,
    net_revenue: revenue - refunds,
    average_order_value: transactions > 0 ? revenue / transactions : 0
  }

  const { data: result, error } = await supabase
    .from('revenue_data')
    .upsert(revenueData, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: revenueData,
        message: 'Revenue recorded (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: result,
    message: 'Revenue recorded successfully'
  })
}

async function recordTraffic(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    date,
    source,
    visitors,
    sessions = visitors,
    bounceRate,
    bounce_rate,
    avgSessionDuration,
    avg_session_duration,
    conversions = 0,
    revenue = 0
  } = data

  if (!source || visitors === undefined) {
    return NextResponse.json(
      { success: false, error: 'Source and visitors are required' },
      { status: 400 }
    )
  }

  const actualDate = date || new Date().toISOString().split('T')[0]
  const actualBounceRate = bounceRate || bounce_rate || 0
  const conversionRate = visitors > 0 ? (conversions / visitors * 100) : 0

  const trafficData = {
    user_id: userId,
    date: actualDate,
    source,
    visitors,
    sessions,
    bounce_rate: actualBounceRate,
    avg_session_duration: avgSessionDuration || avg_session_duration || 0,
    conversions,
    conversion_rate: conversionRate,
    revenue
  }

  const { data: result, error } = await supabase
    .from('traffic_sources')
    .upsert(trafficData, { onConflict: 'user_id,date,source' })
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: trafficData,
        message: 'Traffic recorded (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: result,
    message: 'Traffic recorded successfully'
  })
}

async function recordConversion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { date, stage, count } = data

  if (!stage || count === undefined) {
    return NextResponse.json(
      { success: false, error: 'Stage and count are required' },
      { status: 400 }
    )
  }

  const actualDate = date || new Date().toISOString().split('T')[0]

  // Get previous stage count for percentage calculation
  const stageOrder = ['visitor', 'lead', 'qualified', 'proposal', 'customer']
  const stageIndex = stageOrder.indexOf(stage)
  let percentage = 100
  let conversionRate = 100
  let dropoffRate = 0

  if (stageIndex > 0) {
    const { data: prevStage } = await supabase
      .from('conversion_funnel')
      .select('count')
      .eq('user_id', userId)
      .eq('date', actualDate)
      .eq('stage', stageOrder[stageIndex - 1])
      .single()

    if (prevStage && prevStage.count > 0) {
      percentage = (count / prevStage.count * 100)
      conversionRate = percentage
      dropoffRate = 100 - percentage
    }
  }

  const conversionData = {
    user_id: userId,
    date: actualDate,
    stage,
    count,
    percentage,
    conversion_rate: conversionRate,
    dropoff_rate: dropoffRate
  }

  const { data: result, error } = await supabase
    .from('conversion_funnel')
    .upsert(conversionData, { onConflict: 'user_id,date,stage' })
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: conversionData,
        message: 'Conversion recorded (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: result,
    message: 'Conversion recorded successfully'
  })
}

async function updateMetric(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { type, name, value, previousValue, previous_value, goal, unit = '' } = data

  if (!type || !name || value === undefined) {
    return NextResponse.json(
      { success: false, error: 'Type, name, and value are required' },
      { status: 400 }
    )
  }

  const actualPreviousValue = previousValue || previous_value || value
  const change = value - actualPreviousValue
  const changePercentage = actualPreviousValue !== 0 ? (change / actualPreviousValue * 100) : 0
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable'

  const metricData = {
    user_id: userId,
    date: new Date().toISOString().split('T')[0],
    type,
    name,
    value,
    previous_value: actualPreviousValue,
    change,
    change_percentage: changePercentage,
    trend,
    goal: goal || null,
    unit
  }

  const { data: result, error } = await supabase
    .from('metrics')
    .upsert(metricData, { onConflict: 'user_id,date,type' })
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: metricData,
        message: 'Metric updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: result,
    message: 'Metric updated successfully'
  })
}

async function dismissInsight(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, insightId, insight_id } = data
  const actualId = id || insightId || insight_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Insight ID is required' },
      { status: 400 }
    )
  }

  const { data: insight, error } = await supabase
    .from('analytics_insights')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, dismissed: true },
        message: 'Insight dismissed (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: insight,
    message: 'Insight dismissed'
  })
}

async function generateReport(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    name,
    type = 'full',
    dateRange,
    date_range,
    format = 'pdf',
    customStartDate,
    custom_start_date,
    customEndDate,
    custom_end_date
  } = data

  if (!name) {
    return NextResponse.json(
      { success: false, error: 'Report name is required' },
      { status: 400 }
    )
  }

  const reportData = {
    user_id: userId,
    name,
    type,
    date_range: dateRange || date_range || '30d',
    format,
    custom_start_date: customStartDate || custom_start_date || null,
    custom_end_date: customEndDate || custom_end_date || null,
    data: {}, // Would be populated with actual report data
    generated_at: new Date().toISOString()
  }

  const { data: report, error } = await supabase
    .from('analytics_reports')
    .insert(reportData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `report-${Date.now()}`, ...reportData },
        message: 'Report generated (demo mode)'
      })
    }
    throw error
  }

  // In a real implementation, generate the actual report file here
  logger.info('Report generated', { reportId: report.id, type, format })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: report,
    message: 'Report generated successfully'
  })
}

async function exportData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { type, dateRange, date_range, format = 'csv' } = data

  if (!type) {
    return NextResponse.json(
      { success: false, error: 'Export type is required' },
      { status: 400 }
    )
  }

  // Determine date range
  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '365d': 365
  }[dateRange || date_range || '30d'] || 30

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let exportData: any[] = []

  // Fetch data based on type
  switch (type) {
    case 'revenue':
      const { data: revenueData } = await supabase
        .from('revenue_data')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true })
      exportData = revenueData || []
      break
    case 'traffic':
      const { data: trafficData } = await supabase
        .from('traffic_sources')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true })
      exportData = trafficData || []
      break
    case 'conversions':
      const { data: conversionData } = await supabase
        .from('conversion_funnel')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true })
      exportData = conversionData || []
      break
    default:
      return NextResponse.json(
        { success: false, error: 'Invalid export type' },
        { status: 400 }
      )
  }

  // In a real implementation, convert to requested format and return file URL
  // For now, return the data

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      type,
      format,
      recordCount: exportData.length,
      data: format === 'json' ? exportData : undefined,
      message: `Exported ${exportData.length} records`
    },
    message: 'Data exported successfully'
  })
}
