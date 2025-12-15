'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useMemo } from 'react'

export interface Server {
  id: string
  user_id: string
  server_name: string
  server_type: string
  status: string
  location: string | null
  ip_address: string | null
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_throughput: number
  uptime_percentage: number
  requests_per_hour: number
  last_health_check: string
  configuration: Record<string, unknown>
  tags: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ServerMetric {
  id: string
  server_id: string
  user_id: string
  metric_type: string
  metric_value: number
  unit: string
  recorded_at: string
  metadata: Record<string, unknown>
}

export interface SystemAlert {
  id: string
  user_id: string
  server_id: string | null
  alert_type: string
  severity: string
  title: string
  description: string | null
  status: string
  acknowledged_at: string | null
  acknowledged_by: string | null
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
}

export interface MonitoringFilters {
  status?: string
  serverType?: string
  location?: string
}

export function useServers(initialData?: Server[], filters?: MonitoringFilters) {
  const query = useSupabaseQuery<Server>({
    table: 'servers',
    select: '*',
    filters: [
      { column: 'deleted_at', operator: 'is', value: null }
    ],
    orderBy: { column: 'server_name', ascending: true },
    initialData
  })

  const filteredServers = useMemo(() => {
    if (!query.data) return []

    return query.data.filter(server => {
      if (filters?.status && filters.status !== 'all' && server.status !== filters.status) return false
      if (filters?.serverType && filters.serverType !== 'all' && server.server_type !== filters.serverType) return false
      if (filters?.location && filters.location !== 'all' && server.location !== filters.location) return false
      return true
    })
  }, [query.data, filters])

  const stats = useMemo(() => {
    if (!query.data) return {
      total: 0,
      healthy: 0,
      warning: 0,
      critical: 0,
      avgCpu: 0,
      avgMemory: 0,
      avgDisk: 0,
      avgUptime: 0,
      totalRequests: 0
    }

    const healthy = query.data.filter(s => s.status === 'healthy').length
    const warning = query.data.filter(s => s.status === 'warning').length
    const critical = query.data.filter(s => s.status === 'critical').length
    const avgCpu = query.data.reduce((sum, s) => sum + Number(s.cpu_usage), 0) / query.data.length || 0
    const avgMemory = query.data.reduce((sum, s) => sum + Number(s.memory_usage), 0) / query.data.length || 0
    const avgDisk = query.data.reduce((sum, s) => sum + Number(s.disk_usage), 0) / query.data.length || 0
    const avgUptime = query.data.reduce((sum, s) => sum + Number(s.uptime_percentage), 0) / query.data.length || 0
    const totalRequests = query.data.reduce((sum, s) => sum + s.requests_per_hour, 0)

    return {
      total: query.data.length,
      healthy,
      warning,
      critical,
      avgCpu: Math.round(avgCpu * 10) / 10,
      avgMemory: Math.round(avgMemory * 10) / 10,
      avgDisk: Math.round(avgDisk * 10) / 10,
      avgUptime: Math.round(avgUptime * 100) / 100,
      totalRequests
    }
  }, [query.data])

  return {
    ...query,
    servers: filteredServers,
    stats
  }
}

export function useServerMetrics(serverId?: string, metricType?: string) {
  const filters = [
    { column: 'server_id', operator: 'eq' as const, value: serverId }
  ]

  if (metricType && metricType !== 'all') {
    filters.push({ column: 'metric_type', operator: 'eq' as const, value: metricType })
  }

  return useSupabaseQuery<ServerMetric>({
    table: 'server_metrics',
    select: '*',
    filters: serverId ? filters : [],
    orderBy: { column: 'recorded_at', ascending: false },
    enabled: !!serverId
  })
}

export function useSystemAlerts(initialData?: SystemAlert[], filters?: { status?: string; severity?: string }) {
  const query = useSupabaseQuery<SystemAlert>({
    table: 'system_alerts',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    initialData
  })

  const filteredAlerts = useMemo(() => {
    if (!query.data) return []

    return query.data.filter(alert => {
      if (filters?.status && filters.status !== 'all' && alert.status !== filters.status) return false
      if (filters?.severity && filters.severity !== 'all' && alert.severity !== filters.severity) return false
      return true
    })
  }, [query.data, filters])

  return {
    ...query,
    alerts: filteredAlerts
  }
}

export function useServerMutations() {
  const createServer = useSupabaseMutation<Server>({
    table: 'servers',
    operation: 'insert',
    invalidateQueries: ['servers']
  })

  const updateServer = useSupabaseMutation<Server>({
    table: 'servers',
    operation: 'update',
    invalidateQueries: ['servers']
  })

  const deleteServer = useSupabaseMutation<Server>({
    table: 'servers',
    operation: 'update',
    invalidateQueries: ['servers']
  })

  return {
    createServer: createServer.mutate,
    updateServer: updateServer.mutate,
    deleteServer: (id: string) => deleteServer.mutate({ id, deleted_at: new Date().toISOString() }),
    isCreating: createServer.isLoading,
    isUpdating: updateServer.isLoading,
    isDeleting: deleteServer.isLoading
  }
}

export function useAlertMutations() {
  const acknowledgeAlert = useSupabaseMutation<SystemAlert>({
    table: 'system_alerts',
    operation: 'update',
    invalidateQueries: ['system_alerts']
  })

  const resolveAlert = useSupabaseMutation<SystemAlert>({
    table: 'system_alerts',
    operation: 'update',
    invalidateQueries: ['system_alerts']
  })

  return {
    acknowledgeAlert: (id: string, userId: string) => acknowledgeAlert.mutate({
      id,
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: userId
    }),
    resolveAlert: (id: string, userId: string) => resolveAlert.mutate({
      id,
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: userId
    }),
    isAcknowledging: acknowledgeAlert.isLoading,
    isResolving: resolveAlert.isLoading
  }
}
