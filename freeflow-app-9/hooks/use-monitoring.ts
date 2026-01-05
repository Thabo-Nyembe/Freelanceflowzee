'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'
export type MetricType = 'gauge' | 'counter' | 'histogram' | 'summary'

export interface Metric {
  id: string
  name: string
  displayName: string
  type: MetricType
  value: number
  unit: string
  labels: Record<string, string>
  history: MetricDataPoint[]
  thresholds?: MetricThreshold[]
  lastUpdatedAt: string
}

export interface MetricDataPoint {
  timestamp: string
  value: number
}

export interface MetricThreshold {
  level: AlertSeverity
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  value: number
}

export interface Alert {
  id: string
  name: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  source: string
  metricId?: string
  metricValue?: number
  threshold?: number
  labels: Record<string, string>
  annotations: Record<string, string>
  firedAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolvedBy?: string
  notificationsSent: string[]
}

export interface Dashboard {
  id: string
  name: string
  description?: string
  panels: DashboardPanel[]
  refreshInterval: number
  timeRange: string
  isDefault: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DashboardPanel {
  id: string
  title: string
  type: 'chart' | 'stat' | 'table' | 'gauge' | 'heatmap'
  metricIds: string[]
  query?: string
  position: { x: number; y: number; w: number; h: number }
  options: Record<string, any>
}

export interface ServiceHealth {
  id: string
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  uptime: number
  latency: number
  errorRate: number
  lastCheckAt: string
  endpoints: EndpointHealth[]
  dependencies: string[]
}

export interface EndpointHealth {
  path: string
  method: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  successRate: number
}

export interface MonitoringStats {
  totalMetrics: number
  activeAlerts: number
  criticalAlerts: number
  servicesHealthy: number
  servicesUnhealthy: number
  avgUptime: number
  avgLatency: number
  alertTrend: { date: string; count: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMetrics: Metric[] = [
  { id: 'met-1', name: 'cpu_usage', displayName: 'CPU Usage', type: 'gauge', value: 45.2, unit: '%', labels: { host: 'web-1' }, history: Array.from({ length: 24 }, (_, i) => ({ timestamp: new Date(Date.now() - i * 3600000).toISOString(), value: 40 + Math.random() * 20 })), thresholds: [{ level: 'warning', operator: 'gt', value: 70 }, { level: 'critical', operator: 'gt', value: 90 }], lastUpdatedAt: new Date().toISOString() },
  { id: 'met-2', name: 'memory_usage', displayName: 'Memory Usage', type: 'gauge', value: 62.8, unit: '%', labels: { host: 'web-1' }, history: Array.from({ length: 24 }, (_, i) => ({ timestamp: new Date(Date.now() - i * 3600000).toISOString(), value: 55 + Math.random() * 15 })), thresholds: [{ level: 'warning', operator: 'gt', value: 80 }, { level: 'critical', operator: 'gt', value: 95 }], lastUpdatedAt: new Date().toISOString() },
  { id: 'met-3', name: 'request_count', displayName: 'Requests/sec', type: 'counter', value: 1250, unit: 'req/s', labels: { service: 'api' }, history: Array.from({ length: 24 }, (_, i) => ({ timestamp: new Date(Date.now() - i * 3600000).toISOString(), value: 1000 + Math.random() * 500 })), lastUpdatedAt: new Date().toISOString() },
  { id: 'met-4', name: 'response_time', displayName: 'Response Time', type: 'histogram', value: 125, unit: 'ms', labels: { service: 'api' }, history: Array.from({ length: 24 }, (_, i) => ({ timestamp: new Date(Date.now() - i * 3600000).toISOString(), value: 100 + Math.random() * 50 })), thresholds: [{ level: 'warning', operator: 'gt', value: 200 }, { level: 'critical', operator: 'gt', value: 500 }], lastUpdatedAt: new Date().toISOString() },
  { id: 'met-5', name: 'error_rate', displayName: 'Error Rate', type: 'gauge', value: 0.5, unit: '%', labels: { service: 'api' }, history: Array.from({ length: 24 }, (_, i) => ({ timestamp: new Date(Date.now() - i * 3600000).toISOString(), value: Math.random() * 2 })), thresholds: [{ level: 'warning', operator: 'gt', value: 1 }, { level: 'critical', operator: 'gt', value: 5 }], lastUpdatedAt: new Date().toISOString() }
]

const mockAlerts: Alert[] = [
  { id: 'alert-1', name: 'High CPU Usage', description: 'CPU usage exceeded 70% threshold', severity: 'warning', status: 'active', source: 'web-1', metricId: 'met-1', metricValue: 75.5, threshold: 70, labels: { host: 'web-1' }, annotations: { summary: 'CPU usage is high', dashboard: 'system-metrics' }, firedAt: '2024-03-20T09:00:00Z', notificationsSent: ['slack', 'email'] },
  { id: 'alert-2', name: 'API Latency Spike', description: 'Response time exceeded 200ms', severity: 'warning', status: 'acknowledged', source: 'api', metricId: 'met-4', metricValue: 280, threshold: 200, labels: { service: 'api' }, annotations: {}, firedAt: '2024-03-20T08:30:00Z', acknowledgedAt: '2024-03-20T08:35:00Z', acknowledgedBy: 'Alex Chen', notificationsSent: ['pagerduty'] }
]

const mockServices: ServiceHealth[] = [
  { id: 'svc-1', name: 'API Server', status: 'healthy', uptime: 99.95, latency: 125, errorRate: 0.5, lastCheckAt: new Date().toISOString(), endpoints: [{ path: '/api/health', method: 'GET', status: 'healthy', responseTime: 45, successRate: 100 }, { path: '/api/users', method: 'GET', status: 'healthy', responseTime: 150, successRate: 99.8 }], dependencies: ['database', 'cache'] },
  { id: 'svc-2', name: 'Database', status: 'healthy', uptime: 99.99, latency: 15, errorRate: 0.01, lastCheckAt: new Date().toISOString(), endpoints: [], dependencies: [] },
  { id: 'svc-3', name: 'Cache', status: 'healthy', uptime: 99.98, latency: 2, errorRate: 0, lastCheckAt: new Date().toISOString(), endpoints: [], dependencies: [] },
  { id: 'svc-4', name: 'Worker', status: 'degraded', uptime: 98.5, latency: 500, errorRate: 2.5, lastCheckAt: new Date().toISOString(), endpoints: [], dependencies: ['database', 'queue'] }
]

const mockDashboards: Dashboard[] = [
  { id: 'dash-1', name: 'System Overview', description: 'High-level system metrics', panels: [{ id: 'p1', title: 'CPU Usage', type: 'chart', metricIds: ['met-1'], position: { x: 0, y: 0, w: 6, h: 4 }, options: { chartType: 'line' } }, { id: 'p2', title: 'Memory Usage', type: 'gauge', metricIds: ['met-2'], position: { x: 6, y: 0, w: 3, h: 4 }, options: {} }], refreshInterval: 30, timeRange: '24h', isDefault: true, createdBy: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-03-15' }
]

const mockStats: MonitoringStats = {
  totalMetrics: 156,
  activeAlerts: 3,
  criticalAlerts: 0,
  servicesHealthy: 8,
  servicesUnhealthy: 1,
  avgUptime: 99.85,
  avgLatency: 135,
  alertTrend: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], count: Math.floor(Math.random() * 5) }))
}

