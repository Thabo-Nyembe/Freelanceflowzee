'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getAlerts(options?: {
  severity?: string
  status?: string
  category?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  return { data }
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
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/alerts-v2')
  return { data }
}

export async function acknowledgeAlert(alertId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get the alert to calculate response time
  const { data: alert } = await supabase
    .from('alerts')
    .select('triggered_at')
    .eq('id', alertId)
    .eq('user_id', user.id)
    .single()

  if (!alert) {
    return { error: 'Alert not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/alerts-v2')
  return { data }
}

export async function resolveAlert(
  alertId: string,
  resolution?: string,
  rootCause?: string
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get the alert to calculate resolution time
  const { data: alert } = await supabase
    .from('alerts')
    .select('triggered_at')
    .eq('id', alertId)
    .eq('user_id', user.id)
    .single()

  if (!alert) {
    return { error: 'Alert not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/alerts-v2')
  return { data }
}

export async function escalateAlert(alertId: string, assignTo?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get current escalation level
  const { data: alert } = await supabase
    .from('alerts')
    .select('escalation_level')
    .eq('id', alertId)
    .eq('user_id', user.id)
    .single()

  if (!alert) {
    return { error: 'Alert not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/alerts-v2')
  return { data }
}

export async function snoozeAlert(alertId: string, minutes: number) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/alerts-v2')
  return { data }
}

export async function deleteAlert(alertId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('alerts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', alertId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/alerts-v2')
  return { success: true }
}

export async function getAlertStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: alerts } = await supabase
    .from('alerts')
    .select('status, severity, category, response_time_minutes, resolution_time_minutes, resolved_at')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!alerts) {
    return { data: null }
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

  return { data: stats }
}

export async function acknowledgeAllAlerts() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/alerts-v2')
  return { success: true }
}
