// System Insights - Supabase Queries
// System monitoring, performance tracking, error logging, and health metrics

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type MetricType =
  | 'api_response_time'
  | 'database_query_time'
  | 'page_load_time'
  | 'error_rate'
  | 'request_count'
  | 'memory_usage'
  | 'cpu_usage'
  | 'storage_usage'
  | 'bandwidth_usage'
  | 'active_users'
  | 'concurrent_sessions'

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'critical'
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical'
export type ResourceType = 'database' | 'storage' | 'api' | 'cdn' | 'compute'

export interface SystemMetric {
  id: string
  user_id?: string
  metric_type: MetricType
  metric_name: string
  metric_value: number
  metric_unit: string
  endpoint?: string
  service?: string
  environment: string
  metadata?: any
  tags?: string[]
  timestamp: string
  created_at: string
}

export interface PerformanceLog {
  id: string
  user_id?: string
  operation: string
  duration_ms: number
  success: boolean
  endpoint?: string
  method?: string
  status_code?: number
  network_time?: number
  processing_time?: number
  database_time?: number
  memory_mb?: number
  cpu_percent?: number
  metadata?: any
  timestamp: string
  created_at: string
}

export interface ErrorLog {
  id: string
  user_id?: string
  error_id: string
  error_type: string
  error_message: string
  error_stack?: string
  severity: AlertSeverity
  endpoint?: string
  operation?: string
  file_path?: string
  line_number?: number
  browser?: string
  os?: string
  device?: string
  ip_address?: string
  resolved: boolean
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
  metadata?: any
  timestamp: string
  created_at: string
}

export interface SystemHealth {
  id: string
  status: HealthStatus
  overall_score: number
  api_health: HealthStatus
  database_health: HealthStatus
  storage_health: HealthStatus
  cdn_health: HealthStatus
  avg_response_time: number
  error_rate: number
  uptime_percent: number
  active_users: number
  critical_issues: number
  warnings: number
  metadata?: any
  checked_at: string
  created_at: string
}

export interface ResourceUsage {
  id: string
  user_id?: string
  resource_type: ResourceType
  resource_name: string
  usage_current: number
  usage_limit: number
  usage_percent: number
  unit: string
  usage_1h_ago?: number
  usage_24h_ago?: number
  usage_7d_ago?: number
  alert_threshold: number
  is_alerting: boolean
  metadata?: any
  timestamp: string
  created_at: string
}

export interface ApiPerformance {
  id: string
  endpoint: string
  method: string
  total_requests: number
  successful_requests: number
  failed_requests: number
  success_rate: number
  avg_response_time: number
  min_response_time: number
  max_response_time: number
  p50_response_time: number
  p95_response_time: number
  p99_response_time: number
  period_start: string
  period_end: string
  metadata?: any
  created_at: string
}

export interface SystemAlert {
  id: string
  alert_type: string
  severity: AlertSeverity
  title: string
  message: string
  source: string
  resource_type?: ResourceType
  resource_id?: string
  threshold_value?: number
  current_value?: number
  acknowledged: boolean
  acknowledged_at?: string
  acknowledged_by?: string
  resolved: boolean
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
  metadata?: any
  triggered_at: string
  created_at: string
}

export interface MetricsSummary {
  total_metrics: number
  by_type: Record<MetricType, number>
  avg_values: Record<MetricType, number>
}

export interface SystemDashboard {
  health: SystemHealth
  recent_errors: ErrorLog[]
  active_alerts: SystemAlert[]
  resource_usage: ResourceUsage[]
  api_performance: ApiPerformance[]
  metrics_summary: MetricsSummary
}

// ============================================================================
// SYSTEM METRICS QUERIES
// ============================================================================

/**
 * Log a system metric
 */
