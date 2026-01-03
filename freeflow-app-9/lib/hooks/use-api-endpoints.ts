'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ApiEndpoint {
  id: string
  user_id: string
  endpoint_code: string
  name: string
  description: string | null
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  version: string
  is_public: boolean
  is_deprecated: boolean
  requires_auth: boolean
  rate_limit_per_minute: number
  rate_limit_per_hour: number
  timeout_ms: number
  request_schema: Record<string, unknown>
  response_schema: Record<string, unknown>
  example_request: Record<string, unknown>
  example_response: Record<string, unknown>
  total_requests: number
  requests_today: number
  requests_this_month: number
  avg_latency_ms: number
  p95_latency_ms: number
  p99_latency_ms: number
  error_count: number
  error_rate: number
  success_rate: number
  status: 'active' | 'inactive' | 'deprecated' | 'maintenance'
  last_called_at: string | null
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseApiEndpointsOptions {
  method?: ApiEndpoint['method']
  status?: ApiEndpoint['status']
}

interface ApiEndpointStats {
  total: number
  active: number
  totalRequests: number
  requestsToday: number
  avgLatency: number
  avgSuccessRate: number
}

export function useApiEndpoints(initialEndpoints: ApiEndpoint[] = [], options: UseApiEndpointsOptions = {}) {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>(initialEndpoints)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const stats: ApiEndpointStats = {
    total: endpoints.length,
    active: endpoints.filter(e => e.status === 'active').length,
    totalRequests: endpoints.reduce((sum, e) => sum + e.total_requests, 0),
    requestsToday: endpoints.reduce((sum, e) => sum + e.requests_today, 0),
    avgLatency: endpoints.length > 0
      ? endpoints.reduce((sum, e) => sum + e.avg_latency_ms, 0) / endpoints.length
      : 0,
    avgSuccessRate: endpoints.length > 0
      ? endpoints.reduce((sum, e) => sum + e.success_rate, 0) / endpoints.length
      : 100
  }

  const fetchEndpoints = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('api_endpoints')
        .select('*')
        .is('deleted_at', null)
        .order('total_requests', { ascending: false })

      if (options.method) {
        query = query.eq('method', options.method)
      }
      if (options.status) {
        query = query.eq('status', options.status)
      }

      const { data, error: fetchError } = await query.limit(100)

      if (fetchError) throw fetchError
      setEndpoints(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch endpoints')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.method, options.status])

  useEffect(() => {
    const channel = supabase
      .channel('api_endpoints_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'api_endpoints' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEndpoints(prev => [payload.new as ApiEndpoint, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setEndpoints(prev => prev.map(e =>
              e.id === payload.new.id ? payload.new as ApiEndpoint : e
            ))
          } else if (payload.eventType === 'DELETE') {
            setEndpoints(prev => prev.filter(e => e.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const createEndpoint = useCallback(async (endpointData: {
    name: string
    description?: string
    method: ApiEndpoint['method']
    path: string
    version?: string
    requires_auth?: boolean
    rate_limit_per_hour?: number
    tags?: string[]
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('api_endpoints')
      .insert({
        user_id: user.id,
        name: endpointData.name,
        description: endpointData.description,
        method: endpointData.method,
        path: endpointData.path,
        version: endpointData.version || 'v1',
        requires_auth: endpointData.requires_auth ?? true,
        rate_limit_per_hour: endpointData.rate_limit_per_hour || 1000,
        tags: endpointData.tags || [],
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    setEndpoints(prev => [data, ...prev])
    return data
  }, [supabase])

  const updateEndpoint = useCallback(async (
    endpointId: string,
    updates: Partial<Pick<ApiEndpoint, 'name' | 'description' | 'status' | 'rate_limit_per_hour' | 'requires_auth' | 'tags'>>
  ) => {
    const { error } = await supabase
      .from('api_endpoints')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', endpointId)

    if (error) throw error
    setEndpoints(prev => prev.map(e =>
      e.id === endpointId ? { ...e, ...updates } : e
    ))
  }, [supabase])

  const deleteEndpoint = useCallback(async (endpointId: string) => {
    const { error } = await supabase
      .from('api_endpoints')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', endpointId)

    if (error) throw error
    setEndpoints(prev => prev.filter(e => e.id !== endpointId))
  }, [supabase])

  return {
    endpoints,
    stats,
    isLoading,
    error,
    fetchEndpoints,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint
  }
}

export function getMethodColor(method: ApiEndpoint['method']): string {
  switch (method) {
    case 'GET':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'POST':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'PUT':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'PATCH':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'DELETE':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

export function getStatusColor(status: ApiEndpoint['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'inactive':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    case 'deprecated':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'maintenance':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function formatRequests(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`
  }
  return `${ms.toFixed(0)}ms`
}
