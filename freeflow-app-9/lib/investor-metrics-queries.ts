/**
 * Investor Metrics Query Library
 */

import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

export type MarketPosition = 'leader' | 'challenger' | 'niche' | 'emerging'
export type TrendDirection = 'up' | 'down' | 'stable'
export type MetricPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface InvestorMetric {
  id: string
  user_id: string
  metric_date: string
  period: MetricPeriod

  // User Metrics
  total_users: number
  active_users_daily: number
  active_users_weekly: number
  active_users_monthly: number
  user_growth_rate: number
  new_users_today: number
  new_users_this_week: number
  new_users_this_month: number
  churned_users: number
  churn_rate: number

  // Engagement Metrics
  avg_session_duration: number
  avg_sessions_per_user: number
  avg_actions_per_session: number
  power_user_count: number
  active_projects_per_user: number

  // Revenue Metrics
  mrr: number
  arr: number
  revenue_growth: number
  avg_project_value: number
  payment_velocity: number
  total_gmv: number
  platform_revenue: number
  revenue_per_user: number
  net_revenue_retention: number
  gross_revenue_retention: number

  // Retention Metrics
  ltv: number
  cac: number
  ltv_cac_ratio: number
  payback_period: number

  // AI Metrics
  ai_engagement_rate: number
  total_ai_interactions: number
  ai_interactions_per_user: number
  avg_tokens_per_interaction: number
  total_ai_cost: number
  ai_cost_per_user: number
  ai_value_created: number
  ai_margin_contribution: number

  // Platform Metrics
  uptime: number
  avg_response_time: number
  error_rate: number
  api_calls_per_day: number
  storage_used: number
  bandwidth_used: number
  concurrent_users: number
  peak_concurrent_users: number

  created_at: string
  updated_at: string
}

export interface PlatformHealthSnapshot {
  id: string
  user_id: string
  snapshot_date: string
  health_score: number
  metric_id?: string

  // Market Intelligence
  market_share: number
  total_addressable_market: number
  servicable_addressable_market: number
  servicable_obtainable_market: number

  // Financial Health
  burn_rate: number
  runway_months: number

  // Summary Data
  headline?: string
  highlights: string[]
  concerns: string[]
  next_steps: string[]

  created_at: string
}

export interface CohortRetention {
  id: string
  user_id: string
  cohort_name: string
  cohort_date: string
  cohort_size: number

  week1_retention: number
  month1_retention: number
  month3_retention: number
  month6_retention: number
  year1_retention: number

  created_at: string
  updated_at: string
}

export interface GrowthProjection {
  id: string
  user_id: string
  period: string
  projection_date: string

  projected_users: number
  projected_revenue: number
  confidence_score: number

  assumptions: Record<string, JsonValue>

  created_at: string
  updated_at: string
}

export interface MarketCompetitor {
  id: string
  user_id: string
  competitor_name: string
  user_count: number
  pricing: number
  features: string[]
  market_position: MarketPosition

  last_updated: string
  created_at: string
  updated_at: string
}

export interface BoardDeckReport {
  id: string
  user_id: string
  report_date: string
  health_snapshot_id?: string

  // Summary Section
  headline: string
  key_metrics: JsonValue[]
  highlights: string[]
  concerns: string[]

  // Charts Data
  user_growth_chart: Record<string, JsonValue>
  revenue_chart: Record<string, JsonValue>
  revenue_breakdown: Record<string, JsonValue>

  // Analysis
  user_growth_analysis?: string
  user_growth_prediction?: string
  revenue_analysis?: string
  retention_analysis?: string
  ai_insights: string[]

  // Market Position
  differentiation: string[]
  market_opportunity?: string

  // Financial
  ai_roi: number
  next_steps: string[]

  created_at: string
}

// INVESTOR METRICS
export async function getInvestorMetrics(userId: string, filters?: { period?: MetricPeriod; startDate?: string; endDate?: string }) {
  const supabase = createClient()
  let query = supabase.from('investor_metrics').select('*').eq('user_id', userId).order('metric_date', { ascending: false })
  if (filters?.period) query = query.eq('period', filters.period)
  if (filters?.startDate) query = query.gte('metric_date', filters.startDate)
  if (filters?.endDate) query = query.lte('metric_date', filters.endDate)
  return await query
}

export async function getInvestorMetric(metricId: string) {
  const supabase = createClient()
  return await supabase.from('investor_metrics').select('*').eq('id', metricId).single()
}

export async function getLatestInvestorMetric(userId: string, period: MetricPeriod = 'monthly') {
  const supabase = createClient()
  return await supabase.from('investor_metrics').select('*').eq('user_id', userId).eq('period', period).order('metric_date', { ascending: false }).limit(1).single()
}