export async function logMetric(metricData: {
  user_id?: string
  metric_type: MetricType
  metric_name: string
  metric_value: number
  metric_unit: string
  endpoint?: string
  service?: string
  metadata?: any
  tags?: string[]
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('log_metric', {
      p_user_id: metricData.user_id || null,
      p_metric_type: metricData.metric_type,
      p_metric_name: metricData.metric_name,
      p_metric_value: metricData.metric_value,
      p_metric_unit: metricData.metric_unit,
      p_endpoint: metricData.endpoint || null,
      p_metadata: metricData.metadata || {}
    })

  if (error) throw error
  return data
}

/**
 * Get system metrics
 */
export async function getSystemMetrics(
  userId?: string,
  filters?: {
    metric_type?: MetricType
    start_date?: Date
    end_date?: Date
  },
  limit: number = 100
) {
  const supabase = createClient()

  let query = supabase
    .from('system_metrics')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (filters?.metric_type) {
    query = query.eq('metric_type', filters.metric_type)
  }

  if (filters?.start_date) {
    query = query.gte('timestamp', filters.start_date.toISOString())
  }

  if (filters?.end_date) {
    query = query.lte('timestamp', filters.end_date.toISOString())
  }

  const { data, error } = await query

  if (error) throw error
  return data as SystemMetric[]
}

/**
 * Get metrics by type
 */
export async function getMetricsByType(
  metricType: MetricType,
  userId?: string,
  limit: number = 50
) {
  const supabase = createClient()

  let query = supabase
    .from('system_metrics')
    .select('*')
    .eq('metric_type', metricType)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as SystemMetric[]
}

/**
 * Get average metric value
 */
export async function getAverageMetric(
  metricType: MetricType,
  timeWindow: '1h' | '24h' | '7d' | '30d' = '24h',
  userId?: string
): Promise<number> {
  const supabase = createClient()

  const intervals = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days',
    '30d': '30 days'
  }

  let query = supabase
    .from('system_metrics')
    .select('metric_value')
    .eq('metric_type', metricType)
    .gte('timestamp', `now() - interval '${intervals[timeWindow]}'`)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) throw error
  if (!data || data.length === 0) return 0

  const sum = data.reduce((acc, row) => acc + Number(row.metric_value), 0)
  return sum / data.length
}

/**
 * Get metrics summary
 */
export async function getMetricsSummary(
  userId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<MetricsSummary> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_metrics_summary', {
      p_user_id: userId || null,
      p_start_date: startDate?.toISOString() || null,
      p_end_date: endDate?.toISOString() || null
    })

  if (error) throw error
  return data as MetricsSummary
}

// ============================================================================
// PERFORMANCE LOGS QUERIES
// ============================================================================

/**
 * Log performance data
 */
