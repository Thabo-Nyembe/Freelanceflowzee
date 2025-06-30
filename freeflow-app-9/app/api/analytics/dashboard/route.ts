import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getChartData, getTopPages, getUserActivity, getPerformanceMetrics } from '@/lib/analytics'

export async function GET(request: NextRequest) {
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
    
    const url = new URL(request.url)
    const userId = user.id
    const timeRange = url.searchParams.get('timeRange') || 'week'
    const metric = url.searchParams.get('metric')
    
    try {
      // Get dashboard summary data
      const summary = await getDashboardSummary(supabase, userId, timeRange)
      const chartData = await getChartData(supabase, userId, timeRange)
      const topPages = await getTopPages(supabase, userId, timeRange)
      const userActivity = await getUserActivity(supabase, userId, timeRange)
      const performance = await getPerformanceMetrics(supabase, userId, timeRange)
      const realtimeData = await getRealtimeData(supabase, userId)
      
      // Return specific metric if requested
      if (metric) {
        const metrics = {
          summary,
          chartData,
          topPages,
          userActivity,
          performance,
          realtime: realtimeData
        }
        
        return NextResponse.json({
          success: true,
          data: metrics[metric as keyof typeof metrics] || null,
          timestamp: new Date().toISOString()
        })
      }
      
      // Return complete dashboard data
      return NextResponse.json({
        success: true,
        data: {
          summary,
          chartData,
          topPages,
          userActivity,
          performance,
          realtime: realtimeData
        },
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('Analytics error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch analytics data',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    )
  }
}

async function getDashboardSummary(supabase: any, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  try {
    const { data } = await supabase
      .from('analytics_summary')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.split('T')[0])
      .lte('date', endDate.split('T')[0])
      .single()
    
    return data || getDefaultSummary()
  } catch (error) {
    console.error('Failed to get summary:', error)
    return getDefaultSummary()
  }
}

async function getChartData(supabase: any, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  try {
    const { data: events } = await supabase
      .from('hourly_analytics')
      .select('hour, event_count, event_type')
      .eq('user_id', userId)
      .gte('hour', startDate)
      .lte('hour', endDate)
      .order('hour', { ascending: true })
    
    const { data: revenue } = await supabase
      .from('daily_revenue')
      .select('date, daily_revenue, payments_count, avg_payment_amount')
      .eq('user_id', userId)
      .gte('date', startDate.split('T')[0])
      .lte('date', endDate.split('T')[0])
      .order('date', { ascending: true })
    
    return {
      events: events ? processEventsByDay(events) : [],
      revenue: revenue ? processDailyRevenue(revenue) : [],
      breakdown: events ? getEventTypeBreakdown(events) : []
    }
  } catch (error) {
    console.error('Failed to get chart data:', error)
    return {
      events: [],
      revenue: [],
      breakdown: []
    }
  }
}

async function getTopPages(supabase: any, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  try {
    const { data } = await supabase
      .from('analytics_events')
      .select('properties, page_url')
      .eq('user_id', userId)
      .eq('event_type', 'page_view')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
    
    if (!data) return []
    
    // Count page visits
    const pageMap = new Map()
    data.forEach((event: any) => {
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

async function getUserActivity(supabase: any, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  try {
    const { data } = await supabase
      .from('user_activity_summary')
      .select('*')
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

async function getPerformanceMetrics(supabase: any, userId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange)
  
  try {
    const { data } = await supabase
      .from('performance_summary')
      .select('*')
      .gte('date', startDate.split('T')[0])
      .lte('date', endDate.split('T')[0])
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

async function getRealtimeData(supabase: any, userId: string) {
  try {
    const { data } = await supabase
      .from('realtime_analytics')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return data || getDefaultRealtime()
  } catch (error) {
    console.error('Failed to get realtime data:', error)
    return getDefaultRealtime()
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

function processEventsByDay(events: any[]) {
  const eventMap = new Map()
  
  events.forEach((event: any) => {
    const date = event.hour.split('T')[0]
    const current = eventMap.get(date) || 0
    eventMap.set(date, current + event.event_count)
  })
  
  return Array.from(eventMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function processDailyRevenue(revenue: any[]) {
  return revenue.map((item: any) => ({
    date: item.date,
    revenue: item.daily_revenue || 0,
    payments: item.payments_count || 0,
    avgAmount: item.avg_payment_amount || 0
  }))
}

function getEventTypeBreakdown(events: any[]) {
  const typeMap = new Map()
  
  events.forEach((event: any) => {
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
      `,
      'page_performance': `
        SELECT 
          page_url,
          AVG(page_load_time) as avg_load_time,
          COUNT(*) as total_loads
        FROM performance_events 
        WHERE user_id = $1 
          AND timestamp >= $2
        GROUP BY page_url
        ORDER BY avg_load_time DESC
      `,
      'conversion_funnel': `
        SELECT 
          step_name,
          COUNT(DISTINCT user_id) as users,
          step_order
        FROM conversion_events 
        WHERE timestamp >= $1
        GROUP BY step_name, step_order
        ORDER BY step_order
      `
    }
    
    if (!allowedQueries[query as keyof typeof allowedQueries]) {
      return NextResponse.json(
        { success: false, error: 'Query not allowed' },
        { status: 400 }
      )
    }
    
    const sqlQuery = allowedQueries[query as keyof typeof allowedQueries]
    const { data, error } = await supabase.rpc('execute_analytics_query', {
      query: sqlQuery,
      params: Object.values(parameters)
    })
    
    if (error) {
      console.error('Query execution error:', error)
      return NextResponse.json(
        { success: false, error: 'Query execution failed' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data,
      query,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Analytics POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to execute query' },
      { status: 500 }
    )
  }
} 