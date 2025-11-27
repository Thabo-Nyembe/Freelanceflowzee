/**
 * Performance Analytics Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type MetricCategory = 'revenue' | 'productivity' | 'client' | 'project' | 'financial' | 'efficiency'
export type TrendDirection = 'up' | 'down' | 'stable'
export type PerformancePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type BenchmarkLevel = 'poor' | 'average' | 'good' | 'excellent' | 'outstanding'

export interface PerformanceMetric {
  id: string
  user_id: string
  metric_date: string
  period: PerformancePeriod
  category: MetricCategory
  revenue: number
  revenue_previous: number
  revenue_change: number
  projects_completed: number
  projects_in_progress: number
  projects_total: number
  completion_rate: number
  avg_project_duration: number
  clients_total: number
  clients_active: number
  clients_new: number
  client_retention: number
  client_satisfaction: number
  hours_logged: number
  hours_billable: number
  efficiency_score: number
  utilization_rate: number
  profit: number
  expenses: number
  profit_margin: number
  avg_project_value: number
  trend: TrendDirection
  created_at: string
  updated_at: string
}

export interface PerformanceSnapshot {
  id: string
  user_id: string
  snapshot_date: string
  period: PerformancePeriod
  total_revenue: number
  total_profit: number
  total_projects: number
  total_clients: number
  avg_efficiency: number
  top_performing_projects: any[]
  top_clients: any[]
  performance_summary?: string
  created_at: string
}

export interface PerformanceAlert {
  id: string
  user_id: string
  metric_category: MetricCategory
  alert_type: string
  severity: string
  title: string
  message: string
  threshold_value?: number
  actual_value?: number
  is_read: boolean
  is_resolved: boolean
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface PerformanceBenchmark {
  id: string
  user_id: string
  category: MetricCategory
  metric_name: string
  target_value: number
  current_value: number
  benchmark_level: BenchmarkLevel
  period: PerformancePeriod
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PerformanceGoal {
  id: string
  user_id: string
  category: MetricCategory
  title: string
  description?: string
  target_value: number
  current_value: number
  progress: number
  start_date: string
  target_date: string
  is_achieved: boolean
  achieved_at?: string
  created_at: string
  updated_at: string
}

// PERFORMANCE METRICS
export async function getPerformanceMetrics(userId: string, filters?: { period?: PerformancePeriod; category?: MetricCategory; startDate?: string; endDate?: string }) {
  const supabase = createClient()
  let query = supabase.from('performance_metrics').select('*').eq('user_id', userId).order('metric_date', { ascending: false })
  if (filters?.period) query = query.eq('period', filters.period)
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.startDate) query = query.gte('metric_date', filters.startDate)
  if (filters?.endDate) query = query.lte('metric_date', filters.endDate)
  return await query
}

export async function getPerformanceMetric(metricId: string) {
  const supabase = createClient()
  return await supabase.from('performance_metrics').select('*').eq('id', metricId).single()
}

export async function createPerformanceMetric(userId: string, metric: Partial<PerformanceMetric>) {
  const supabase = createClient()
  return await supabase.from('performance_metrics').insert({ user_id: userId, ...metric }).select().single()
}

export async function updatePerformanceMetric(metricId: string, updates: Partial<PerformanceMetric>) {
  const supabase = createClient()
  return await supabase.from('performance_metrics').update(updates).eq('id', metricId).select().single()
}

export async function deletePerformanceMetric(metricId: string) {
  const supabase = createClient()
  return await supabase.from('performance_metrics').delete().eq('id', metricId)
}

// PERFORMANCE SNAPSHOTS
export async function getPerformanceSnapshots(userId: string, filters?: { period?: PerformancePeriod; limit?: number }) {
  const supabase = createClient()
  let query = supabase.from('performance_snapshots').select('*').eq('user_id', userId).order('snapshot_date', { ascending: false })
  if (filters?.period) query = query.eq('period', filters.period)
  if (filters?.limit) query = query.limit(filters.limit)
  return await query
}

export async function getLatestSnapshot(userId: string, period?: PerformancePeriod) {
  const supabase = createClient()
  let query = supabase.from('performance_snapshots').select('*').eq('user_id', userId).order('snapshot_date', { ascending: false }).limit(1)
  if (period) query = query.eq('period', period)
  return await query.single()
}

export async function createPerformanceSnapshot(userId: string, snapshot: Partial<PerformanceSnapshot>) {
  const supabase = createClient()
  return await supabase.from('performance_snapshots').insert({ user_id: userId, ...snapshot }).select().single()
}

export async function deletePerformanceSnapshot(snapshotId: string) {
  const supabase = createClient()
  return await supabase.from('performance_snapshots').delete().eq('id', snapshotId)
}

// PERFORMANCE ALERTS
export async function getPerformanceAlerts(userId: string, filters?: { is_read?: boolean; is_resolved?: boolean; severity?: string }) {
  const supabase = createClient()
  let query = supabase.from('performance_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.is_read !== undefined) query = query.eq('is_read', filters.is_read)
  if (filters?.is_resolved !== undefined) query = query.eq('is_resolved', filters.is_resolved)
  if (filters?.severity) query = query.eq('severity', filters.severity)
  return await query
}

export async function createPerformanceAlert(userId: string, alert: Partial<PerformanceAlert>) {
  const supabase = createClient()
  return await supabase.from('performance_alerts').insert({ user_id: userId, ...alert }).select().single()
}

export async function updatePerformanceAlert(alertId: string, updates: Partial<PerformanceAlert>) {
  const supabase = createClient()
  return await supabase.from('performance_alerts').update(updates).eq('id', alertId).select().single()
}

export async function markAlertAsRead(alertId: string) {
  const supabase = createClient()
  return await supabase.from('performance_alerts').update({ is_read: true }).eq('id', alertId).select().single()
}

export async function resolveAlert(alertId: string) {
  const supabase = createClient()
  return await supabase.from('performance_alerts').update({ is_resolved: true }).eq('id', alertId).select().single()
}

export async function deletePerformanceAlert(alertId: string) {
  const supabase = createClient()
  return await supabase.from('performance_alerts').delete().eq('id', alertId)
}

// PERFORMANCE BENCHMARKS
export async function getPerformanceBenchmarks(userId: string, filters?: { category?: MetricCategory; is_active?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('performance_benchmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  return await query
}

export async function createPerformanceBenchmark(userId: string, benchmark: Partial<PerformanceBenchmark>) {
  const supabase = createClient()
  return await supabase.from('performance_benchmarks').insert({ user_id: userId, ...benchmark }).select().single()
}

export async function updatePerformanceBenchmark(benchmarkId: string, updates: Partial<PerformanceBenchmark>) {
  const supabase = createClient()
  return await supabase.from('performance_benchmarks').update(updates).eq('id', benchmarkId).select().single()
}

export async function deletePerformanceBenchmark(benchmarkId: string) {
  const supabase = createClient()
  return await supabase.from('performance_benchmarks').delete().eq('id', benchmarkId)
}

// PERFORMANCE GOALS
export async function getPerformanceGoals(userId: string, filters?: { category?: MetricCategory; is_achieved?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('performance_goals').select('*').eq('user_id', userId).order('target_date')
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.is_achieved !== undefined) query = query.eq('is_achieved', filters.is_achieved)
  return await query
}

export async function createPerformanceGoal(userId: string, goal: Partial<PerformanceGoal>) {
  const supabase = createClient()
  return await supabase.from('performance_goals').insert({ user_id: userId, ...goal }).select().single()
}

export async function updatePerformanceGoal(goalId: string, updates: Partial<PerformanceGoal>) {
  const supabase = createClient()
  return await supabase.from('performance_goals').update(updates).eq('id', goalId).select().single()
}

export async function updateGoalProgress(goalId: string, currentValue: number) {
  const supabase = createClient()
  return await supabase.from('performance_goals').update({ current_value: currentValue }).eq('id', goalId).select().single()
}

export async function deletePerformanceGoal(goalId: string) {
  const supabase = createClient()
  return await supabase.from('performance_goals').delete().eq('id', goalId)
}

// STATS
export async function getPerformanceAnalyticsStats(userId: string, period: PerformancePeriod = 'monthly') {
  const supabase = createClient()
  const [metricsResult, alertsResult, goalsResult, benchmarksResult] = await Promise.all([
    supabase.from('performance_metrics').select('revenue, profit, efficiency_score, completion_rate').eq('user_id', userId).eq('period', period).order('metric_date', { ascending: false }).limit(1).single(),
    supabase.from('performance_alerts').select('id, is_read, is_resolved, severity').eq('user_id', userId),
    supabase.from('performance_goals').select('id, is_achieved, progress').eq('user_id', userId),
    supabase.from('performance_benchmarks').select('id, benchmark_level').eq('user_id', userId).eq('is_active', true)
  ])

  const unreadAlerts = alertsResult.data?.filter(a => !a.is_read).length || 0
  const unresolvedAlerts = alertsResult.data?.filter(a => !a.is_resolved).length || 0
  const criticalAlerts = alertsResult.data?.filter(a => a.severity === 'critical' && !a.is_resolved).length || 0
  const achievedGoals = goalsResult.data?.filter(g => g.is_achieved).length || 0
  const avgGoalProgress = goalsResult.data?.reduce((sum, g) => sum + (g.progress || 0), 0) / (goalsResult.data?.length || 1) || 0
  const excellentBenchmarks = benchmarksResult.data?.filter(b => b.benchmark_level === 'excellent' || b.benchmark_level === 'outstanding').length || 0

  return {
    data: {
      current_revenue: metricsResult.data?.revenue || 0,
      current_profit: metricsResult.data?.profit || 0,
      efficiency_score: metricsResult.data?.efficiency_score || 0,
      completion_rate: metricsResult.data?.completion_rate || 0,
      total_alerts: alertsResult.count || 0,
      unread_alerts: unreadAlerts,
      unresolved_alerts: unresolvedAlerts,
      critical_alerts: criticalAlerts,
      total_goals: goalsResult.count || 0,
      achieved_goals: achievedGoals,
      average_goal_progress: avgGoalProgress,
      total_benchmarks: benchmarksResult.count || 0,
      excellent_benchmarks: excellentBenchmarks
    },
    error: metricsResult.error || alertsResult.error || goalsResult.error || benchmarksResult.error
  }
}

// TREND ANALYSIS
export async function getRevenueProgress(userId: string, period: PerformancePeriod = 'monthly', limit: number = 6) {
  const supabase = createClient()
  return await supabase.from('performance_metrics')
    .select('metric_date, revenue, revenue_change, trend')
    .eq('user_id', userId)
    .eq('period', period)
    .order('metric_date', { ascending: false })
    .limit(limit)
}

export async function getEfficiencyTrend(userId: string, period: PerformancePeriod = 'monthly', limit: number = 6) {
  const supabase = createClient()
  return await supabase.from('performance_metrics')
    .select('metric_date, efficiency_score, utilization_rate, hours_billable, hours_logged')
    .eq('user_id', userId)
    .eq('period', period)
    .order('metric_date', { ascending: false })
    .limit(limit)
}

export async function getClientMetrics(userId: string, period: PerformancePeriod = 'monthly', limit: number = 6) {
  const supabase = createClient()
  return await supabase.from('performance_metrics')
    .select('metric_date, clients_total, clients_active, clients_new, client_retention, client_satisfaction')
    .eq('user_id', userId)
    .eq('period', period)
    .order('metric_date', { ascending: false })
    .limit(limit)
}
