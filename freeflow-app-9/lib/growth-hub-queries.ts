/**
 * Growth Hub Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type UserType = 'freelancer' | 'entrepreneur' | 'startup' | 'enterprise' | 'creative'
export type GrowthGoalType = 'monetize' | 'acquire' | 'scale' | 'optimize'
export type StrategyStatus = 'draft' | 'active' | 'completed' | 'paused' | 'archived'
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low'
export type TimeframeType = '3-months' | '6-months' | '12-months' | '24-months'
export type MetricType = 'revenue' | 'clients' | 'efficiency' | 'profit' | 'growth-rate'
export type ActionCategory = 'pricing' | 'marketing' | 'operations' | 'sales' | 'product' | 'team'
export type ProbabilityType = 'low' | 'medium' | 'high' | 'very-high'

export interface GrowthStrategy {
  id: string
  user_id: string
  name: string
  user_type: UserType
  goal_type: GrowthGoalType
  status: StrategyStatus
  current_revenue: number
  target_revenue: number
  timeline: number
  challenges: string[]
  revenue_increase: number
  probability: ProbabilityType
  roi: number
  confidence_score: number
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface QuickWin {
  id: string
  strategy_id: string
  action: string
  category: ActionCategory
  estimated_revenue: number
  time_to_implement: number
  difficulty: PriorityLevel
  completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface MonthlyPlan {
  id: string
  strategy_id: string
  month: number
  revenue: number
  revenue_target: number
  actions: string[]
  completed: boolean
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  monthly_plan_id: string
  title: string
  description?: string
  target_date: string
  completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface KPI {
  id: string
  monthly_plan_id: string
  name: string
  metric: MetricType
  current_value: number
  target_value: number
  unit: string
  created_at: string
  updated_at: string
}

export interface PriorityAction {
  id: string
  strategy_id: string
  title: string
  description?: string
  category: ActionCategory
  priority: PriorityLevel
  estimated_impact: number
  timeframe: TimeframeType
  resources: string[]
  dependencies: string[]
  completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface GrowthMetric {
  id: string
  user_id: string
  strategy_id: string
  month: number
  metric_date: string
  revenue: number
  clients: number
  average_project_value: number
  efficiency_score: number
  profit_margin: number
  growth_rate: number
  client_acquisition_cost: number
  lifetime_value: number
  created_at: string
  updated_at: string
}

export interface GrowthTemplate {
  id: string
  name: string
  user_type: UserType
  goal_type: GrowthGoalType
  description?: string
  timeline: number
  quick_wins: string[]
  milestones: string[]
  estimated_impact: number
  usage_count: number
  created_at: string
  updated_at: string
}

export interface UserTypeProfile {
  id: string
  type: UserType
  display_name: string
  icon: string
  color: string
  quick_wins: string[]
  challenges: string[]
  recommended_strategies: GrowthGoalType[]
  average_revenue: number
  growth_potential: number
  created_at: string
  updated_at: string
}

// GROWTH STRATEGIES
export async function getGrowthStrategies(userId: string, filters?: { status?: StrategyStatus; user_type?: UserType }) {
  const supabase = createClient()
  let query = supabase.from('growth_strategies').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.user_type) query = query.eq('user_type', filters.user_type)
  return await query
}

export async function getGrowthStrategy(strategyId: string) {
  const supabase = createClient()
  return await supabase.from('growth_strategies').select('*').eq('id', strategyId).single()
}

export async function createGrowthStrategy(userId: string, strategy: Partial<GrowthStrategy>) {
  const supabase = createClient()
  return await supabase.from('growth_strategies').insert({ user_id: userId, ...strategy }).select().single()
}

export async function updateGrowthStrategy(strategyId: string, updates: Partial<GrowthStrategy>) {
  const supabase = createClient()
  return await supabase.from('growth_strategies').update(updates).eq('id', strategyId).select().single()
}

export async function completeStrategy(strategyId: string) {
  const supabase = createClient()
  return await supabase.from('growth_strategies').update({ status: 'completed' }).eq('id', strategyId).select().single()
}

export async function deleteGrowthStrategy(strategyId: string) {
  const supabase = createClient()
  return await supabase.from('growth_strategies').delete().eq('id', strategyId)
}

// QUICK WINS
export async function getQuickWins(strategyId: string, filters?: { completed?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('quick_wins').select('*').eq('strategy_id', strategyId).order('estimated_revenue', { ascending: false })
  if (filters?.completed !== undefined) query = query.eq('completed', filters.completed)
  return await query
}

export async function createQuickWin(strategyId: string, quickWin: Partial<QuickWin>) {
  const supabase = createClient()
  return await supabase.from('quick_wins').insert({ strategy_id: strategyId, ...quickWin }).select().single()
}

export async function updateQuickWin(quickWinId: string, updates: Partial<QuickWin>) {
  const supabase = createClient()
  return await supabase.from('quick_wins').update(updates).eq('id', quickWinId).select().single()
}

export async function completeQuickWin(quickWinId: string) {
  const supabase = createClient()
  return await supabase.from('quick_wins').update({ completed: true }).eq('id', quickWinId).select().single()
}

export async function deleteQuickWin(quickWinId: string) {
  const supabase = createClient()
  return await supabase.from('quick_wins').delete().eq('id', quickWinId)
}

// MONTHLY PLANS
export async function getMonthlyPlans(strategyId: string) {
  const supabase = createClient()
  return await supabase.from('monthly_plans').select('*').eq('strategy_id', strategyId).order('month')
}

export async function getMonthlyPlan(planId: string) {
  const supabase = createClient()
  return await supabase.from('monthly_plans').select('*').eq('id', planId).single()
}

export async function createMonthlyPlan(strategyId: string, plan: Partial<MonthlyPlan>) {
  const supabase = createClient()
  return await supabase.from('monthly_plans').insert({ strategy_id: strategyId, ...plan }).select().single()
}

export async function updateMonthlyPlan(planId: string, updates: Partial<MonthlyPlan>) {
  const supabase = createClient()
  return await supabase.from('monthly_plans').update(updates).eq('id', planId).select().single()
}

export async function deleteMonthlyPlan(planId: string) {
  const supabase = createClient()
  return await supabase.from('monthly_plans').delete().eq('id', planId)
}

// MILESTONES
export async function getMilestones(planId: string, filters?: { completed?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('milestones').select('*').eq('monthly_plan_id', planId).order('target_date')
  if (filters?.completed !== undefined) query = query.eq('completed', filters.completed)
  return await query
}

export async function createMilestone(planId: string, milestone: Partial<Milestone>) {
  const supabase = createClient()
  return await supabase.from('milestones').insert({ monthly_plan_id: planId, ...milestone }).select().single()
}

export async function updateMilestone(milestoneId: string, updates: Partial<Milestone>) {
  const supabase = createClient()
  return await supabase.from('milestones').update(updates).eq('id', milestoneId).select().single()
}

export async function completeMilestone(milestoneId: string) {
  const supabase = createClient()
  return await supabase.from('milestones').update({ completed: true }).eq('id', milestoneId).select().single()
}

export async function deleteMilestone(milestoneId: string) {
  const supabase = createClient()
  return await supabase.from('milestones').delete().eq('id', milestoneId)
}

// KPIs
export async function getKPIs(planId: string) {
  const supabase = createClient()
  return await supabase.from('kpis').select('*').eq('monthly_plan_id', planId).order('created_at')
}

export async function createKPI(planId: string, kpi: Partial<KPI>) {
  const supabase = createClient()
  return await supabase.from('kpis').insert({ monthly_plan_id: planId, ...kpi }).select().single()
}

export async function updateKPI(kpiId: string, updates: Partial<KPI>) {
  const supabase = createClient()
  return await supabase.from('kpis').update(updates).eq('id', kpiId).select().single()
}

export async function deleteKPI(kpiId: string) {
  const supabase = createClient()
  return await supabase.from('kpis').delete().eq('id', kpiId)
}

// PRIORITY ACTIONS
export async function getPriorityActions(strategyId: string, filters?: { priority?: PriorityLevel; completed?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('priority_actions').select('*').eq('strategy_id', strategyId).order('priority')
  if (filters?.priority) query = query.eq('priority', filters.priority)
  if (filters?.completed !== undefined) query = query.eq('completed', filters.completed)
  return await query
}

export async function createPriorityAction(strategyId: string, action: Partial<PriorityAction>) {
  const supabase = createClient()
  return await supabase.from('priority_actions').insert({ strategy_id: strategyId, ...action }).select().single()
}

export async function updatePriorityAction(actionId: string, updates: Partial<PriorityAction>) {
  const supabase = createClient()
  return await supabase.from('priority_actions').update(updates).eq('id', actionId).select().single()
}

export async function completePriorityAction(actionId: string) {
  const supabase = createClient()
  return await supabase.from('priority_actions').update({ completed: true }).eq('id', actionId).select().single()
}

export async function deletePriorityAction(actionId: string) {
  const supabase = createClient()
  return await supabase.from('priority_actions').delete().eq('id', actionId)
}

// GROWTH METRICS
export async function getGrowthMetrics(userId: string, strategyId?: string) {
  const supabase = createClient()
  let query = supabase.from('growth_metrics').select('*').eq('user_id', userId).order('metric_date', { ascending: false })
  if (strategyId) query = query.eq('strategy_id', strategyId)
  return await query
}

export async function createGrowthMetric(userId: string, strategyId: string, metric: Partial<GrowthMetric>) {
  const supabase = createClient()
  return await supabase.from('growth_metrics').insert({ user_id: userId, strategy_id: strategyId, ...metric }).select().single()
}

export async function updateGrowthMetric(metricId: string, updates: Partial<GrowthMetric>) {
  const supabase = createClient()
  return await supabase.from('growth_metrics').update(updates).eq('id', metricId).select().single()
}

// GROWTH TEMPLATES
export async function getGrowthTemplates(filters?: { user_type?: UserType; goal_type?: GrowthGoalType }) {
  const supabase = createClient()
  let query = supabase.from('growth_templates').select('*').order('usage_count', { ascending: false })
  if (filters?.user_type) query = query.eq('user_type', filters.user_type)
  if (filters?.goal_type) query = query.eq('goal_type', filters.goal_type)
  return await query
}

export async function incrementTemplateUsage(templateId: string) {
  const supabase = createClient()
  const { data: template } = await supabase.from('growth_templates').select('usage_count').eq('id', templateId).single()
  if (!template) return { data: null, error: new Error('Template not found') }
  return await supabase.from('growth_templates').update({ usage_count: template.usage_count + 1 }).eq('id', templateId).select().single()
}

// USER TYPE PROFILES
export async function getUserTypeProfiles() {
  const supabase = createClient()
  return await supabase.from('user_type_profiles').select('*').order('type')
}

export async function getUserTypeProfile(type: UserType) {
  const supabase = createClient()
  return await supabase.from('user_type_profiles').select('*').eq('type', type).single()
}

// STATS
export async function getGrowthHubStats(userId: string) {
  const supabase = createClient()
  const [strategiesResult, quickWinsResult, actionsResult, metricsResult] = await Promise.all([
    supabase.from('growth_strategies').select('id, status, revenue_increase, roi').eq('user_id', userId),
    supabase.from('quick_wins').select('id, completed, estimated_revenue').eq('strategy_id', strategiesResult.data?.[0]?.id || ''),
    supabase.from('priority_actions').select('id, completed, estimated_impact').eq('strategy_id', strategiesResult.data?.[0]?.id || ''),
    supabase.from('growth_metrics').select('revenue, growth_rate').eq('user_id', userId).order('metric_date', { ascending: false }).limit(1).single()
  ])

  const activeStrategies = strategiesResult.data?.filter(s => s.status === 'active').length || 0
  const completedStrategies = strategiesResult.data?.filter(s => s.status === 'completed').length || 0
  const totalQuickWins = quickWinsResult.count || 0
  const completedQuickWins = quickWinsResult.data?.filter(qw => qw.completed).length || 0
  const totalActions = actionsResult.count || 0
  const completedActions = actionsResult.data?.filter(a => a.completed).length || 0
  const avgROI = strategiesResult.data?.reduce((sum, s) => sum + (s.roi || 0), 0) / (strategiesResult.data?.length || 1) || 0

  return {
    data: {
      total_strategies: strategiesResult.count || 0,
      active_strategies: activeStrategies,
      completed_strategies: completedStrategies,
      total_quick_wins: totalQuickWins,
      completed_quick_wins: completedQuickWins,
      total_priority_actions: totalActions,
      completed_priority_actions: completedActions,
      current_revenue: metricsResult.data?.revenue || 0,
      growth_rate: metricsResult.data?.growth_rate || 0,
      average_roi: avgROI
    },
    error: strategiesResult.error || quickWinsResult.error || actionsResult.error || metricsResult.error
  }
}
