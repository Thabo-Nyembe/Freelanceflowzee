/**
 * Advanced Analytics Query Library
 */

import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

export type MetricType = 'revenue' | 'users' | 'engagement' | 'conversion' | 'retention' | 'performance'
export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut' | 'radar' | 'scatter' | 'heatmap'
export type InsightType = 'trend' | 'anomaly' | 'opportunity' | 'warning' | 'achievement'
export type InsightImpact = 'low' | 'medium' | 'high' | 'critical'
export type GoalStatus = 'on-track' | 'at-risk' | 'completed' | 'missed'
export type DashboardWidgetType = 'metric' | 'chart' | 'table' | 'text' | 'custom'
export type FilterType = 'date-range' | 'select' | 'multi-select' | 'text' | 'number-range'
export type ReportType = 'revenue' | 'sales' | 'marketing' | 'operations' | 'custom'
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json'

export interface AnalyticsMetric {
  id: string
  user_id: string
  metric_type: MetricType
  name: string
  value: number
  previous_value: number
  change_value: number
  change_percent: number
  trend: 'up' | 'down' | 'stable'
  unit: 'currency' | 'number' | 'percentage' | 'time'
  icon?: string
  color?: string
  time_range: TimeRange
  metric_date: string
  created_at: string
  updated_at: string
}

export interface AnalyticsDashboard {
  id: string
  user_id: string
  name: string
  description?: string
  is_default: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface DashboardWidget {
  id: string
  dashboard_id: string
  type: DashboardWidgetType
  title: string
  description?: string
  data_source: string
  config: Record<string, JsonValue>
  position_x: number
  position_y: number
  width: number
  height: number
  refresh_interval?: number
  created_at: string
  updated_at: string
}

export interface DashboardFilter {
  id: string
  dashboard_id: string
  name: string
  type: FilterType
  value?: JsonValue
  options?: JsonValue[]
  created_at: string
}

export interface AnalyticsReport {
  id: string
  user_id: string
  name: string
  description?: string
  type: ReportType
  format: ReportFormat
  schedule_frequency?: string
  schedule_enabled: boolean
  schedule_day_of_week?: number
  schedule_day_of_month?: number
  schedule_time?: string
  recipients: string[]
  sections: JsonValue[]
  last_generated_at?: string
  created_at: string
  updated_at: string
}

export interface FunnelStage {
  id: string
  user_id: string
  funnel_name: string
  stage_name: string
  stage_order: number
  count: number
  percentage: number
  conversion_rate?: number
  dropoff_rate?: number
  metric_date: string
  created_at: string
  updated_at: string
}

export interface AnalyticsInsight {
  id: string
  user_id: string
  type: InsightType
  title: string
  description: string
  impact: InsightImpact
  metric_name?: string
  metric_value?: number
  recommendation?: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsGoal {
  id: string
  user_id: string
  name: string
  description?: string
  metric: string
  target_value: number
  current_value: number
  progress: number
  start_date: string
  end_date: string
  status: GoalStatus
  assigned_to?: string
  created_at: string
  updated_at: string
}

export interface AnalyticsCohort {
  id: string
  user_id: string
  name: string
  start_date: string
  end_date: string
  size: number
  retention_data: JsonValue[]
  created_at: string
  updated_at: string
}

export interface AnalyticsSegment {
  id: string
  user_id: string
  name: string
  description?: string
  criteria: JsonValue[]
  size: number
  created_at: string
  updated_at: string
}

// ANALYTICS METRICS
export async function getAnalyticsMetrics(userId: string, filters?: { metric_type?: MetricType; time_range?: TimeRange; startDate?: string; endDate?: string }) {
  const supabase = createClient()
  let query = supabase.from('analytics_metrics').select('*').eq('user_id', userId).order('metric_date', { ascending: false })
  if (filters?.metric_type) query = query.eq('metric_type', filters.metric_type)
  if (filters?.time_range) query = query.eq('time_range', filters.time_range)
  if (filters?.startDate) query = query.gte('metric_date', filters.startDate)
  if (filters?.endDate) query = query.lte('metric_date', filters.endDate)
  return await query
}

export async function getAnalyticsMetric(metricId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_metrics').select('*').eq('id', metricId).single()
}

export async function createAnalyticsMetric(userId: string, metric: Partial<AnalyticsMetric>) {
  const supabase = createClient()
  return await supabase.from('analytics_metrics').insert({ user_id: userId, ...metric }).select().single()
}

export async function updateAnalyticsMetric(metricId: string, updates: Partial<AnalyticsMetric>) {
  const supabase = createClient()
  return await supabase.from('analytics_metrics').update(updates).eq('id', metricId).select().single()
}

export async function deleteAnalyticsMetric(metricId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_metrics').delete().eq('id', metricId)
}

// DASHBOARDS
export async function getAnalyticsDashboards(userId: string, filters?: { is_public?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('analytics_dashboards').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)
  return await query
}

export async function getAnalyticsDashboard(dashboardId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboards').select('*').eq('id', dashboardId).single()
}

export async function getDefaultDashboard(userId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboards').select('*').eq('user_id', userId).eq('is_default', true).single()
}

export async function createAnalyticsDashboard(userId: string, dashboard: Partial<AnalyticsDashboard>) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboards').insert({ user_id: userId, ...dashboard }).select().single()
}

export async function updateAnalyticsDashboard(dashboardId: string, updates: Partial<AnalyticsDashboard>) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboards').update(updates).eq('id', dashboardId).select().single()
}