export async function createInvestorMetric(userId: string, metric: Partial<InvestorMetric>) {
  const supabase = createClient()
  return await supabase.from('investor_metrics').insert({ user_id: userId, ...metric }).select().single()
}

export async function updateInvestorMetric(metricId: string, updates: Partial<InvestorMetric>) {
  const supabase = createClient()
  return await supabase.from('investor_metrics').update(updates).eq('id', metricId).select().single()
}

export async function deleteInvestorMetric(metricId: string) {
  const supabase = createClient()
  return await supabase.from('investor_metrics').delete().eq('id', metricId)
}

// PLATFORM HEALTH SNAPSHOTS
export async function getHealthSnapshots(userId: string, limit?: number) {
  const supabase = createClient()
  let query = supabase.from('platform_health_snapshots').select('*').eq('user_id', userId).order('snapshot_date', { ascending: false })
  if (limit) query = query.limit(limit)
  return await query
}

export async function getLatestHealthSnapshot(userId: string) {
  const supabase = createClient()
  return await supabase.from('platform_health_snapshots').select('*').eq('user_id', userId).order('snapshot_date', { ascending: false }).limit(1).single()
}

export async function createHealthSnapshot(userId: string, snapshot: Partial<PlatformHealthSnapshot>) {
  const supabase = createClient()
  return await supabase.from('platform_health_snapshots').insert({ user_id: userId, ...snapshot }).select().single()
}

export async function deleteHealthSnapshot(snapshotId: string) {
  const supabase = createClient()
  return await supabase.from('platform_health_snapshots').delete().eq('id', snapshotId)
}

// COHORT RETENTION
export async function getCohortRetention(userId: string, filters?: { cohortName?: string }) {
  const supabase = createClient()
  let query = supabase.from('cohort_retention').select('*').eq('user_id', userId).order('cohort_date', { ascending: false })
  if (filters?.cohortName) query = query.eq('cohort_name', filters.cohortName)
  return await query
}

export async function createCohortRetention(userId: string, cohort: Partial<CohortRetention>) {
  const supabase = createClient()
  return await supabase.from('cohort_retention').insert({ user_id: userId, ...cohort }).select().single()
}

export async function updateCohortRetention(cohortId: string, updates: Partial<CohortRetention>) {
  const supabase = createClient()
  return await supabase.from('cohort_retention').update(updates).eq('id', cohortId).select().single()
}

export async function deleteCohortRetention(cohortId: string) {
  const supabase = createClient()
  return await supabase.from('cohort_retention').delete().eq('id', cohortId)
}

// GROWTH PROJECTIONS
export async function getGrowthProjections(userId: string, limit?: number) {
  const supabase = createClient()
  let query = supabase.from('growth_projections').select('*').eq('user_id', userId).order('projection_date')
  if (limit) query = query.limit(limit)
  return await query
}

export async function createGrowthProjection(userId: string, projection: Partial<GrowthProjection>) {
  const supabase = createClient()
  return await supabase.from('growth_projections').insert({ user_id: userId, ...projection }).select().single()
}

export async function updateGrowthProjection(projectionId: string, updates: Partial<GrowthProjection>) {
  const supabase = createClient()
  return await supabase.from('growth_projections').update(updates).eq('id', projectionId).select().single()
}

export async function deleteGrowthProjection(projectionId: string) {
  const supabase = createClient()
  return await supabase.from('growth_projections').delete().eq('id', projectionId)
}

// MARKET COMPETITORS
export async function getMarketCompetitors(userId: string, filters?: { market_position?: MarketPosition }) {
  const supabase = createClient()
  let query = supabase.from('market_competitors').select('*').eq('user_id', userId).order('user_count', { ascending: false })
  if (filters?.market_position) query = query.eq('market_position', filters.market_position)
  return await query
}

export async function createMarketCompetitor(userId: string, competitor: Partial<MarketCompetitor>) {
  const supabase = createClient()
  return await supabase.from('market_competitors').insert({ user_id: userId, ...competitor }).select().single()
}

export async function updateMarketCompetitor(competitorId: string, updates: Partial<MarketCompetitor>) {
  const supabase = createClient()
  return await supabase.from('market_competitors').update(updates).eq('id', competitorId).select().single()
}

export async function deleteMarketCompetitor(competitorId: string) {
  const supabase = createClient()
  return await supabase.from('market_competitors').delete().eq('id', competitorId)
}

// BOARD DECK REPORTS
export async function getBoardDeckReports(userId: string, limit?: number) {
  const supabase = createClient()
  let query = supabase.from('board_deck_reports').select('*').eq('user_id', userId).order('report_date', { ascending: false })
  if (limit) query = query.limit(limit)
  return await query
}

