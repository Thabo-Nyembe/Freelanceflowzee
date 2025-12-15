import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type InsightType = 'observation' | 'anomaly' | 'trend' | 'pattern' | 'recommendation' | 'prediction' | 'alert' | 'opportunity' | 'risk'
export type InsightSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
export type InsightPriority = 'low' | 'medium' | 'high' | 'urgent'
export type InsightStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed' | 'archived'
export type ImpactLevel = 'minimal' | 'low' | 'medium' | 'high' | 'severe'

export interface SystemInsight {
  id: string
  user_id: string
  insight_type: InsightType
  category: string
  subcategory?: string
  title: string
  description?: string
  severity: InsightSeverity
  priority: InsightPriority
  impact_level?: ImpactLevel
  confidence_score: number
  reliability_score: number
  accuracy_rate?: number
  status: InsightStatus
  affected_metric?: string
  metric_value?: number
  expected_value?: number
  deviation?: number
  deviation_percent?: number
  detected_at: string
  started_at?: string
  ended_at?: string
  resolved_at?: string
  detection_method?: string
  data_source?: string
  algorithm?: string
  recommended_action?: string
  action_taken?: string
  action_taken_at?: string
  action_taken_by?: string
  estimated_impact?: string
  actual_impact?: string
  affected_users?: number
  affected_resources?: string[]
  root_cause?: string
  contributing_factors?: string[]
  related_insight_ids?: string[]
  parent_insight_id?: string
  is_recurring: boolean
  recurrence_count: number
  last_occurrence_at?: string
  frequency?: string
  evidence: any
  metrics: any
  visualizations: any
  viewed_by?: string[]
  viewed_at?: string
  acknowledged_by?: string
  acknowledged_at?: string
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

export interface UseSystemInsightsOptions {
  insightType?: InsightType | 'all'
  severity?: InsightSeverity | 'all'
  status?: InsightStatus | 'all'
  category?: string | 'all'
  limit?: number
}

export function useSystemInsights(options: UseSystemInsightsOptions = {}) {
  const { insightType, severity, status, category, limit } = options

  const filters: Record<string, any> = {}
  if (insightType && insightType !== 'all') filters.insight_type = insightType
  if (severity && severity !== 'all') filters.severity = severity
  if (status && status !== 'all') filters.status = status
  if (category && category !== 'all') filters.category = category

  const queryOptions: any = {
    table: 'system_insights',
    filters,
    orderBy: { column: 'detected_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<SystemInsight>(queryOptions)

  const { mutate: create } = useSupabaseMutation<SystemInsight>({
    table: 'system_insights',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<SystemInsight>({
    table: 'system_insights',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<SystemInsight>({
    table: 'system_insights',
    operation: 'delete'
  })

  return {
    insights: data,
    loading,
    error,
    createInsight: create,
    updateInsight: update,
    deleteInsight: remove,
    refetch
  }
}
