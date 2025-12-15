'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

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
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function getApiEndpoint(endpointId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('api_endpoints')
    .select('*')
    .eq('id', endpointId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function createApiEndpoint(input: ApiEndpointInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/api-v2')
  return { error: null, data }
}

export async function updateApiEndpoint(
  endpointId: string,
  updates: Partial<ApiEndpointInput> & {
    status?: 'active' | 'inactive' | 'deprecated' | 'maintenance'
    is_deprecated?: boolean
  }
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/api-v2')
  return { error: null, data }
}

export async function deleteApiEndpoint(endpointId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { error } = await supabase
    .from('api_endpoints')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', endpointId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/api-v2')
  return { error: null, success: true }
}

export async function deprecateApiEndpoint(endpointId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/api-v2')
  return { error: null, data }
}

export async function trackApiRequest(
  endpointId: string,
  latencyMs: number,
  success: boolean
) {
  const supabase = createServerActionClient({ cookies })

  const { data: endpoint } = await supabase
    .from('api_endpoints')
    .select('total_requests, requests_today, requests_this_month, avg_latency_ms, error_count, success_rate')
    .eq('id', endpointId)
    .single()

  if (!endpoint) {
    return { error: 'Endpoint not found', data: null }
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
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function getApiStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: endpoints } = await supabase
    .from('api_endpoints')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!endpoints) {
    return { error: null, data: { total: 0, active: 0, totalRequests: 0, requestsToday: 0, avgLatency: 0, avgSuccessRate: 100 } }
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

  return { error: null, data: stats }
}
