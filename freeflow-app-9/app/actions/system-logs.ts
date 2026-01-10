'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('system-logs-actions')

export async function createSystemLog(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: log, error } = await supabase
      .from('system_logs')
      .insert({
        ...data,
        user_id: user.id,
        logged_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create system log', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/logs-v2')
    logger.info('System log created', { logId: log.id })
    return actionSuccess(log, 'System log created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating system log', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function archiveLog(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to archive log', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/logs-v2')
    logger.info('Log archived', { logId: id })
    return actionSuccess(log, 'Log archived successfully')
  } catch (error: any) {
    logger.error('Unexpected error archiving log', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteLog(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: log, error } = await supabase
      .from('system_logs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to delete log', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/logs-v2')
    logger.info('Log deleted', { logId: id })
    return actionSuccess(log, 'Log deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting log', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function bulkArchiveLogs(olderThanDays: number): Promise<ActionResult<{ archivedCount: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to bulk archive logs', { error: error.message, olderThanDays })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const archivedCount = logs?.length || 0
    revalidatePath('/dashboard/logs-v2')
    logger.info('Bulk archive logs completed', { archivedCount, olderThanDays })
    return actionSuccess({ archivedCount }, `${archivedCount} logs archived successfully`)
  } catch (error: any) {
    logger.error('Unexpected error bulk archiving logs', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getLogStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get counts by level
    const { data: logs, error } = await supabase
      .from('system_logs')
      .select('log_level, severity')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch log stats', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const stats = {
      total: logs?.length || 0,
      error: logs?.filter(l => l.log_level === 'error').length || 0,
      warn: logs?.filter(l => l.log_level === 'warn').length || 0,
      info: logs?.filter(l => l.log_level === 'info').length || 0,
      debug: logs?.filter(l => l.log_level === 'debug').length || 0,
      critical: logs?.filter(l => l.severity === 'critical').length || 0,
      high: logs?.filter(l => l.severity === 'high').length || 0
    }

    logger.info('Log stats fetched', { total: stats.total })
    return actionSuccess(stats, 'Log stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching log stats', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function searchLogs(query: string, options?: {
  level?: string
  source?: string
  startDate?: string
  endDate?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to search logs', { error: error.message, query })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Logs searched', { query, count: logs?.length || 0 })
    return actionSuccess(logs || [], 'Logs retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error searching logs', { error: error.message, query })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
