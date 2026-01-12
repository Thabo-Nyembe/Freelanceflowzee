'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('connectors-actions')

export async function createConnector(data: {
  connector_name: string
  description?: string
  connector_type: string
  provider_name: string
  auth_type: string
  base_url?: string
  api_key?: string
  api_secret?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: connector, error } = await supabase
      .from('connectors')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create connector', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Connector created successfully', { connectorId: connector.id })
    revalidatePath('/dashboard/connectors-v2')
    return actionSuccess(connector, 'Connector created successfully')
  } catch (error: any) {
    logger.error('Unexpected error in createConnector', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateConnector(id: string, data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: connector, error } = await supabase
      .from('connectors')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update connector', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Connector updated successfully', { id })
    revalidatePath('/dashboard/connectors-v2')
    return actionSuccess(connector, 'Connector updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error in updateConnector', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteConnector(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('connectors')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete connector', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Connector deleted successfully', { id })
    revalidatePath('/dashboard/connectors-v2')
    return actionSuccess(undefined, 'Connector deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error in deleteConnector', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function connectConnector(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to connect connector', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Connector connected successfully', { id })
    revalidatePath('/dashboard/connectors-v2')
    return actionSuccess(connector, 'Connector connected successfully')
  } catch (error: any) {
    logger.error('Unexpected error in connectConnector', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function disconnectConnector(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to disconnect connector', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Connector disconnected successfully', { id })
    revalidatePath('/dashboard/connectors-v2')
    return actionSuccess(connector, 'Connector disconnected successfully')
  } catch (error: any) {
    logger.error('Unexpected error in disconnectConnector', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateHealthStatus(id: string, health: {
  status: string
  uptime?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to update health status', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Health status updated successfully', { id })
    revalidatePath('/dashboard/connectors-v2')
    return actionSuccess(connector, 'Health status updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error in updateHealthStatus', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordRequest(id: string, success: boolean, responseTime: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('connectors')
      .select('request_count, success_count, error_count, total_response_time, requests_today')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Connector not found', 'NOT_FOUND')

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

    if (error) {
      logger.error('Failed to record request', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Request recorded successfully', { id })
    revalidatePath('/dashboard/connectors-v2')
    return actionSuccess(connector, 'Request recorded successfully')
  } catch (error: any) {
    logger.error('Unexpected error in recordRequest', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateQuotaUsage(id: string, used: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: connector, error } = await supabase
      .from('connectors')
      .update({
        quota_used: used
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update quota usage', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Quota usage updated successfully', { id })
    revalidatePath('/dashboard/connectors-v2')
    return actionSuccess(connector, 'Quota usage updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error in updateQuotaUsage', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function syncConnector(id: string, recordsSynced: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('connectors')
      .select('records_synced')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Connector not found', 'NOT_FOUND')

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

    if (error) {
      logger.error('Failed to sync connector', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Connector synced successfully', { id })
    revalidatePath('/dashboard/connectors-v2')
    return actionSuccess(connector, 'Connector synced successfully')
  } catch (error: any) {
    logger.error('Unexpected error in syncConnector', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function testConnector(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to test connector', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Connector test initiated successfully', { id })
    revalidatePath('/dashboard/connectors-v2')
    return actionSuccess(connector, 'Connector test initiated successfully')
  } catch (error: any) {
    logger.error('Unexpected error in testConnector', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
