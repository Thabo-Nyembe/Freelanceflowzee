'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('access-logs-actions')

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

export async function logAccess(input: LogAccessInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

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
      logger.error('Failed to log access', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Access logged successfully', { logId: data.id })
    return actionSuccess(data, 'Access logged successfully')
  } catch (error) {
    logger.error('Unexpected error logging access', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function flagSuspicious(id: string, reason: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
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
      logger.error('Failed to flag suspicious access', { error, logId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/access-logs-v2')
    logger.info('Access flagged as suspicious', { logId: id })
    return actionSuccess(data, 'Access flagged as suspicious')
  } catch (error) {
    logger.error('Unexpected error flagging suspicious access', { error, logId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getAccessLogs(filters?: {
  status?: string
  accessType?: string
  isSuspicious?: boolean
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
      logger.error('Failed to fetch access logs', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Access logs fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data, 'Access logs fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching access logs', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getAccessStats(): Promise<ActionResult<any>> {
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

    logger.info('Access stats fetched successfully')
    return actionSuccess(stats, 'Access stats fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching access stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function blockIP(ipAddress: string, reason: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
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
      logger.error('Failed to block IP', { error, ipAddress })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/access-logs-v2')
    logger.info('IP blocked successfully', { ipAddress })
    return actionSuccess(undefined, 'IP blocked successfully')
  } catch (error) {
    logger.error('Unexpected error blocking IP', { error, ipAddress })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
