import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type PerformanceType = 'speed' | 'efficiency' | 'quality' | 'reliability' | 'scalability' | 'throughput' | 'latency' | 'uptime' | 'error_rate' | 'custom'
export type PerformancePeriodType = 'minute' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'real_time'
export type TrendDirection = 'improving' | 'stable' | 'degrading' | 'volatile' | 'unknown'
export type Environment = 'production' | 'staging' | 'development' | 'testing' | 'local'

export interface PerformanceAnalytic {
  id: string
  user_id: string
  metric_name: string
  metric_category: string
  performance_type: PerformanceType
  current_value: number
  previous_value?: number
  baseline_value?: number
  target_value?: number
  optimal_value?: number
  performance_score?: number
  health_score?: number
  quality_score?: number
  efficiency_score?: number
  p50_value?: number
  p75_value?: number
  p90_value?: number
  p95_value?: number
  p99_value?: number
  min_value?: number
  max_value?: number
  avg_value?: number
  median_value?: number
  std_deviation?: number
  period_type: PerformancePeriodType
  period_start: string
  period_end: string
  measured_at: string
  resource_type?: string
  resource_id?: string
  environment?: Environment
  region?: string
  is_degraded: boolean
  is_critical: boolean
  is_optimal: boolean
  degradation_reason?: string
  trend_direction?: TrendDirection
  trend_percentage?: number
  warning_threshold?: number
  critical_threshold?: number
  is_alert_active: boolean
  alert_triggered_at?: string
  alert_resolved_at?: string
  incident_count: number
  last_incident_at?: string
  mttr?: number
  mtbf?: number
  timeseries: any
  breakdown: any
  correlations: any
  description?: string
  notes?: string
  tags?: string[]
  metadata: any
  external_id?: string
  external_source?: string
  sync_status?: string
  last_synced_at?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UsePerformanceAnalyticsOptions {
  category?: string | 'all'
  performanceType?: PerformanceType | 'all'
  environment?: Environment | 'all'
  limit?: number
}

export function usePerformanceAnalytics(options: UsePerformanceAnalyticsOptions = {}) {
  const { category, performanceType, environment, limit } = options

  const filters: Record<string, any> = {}
  if (category && category !== 'all') filters.metric_category = category
  if (performanceType && performanceType !== 'all') filters.performance_type = performanceType
  if (environment && environment !== 'all') filters.environment = environment

  const queryOptions: any = {
    table: 'performance_analytics',
    filters,
    orderBy: { column: 'measured_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<PerformanceAnalytic>(queryOptions)

  const { mutate: create } = useSupabaseMutation<PerformanceAnalytic>({
    table: 'performance_analytics',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<PerformanceAnalytic>({
    table: 'performance_analytics',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<PerformanceAnalytic>({
    table: 'performance_analytics',
    operation: 'delete'
  })

  return {
    performanceAnalytics: data,
    loading,
    error,
    createPerformanceAnalytic: create,
    updatePerformanceAnalytic: update,
    deletePerformanceAnalytic: remove,
    refetch
  }
}
