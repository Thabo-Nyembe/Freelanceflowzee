/**
 * Security Alert Detail API
 *
 * GET /api/security/alerts/[id] - Get alert details
 * PATCH /api/security/alerts/[id] - Update alert status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateAlertStatus, type AlertStatus } from '@/lib/security/anomaly-detection'
import { createSimpleLogger } from '@/lib/simple-logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('security-alerts')

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Get alert details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get alert
    const { data: alert, error: alertError } = await supabase
      .from('security_alerts')
      .select(`
        *,
        user:users!security_alerts_user_id_fkey (id, name, email, avatar_url),
        resolved_by_user:users!security_alerts_resolved_by_fkey (id, name, email)
      `)
      .eq('id', id)
      .single()

    if (alertError || !alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    // Verify access
    if (alert.organization_id) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', alert.organization_id)
        .eq('user_id', user.id)
        .single()

      if (!membership || !['admin', 'owner'].includes(membership.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    } else if (alert.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get related events
    const { data: relatedEvents } = await supabase
      .from('security_events')
      .select('*')
      .in('id', alert.related_events || [])
      .order('timestamp', { ascending: false })

    // Get similar alerts
    const { data: similarAlerts } = await supabase
      .from('security_alerts')
      .select('id, title, severity, status, created_at')
      .eq('alert_type', alert.alert_type)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      alert: {
        ...alert,
        related_events_details: relatedEvents || [],
        similar_alerts: similarAlerts || []
      }
    })
  } catch (error) {
    logger.error('Get security alert error', { error })
    return NextResponse.json(
      { error: 'Failed to get security alert' },
      { status: 500 }
    )
  }
}

/**
 * Update alert status
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get alert
    const { data: alert, error: alertError } = await supabase
      .from('security_alerts')
      .select('*')
      .eq('id', id)
      .single()

    if (alertError || !alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    // Verify access
    if (alert.organization_id) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', alert.organization_id)
        .eq('user_id', user.id)
        .single()

      if (!membership || !['admin', 'owner'].includes(membership.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    } else if (alert.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, notes } = body

    // Validate status
    const validStatuses: AlertStatus[] = ['new', 'investigating', 'resolved', 'false_positive']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid values: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Update alert status
    if (status) {
      await updateAlertStatus(id, status, user.id)
    }

    // Add notes if provided
    if (notes) {
      await supabase.from('security_alert_notes').insert({
        alert_id: id,
        user_id: user.id,
        content: notes,
        created_at: new Date().toISOString()
      })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      organization_id: alert.organization_id,
      action: 'security_alert_updated',
      resource_type: 'security_alert',
      resource_id: id,
      details: { status, notes }
    })

    // Get updated alert
    const { data: updatedAlert } = await supabase
      .from('security_alerts')
      .select('*')
      .eq('id', id)
      .single()

    return NextResponse.json({
      success: true,
      alert: updatedAlert
    })
  } catch (error) {
    logger.error('Update security alert error', { error })
    return NextResponse.json(
      { error: 'Failed to update security alert' },
      { status: 500 }
    )
  }
}
