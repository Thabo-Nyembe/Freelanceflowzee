import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'
import crypto from 'crypto'

const logger = createFeatureLogger('Analytics:Track')

/**
 * POST /api/analytics/track
 *
 * Universal event tracking endpoint for marketing analytics
 * Tracks user interactions, page views, button clicks, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, properties } = body

    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      )
    }

    // Get user data if authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Prepare analytics record
    const analyticsData = {
      event_name: event,
      user_id: user?.id || null,
      session_id: request.cookies.get('session_id')?.value || generateSessionId(),
      properties: {
        ...properties,
        user_agent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        referrer: request.headers.get('referer'),
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    }

    // Store in database
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(analyticsData)
      .select()
      .single()

    if (error) {
      logger.warn('Failed to store analytics event', { error: error.message })
      // Don't fail the request - analytics should be non-blocking
      return NextResponse.json({ success: true, stored: false })
    }

    logger.info('Analytics event tracked', {
      event,
      eventId: data?.id,
      userId: user?.id
    })

    return NextResponse.json({
      success: true,
      stored: true,
      eventId: data?.id
    })

  } catch (error) {
    logger.error('Analytics tracking failed', { error: error.message })
    // Silent fail - don't break user experience
    return NextResponse.json({ success: true, stored: false })
  }
}

/**
 * Generate a unique session ID using cryptographically secure randomness
 */
function generateSessionId(): string {
  return `session_${crypto.randomUUID()}`
}

/**
 * GET /api/analytics/track
 *
 * Returns analytics tracking configuration
 */
export async function GET() {
  return NextResponse.json({
    enabled: true,
    events: [
      'page_view',
      'navigation_click',
      'button_click',
      'feature_click',
      'signup_start',
      'signup_complete',
      'trial_start',
      'checkout_start',
      'checkout_complete',
      'guest_upload_start',
      'guest_upload_complete',
      'video_play',
      'download_start'
    ],
    storage: 'supabase',
    retention: '90 days'
  })
}
