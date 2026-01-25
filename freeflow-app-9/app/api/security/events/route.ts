/**
 * Security Events API
 *
 * GET /api/security/events - List security events
 * POST /api/security/events - Record a security event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processSecurityEvent, type SecurityEvent } from '@/lib/security/anomaly-detection'
import { headers } from 'next/headers'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('security-events')

/**
 * List security events
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

    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const userId = searchParams.get('userId')
    const eventType = searchParams.get('eventType')
    const minRiskScore = searchParams.get('minRiskScore')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Verify user has admin access if querying organization
    if (organizationId) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single()

      if (!membership || !['admin', 'owner'].includes(membership.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Build query
    let query = supabase
      .from('security_events')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    } else {
      // If no org specified, show user's own events
      query = query.eq('user_id', user.id)
    }

    if (userId && organizationId) {
      query = query.eq('user_id', userId)
    }

    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    if (minRiskScore) {
      query = query.gte('risk_score', parseInt(minRiskScore))
    }

    if (startDate) {
      query = query.gte('timestamp', startDate)
    }

    if (endDate) {
      query = query.lte('timestamp', endDate)
    }

    const { data: events, error: queryError, count } = await query

    if (queryError) {
      throw queryError
    }

    return NextResponse.json({
      success: true,
      events,
      total: count,
      limit,
      offset
    })
  } catch (error) {
    logger.error('List security events error', { error })
    return NextResponse.json(
      { error: 'Failed to list security events' },
      { status: 500 }
    )
  }
}

/**
 * Record a security event
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const headersList = await headers()

    // Get current user (optional for some events like login failures)
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { event_type, metadata = {}, organization_id } = body

    // Validate event type
    const validEventTypes = [
      'login_attempt', 'login_success', 'login_failure', 'logout',
      'password_change', 'mfa_enabled', 'mfa_disabled', 'api_call',
      'permission_change', 'data_export', 'session_created', 'session_revoked',
      'suspicious_activity'
    ]

    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: `Invalid event type. Valid types: ${validEventTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Get client information
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
      headersList.get('x-real-ip') ||
      '127.0.0.1'

    const userAgent = headersList.get('user-agent') || 'Unknown'

    // Get geolocation from IP (would use external service in production)
    const location = await getGeoLocation(ipAddress)

    // Construct security event
    const securityEvent: SecurityEvent = {
      user_id: user?.id || body.user_id || null,
      organization_id: organization_id || null,
      event_type,
      ip_address: ipAddress,
      user_agent: userAgent,
      location,
      metadata: {
        ...metadata,
        endpoint: body.endpoint,
        method: body.method
      },
      timestamp: new Date().toISOString()
    }

    // Process event through anomaly detection
    const result = await processSecurityEvent(securityEvent)

    return NextResponse.json({
      success: true,
      risk_score: result.risk_score,
      anomalies: result.anomalies,
      alerts_created: result.alerts.length
    })
  } catch (error) {
    logger.error('Record security event error', { error })
    return NextResponse.json(
      { error: 'Failed to record security event' },
      { status: 500 }
    )
  }
}

/**
 * Get geolocation from IP address
 * In production, this would use an external service like MaxMind or ip-api
 */
async function getGeoLocation(ipAddress: string): Promise<{
  country?: string
  country_code?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  timezone?: string
}> {
  // Skip for localhost/private IPs
  if (
    ipAddress === '127.0.0.1' ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('172.')
  ) {
    return {
      country: 'Local',
      country_code: 'LO',
      city: 'Localhost'
    }
  }

  // In production, would call external geolocation API
  // For now, return placeholder
  return {
    country: 'Unknown',
    country_code: 'XX'
  }
}
