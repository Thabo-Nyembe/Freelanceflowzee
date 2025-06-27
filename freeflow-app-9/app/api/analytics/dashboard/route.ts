import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    
    // Get user (required for analytics dashboard)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const timeRange = searchParams.get('range') || 'day'
    
    // Get analytics summary using the database function
    const { data: summaryData, error: summaryError } = await supabase
      .rpc('get_analytics_summary')
    
    if (summaryError) {
      console.error('Failed to get analytics summary:', summaryError)
    }
    
    // Get real-time metrics
    const { data: realtimeData, error: realtimeError } = await supabase
      .rpc('get_realtime_metrics')
    
    if (realtimeError) {
      console.error('Failed to get realtime metrics:', realtimeError)
    }
    
    // Get detailed metrics for charts
    const chartData = await getChartData(supabase, user.id, timeRange)
    
    // Get top pages
    const topPages = await getTopPages(supabase, user.id, timeRange)
    
    // Get user activity
    const userActivity = await getUserActivity(supabase, user.id, timeRange)
    
    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics(supabase, user.id, timeRange)
    
    return NextResponse.json({
      success: true,
      data: {
        summary: summaryData?.[0] || getDefaultSummary(),
        realtime: realtimeData?.[0] || getDefaultRealtime(),
        charts: chartData,
        topPages,
        userActivity,
        performance: performanceMetrics,
        timeRange
      }
    })
    
  } catch (error) {
    console.error('Analytics dashboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getChartData(supabase: unknown, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  try {
    // Get daily event counts
    const { data: dailyEvents } = await supabase
      .from('hourly_events')
      .select('*')'
      .gte('hour', startDate)
      .lte('hour', endDate)
      .order('hour')
    
    // Get daily revenue
    const { data: dailyRevenue } = await supabase
      .from('revenue_summary')
      .select('*')'
      .gte('date', startDate.split('T')[0])'
      .lte('date', endDate.split('T')[0])'
      .order('date')
    
    // Process data for charts
    const eventsByDay = processEventsByDay(dailyEvents || [])
    const revenueByDay = processDailyRevenue(dailyRevenue || [])
    
    return {
      events: eventsByDay,
      revenue: revenueByDay,
      eventTypes: getEventTypeBreakdown(dailyEvents || [])
    }
  } catch (error) {
    console.error('Failed to get chart data:', error)
    return {
      events: [],
      revenue: [],
      eventTypes: []
    }
  }
}

