'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createConnector(data: {
  connector_name: string
  description?: string
  connector_type: string
  provider_name: string
  auth_type: string
  base_url?: string
  api_key?: string
  api_secret?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: connector, error } = await supabase
    .from('connectors')
    .insert([{ ...data, user_id: user.id }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/connectors-v2')
  return connector
}

export async function updateConnector(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: connector, error } = await supabase
    .from('connectors')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/connectors-v2')
  return connector
}

export async function deleteConnector(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('connectors')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/connectors-v2')
}

export async function connectConnector(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: connector, error } = await supabase
    .from('connectors')
    .update({
      is_connected: true,
      is_active: true,
      status: 'active',
      verified_at: new Date().toISOString(),
      is_verified: true
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/connectors-v2')
  return connector
}

export async function disconnectConnector(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: connector, error } = await supabase
    .from('connectors')
    .update({
      is_connected: false,
      is_active: false,
      status: 'inactive'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/connectors-v2')
  return connector
}

export async function updateHealthStatus(id: string, health: {
  status: string
  uptime?: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: connector, error } = await supabase
    .from('connectors')
    .update({
      health_status: health.status,
      last_health_check: new Date().toISOString(),
      uptime_percentage: health.uptime
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/connectors-v2')
  return connector
}

export async function recordRequest(id: string, success: boolean, responseTime: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('connectors')
    .select('request_count, success_count, error_count, total_response_time, requests_today')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Connector not found')

  const requestCount = (current.request_count || 0) + 1
  const successCount = success ? (current.success_count || 0) + 1 : current.success_count || 0
  const errorCount = !success ? (current.error_count || 0) + 1 : current.error_count || 0
  const totalResponseTime = (current.total_response_time || 0) + responseTime
  const avgResponseTime = Math.round(totalResponseTime / requestCount)
  const successRate = parseFloat(((successCount / requestCount) * 100).toFixed(2))
  const errorRate = parseFloat(((errorCount / requestCount) * 100).toFixed(2))

  const { data: connector, error } = await supabase
    .from('connectors')
    .update({
      request_count: requestCount,
      success_count: successCount,
      error_count: errorCount,
      total_response_time: totalResponseTime,
      avg_response_time: avgResponseTime,
      success_rate: successRate,
      error_rate: errorRate,
      requests_today: (current.requests_today || 0) + 1,
      last_request_at: new Date().toISOString(),
      last_success_at: success ? new Date().toISOString() : current.last_success_at,
      last_error_at: !success ? new Date().toISOString() : current.last_error_at
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/connectors-v2')
  return connector
}

export async function updateQuotaUsage(id: string, used: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: connector, error } = await supabase
    .from('connectors')
    .update({
      quota_used: used
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/connectors-v2')
  return connector
}

export async function syncConnector(id: string, recordsSynced: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('connectors')
    .select('records_synced')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Connector not found')

  const { data: connector, error } = await supabase
    .from('connectors')
    .update({
      last_sync_at: new Date().toISOString(),
      sync_status: 'completed',
      records_synced: (current.records_synced || 0) + recordsSynced
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/connectors-v2')
  return connector
}

export async function testConnector(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: connector, error } = await supabase
    .from('connectors')
    .update({
      status: 'testing',
      last_health_check: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/connectors-v2')
  return connector
}
