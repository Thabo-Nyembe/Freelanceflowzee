import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// Context7 Enhanced Analytics Tracking for Monetization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data, timestamp, userAgent, referrer } = body

    // Get client IP and location data
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const clientIp = forwarded ? forwarded.split(',')[0] : (realIp || null)

    // Initialize Supabase client
    const supabase = await createClient()

    // Get current user (optional - for authenticated events)
    const { data: { user } } = await supabase.auth.getUser()

    // Enhanced event data with monetization context
    const eventData = {
      event_name: event,
      event_data: data,
      user_id: user?.id || null,
      session_id: generateSessionId(userAgent, clientIp),
      timestamp: timestamp || new Date().toISOString(),
      user_agent: userAgent,
      referrer: referrer,
      ip_address: clientIp,
      metadata: {
        revenue_potential: calculateRevenuePotential(event, data),
        conversion_value: calculateConversionValue(event, data),
        traffic_source: getTrafficSource(referrer),
        device_type: getDeviceType(userAgent || ''),
        utm_data: extractUTMParams(referrer)
      }
    }

    // Store in analytics table
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .insert(eventData)

    if (analyticsError) {
      console.error('Analytics insert error:', analyticsError)
      throw new Error(`Failed to insert analytics event: ${analyticsError.message}`)
    }

    // Update aggregated metrics for real-time dashboards
    await updateAggregatedMetrics(supabase, event, data, user?.id)

    // Track revenue events separately for monetization
    if (isRevenueEvent(event)) {
      await trackRevenueEvent(supabase, event, data, user?.id)
    }

    // Update file-specific analytics
    if (data.fileId) {
      await updateFileAnalytics(supabase, data.fileId, event, data)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked successfully',
      sessionId: eventData.session_id
    })

  } catch (error) {
    // Properly type the error and provide structured error details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorDetails = error instanceof Error && error.cause ? error.cause : undefined
    
    console.error('Analytics tracking error:', {'
      message: errorMessage,
      details: errorDetails
    })
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to track event,'
      message: errorMessage,
      details: errorDetails
    }, { 
      status: 500 
    })
  }
}

