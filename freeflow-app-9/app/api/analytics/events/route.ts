import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuration error',
          message: 'Database not configured'
        },
        { status: 500 }
      )
    }
    
    // Get user if authenticated (optional for analytics)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get client IP address
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'
    
    const body = await request.json()
    
    const {
      event_type,
      event_name,
      session_id,
      properties = {},
      page_url,
      performance_metrics = {}
    } = body
    
    // Validate required fields
    if (!event_type || !event_name || !session_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          message: 'Missing required fields: event_type, event_name, session_id'
        },
        { status: 400 }
      )
    }
    
    // Prepare event data
    const eventData = {
      event_type,
      event_name,
      user_id: user?.id || null,
      session_id,
      timestamp: new Date().toISOString(),
      properties,
      page_url: page_url || request.headers.get('referer') || '',
      user_agent: request.headers.get('user-agent') || '',
      ip_address: ipAddress,
      performance_metrics: Object.keys(performance_metrics).length > 0 ? performance_metrics : null
    }
    
    // Insert event into database
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(eventData)
      .select()
    
    if (error) {
      console.error('Failed to insert analytics event:', error)
      throw new Error(`Failed to track event: ${error.message}`)
    }
    
    // Track special business metrics
    if (event_type === 'page_view') {
      await trackBusinessMetric(supabase, 'page_views', 1, 'count', user?.id)
    }
    
    if (event_type === 'error') {
      await trackBusinessMetric(supabase, 'errors', 1, 'count', user?.id)
    }
    
    if (event_type === 'performance' && performance_metrics.page_load_time) {
      await trackBusinessMetric(
        supabase, 'performance_page_load_time', performance_metrics.page_load_time, 'ms', user?.id
      )
    }
    
    return NextResponse.json({
      success: true,
      event_id: data[0]?.id,
      message: 'Event tracked successfully'
    })
    
  } catch (error) {
    // Properly type the error and provide structured error details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorDetails = error instanceof Error && error.cause ? error.cause : undefined
    
    console.error('Analytics API error:', {
      message: errorMessage,
      details: errorDetails
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuration error',
          message: 'Database not configured'
        },
        { status: 500 }
      )
    }
    
    // Get user (required for reading analytics)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication error',
          message: 'Authentication required',
          details: authError?.message
        },
        { status: 401 }
      )
    }
    
    const timeRange = searchParams.get('range') || 'day'
    const eventType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    // Calculate time range
    const now = new Date()
    const startTime = new Date()
    
    switch (timeRange) {
      case 'hour':
        startTime.setHours(now.getHours() - 1)
        break
      case 'day':
        startTime.setDate(now.getDate() - 1)
        break
      case 'week':
        startTime.setDate(now.getDate() - 7)
        break
      case 'month':
        startTime.setMonth(now.getMonth() - 1)
        break
      default:
        startTime.setDate(now.getDate() - 1)
    }
    
    // Build query
    let query = supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', now.toISOString())
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (eventType) {
      query = query.eq('event_type', eventType)
    }
    
    const { data: events, error } = await query
    
    if (error) {
      console.error('Failed to fetch analytics events:', error)
      throw new Error(`Failed to fetch events: ${error.message}`)
    }
    
    return NextResponse.json({
      success: true,
      events,
      message: 'Events retrieved successfully'
    })
    
  } catch (error) {
    // Properly type the error and provide structured error details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorDetails = error instanceof Error && error.cause ? error.cause : undefined
    
    console.error('Analytics API error:', {
      message: errorMessage,
      details: errorDetails
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}

// Helper function to track business metrics
async function trackBusinessMetric(
  supabase: unknown,
  metricName: string,
  value: number,
  unit: string,
  userId?: string
) {
  try {
    await supabase
      .from('business_metrics')
      .insert({
        metric_name: metricName,
        value,
        unit,
        user_id: userId,
        timestamp: new Date().toISOString()
      })
  } catch (error) {
    console.error('Failed to track business metric:', error)
  }
}

// Helper function to calculate events summary
function calculateEventsSummary(events: unknown[], metrics: unknown[]) {
  const pageViews = events.filter(e => e.event_type === 'page_view').length
  const userActions = events.filter(e => e.event_type === 'user_action').length
  const errors = events.filter(e => e.event_type === 'error').length
  const performanceEvents = events.filter(e => e.event_type === 'performance')
  
  const avgLoadTime = performanceEvents.length > 0 
    ? performanceEvents.reduce((sum, e) => {
        const loadTime = e.performance_metrics?.page_load_time || 0
        return sum + loadTime
      }, 0) / performanceEvents.length
    : 0
  
  const revenue = metrics
    .filter(m => m.metric_name === 'revenue')
    .reduce((sum, m) => sum + (m.value || 0), 0)
  
  const uniqueSessions = new Set(events.map(e => e.session_id)).size
  
  return {
    pageViews,
    userActions,
    errors,
    performanceEvents: performanceEvents.length,
    avgLoadTime: Math.round(avgLoadTime),
    revenue,
    uniqueSessions,
    totalEvents: events.length
  }
} 