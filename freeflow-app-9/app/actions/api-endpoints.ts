'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('api-endpoints-actions')

export interface ApiEndpointInput {
  name: string
  description?: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  version?: string
  is_public?: boolean
  requires_auth?: boolean
  rate_limit_per_minute?: number
  rate_limit_per_hour?: number
  timeout_ms?: number
  request_schema?: Record<string, unknown>
  response_schema?: Record<string, unknown>
  example_request?: Record<string, unknown>
  example_response?: Record<string, unknown>
  tags?: string[]
}

export async function getApiEndpoints(options?: {
  method?: string
  status?: string
  limit?: number
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    let query = supabase
      .from('api_endpoints')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('total_requests', { ascending: false })

    if (options?.method) {
      query = query.eq('method', options.method)
    }
    if (options?.status) {
      query = query.eq('status', options.status)
    }

    const { data, error } = await query.limit(options?.limit || 100)

    if (error) {
      logger.error('Failed to get API endpoints', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API endpoints retrieved successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'API endpoints retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting API endpoints', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getApiEndpoint(endpointId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('api_endpoints')
      .select('*')
      .eq('id', endpointId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to get API endpoint', { error: error.message, endpointId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API endpoint retrieved successfully', { endpointId })
    return actionSuccess(data, 'API endpoint retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting API endpoint', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createApiEndpoint(input: ApiEndpointInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('api_endpoints')
      .insert({
        user_id: user.id,
        name: input.name,
        description: input.description,
        method: input.method,
        path: input.path,
        version: input.version || 'v1',
        is_public: input.is_public ?? false,
        requires_auth: input.requires_auth ?? true,
        rate_limit_per_minute: input.rate_limit_per_minute || 60,
        rate_limit_per_hour: input.rate_limit_per_hour || 1000,
        timeout_ms: input.timeout_ms || 30000,
        request_schema: input.request_schema || {},
        response_schema: input.response_schema || {},
        example_request: input.example_request || {},
        example_response: input.example_response || {},
        tags: input.tags || [],
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create API endpoint', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API endpoint created successfully', { endpointId: data.id })
    revalidatePath('/dashboard/api-v2')
    return actionSuccess(data, 'API endpoint created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating API endpoint', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateApiEndpoint(
  endpointId: string,
  updates: Partial<ApiEndpointInput> & {
    status?: 'active' | 'inactive' | 'deprecated' | 'maintenance'
    is_deprecated?: boolean
  }
): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('api_endpoints')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', endpointId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update API endpoint', { error: error.message, endpointId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API endpoint updated successfully', { endpointId })
    revalidatePath('/dashboard/api-v2')
    return actionSuccess(data, 'API endpoint updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating API endpoint', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteApiEndpoint(endpointId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('api_endpoints')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', endpointId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete API endpoint', { error: error.message, endpointId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API endpoint deleted successfully', { endpointId })
    revalidatePath('/dashboard/api-v2')
    return actionSuccess({ success: true }, 'API endpoint deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting API endpoint', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deprecateApiEndpoint(endpointId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('api_endpoints')
      .update({
        status: 'deprecated',
        is_deprecated: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', endpointId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to deprecate API endpoint', { error: error.message, endpointId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API endpoint deprecated successfully', { endpointId })
    revalidatePath('/dashboard/api-v2')
    return actionSuccess(data, 'API endpoint deprecated successfully')
  } catch (error: any) {
    logger.error('Unexpected error deprecating API endpoint', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function trackApiRequest(
  endpointId: string,
  latencyMs: number,
  success: boolean
): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: endpoint } = await supabase
      .from('api_endpoints')
      .select('total_requests, requests_today, requests_this_month, avg_latency_ms, error_count, success_rate')
      .eq('id', endpointId)
      .single()

    if (!endpoint) {
      return actionError('Endpoint not found', 'NOT_FOUND')
    }

    const totalRequests = endpoint.total_requests + 1
    const requestsToday = endpoint.requests_today + 1
    const requestsThisMonth = endpoint.requests_this_month + 1
    const errorCount = success ? endpoint.error_count : endpoint.error_count + 1

    // Calculate new averages
    const newAvgLatency = ((endpoint.avg_latency_ms * endpoint.total_requests) + latencyMs) / totalRequests
    const successRate = ((totalRequests - errorCount) / totalRequests) * 100
    const errorRate = 100 - successRate

    const { data, error } = await supabase
      .from('api_endpoints')
      .update({
        total_requests: totalRequests,
        requests_today: requestsToday,
        requests_this_month: requestsThisMonth,
        avg_latency_ms: newAvgLatency,
        error_count: errorCount,
        success_rate: successRate,
        error_rate: errorRate,
        last_called_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', endpointId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to track API request', { error: error.message, endpointId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API request tracked successfully', { endpointId, success })
    return actionSuccess(data, 'API request tracked successfully')
  } catch (error: any) {
    logger.error('Unexpected error tracking API request', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getApiStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: endpoints, error } = await supabase
      .from('api_endpoints')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get API stats', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!endpoints) {
      return actionSuccess({ total: 0, active: 0, totalRequests: 0, requestsToday: 0, avgLatency: 0, avgSuccessRate: 100 }, 'No endpoints found')
    }

    const stats = {
      total: endpoints.length,
      active: endpoints.filter(e => e.status === 'active').length,
      deprecated: endpoints.filter(e => e.status === 'deprecated').length,
      totalRequests: endpoints.reduce((sum, e) => sum + (e.total_requests || 0), 0),
      requestsToday: endpoints.reduce((sum, e) => sum + (e.requests_today || 0), 0),
      requestsThisMonth: endpoints.reduce((sum, e) => sum + (e.requests_this_month || 0), 0),
      avgLatency: endpoints.length > 0
        ? endpoints.reduce((sum, e) => sum + (e.avg_latency_ms || 0), 0) / endpoints.length
        : 0,
      avgSuccessRate: endpoints.length > 0
        ? endpoints.reduce((sum, e) => sum + (e.success_rate || 100), 0) / endpoints.length
        : 100
    }

    logger.info('API stats retrieved successfully', { total: stats.total })
    return actionSuccess(stats, 'API stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting API stats', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
