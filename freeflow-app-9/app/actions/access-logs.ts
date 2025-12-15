'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface LogAccessInput {
  user_name?: string
  user_email?: string
  access_type: string
  status: string
  resource?: string
  method?: string
  status_code?: number
  ip_address?: string
  location?: string
  device_type?: string
  browser?: string
  user_agent?: string
  duration?: number
  is_suspicious?: boolean
  threat_level?: string
  blocked_reason?: string
  metadata?: Record<string, any>
}

export async function logAccess(input: LogAccessInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('access_logs')
    .insert({
      user_id: user?.id || null,
      user_name: input.user_name || user?.email?.split('@')[0] || 'Unknown',
      user_email: input.user_email || user?.email,
      access_type: input.access_type,
      status: input.status,
      resource: input.resource,
      method: input.method || 'GET',
      status_code: input.status_code || 200,
      ip_address: input.ip_address,
      location: input.location,
      device_type: input.device_type || 'desktop',
      browser: input.browser,
      user_agent: input.user_agent,
      duration: input.duration || 0,
      is_suspicious: input.is_suspicious || false,
      threat_level: input.threat_level || 'none',
      blocked_reason: input.blocked_reason,
      metadata: input.metadata || {}
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function flagSuspicious(id: string, reason: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('access_logs')
    .update({
      is_suspicious: true,
      threat_level: 'high',
      blocked_reason: reason
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/access-logs-v2')
  return { data }
}

export async function getAccessLogs(filters?: {
  status?: string
  accessType?: string
  isSuspicious?: boolean
  startDate?: string
  endDate?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  let query = supabase
    .from('access_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.accessType) {
    query = query.eq('access_type', filters.accessType)
  }
  if (filters?.isSuspicious !== undefined) {
    query = query.eq('is_suspicious', filters.isSuspicious)
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  const { data, error } = await query.limit(200)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getAccessStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get logs from last 24 hours
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const { data: logs } = await supabase
    .from('access_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', yesterday.toISOString())

  const stats = {
    total: logs?.length || 0,
    success: logs?.filter(l => l.status === 'success').length || 0,
    failed: logs?.filter(l => l.status === 'failed').length || 0,
    blocked: logs?.filter(l => l.status === 'blocked').length || 0,
    suspicious: logs?.filter(l => l.is_suspicious).length || 0,
    avgDuration: logs && logs.length > 0
      ? logs.reduce((sum, l) => sum + (l.duration || 0), 0) / logs.length
      : 0
  }

  return { data: stats }
}

export async function blockIP(ipAddress: string, reason: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Update all logs from this IP to blocked
  const { error } = await supabase
    .from('access_logs')
    .update({
      status: 'blocked',
      is_suspicious: true,
      blocked_reason: reason
    })
    .eq('ip_address', ipAddress)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/access-logs-v2')
  return { success: true }
}