export async function deleteAnalyticsDashboard(dashboardId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboards').delete().eq('id', dashboardId)
}

// DASHBOARD WIDGETS
export async function getDashboardWidgets(dashboardId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboard_widgets').select('*').eq('dashboard_id', dashboardId).order('position_y').order('position_x')
}

export async function createDashboardWidget(dashboardId: string, widget: Partial<DashboardWidget>) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboard_widgets').insert({ dashboard_id: dashboardId, ...widget }).select().single()
}

export async function updateDashboardWidget(widgetId: string, updates: Partial<DashboardWidget>) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboard_widgets').update(updates).eq('id', widgetId).select().single()
}

export async function deleteDashboardWidget(widgetId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboard_widgets').delete().eq('id', widgetId)
}

// DASHBOARD FILTERS
export async function getDashboardFilters(dashboardId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboard_filters').select('*').eq('dashboard_id', dashboardId).order('created_at')
}

export async function createDashboardFilter(dashboardId: string, filter: Partial<DashboardFilter>) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboard_filters').insert({ dashboard_id: dashboardId, ...filter }).select().single()
}

export async function updateDashboardFilter(filterId: string, updates: Partial<DashboardFilter>) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboard_filters').update(updates).eq('id', filterId).select().single()
}

export async function deleteDashboardFilter(filterId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_dashboard_filters').delete().eq('id', filterId)
}

