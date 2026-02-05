/**
 * Security Alerts API
 *
 * GET /api/security/alerts - List security alerts
 * POST /api/security/alerts - Create a security alert manually
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSecurityAlert, type SecurityAlert } from '@/lib/security/anomaly-detection'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('security-alerts')

/**
 * List security alerts
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
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const alertType = searchParams.get('alertType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
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
      .from('security_alerts')
      .select(`
        *,
        user:users!security_alerts_user_id_fkey (id, name, email, avatar_url),
        resolved_by_user:users!security_alerts_resolved_by_fkey (id, name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    } else {
      query = query.eq('user_id', user.id)
    }

    if (status) {
      if (status === 'open') {
        query = query.in('status', ['new', 'investigating'])
      } else {
        query = query.eq('status', status)
      }
    }

    if (severity) {
      query = query.eq('severity', severity)
    }

    if (alertType) {
      query = query.eq('alert_type', alertType)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: alerts, error: queryError, count } = await query

    if (queryError) {
      throw queryError
    }

    // Get alert statistics
    const { data: stats } = await supabase.rpc('get_security_alert_stats', {
      p_organization_id: organizationId || null,
      p_user_id: organizationId ? null : user.id
    })

    return NextResponse.json({
      success: true,
      alerts,
      total: count,
      limit,
      offset,
      stats
    })
  } catch (error) {
    logger.error('List security alerts error', { error })
    return NextResponse.json(
      { error: 'Failed to list security alerts' },
      { status: 500 }
    )
  }
}

/**
 * Create a security alert manually
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const body = await request.json()
    const {
      organization_id,
      alert_type,
      severity,
      title,
      description,
      details = {},
      user_id
    } = body

    // Validate required fields
    if (!alert_type || !severity || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: alert_type, severity, title' },
        { status: 400 }
      )
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical']
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: `Invalid severity. Valid values: ${validSeverities.join(', ')}` },
        { status: 400 }
      )
    }

    // If organization specified, verify admin access
    if (organization_id) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organization_id)
        .eq('user_id', user.id)
        .single()

      if (!membership || !['admin', 'owner'].includes(membership.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Create alert
    const alert: SecurityAlert = {
      user_id: user_id || null,
      organization_id: organization_id || null,
      alert_type,
      severity,
      status: 'new',
      title,
      description: description || '',
      details: {
        ...details,
        created_by: user.id,
        manual_alert: true
      },
      related_events: []
    }

    const alertId = await createSecurityAlert(alert)

    if (!alertId) {
      throw new Error('Failed to create alert')
    }

    return NextResponse.json({
      success: true,
      alertId
    }, { status: 201 })
  } catch (error) {
    logger.error('Create security alert error', { error })
    return NextResponse.json(
      { error: 'Failed to create security alert' },
      { status: 500 }
    )
  }
}