export async function logPerformance(performanceData: {
  user_id?: string
  operation: string
  duration_ms: number
  success?: boolean
  endpoint?: string
  method?: string
  status_code?: number
  network_time?: number
  processing_time?: number
  database_time?: number
  memory_mb?: number
  cpu_percent?: number
  metadata?: any
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('performance_logs')
    .insert({
      user_id: performanceData.user_id || null,
      operation: performanceData.operation,
      duration_ms: performanceData.duration_ms,
      success: performanceData.success ?? true,
      endpoint: performanceData.endpoint,
      method: performanceData.method,
      status_code: performanceData.status_code,
      network_time: performanceData.network_time,
      processing_time: performanceData.processing_time,
      database_time: performanceData.database_time,
      memory_mb: performanceData.memory_mb,
      cpu_percent: performanceData.cpu_percent,
      metadata: performanceData.metadata || {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get performance logs
 */
export async function getPerformanceLogs(
  userId?: string,
  filters?: {
    operation?: string
    endpoint?: string
    success?: boolean
    start_date?: Date
    end_date?: Date
  },
  limit: number = 100
) {
  const supabase = createClient()

  let query = supabase
    .from('performance_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (filters?.operation) {
    query = query.eq('operation', filters.operation)
  }

  if (filters?.endpoint) {
    query = query.eq('endpoint', filters.endpoint)
  }

  if (filters?.success !== undefined) {
    query = query.eq('success', filters.success)
  }

  if (filters?.start_date) {
    query = query.gte('timestamp', filters.start_date.toISOString())
  }

  if (filters?.end_date) {
    query = query.lte('timestamp', filters.end_date.toISOString())
  }

  const { data, error } = await query

  if (error) throw error
  return data as PerformanceLog[]
}

/**
 * Get slow operations (> 1000ms)
 */
export async function getSlowOperations(limit: number = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('performance_logs')
    .select('*')
    .gt('duration_ms', 1000)
    .order('duration_ms', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as PerformanceLog[]
}

/**
 * Get average response time by endpoint
 */
export async function getAverageResponseTimeByEndpoint(
  timeWindow: '1h' | '24h' | '7d' = '24h'
) {
  const supabase = createClient()

  const intervals = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days'
  }

  const { data, error } = await supabase
    .from('performance_logs')
    .select('endpoint, duration_ms')
    .gte('timestamp', `now() - interval '${intervals[timeWindow]}'`)
    .not('endpoint', 'is', null)

  if (error) throw error
  if (!data) return []

  // Group by endpoint and calculate average
  const grouped = data.reduce((acc, row) => {
    if (!row.endpoint) return acc
    if (!acc[row.endpoint]) {
      acc[row.endpoint] = { sum: 0, count: 0 }
    }
    acc[row.endpoint].sum += row.duration_ms
    acc[row.endpoint].count += 1
    return acc
  }, {} as Record<string, { sum: number; count: number }>)

  return Object.entries(grouped).map(([endpoint, stats]) => ({
    endpoint,
    avg_response_time: stats.sum / stats.count,
    request_count: stats.count
  }))
}

// ============================================================================
// ERROR LOGS QUERIES
// ============================================================================

/**
 * Log an error
 */
export async function logError(errorData: {
  user_id?: string
  error_id: string
  error_type: string
  error_message: string
  error_stack?: string
  severity?: AlertSeverity
  endpoint?: string
  operation?: string
  file_path?: string
  line_number?: number
  browser?: string
  os?: string
  device?: string
  metadata?: any
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('log_error', {
      p_user_id: errorData.user_id || null,
      p_error_id: errorData.error_id,
      p_error_type: errorData.error_type,
      p_error_message: errorData.error_message,
      p_severity: errorData.severity || 'error',
      p_endpoint: errorData.endpoint || null,
      p_metadata: errorData.metadata || {}
    })

  if (error) throw error
  return data
}

/**
 * Get error logs
 */
export async function getErrorLogs(
  userId?: string,
  filters?: {
    severity?: AlertSeverity
    resolved?: boolean
    start_date?: Date
    end_date?: Date
  },
  limit: number = 100
) {
  const supabase = createClient()

  let query = supabase
    .from('error_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (filters?.severity) {
    query = query.eq('severity', filters.severity)
  }

  if (filters?.resolved !== undefined) {
    query = query.eq('resolved', filters.resolved)
  }

  if (filters?.start_date) {
    query = query.gte('timestamp', filters.start_date.toISOString())
  }

  if (filters?.end_date) {
    query = query.lte('timestamp', filters.end_date.toISOString())
  }

  const { data, error } = await query

  if (error) throw error
  return data as ErrorLog[]
}

/**
 * Get critical errors (unresolved)
 */
export async function getCriticalErrors(limit: number = 20) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .eq('severity', 'critical')
    .eq('resolved', false)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as ErrorLog[]
}

/**
 * Resolve error
 */
export async function resolveError(
  errorId: string,
  resolvedBy: string,
  resolutionNotes?: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('error_logs')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
      resolution_notes: resolutionNotes
    })
    .eq('error_id', errorId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get error rate
 */
export async function getErrorRate(
  timeWindow: '1h' | '24h' | '7d' = '24h'
): Promise<number> {
  const supabase = createClient()

  const intervals = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days'
  }

  // Count errors
  const { count: errorCount } = await supabase
    .from('error_logs')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', `now() - interval '${intervals[timeWindow]}'`)

  // Count total requests
  const { count: totalRequests } = await supabase
    .from('performance_logs')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', `now() - interval '${intervals[timeWindow]}'`)

  if (!totalRequests || totalRequests === 0) return 0

  return ((errorCount || 0) / totalRequests) * 100
}

// ============================================================================
// SYSTEM HEALTH QUERIES
// ============================================================================

/**
 * Get current system health
 */
export async function getSystemHealth() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('system_health')
    .select('*')
    .order('checked_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // Ignore "no rows" error
  return data as SystemHealth | null
}

/**
 * Calculate and update system health
 */
export async function updateSystemHealth() {
  const supabase = createClient()

  // Get health score
  const { data: score } = await supabase.rpc('get_system_health_score')
  const { data: status } = await supabase.rpc('calculate_system_health')

  // Get component metrics
  const avgResponse = await getAverageMetric('api_response_time', '1h')
  const errorRate = await getErrorRate('1h')
  const criticalErrors = await getCriticalErrors(100)
  const activeAlerts = await getActiveAlerts()

  const { data, error } = await supabase
    .from('system_health')
    .insert({
      status,
      overall_score: score || 100,
      api_health: avgResponse > 1000 ? 'unhealthy' : avgResponse > 500 ? 'degraded' : 'healthy',
      database_health: 'healthy', // Would check actual DB metrics
      storage_health: 'healthy', // Would check storage usage
      cdn_health: 'healthy', // Would check CDN status
      avg_response_time: avgResponse,
      error_rate: errorRate,
      uptime_percent: 99.9, // Would calculate from actual uptime data
      active_users: 0, // Would get from active sessions
      critical_issues: criticalErrors.length,
      warnings: activeAlerts.filter(a => a.severity === 'warning').length
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get system health history
 */
export async function getSystemHealthHistory(days: number = 7) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('system_health')
    .select('*')
    .gte('checked_at', `now() - interval '${days} days'`)
    .order('checked_at', { ascending: true })

  if (error) throw error
  return data as SystemHealth[]
}

// ============================================================================
// RESOURCE USAGE QUERIES
// ============================================================================

/**
 * Get resource usage
 */
export async function getResourceUsage(
  userId?: string,
  resourceType?: ResourceType,
  limit: number = 50
) {
  const supabase = createClient()

  let query = supabase
    .from('resource_usage')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (resourceType) {
    query = query.eq('resource_type', resourceType)
  }

  const { data, error } = await query

  if (error) throw error
  return data as ResourceUsage[]
}

/**
 * Get resources with alerts
 */
export async function getAlertingResources() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_usage')
    .select('*')
    .eq('is_alerting', true)
    .order('usage_percent', { ascending: false })

  if (error) throw error
  return data as ResourceUsage[]
}

/**
 * Update resource usage
 */
export async function updateResourceUsage(resourceData: {
  user_id?: string
  resource_type: ResourceType
  resource_name: string
  usage_current: number
  usage_limit: number
  unit: string
  alert_threshold?: number
}) {
  const supabase = createClient()

  const usagePercent = (resourceData.usage_current / resourceData.usage_limit) * 100
  const isAlerting = usagePercent >= (resourceData.alert_threshold || 80)

  const { data, error } = await supabase
    .from('resource_usage')
    .insert({
      user_id: resourceData.user_id || null,
      resource_type: resourceData.resource_type,
      resource_name: resourceData.resource_name,
      usage_current: resourceData.usage_current,
      usage_limit: resourceData.usage_limit,
      usage_percent: usagePercent,
      unit: resourceData.unit,
      alert_threshold: resourceData.alert_threshold || 80,
      is_alerting: isAlerting
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// API PERFORMANCE QUERIES
// ============================================================================

/**
 * Get API performance metrics
 */
export async function getApiPerformance(
  endpoint?: string,
  limit: number = 50
) {
  const supabase = createClient()

  let query = supabase
    .from('api_performance')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (endpoint) {
    query = query.eq('endpoint', endpoint)
  }

  const { data, error } = await query

  if (error) throw error
  return data as ApiPerformance[]
}

/**
 * Get slowest API endpoints
 */
export async function getSlowestEndpoints(limit: number = 10) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('api_performance')
    .select('*')
    .order('avg_response_time', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as ApiPerformance[]
}

// ============================================================================
// SYSTEM ALERTS QUERIES
// ============================================================================

/**
 * Create system alert
 */
export async function createAlert(alertData: {
  alert_type: string
  severity: AlertSeverity
  title: string
  message: string
  source: string
  resource_type?: ResourceType
  resource_id?: string
  threshold_value?: number
  current_value?: number
  metadata?: any
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('system_alerts')
    .insert(alertData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get active alerts
 */
export async function getActiveAlerts(severity?: AlertSeverity) {
  const supabase = createClient()

  let query = supabase
    .from('system_alerts')
    .select('*')
    .eq('resolved', false)
    .order('triggered_at', { ascending: false })

  if (severity) {
    query = query.eq('severity', severity)
  }

  const { data, error } = await query

  if (error) throw error
  return data as SystemAlert[]
}

/**
 * Acknowledge alert
 */
export async function acknowledgeAlert(alertId: string, userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('system_alerts')
    .update({
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: userId
    })
    .eq('id', alertId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Resolve alert
 */
export async function resolveAlert(
  alertId: string,
  userId: string,
  resolutionNotes?: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('system_alerts')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
      resolution_notes: resolutionNotes
    })
    .eq('id', alertId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get alert history
 */
export async function getAlertHistory(
  filters?: {
    severity?: AlertSeverity
    resolved?: boolean
    start_date?: Date
    end_date?: Date
  },
  limit: number = 100
) {
  const supabase = createClient()

  let query = supabase
    .from('system_alerts')
    .select('*')
    .order('triggered_at', { ascending: false })
    .limit(limit)

  if (filters?.severity) {
    query = query.eq('severity', filters.severity)
  }

  if (filters?.resolved !== undefined) {
    query = query.eq('resolved', filters.resolved)
  }

  if (filters?.start_date) {
    query = query.gte('triggered_at', filters.start_date.toISOString())
  }

  if (filters?.end_date) {
    query = query.lte('triggered_at', filters.end_date.toISOString())
  }

  const { data, error } = await query

  if (error) throw error
  return data as SystemAlert[]
}

// ============================================================================
// DASHBOARD QUERIES
// ============================================================================

/**
 * Get system insights dashboard data
 */
export async function getSystemDashboard(userId?: string): Promise<SystemDashboard> {
  // Get all data in parallel
  const [
    health,
    recentErrors,
    activeAlerts,
    resourceUsage,
    apiPerformance,
    metricsSummary
  ] = await Promise.all([
    getSystemHealth(),
    getErrorLogs(userId, { resolved: false }, 10),
    getActiveAlerts(),
    getResourceUsage(userId, undefined, 10),
    getApiPerformance(undefined, 10),
    getMetricsSummary(userId, new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
  ])

  return {
    health: health || {
      id: '',
      status: 'healthy',
      overall_score: 100,
      api_health: 'healthy',
      database_health: 'healthy',
      storage_health: 'healthy',
      cdn_health: 'healthy',
      avg_response_time: 0,
      error_rate: 0,
      uptime_percent: 100,
      active_users: 0,
      critical_issues: 0,
      warnings: 0,
      checked_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    recent_errors: recentErrors,
    active_alerts: activeAlerts,
    resource_usage: resourceUsage,
    api_performance: apiPerformance,
    metrics_summary: metricsSummary
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export metrics to CSV
 */
export async function exportMetrics(
  userId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const metrics = await getSystemMetrics(userId, { start_date: startDate, end_date: endDate }, 10000)

  const headers = ['Timestamp', 'Type', 'Name', 'Value', 'Unit', 'Endpoint', 'Service']
  const rows = metrics.map(m => [
    m.timestamp,
    m.metric_type,
    m.metric_name,
    m.metric_value.toString(),
    m.metric_unit,
    m.endpoint || '',
    m.service || ''
  ])

  return { headers, rows }
}

/**
 * Export error logs to CSV
 */
export async function exportErrorLogs(
  userId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const errors = await getErrorLogs(userId, { start_date: startDate, end_date: endDate }, 10000)

  const headers = ['Timestamp', 'Error ID', 'Type', 'Message', 'Severity', 'Endpoint', 'Resolved']
  const rows = errors.map(e => [
    e.timestamp,
    e.error_id,
    e.error_type,
    e.error_message,
    e.severity,
    e.endpoint || '',
    e.resolved ? 'Yes' : 'No'
  ])

  return { headers, rows }
}