// Generate unique session ID
function generateSessionId(userAgent: string | undefined, ip: string | undefined | null): string {
  const timestamp = Date.now()
  const hash = btoa(`${userAgent || 'unknown'}-${ip || 'unknown'}-${timestamp}`).substring(0, 16)
  return `session_${hash}
}

// Calculate revenue potential based on event type
function calculateRevenuePotential(event: string, data: unknown): number {
  const eventValues = {
    'download_started': 2.50, 'download_completed': 5.00, 'link_copied': 1.00, 'social_share': 3.00, 'payment_initiated': 25.00, 'premium_upgrade': 50.00, 'file_view': 0.50, 'external_link_click': 1.50'
  }

  const baseValue = eventValues[event] || 0
  const fileSize = data.fileSize || 0
  const sizeMultiplier = fileSize > 10000000 ? 1.5 : 1.0 // 10MB+

  return baseValue * sizeMultiplier
}

// Calculate conversion value
function calculateConversionValue(event: string, data: unknown): number {
  if (event === 'payment_initiated' || event === 'premium_upgrade') {'
    return data.amount || data.revenue || 0
  }
  
  if (event === 'download_completed' && data.revenue) {'
    return data.revenue
  }

  return 0
}

// Extract traffic source from referrer
function getTrafficSource(referrer: string): string {
  if (!referrer) return 'direct'
  
  if (referrer.includes('google.com')) return 'google'
  if (referrer.includes('facebook.com')) return 'facebook'
  if (referrer.includes('twitter.com') || referrer.includes('t.co')) return 'twitter'
  if (referrer.includes('linkedin.com')) return 'linkedin'
  if (referrer.includes('youtube.com')) return 'youtube'
  if (referrer.includes('instagram.com')) return 'instagram'
  
  return 'referral'
}

// Detect device type from user agent
function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile'
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  return 'desktop'
}

// Extract UTM parameters
function extractUTMParams(referrer: string) {
  if (!referrer) return {}
  
  try {
    const url = new URL(referrer)
    return {
      utm_source: url.searchParams.get('utm_source'),'
      utm_medium: url.searchParams.get('utm_medium'),'
      utm_campaign: url.searchParams.get('utm_campaign'),'
      utm_content: url.searchParams.get('utm_content'),'
      utm_term: url.searchParams.get('utm_term')
    }
  } catch {
    return {}
  }
}

// Check if event generates revenue
function isRevenueEvent(event: string): boolean {
  return ['payment_initiated', 'premium_upgrade', 'subscription_started', 'download_completed'
  ].includes(event)
}

// Track revenue-specific metrics
async function trackRevenueEvent(supabase: unknown, event: string, data: unknown, userId: string | undefined | null) {
  const revenueData = {
    event_type: event,
    user_id: userId || null,
    file_id: data.fileId,
    amount: data.amount || data.revenue || 0,
    currency: data.currency || 'USD,'
    payment_method: data.paymentMethod || 'unknown,'
    conversion_source: data.conversionSource || 'organic,'
    timestamp: new Date().toISOString()
  }

  await supabase
    .from('revenue_analytics')
    .insert(revenueData)
}

// Update aggregated metrics for real-time dashboards
async function updateAggregatedMetrics(supabase: unknown, event: string, data: unknown, userId: string | undefined | null) {
  const today = new Date().toISOString().split('T')[0]'
  
  // Update daily aggregates
  const { data: existing } = await supabase
    .from('daily_analytics')
    .select('*')
    .eq('date', today)
    .single()

  if (existing) {
    // Update existing record
    const updates = {
      total_events: existing.total_events + 1,
      unique_users: userId ? new Set([...existing.unique_users, userId]).size : existing.unique_users,
      event_counts: {
        ...existing.event_counts,
        [event]: (existing.event_counts[event] || 0) + 1
      }
    }

    await supabase
      .from('daily_analytics')
      .update(updates)
      .eq('date', today)
  } else {
    // Create new record
    await supabase
      .from('daily_analytics')
      .insert({
        date: today,
        total_events: 1,
        unique_users: userId ? 1 : 0,
        event_counts: { [event]: 1 }
      })
  }
}

// Update file-specific analytics
async function updateFileAnalytics(supabase: unknown, fileId: string, event: string, data: unknown) {
  const { data: existing } = await supabase
    .from('file_analytics')
    .select('*')
    .eq('file_id', fileId)
    .single()

  const eventMap = {
    'file_view': 'view_count', 'download_started': 'download_count', 'download_completed': 'download_count', 'link_copied': 'share_count', 'social_share': 'share_count'
  }

  const field = eventMap[event]
  if (!field) return

  if (existing) {
    const updates: unknown = {
      [field]: (existing[field] || 0) + 1,
      last_activity: new Date().toISOString()
    }

    if (data.revenue || data.amount) {
      updates.total_revenue = (existing.total_revenue || 0) + (data.revenue || data.amount || 0)
    }

    await supabase
      .from('file_analytics')
      .update(updates)
      .eq('file_id', fileId)
  } else {
    await supabase
      .from('file_analytics')
      .insert({
        file_id: fileId,
        [field]: 1,
        total_revenue: data.revenue || data.amount || 0,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      })
  }
}

// GET method for retrieving analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('event')
    const fileId = searchParams.get('fileId')
    const timeRange = searchParams.get('timeRange') || '7d'

    const supabase = await createClient()

    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)

    // Filter by event type
    if (eventType) {
      query = query.eq('event_name', eventType)
    }

    // Filter by file ID
    if (fileId) {
      query = query.eq('event_data->>fileId', fileId)
    }

    // Filter by time range
    const timeRangeMap = {
      '1d': 1, '7d': 7, '30d': 30, '90d': 90'
    }
    
    const days = timeRangeMap[timeRange] || 7
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('timestamp', startDate)

    const { data: events, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate summary metrics
    const summary = {
      totalEvents: events.length,
      uniqueUsers: new Set(events.map(e => e.user_id).filter(Boolean)).size,
      totalRevenue: events.reduce((sum, e) => sum + (e.metadata?.conversion_value || 0), 0),
      conversionRate: events.filter(e => e.metadata?.conversion_value > 0).length / events.length * 100
    }

    return NextResponse.json({
      events,
      summary,
      timeRange: `${days} days
    })

  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve analytics,'
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 