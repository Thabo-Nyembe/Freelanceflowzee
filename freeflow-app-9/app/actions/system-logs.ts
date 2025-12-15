'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createSystemLog(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: log, error } = await supabase
    .from('system_logs')
    .insert({
      ...data,
      user_id: user.id,
      logged_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/logs-v2')
  return log
}

export async function archiveLog(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: log, error } = await supabase
    .from('system_logs')
    .update({
      is_archived: true,
      archived_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/logs-v2')
  return log
}

export async function deleteLog(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: log, error } = await supabase
    .from('system_logs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/logs-v2')
  return log
}

export async function bulkArchiveLogs(olderThanDays: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  const { data: logs, error } = await supabase
    .from('system_logs')
    .update({
      is_archived: true,
      archived_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .lt('logged_at', cutoffDate.toISOString())
    .select()

  if (error) throw error
  revalidatePath('/dashboard/logs-v2')
  return { archivedCount: logs?.length || 0 }
}

export async function getLogStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get counts by level
  const { data: logs } = await supabase
    .from('system_logs')
    .select('log_level, severity')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const stats = {
    total: logs?.length || 0,
    error: logs?.filter(l => l.log_level === 'error').length || 0,
    warn: logs?.filter(l => l.log_level === 'warn').length || 0,
    info: logs?.filter(l => l.log_level === 'info').length || 0,
    debug: logs?.filter(l => l.log_level === 'debug').length || 0,
    critical: logs?.filter(l => l.severity === 'critical').length || 0,
    high: logs?.filter(l => l.severity === 'high').length || 0
  }

  return stats
}

export async function searchLogs(query: string, options?: {
  level?: string
  source?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let queryBuilder = supabase
    .from('system_logs')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .or(`message.ilike.%${query}%,details.ilike.%${query}%,request_id.ilike.%${query}%`)
    .order('logged_at', { ascending: false })
    .limit(100)

  if (options?.level) {
    queryBuilder = queryBuilder.eq('log_level', options.level)
  }

  if (options?.source) {
    queryBuilder = queryBuilder.eq('log_source', options.source)
  }

  if (options?.startDate) {
    queryBuilder = queryBuilder.gte('logged_at', options.startDate)
  }

  if (options?.endDate) {
    queryBuilder = queryBuilder.lte('logged_at', options.endDate)
  }

  const { data: logs, error } = await queryBuilder

  if (error) throw error
  return logs
}
