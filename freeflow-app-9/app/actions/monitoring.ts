'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('monitoring-actions')

// Server types
export interface CreateServerInput {
  server_name: string
  server_type?: string
  location?: string
  ip_address?: string
  configuration?: Record<string, unknown>
  tags?: string[]
}

export interface UpdateServerInput extends Partial<CreateServerInput> {
  id: string
  status?: string
  cpu_usage?: number
  memory_usage?: number
  disk_usage?: number
  network_throughput?: number
  uptime_percentage?: number
  requests_per_hour?: number
}

// Alert types
export interface CreateAlertInput {
  server_id?: string
  alert_type: string
  severity?: string
  title: string
  description?: string
}

// Server Actions
export async function createServer(input: CreateServerInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to createServer')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating server', { userId: user.id, serverName: input.server_name })

    const { data, error } = await supabase
      .from('servers')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create server', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/monitoring-v2')
    logger.info('Server created successfully', { serverId: data.id })
    return actionSuccess(data, 'Server created successfully')
  } catch (error) {
    logger.error('Unexpected error in createServer', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateServer(input: UpdateServerInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to updateServer')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { id, ...updateData } = input
    logger.info('Updating server', { userId: user.id, serverId: id })

    const { data, error } = await supabase
      .from('servers')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update server', { error: error.message, serverId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/monitoring-v2')
    logger.info('Server updated successfully', { serverId: data.id })
    return actionSuccess(data, 'Server updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateServer', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteServer(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to deleteServer')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Deleting server', { userId: user.id, serverId: id })

    const { error } = await supabase
      .from('servers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete server', { error: error.message, serverId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/monitoring-v2')
    logger.info('Server deleted successfully', { serverId: id })
    return actionSuccess({ success: true }, 'Server deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteServer', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateServerMetrics(serverId: string, metrics: {
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_throughput: number
}): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to updateServerMetrics')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Updating server metrics', { userId: user.id, serverId })

    // Update server with latest metrics
    const { error: serverError } = await supabase
      .from('servers')
      .update({
        ...metrics,
        last_health_check: new Date().toISOString()
      })
      .eq('id', serverId)
      .eq('user_id', user.id)

    if (serverError) {
      logger.error('Failed to update server metrics', { error: serverError.message, serverId })
      return actionError(serverError.message, 'DATABASE_ERROR')
    }

    // Record metrics history
    const metricRecords = [
      { server_id: serverId, user_id: user.id, metric_type: 'cpu', metric_value: metrics.cpu_usage, unit: 'percent' },
      { server_id: serverId, user_id: user.id, metric_type: 'memory', metric_value: metrics.memory_usage, unit: 'percent' },
      { server_id: serverId, user_id: user.id, metric_type: 'disk', metric_value: metrics.disk_usage, unit: 'percent' },
      { server_id: serverId, user_id: user.id, metric_type: 'network', metric_value: metrics.network_throughput, unit: 'mbps' }
    ]

    const { error: metricsError } = await supabase
      .from('server_metrics')
      .insert(metricRecords)

    if (metricsError) {
      logger.error('Failed to record metrics history', { error: metricsError.message, serverId })
      return actionError(metricsError.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/monitoring-v2')
    logger.info('Server metrics updated successfully', { serverId })
    return actionSuccess({ success: true }, 'Server metrics updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateServerMetrics', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Alert Actions
export async function createAlert(input: CreateAlertInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to createAlert')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating alert', { userId: user.id, alertType: input.alert_type })

    const { data, error } = await supabase
      .from('system_alerts')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create alert', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/monitoring-v2')
    logger.info('Alert created successfully', { alertId: data.id })
    return actionSuccess(data, 'Alert created successfully')
  } catch (error) {
    logger.error('Unexpected error in createAlert', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function acknowledgeAlert(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to acknowledgeAlert')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Acknowledging alert', { userId: user.id, alertId: id })

    const { data, error } = await supabase
      .from('system_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to acknowledge alert', { error: error.message, alertId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/monitoring-v2')
    logger.info('Alert acknowledged successfully', { alertId: data.id })
    return actionSuccess(data, 'Alert acknowledged successfully')
  } catch (error) {
    logger.error('Unexpected error in acknowledgeAlert', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function resolveAlert(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to resolveAlert')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Resolving alert', { userId: user.id, alertId: id })

    const { data, error } = await supabase
      .from('system_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to resolve alert', { error: error.message, alertId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/monitoring-v2')
    logger.info('Alert resolved successfully', { alertId: data.id })
    return actionSuccess(data, 'Alert resolved successfully')
  } catch (error) {
    logger.error('Unexpected error in resolveAlert', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getServerStats(): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to getServerStats')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Fetching server stats', { userId: user.id })

    const { data: servers, error } = await supabase
      .from('servers')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch server stats', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const total = servers.length
    const healthy = servers.filter(s => s.status === 'healthy').length
    const warning = servers.filter(s => s.status === 'warning').length
    const critical = servers.filter(s => s.status === 'critical').length

    const avgCpu = total > 0
      ? servers.reduce((sum, s) => sum + Number(s.cpu_usage), 0) / total
      : 0

    const avgUptime = total > 0
      ? servers.reduce((sum, s) => sum + Number(s.uptime_percentage), 0) / total
      : 0

    const stats = {
      total,
      healthy,
      warning,
      critical,
      avgCpu: Math.round(avgCpu * 10) / 10,
      avgUptime: Math.round(avgUptime * 100) / 100
    }

    logger.info('Server stats fetched successfully', { total })
    return actionSuccess(stats, 'Server stats fetched successfully')
  } catch (error) {
    logger.error('Unexpected error in getServerStats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
