'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
export async function createServer(input: CreateServerInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('servers')
    .insert({
      ...input,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/monitoring-v2')
  return { data }
}

export async function updateServer(input: UpdateServerInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from('servers')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/monitoring-v2')
  return { data }
}

export async function deleteServer(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('servers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/monitoring-v2')
  return { success: true }
}

export async function updateServerMetrics(serverId: string, metrics: {
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_throughput: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: serverError.message }
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
    return { error: metricsError.message }
  }

  revalidatePath('/dashboard/monitoring-v2')
  return { success: true }
}

// Alert Actions
export async function createAlert(input: CreateAlertInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('system_alerts')
    .insert({
      ...input,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/monitoring-v2')
  return { data }
}

export async function acknowledgeAlert(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/monitoring-v2')
  return { data }
}

export async function resolveAlert(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/monitoring-v2')
  return { data }
}

export async function getServerStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: servers, error } = await supabase
    .from('servers')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (error) {
    return { error: error.message }
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

  return {
    data: {
      total,
      healthy,
      warning,
      critical,
      avgCpu: Math.round(avgCpu * 10) / 10,
      avgUptime: Math.round(avgUptime * 100) / 100
    }
  }
}