async function getTopPages(supabase: unknown, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  try {
    const { data } = await supabase
      .from('analytics_events')
      .select('page_url, properties')
      .eq('event_type', 'page_view')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
    
    if (!data) return []
    
    // Count page visits
    const pageMap = new Map()
    data.forEach((event: unknown) => {
      const path = event.properties?.path || new URL(event.page_url || '').pathname || '/'
      pageMap.set(path, (pageMap.get(path) || 0) + 1)
    })
    
    return Array.from(pageMap.entries())
      .map(([path, visits]) => ({ path, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10)
  } catch (error) {
    console.error('Failed to get top pages:', error)
    return []
  }
}

async function getUserActivity(supabase: unknown, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  try {
    const { data } = await supabase
      .from('user_activity_summary')
      .select('*')'
      .eq('user_id', userId)
    
    return data?.[0] || {
      sessions: 0,
      page_views: 0,
      user_actions: 0,
      hours_active: 0
    }
  } catch (error) {
    console.error('Failed to get user activity:', error)
    return {
      sessions: 0,
      page_views: 0,
      user_actions: 0,
      hours_active: 0
    }
  }
}

async function getPerformanceMetrics(supabase: unknown, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  try {
    const { data } = await supabase
      .from('performance_summary')
      .select('*')'
      .gte('date', startDate.split('T')[0])'
      .lte('date', endDate.split('T')[0])'
      .order('date', { ascending: false })
      .limit(1)
    
    return data?.[0] || {
      avg_page_load_time: 0,
      avg_dom_load_time: 0,
      avg_fcp: 0,
      avg_lcp: 0,
      avg_cls: 0,
      total_measurements: 0
    }
  } catch (error) {
    console.error('Failed to get performance metrics:', error)
    return {
      avg_page_load_time: 0,
      avg_dom_load_time: 0,
      avg_fcp: 0,
      avg_lcp: 0,
      avg_cls: 0,
      total_measurements: 0
    }
  }
}

function getDateRange(timeRange: string) {
  const now = new Date()
  const startDate = new Date()
  
  switch (timeRange) {
    case 'hour':
      startDate.setHours(now.getHours() - 1)
      break
    case 'day':
      startDate.setDate(now.getDate() - 1)
      break
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
    default:
      startDate.setDate(now.getDate() - 1)
  }
  
  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString()
  }
}

function processEventsByDay(events: unknown[]) {
  const eventMap = new Map()
  
  events.forEach((event: unknown) => {
    const date = event.hour.split('T')[0]'
    const current = eventMap.get(date) || 0
    eventMap.set(date, current + event.event_count)
  })
  
  return Array.from(eventMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function processDailyRevenue(revenue: unknown[]) {
  return revenue.map((item: unknown) => ({
    date: item.date,
    revenue: item.daily_revenue || 0,
    payments: item.payments_count || 0,
    avgAmount: item.avg_payment_amount || 0
  }))
}

function getEventTypeBreakdown(events: unknown[]) {
  const typeMap = new Map()
  
  events.forEach((event: unknown) => {
    const current = typeMap.get(event.event_type) || 0
    typeMap.set(event.event_type, current + event.event_count)
  })
  
  return Array.from(typeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

function getDefaultSummary() {
  return {
    total_events: 0,
    total_users: 0,
    total_sessions: 0,
    total_page_views: 0,
    total_revenue: 0,
    avg_session_duration: 0
  }
}

function getDefaultRealtime() {
  return {
    active_sessions: 0,
    events_last_hour: 0,
    revenue_today: 0,
    page_views_today: 0,
    errors_today: 0
  }
}

// POST endpoint for custom analytics queries
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      )
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { query, parameters = {} } = body
    
    // Define allowed custom queries for security
    const allowedQueries = {
      'user_funnel': `
        SELECT 
          event_name,
          COUNT(*) as count,
          COUNT(DISTINCT session_id) as unique_sessions
        FROM analytics_events 
        WHERE user_id = $1 
          AND event_type = 'user_action'
          AND timestamp >= $2
        GROUP BY event_name
        ORDER BY count DESC
      `, 'page_performance': `
        SELECT 
          properties->>'path' as page,
          AVG((performance_metrics->>'page_load_time')::numeric) as avg_load_time,
          COUNT(*) as measurements
        FROM analytics_events
        WHERE user_id = $1
          AND event_type = 'performance'
          AND timestamp >= $2
        GROUP BY properties->>'path'
        ORDER BY avg_load_time DESC
      `, 'error_analysis': `
        SELECT 
          properties->>'error_message' as error,
          COUNT(*) as occurrences,
          MAX(timestamp) as last_occurrence
        FROM analytics_events
        WHERE user_id = $1
          AND event_type = 'error'
          AND timestamp >= $2
        GROUP BY properties->>'error_message'
        ORDER BY occurrences DESC
      `
    }
    
    if (!allowedQueries[query as keyof typeof allowedQueries]) {
      return NextResponse.json(
        { success: false, error: 'Query not allowed' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .rpc('execute_analytics_query', {
        query_name: query,
        user_id: user.id,
        start_date: parameters.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      })
    
    if (error) {
      console.error('Custom analytics query error:', error)
      return NextResponse.json(
        { success: false, error: 'Query execution failed' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: data || [],
      query
    })
    
  } catch (error) {
    console.error('Analytics POST API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 