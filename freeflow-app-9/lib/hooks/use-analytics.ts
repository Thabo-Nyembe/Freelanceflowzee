import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type MetricType = 'count' | 'sum' | 'average' | 'percentage' | 'ratio' | 'rate' | 'duration' | 'score' | 'ranking' | 'custom'
export type PeriodType = 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type AnalyticsStatus = 'draft' | 'active' | 'archived' | 'deprecated' | 'reviewing'

export interface AnalyticsRecord {
  id: string
  user_id: string
  metric_name: string
  metric_type: MetricType
  category: string
  subcategory?: string
  value: number
  previous_value?: number
  target_value?: number
  baseline_value?: number
  change_amount?: number
  change_percent?: number
  variance?: number
  variance_percent?: number
  dimension_1?: string
  dimension_2?: string
  dimension_3?: string
  segment?: string
  cohort?: string
  period_type: PeriodType
  period_start: string
  period_end: string
  recorded_at: string
  source?: string
  data_source?: string
  collection_method?: string
  data_quality: number
  confidence_level: number
  sample_size?: number
  is_estimated: boolean
  is_projection: boolean
  status: AnalyticsStatus
  breakdown: any
  timeseries: any
  dimensions: any
  alert_threshold_min?: number
  alert_threshold_max?: number
  is_alert_triggered: boolean
  alert_triggered_at?: string
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

export interface UseAnalyticsOptions {
  category?: string | 'all'
  metricType?: MetricType | 'all'
  periodType?: PeriodType | 'all'
  status?: AnalyticsStatus | 'all'
  limit?: number
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { category, metricType, periodType, status, limit } = options

  const filters: Record<string, any> = {}
  if (category && category !== 'all') filters.category = category
  if (metricType && metricType !== 'all') filters.metric_type = metricType
  if (periodType && periodType !== 'all') filters.period_type = periodType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'analytics',
    filters,
    orderBy: { column: 'recorded_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<AnalyticsRecord>(queryOptions)

  const { mutate: create } = useSupabaseMutation<AnalyticsRecord>({
    table: 'analytics',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<AnalyticsRecord>({
    table: 'analytics',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<AnalyticsRecord>({
    table: 'analytics',
    operation: 'delete'
  })

  return {
    analytics: data,
    loading,
    error,
    createAnalytic: create,
    updateAnalytic: update,
    deleteAnalytic: remove,
    refetch
  }
}