export async function getBoardDeckReport(reportId: string) {
  const supabase = createClient()
  return await supabase.from('board_deck_reports').select('*').eq('id', reportId).single()
}

export async function getLatestBoardDeck(userId: string) {
  const supabase = createClient()
  return await supabase.from('board_deck_reports').select('*').eq('user_id', userId).order('report_date', { ascending: false }).limit(1).single()
}

export async function createBoardDeckReport(userId: string, report: Partial<BoardDeckReport>) {
  const supabase = createClient()
  return await supabase.from('board_deck_reports').insert({ user_id: userId, ...report }).select().single()
}

export async function updateBoardDeckReport(reportId: string, updates: Partial<BoardDeckReport>) {
  const supabase = createClient()
  return await supabase.from('board_deck_reports').update(updates).eq('id', reportId).select().single()
}

export async function deleteBoardDeckReport(reportId: string) {
  const supabase = createClient()
  return await supabase.from('board_deck_reports').delete().eq('id', reportId)
}

// STATS & ANALYTICS
export async function getInvestorMetricsStats(userId: string, period: MetricPeriod = 'monthly') {
  const supabase = createClient()
  const [metricsResult, healthResult, cohortsResult, projectionsResult, competitorsResult] = await Promise.all([
    supabase.from('investor_metrics').select('*').eq('user_id', userId).eq('period', period).order('metric_date', { ascending: false }).limit(1).single(),
    supabase.from('platform_health_snapshots').select('health_score, runway_months').eq('user_id', userId).order('snapshot_date', { ascending: false }).limit(1).single(),
    supabase.from('cohort_retention').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('growth_projections').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('market_competitors').select('id', { count: 'exact' }).eq('user_id', userId)
  ])

  const metrics = metricsResult.data
  const health = healthResult.data

  return {
    data: {
      // User Metrics
      total_users: metrics?.total_users || 0,
      active_users_monthly: metrics?.active_users_monthly || 0,
      user_growth_rate: metrics?.user_growth_rate || 0,
      churn_rate: metrics?.churn_rate || 0,

      // Revenue Metrics
      mrr: metrics?.mrr || 0,
      arr: metrics?.arr || 0,
      revenue_growth: metrics?.revenue_growth || 0,
      revenue_per_user: metrics?.revenue_per_user || 0,

      // Retention Metrics
      ltv: metrics?.ltv || 0,
      cac: metrics?.cac || 0,
      ltv_cac_ratio: metrics?.ltv_cac_ratio || 0,
      payback_period: metrics?.payback_period || 0,

      // AI Metrics
      ai_engagement_rate: metrics?.ai_engagement_rate || 0,
      total_ai_interactions: metrics?.total_ai_interactions || 0,
      ai_cost_per_user: metrics?.ai_cost_per_user || 0,
      ai_value_created: metrics?.ai_value_created || 0,

      // Platform Metrics
      uptime: metrics?.uptime || 99.9,
      error_rate: metrics?.error_rate || 0,
      concurrent_users: metrics?.concurrent_users || 0,

      // Health
      health_score: health?.health_score || 0,
      runway_months: health?.runway_months || 0,

      // Counts
      total_cohorts: cohortsResult.count || 0,
      total_projections: projectionsResult.count || 0,
      total_competitors: competitorsResult.count || 0
    },
    error: metricsResult.error || healthResult.error || cohortsResult.error || projectionsResult.error || competitorsResult.error
  }
}

export async function getMetricsTrend(userId: string, period: MetricPeriod = 'monthly', limit: number = 6) {
  const supabase = createClient()
  return await supabase.from('investor_metrics')
    .select('metric_date, total_users, mrr, arr, user_growth_rate, revenue_growth, churn_rate, ltv_cac_ratio')
    .eq('user_id', userId)
    .eq('period', period)
    .order('metric_date', { ascending: false })
    .limit(limit)
}

export async function getRevenueMetrics(userId: string, period: MetricPeriod = 'monthly', limit: number = 6) {
  const supabase = createClient()
  return await supabase.from('investor_metrics')
    .select('metric_date, mrr, arr, total_gmv, platform_revenue, revenue_per_user, net_revenue_retention, gross_revenue_retention')
    .eq('user_id', userId)
    .eq('period', period)
    .order('metric_date', { ascending: false })
    .limit(limit)
}

export async function getAIMetrics(userId: string, period: MetricPeriod = 'monthly', limit: number = 6) {
  const supabase = createClient()
  return await supabase.from('investor_metrics')
    .select('metric_date, ai_engagement_rate, total_ai_interactions, ai_cost_per_user, ai_value_created, ai_margin_contribution')
    .eq('user_id', userId)
    .eq('period', period)
    .order('metric_date', { ascending: false })
    .limit(limit)
}