// REPORTS
export async function getAnalyticsReports(userId: string, filters?: { type?: ReportType }) {
  const supabase = createClient()
  let query = supabase.from('analytics_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.type) query = query.eq('type', filters.type)
  return await query
}

export async function getAnalyticsReport(reportId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_reports').select('*').eq('id', reportId).single()
}

export async function createAnalyticsReport(userId: string, report: Partial<AnalyticsReport>) {
  const supabase = createClient()
  return await supabase.from('analytics_reports').insert({ user_id: userId, ...report }).select().single()
}

export async function updateAnalyticsReport(reportId: string, updates: Partial<AnalyticsReport>) {
  const supabase = createClient()
  return await supabase.from('analytics_reports').update(updates).eq('id', reportId).select().single()
}

export async function deleteAnalyticsReport(reportId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_reports').delete().eq('id', reportId)
}

// FUNNEL STAGES
export async function getFunnelStages(userId: string, funnelName: string, metricDate?: string) {
  const supabase = createClient()
  let query = supabase.from('analytics_funnel_stages').select('*').eq('user_id', userId).eq('funnel_name', funnelName).order('stage_order')
  if (metricDate) query = query.eq('metric_date', metricDate)
  return await query
}

export async function createFunnelStage(userId: string, stage: Partial<FunnelStage>) {
  const supabase = createClient()
  return await supabase.from('analytics_funnel_stages').insert({ user_id: userId, ...stage }).select().single()
}

export async function updateFunnelStage(stageId: string, updates: Partial<FunnelStage>) {
  const supabase = createClient()
  return await supabase.from('analytics_funnel_stages').update(updates).eq('id', stageId).select().single()
}

export async function deleteFunnelStage(stageId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_funnel_stages').delete().eq('id', stageId)
}

// INSIGHTS
export async function getAnalyticsInsights(userId: string, filters?: { type?: InsightType; impact?: InsightImpact; is_read?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('analytics_insights').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.impact) query = query.eq('impact', filters.impact)
  if (filters?.is_read !== undefined) query = query.eq('is_read', filters.is_read)
  return await query
}

export async function createAnalyticsInsight(userId: string, insight: Partial<AnalyticsInsight>) {
  const supabase = createClient()
  return await supabase.from('analytics_insights').insert({ user_id: userId, ...insight }).select().single()
}

export async function updateAnalyticsInsight(insightId: string, updates: Partial<AnalyticsInsight>) {
  const supabase = createClient()
  return await supabase.from('analytics_insights').update(updates).eq('id', insightId).select().single()
}

export async function markInsightAsRead(insightId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_insights').update({ is_read: true }).eq('id', insightId).select().single()
}

export async function deleteAnalyticsInsight(insightId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_insights').delete().eq('id', insightId)
}

// GOALS
export async function getAnalyticsGoals(userId: string, filters?: { status?: GoalStatus }) {
  const supabase = createClient()
  let query = supabase.from('analytics_goals').select('*').eq('user_id', userId).order('end_date')
  if (filters?.status) query = query.eq('status', filters.status)
  return await query
}

export async function getAnalyticsGoal(goalId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_goals').select('*').eq('id', goalId).single()
}

export async function createAnalyticsGoal(userId: string, goal: Partial<AnalyticsGoal>) {
  const supabase = createClient()
  return await supabase.from('analytics_goals').insert({ user_id: userId, ...goal }).select().single()
}

export async function updateAnalyticsGoal(goalId: string, updates: Partial<AnalyticsGoal>) {
  const supabase = createClient()
  return await supabase.from('analytics_goals').update(updates).eq('id', goalId).select().single()
}

export async function updateGoalCurrentValue(goalId: string, currentValue: number) {
  const supabase = createClient()
  return await supabase.from('analytics_goals').update({ current_value: currentValue }).eq('id', goalId).select().single()
}

export async function deleteAnalyticsGoal(goalId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_goals').delete().eq('id', goalId)
}

// COHORTS
export async function getAnalyticsCohorts(userId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_cohorts').select('*').eq('user_id', userId).order('start_date', { ascending: false })
}

export async function createAnalyticsCohort(userId: string, cohort: Partial<AnalyticsCohort>) {
  const supabase = createClient()
  return await supabase.from('analytics_cohorts').insert({ user_id: userId, ...cohort }).select().single()
}

export async function updateAnalyticsCohort(cohortId: string, updates: Partial<AnalyticsCohort>) {
  const supabase = createClient()
  return await supabase.from('analytics_cohorts').update(updates).eq('id', cohortId).select().single()
}

export async function deleteAnalyticsCohort(cohortId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_cohorts').delete().eq('id', cohortId)
}

// SEGMENTS
export async function getAnalyticsSegments(userId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_segments').select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function createAnalyticsSegment(userId: string, segment: Partial<AnalyticsSegment>) {
  const supabase = createClient()
  return await supabase.from('analytics_segments').insert({ user_id: userId, ...segment }).select().single()
}

export async function updateAnalyticsSegment(segmentId: string, updates: Partial<AnalyticsSegment>) {
  const supabase = createClient()
  return await supabase.from('analytics_segments').update(updates).eq('id', segmentId).select().single()
}

export async function deleteAnalyticsSegment(segmentId: string) {
  const supabase = createClient()
  return await supabase.from('analytics_segments').delete().eq('id', segmentId)
}

// STATS
export async function getAdvancedAnalyticsStats(userId: string, timeRange: TimeRange = 'month') {
  const supabase = createClient()
  const [metricsResult, dashboardsResult, reportsResult, insightsResult, goalsResult] = await Promise.all([
    supabase.from('analytics_metrics').select('metric_type, value, change_percent, trend').eq('user_id', userId).eq('time_range', timeRange),
    supabase.from('analytics_dashboards').select('id, is_default', { count: 'exact' }).eq('user_id', userId),
    supabase.from('analytics_reports').select('id, schedule_enabled').eq('user_id', userId),
    supabase.from('analytics_insights').select('id, type, impact, is_read').eq('user_id', userId),
    supabase.from('analytics_goals').select('id, status, progress').eq('user_id', userId)
  ])

  const revenueMetric = metricsResult.data?.find(m => m.metric_type === 'revenue')
  const usersMetric = metricsResult.data?.find(m => m.metric_type === 'users')
  const conversionMetric = metricsResult.data?.find(m => m.metric_type === 'conversion')
  const retentionMetric = metricsResult.data?.find(m => m.metric_type === 'retention')

  const unreadInsights = insightsResult.data?.filter(i => !i.is_read).length || 0
  const criticalInsights = insightsResult.data?.filter(i => i.impact === 'critical').length || 0
  const activeReports = reportsResult.data?.filter(r => r.schedule_enabled).length || 0
  const onTrackGoals = goalsResult.data?.filter(g => g.status === 'on-track' || g.status === 'completed').length || 0
  const avgGoalProgress = goalsResult.data?.reduce((sum, g) => sum + (g.progress || 0), 0) / (goalsResult.data?.length || 1) || 0

  return {
    data: {
      total_metrics: metricsResult.count || 0,
      revenue: revenueMetric?.value || 0,
      revenue_change: revenueMetric?.change_percent || 0,
      users: usersMetric?.value || 0,
      users_change: usersMetric?.change_percent || 0,
      conversion_rate: conversionMetric?.value || 0,
      retention_rate: retentionMetric?.value || 0,
      total_dashboards: dashboardsResult.count || 0,
      total_reports: reportsResult.count || 0,
      active_reports: activeReports,
      total_insights: insightsResult.count || 0,
      unread_insights: unreadInsights,
      critical_insights: criticalInsights,
      total_goals: goalsResult.count || 0,
      on_track_goals: onTrackGoals,
      average_goal_progress: avgGoalProgress
    },
    error: metricsResult.error || dashboardsResult.error || reportsResult.error || insightsResult.error || goalsResult.error
  }
}
