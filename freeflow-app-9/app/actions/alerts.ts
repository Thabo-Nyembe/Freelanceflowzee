'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('alerts-actions')

export async function getAlerts(options?: {
  severity?: string
  status?: string
  category?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('triggered_at', { ascending: false })

    if (options?.severity) {
      query = query.eq('severity', options.severity)
    }
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.category) {
      query = query.eq('category', options.category)
    }

    const { data, error } = await query.limit(200)

    if (error) {
      logger.error('Failed to fetch alerts', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Alerts fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data, 'Alerts fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching alerts', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createAlert(alertData: {
  title: string
  description?: string
  severity?: string
  category?: string
  source?: string
  affected_systems?: string[]
  impact?: string
  notification_channels?: string[]
  tags?: string[]
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        title: alertData.title,
        description: alertData.description,
        severity: alertData.severity || 'info',
        category: alertData.category || 'other',
        source: alertData.source || 'manual',
        affected_systems: alertData.affected_systems || [],
        impact: alertData.impact,
        notification_channels: alertData.notification_channels || [],
        tags: alertData.tags || [],
        status: 'active',
        triggered_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create alert', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/alerts-v2')
    logger.info('Alert created successfully', { alertId: data.id })
    return actionSuccess(data, 'Alert created successfully')
  } catch (error) {
    logger.error('Unexpected error creating alert', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function acknowledgeAlert(alertId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get the alert to calculate response time
    const { data: alert } = await supabase
      .from('alerts')
      .select('triggered_at')
      .eq('id', alertId)
      .eq('user_id', user.id)
      .single()

    if (!alert) {
      logger.error('Alert not found for acknowledgement', { alertId })
      return actionError('Alert not found', 'DATABASE_ERROR')
    }

    const triggeredAt = new Date(alert.triggered_at).getTime()
    const responseTime = Math.floor((Date.now() - triggeredAt) / 60000)

    const { data, error } = await supabase
      .from('alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        response_time_minutes: responseTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to acknowledge alert', { error, alertId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/alerts-v2')
    logger.info('Alert acknowledged successfully', { alertId })
    return actionSuccess(data, 'Alert acknowledged successfully')
  } catch (error) {
    logger.error('Unexpected error acknowledging alert', { error, alertId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function resolveAlert(
  alertId: string,
  resolution?: string,
  rootCause?: string
): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get the alert to calculate resolution time
    const { data: alert } = await supabase
      .from('alerts')
      .select('triggered_at')
      .eq('id', alertId)
      .eq('user_id', user.id)
      .single()

    if (!alert) {
      logger.error('Alert not found for resolution', { alertId })
      return actionError('Alert not found', 'DATABASE_ERROR')
    }

    const triggeredAt = new Date(alert.triggered_at).getTime()
    const resolutionTime = Math.floor((Date.now() - triggeredAt) / 60000)

    const { data, error } = await supabase
      .from('alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolution_time_minutes: resolutionTime,
        resolution: resolution || null,
        root_cause: rootCause || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to resolve alert', { error, alertId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/alerts-v2')
    logger.info('Alert resolved successfully', { alertId })
    return actionSuccess(data, 'Alert resolved successfully')
  } catch (error) {
    logger.error('Unexpected error resolving alert', { error, alertId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function escalateAlert(alertId: string, assignTo?: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current escalation level
    const { data: alert } = await supabase
      .from('alerts')
      .select('escalation_level')
      .eq('id', alertId)
      .eq('user_id', user.id)
      .single()

    if (!alert) {
      logger.error('Alert not found for escalation', { alertId })
      return actionError('Alert not found', 'DATABASE_ERROR')
    }

    const { data, error } = await supabase
      .from('alerts')
      .update({
        status: 'escalated',
        escalation_level: alert.escalation_level + 1,
        assigned_to: assignTo || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to escalate alert', { error, alertId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/alerts-v2')
    logger.info('Alert escalated successfully', { alertId })
    return actionSuccess(data, 'Alert escalated successfully')
  } catch (error) {
    logger.error('Unexpected error escalating alert', { error, alertId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function snoozeAlert(alertId: string, minutes: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const snoozeUntil = new Date(Date.now() + minutes * 60000).toISOString()

    const { data, error } = await supabase
      .from('alerts')
      .update({
        status: 'snoozed',
        snoozed_until: snoozeUntil,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to snooze alert', { error, alertId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/alerts-v2')
    logger.info('Alert snoozed successfully', { alertId, minutes })
    return actionSuccess(data, 'Alert snoozed successfully')
  } catch (error) {
    logger.error('Unexpected error snoozing alert', { error, alertId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteAlert(alertId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('alerts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', alertId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete alert', { error, alertId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/alerts-v2')
    logger.info('Alert deleted successfully', { alertId })
    return actionSuccess(undefined, 'Alert deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting alert', { error, alertId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getAlertStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: alerts } = await supabase
      .from('alerts')
      .select('status, severity, category, response_time_minutes, resolution_time_minutes, resolved_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (!alerts) {
      logger.info('No alerts found for stats')
      return actionSuccess(null, 'No alerts found')
    }

    const resolvedAlerts = alerts.filter(a => a.resolved_at)

    const stats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
      resolved: resolvedAlerts.length,
      snoozed: alerts.filter(a => a.status === 'snoozed').length,
      escalated: alerts.filter(a => a.status === 'escalated').length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      byCategory: alerts.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      bySeverity: alerts.reduce((acc, a) => {
        acc[a.severity] = (acc[a.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      avgResponseTime: alerts.length > 0
        ? alerts.reduce((sum, a) => sum + a.response_time_minutes, 0) / alerts.length
        : 0,
      avgResolutionTime: resolvedAlerts.length > 0
        ? resolvedAlerts.reduce((sum, a) => sum + a.resolution_time_minutes, 0) / resolvedAlerts.length
        : 0
    }

    logger.info('Alert stats fetched successfully')
    return actionSuccess(stats, 'Alert stats fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching alert stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function acknowledgeAllAlerts(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to acknowledge all alerts', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/alerts-v2')
    logger.info('All alerts acknowledged successfully')
    return actionSuccess(undefined, 'All alerts acknowledged successfully')
  } catch (error) {
    logger.error('Unexpected error acknowledging all alerts', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
