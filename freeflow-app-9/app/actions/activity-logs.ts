'use server'

import { createClient } from '@/lib/supabase/server'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('activity-logs-actions')

export interface LogActivityInput {
  user_name?: string
  user_email?: string
  activity_type: string
  category?: string
  status?: string
  action: string
  resource_type?: string
  resource_id?: string
  resource_name?: string
  changes?: Array<{
    field: string
    oldValue: string
    newValue: string
  }>
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  duration?: number
  metadata?: Record<string, any>
}

export async function logActivity(input: LogActivityInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user?.id || null,
        user_name: input.user_name || user?.email?.split('@')[0] || 'Unknown',
        user_email: input.user_email || user?.email,
        activity_type: input.activity_type,
        category: input.category || 'general',
        status: input.status || 'success',
        action: input.action,
        resource_type: input.resource_type,
        resource_id: input.resource_id,
        resource_name: input.resource_name,
        changes: input.changes || [],
        old_values: input.old_values || {},
        new_values: input.new_values || {},
        ip_address: input.ip_address,
        user_agent: input.user_agent,
        duration: input.duration || 0,
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to log activity', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Activity logged successfully', { logId: data.id })
    return actionSuccess(data, 'Activity logged successfully')
  } catch (error) {
    logger.error('Unexpected error logging activity', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getActivityLogs(filters?: {
  status?: string
  activityType?: string
  category?: string
  startDate?: string
  endDate?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.activityType) {
      query = query.eq('activity_type', filters.activityType)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    const { data, error } = await query.limit(200)

    if (error) {
      logger.error('Failed to fetch activity logs', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Activity logs fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data, 'Activity logs fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching activity logs', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getActivityStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get logs from last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: logs } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', yesterday.toISOString())

    const stats = {
      total: logs?.length || 0,
      success: logs?.filter(l => l.status === 'success').length || 0,
      failed: logs?.filter(l => l.status === 'failed').length || 0,
      pending: logs?.filter(l => l.status === 'pending').length || 0,
      creates: logs?.filter(l => l.activity_type === 'create').length || 0,
      updates: logs?.filter(l => l.activity_type === 'update').length || 0,
      deletes: logs?.filter(l => l.activity_type === 'delete').length || 0,
      avgDuration: logs && logs.length > 0
        ? logs.reduce((sum, l) => sum + (l.duration || 0), 0) / logs.length
        : 0
    }

    logger.info('Activity stats fetched successfully')
    return actionSuccess(stats, 'Activity stats fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching activity stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getUserActivitySummary(userId?: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const targetUserId = userId || user.id

    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('activity_type, status')
      .eq('user_id', targetUserId)

    if (error) {
      logger.error('Failed to fetch user activity summary', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Group by activity type
    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}

    logs?.forEach(log => {
      byType[log.activity_type] = (byType[log.activity_type] || 0) + 1
      byStatus[log.status] = (byStatus[log.status] || 0) + 1
    })

    const summary = {
      total: logs?.length || 0,
      byType,
      byStatus
    }

    logger.info('User activity summary fetched successfully')
    return actionSuccess(summary, 'User activity summary fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching user activity summary', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function revertActivity(activityId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get the activity log
    const { data: activity, error: fetchError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('id', activityId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !activity) {
      logger.error('Activity not found for revert', { activityId })
      return actionError('Activity not found', 'DATABASE_ERROR')
    }

    // This would need to be implemented based on the resource type
    // For now, just log the revert attempt
    await logActivity({
      activity_type: 'revert',
      action: `Attempted to revert activity ${activityId}`,
      resource_type: activity.resource_type,
      resource_id: activity.resource_id,
      metadata: { original_activity: activityId }
    })

    logger.info('Revert logged', { activityId })
    return actionSuccess({ message: 'Revert logged. Manual review required.' }, 'Revert logged successfully')
  } catch (error) {
    logger.error('Unexpected error reverting activity', { error, activityId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