// ============================================================================
// HOOK
// ============================================================================

interface UseMonitoringOptions {
  
  refreshInterval?: number
}

export function useMonitoring(options: UseMonitoringOptions = {}) {
  const {  refreshInterval = 30000 } = options

  const [metrics, setMetrics] = useState<Metric[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [services, setServices] = useState<ServiceHealth[]>([])
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null)
  const [stats, setStats] = useState<MonitoringStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMonitoringData = useCallback(async () => {
    }, [])

  const resolveAlert = useCallback(async (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? {
      ...a,
      status: 'resolved' as const,
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'You'
    } : a))
    return { success: true }
  }, [])

  const silenceAlert = useCallback(async (alertId: string, duration: number) => {
    // In real implementation, this would silence the alert for duration minutes
    return { success: true }
  }, [])

  const createDashboard = useCallback(async (data: Partial<Dashboard>) => {
    const dashboard: Dashboard = {
      id: `dash-${Date.now()}`,
      name: data.name || 'New Dashboard',
      description: data.description,
      panels: data.panels || [],
      refreshInterval: data.refreshInterval || 30,
      timeRange: data.timeRange || '24h',
      isDefault: false,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setDashboards(prev => [...prev, dashboard])
    return { success: true, dashboard }
  }, [])

  const updateDashboard = useCallback(async (dashboardId: string, updates: Partial<Dashboard>) => {
    setDashboards(prev => prev.map(d => d.id === dashboardId ? {
      ...d,
      ...updates,
      updatedAt: new Date().toISOString()
    } : d))
    return { success: true }
  }, [])

  const deleteDashboard = useCallback(async (dashboardId: string) => {
    setDashboards(prev => prev.filter(d => d.id !== dashboardId))
    return { success: true }
  }, [])

  const addPanel = useCallback(async (dashboardId: string, panel: Omit<DashboardPanel, 'id'>) => {
    const newPanel: DashboardPanel = { id: `panel-${Date.now()}`, ...panel }
    setDashboards(prev => prev.map(d => d.id === dashboardId ? {
      ...d,
      panels: [...d.panels, newPanel],
      updatedAt: new Date().toISOString()
    } : d))
    return { success: true, panel: newPanel }
  }, [])

  const updatePanel = useCallback(async (dashboardId: string, panelId: string, updates: Partial<DashboardPanel>) => {
    setDashboards(prev => prev.map(d => d.id === dashboardId ? {
      ...d,
      panels: d.panels.map(p => p.id === panelId ? { ...p, ...updates } : p),
      updatedAt: new Date().toISOString()
    } : d))
    return { success: true }
  }, [])

  const removePanel = useCallback(async (dashboardId: string, panelId: string) => {
    setDashboards(prev => prev.map(d => d.id === dashboardId ? {
      ...d,
      panels: d.panels.filter(p => p.id !== panelId),
      updatedAt: new Date().toISOString()
    } : d))
    return { success: true }
  }, [])

  const getMetricHistory = useCallback((metricId: string, timeRange: string) => {
    const metric = metrics.find(m => m.id === metricId)
    return metric?.history || []
  }, [metrics])

  const queryMetrics = useCallback((query: string) => {
    // Simplified query - in real implementation would use PromQL or similar
    return metrics.filter(m => m.name.includes(query) || m.displayName.toLowerCase().includes(query.toLowerCase()))
  }, [metrics])

  const checkServiceHealth = useCallback(async (serviceId: string) => {
    // Simulate health check
    setServices(prev => prev.map(s => s.id === serviceId ? {
      ...s,
      lastCheckAt: new Date().toISOString()
    } : s))
    return { success: true }
  }, [])

  const getSeverityColor = useCallback((severity: AlertSeverity): string => {
    switch (severity) {
      case 'info': return '#3b82f6'
      case 'warning': return '#f59e0b'
      case 'error': return '#ef4444'
      case 'critical': return '#dc2626'
    }
  }, [])

  const getStatusColor = useCallback((status: ServiceHealth['status']): string => {
    switch (status) {
      case 'healthy': return '#22c55e'
      case 'degraded': return '#f59e0b'
      case 'unhealthy': return '#ef4444'
      case 'unknown': return '#6b7280'
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchMonitoringData()
  }, [fetchMonitoringData])

  useEffect(() => { refresh() }, [refresh])

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [refreshInterval, refresh])

  // Computed values
  const activeAlerts = useMemo(() => alerts.filter(a => a.status === 'active'), [alerts])
  const criticalAlerts = useMemo(() => alerts.filter(a => a.severity === 'critical' && a.status === 'active'), [alerts])
  const healthyServices = useMemo(() => services.filter(s => s.status === 'healthy'), [services])
  const unhealthyServices = useMemo(() => services.filter(s => s.status === 'unhealthy' || s.status === 'degraded'), [services])
  const defaultDashboard = useMemo(() => dashboards.find(d => d.isDefault), [dashboards])

  return {
    metrics, alerts, services, dashboards, currentDashboard, stats,
    activeAlerts, criticalAlerts, healthyServices, unhealthyServices, defaultDashboard,
    isLoading, error,
    refresh, acknowledgeAlert, resolveAlert, silenceAlert,
    createDashboard, updateDashboard, deleteDashboard,
    addPanel, updatePanel, removePanel,
    getMetricHistory, queryMetrics, checkServiceHealth,
    getSeverityColor, getStatusColor, setCurrentDashboard
  }
}

export default useMonitoring
