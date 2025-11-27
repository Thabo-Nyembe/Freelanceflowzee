/**
 * AI Business Advisor Query Library
 *
 * CRUD operations for AI Business Advisory:
 * - Project Analyses (8 functions)
 * - Business Insights (7 functions)
 * - Pricing Recommendations (6 functions)
 * - Advisory Sessions (8 functions)
 * - Session Messages (4 functions)
 * - Growth Forecasts (6 functions)
 * - Analytics (2 functions)
 *
 * Total: 41 functions
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type InsightCategory = 'profitability' | 'risk' | 'opportunity' | 'warning' | 'optimization' | 'growth'
export type ImpactLevel = 'high' | 'medium' | 'low'
export type PricingTier = 'basic' | 'standard' | 'premium' | 'enterprise'
export type SessionStatus = 'active' | 'completed' | 'cancelled'
export type ForecastPeriod = 'monthly' | 'quarterly' | 'yearly'

export interface ProjectAnalysis {
  id: string
  user_id: string
  project_id: string | null
  project_name: string
  budget: number
  timeline: number
  client_type: string
  scope: string | null
  profitability_score: number
  risk_score: number
  estimated_profit: number
  estimated_margin: number
  recommendations: string[]
  created_at: string
  updated_at: string
}

export interface BusinessInsight {
  id: string
  analysis_id: string
  category: InsightCategory
  title: string
  description: string
  impact: ImpactLevel
  is_actionable: boolean
  recommendation: string | null
  is_implemented: boolean
  implemented_at: string | null
  created_at: string
  updated_at: string
}

export interface PricingRecommendation {
  id: string
  user_id: string
  tier: PricingTier
  price: number
  description: string
  reasoning: string
  target_client: string
  market_analysis: string
  competitive_position: string | null
  rate_increase_strategy: string | null
  skills: string[]
  experience_years: number | null
  market: string | null
  created_at: string
  updated_at: string
}

export interface AdvisorySession {
  id: string
  user_id: string
  title: string
  topic: string
  status: SessionStatus
  message_count: number
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface SessionMessage {
  id: string
  session_id: string
  role: string
  content: string
  created_at: string
}

export interface GrowthForecast {
  id: string
  user_id: string
  period: ForecastPeriod
  year: number
  quarter: number | null
  month: number | null
  revenue_forecast: number
  project_count_forecast: number
  growth_rate: number
  confidence_score: number
  assumptions: string[]
  milestones: string[]
  created_at: string
  updated_at: string
}

export interface AdvisoryAnalytics {
  id: string
  user_id: string
  date: string
  total_analyses: number
  total_insights: number
  avg_profitability_score: number
  avg_risk_score: number
  total_revenue_analyzed: number
  sessions_count: number
  created_at: string
  updated_at: string
}

// ============================================================================
// PROJECT ANALYSES (8 functions)
// ============================================================================

export async function getProjectAnalyses(
  userId: string,
  filters?: {
    project_id?: string
    min_profitability?: number
    max_risk?: number
  }
): Promise<{ data: ProjectAnalysis[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('project_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.project_id) {
    query = query.eq('project_id', filters.project_id)
  }
  if (filters?.min_profitability) {
    query = query.gte('profitability_score', filters.min_profitability)
  }
  if (filters?.max_risk) {
    query = query.lte('risk_score', filters.max_risk)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getProjectAnalysis(
  analysisId: string
): Promise<{ data: ProjectAnalysis | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_analyses')
    .select('*')
    .eq('id', analysisId)
    .single()

  return { data, error }
}

export async function createProjectAnalysis(
  userId: string,
  analysis: {
    project_id?: string
    project_name: string
    budget: number
    timeline: number
    client_type: string
    scope?: string
    profitability_score: number
    risk_score: number
    estimated_profit: number
    estimated_margin: number
    recommendations?: string[]
  }
): Promise<{ data: ProjectAnalysis | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_analyses')
    .insert({
      user_id: userId,
      ...analysis
    })
    .select()
    .single()

  return { data, error }
}

export async function updateProjectAnalysis(
  analysisId: string,
  updates: Partial<Omit<ProjectAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ProjectAnalysis | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_analyses')
    .update(updates)
    .eq('id', analysisId)
    .select()
    .single()

  return { data, error }
}

export async function deleteProjectAnalysis(
  analysisId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('project_analyses')
    .delete()
    .eq('id', analysisId)

  return { error }
}

export async function getTopProfitableProjects(
  userId: string,
  limit: number = 10
): Promise<{ data: ProjectAnalysis[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('profitability_score', { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function getHighRiskProjects(
  userId: string,
  riskThreshold: number = 70,
  limit: number = 10
): Promise<{ data: ProjectAnalysis[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_analyses')
    .select('*')
    .eq('user_id', userId)
    .gte('risk_score', riskThreshold)
    .order('risk_score', { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function bulkDeleteAnalyses(
  analysisIds: string[]
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('project_analyses')
    .delete()
    .in('id', analysisIds)

  return { error }
}

// ============================================================================
// BUSINESS INSIGHTS (7 functions)
// ============================================================================

export async function getBusinessInsights(
  analysisId: string,
  filters?: {
    category?: InsightCategory
    impact?: ImpactLevel
    is_actionable?: boolean
    is_implemented?: boolean
  }
): Promise<{ data: BusinessInsight[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('business_insights')
    .select('*')
    .eq('analysis_id', analysisId)
    .order('impact', { ascending: true })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.impact) {
    query = query.eq('impact', filters.impact)
  }
  if (filters?.is_actionable !== undefined) {
    query = query.eq('is_actionable', filters.is_actionable)
  }
  if (filters?.is_implemented !== undefined) {
    query = query.eq('is_implemented', filters.is_implemented)
  }

  const { data, error } = await query
  return { data, error }
}

export async function createBusinessInsight(
  insight: {
    analysis_id: string
    category: InsightCategory
    title: string
    description: string
    impact: ImpactLevel
    is_actionable?: boolean
    recommendation?: string
  }
): Promise<{ data: BusinessInsight | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('business_insights')
    .insert(insight)
    .select()
    .single()

  return { data, error }
}

export async function updateBusinessInsight(
  insightId: string,
  updates: Partial<Omit<BusinessInsight, 'id' | 'analysis_id' | 'created_at' | 'updated_at' | 'implemented_at'>>
): Promise<{ data: BusinessInsight | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('business_insights')
    .update(updates)
    .eq('id', insightId)
    .select()
    .single()

  return { data, error }
}

export async function markInsightImplemented(
  insightId: string
): Promise<{ data: BusinessInsight | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('business_insights')
    .update({ is_implemented: true })
    .eq('id', insightId)
    .select()
    .single()

  return { data, error }
}

export async function getActionableInsights(
  analysisId: string
): Promise<{ data: BusinessInsight[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('business_insights')
    .select('*')
    .eq('analysis_id', analysisId)
    .eq('is_actionable', true)
    .eq('is_implemented', false)
    .order('impact', { ascending: true })

  return { data, error }
}

export async function bulkCreateInsights(
  insights: {
    analysis_id: string
    category: InsightCategory
    title: string
    description: string
    impact: ImpactLevel
    is_actionable?: boolean
    recommendation?: string
  }[]
): Promise<{ data: BusinessInsight[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('business_insights')
    .insert(insights)
    .select()

  return { data, error }
}

export async function deleteBusinessInsight(
  insightId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('business_insights')
    .delete()
    .eq('id', insightId)

  return { error }
}

// ============================================================================
// PRICING RECOMMENDATIONS (6 functions)
// ============================================================================

export async function getPricingRecommendations(
  userId: string
): Promise<{ data: PricingRecommendation[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pricing_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function createPricingRecommendation(
  userId: string,
  recommendation: {
    tier: PricingTier
    price: number
    description: string
    reasoning: string
    target_client: string
    market_analysis: string
    competitive_position?: string
    rate_increase_strategy?: string
    skills?: string[]
    experience_years?: number
    market?: string
  }
): Promise<{ data: PricingRecommendation | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pricing_recommendations')
    .insert({
      user_id: userId,
      ...recommendation
    })
    .select()
    .single()

  return { data, error }
}

export async function updatePricingRecommendation(
  recommendationId: string,
  updates: Partial<Omit<PricingRecommendation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: PricingRecommendation | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pricing_recommendations')
    .update(updates)
    .eq('id', recommendationId)
    .select()
    .single()

  return { data, error }
}

export async function deletePricingRecommendation(
  recommendationId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('pricing_recommendations')
    .delete()
    .eq('id', recommendationId)

  return { error }
}

export async function getLatestPricingRecommendation(
  userId: string
): Promise<{ data: PricingRecommendation | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pricing_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return { data, error }
}

export async function bulkCreatePricingRecommendations(
  userId: string,
  recommendations: {
    tier: PricingTier
    price: number
    description: string
    reasoning: string
    target_client: string
    market_analysis: string
  }[]
): Promise<{ data: PricingRecommendation[] | null; error: any }> {
  const supabase = createClient()
  const withUserId = recommendations.map(r => ({ user_id: userId, ...r }))
  const { data, error } = await supabase
    .from('pricing_recommendations')
    .insert(withUserId)
    .select()

  return { data, error }
}

// ============================================================================
// ADVISORY SESSIONS (8 functions)
// ============================================================================

export async function getAdvisorySessions(
  userId: string,
  filters?: {
    status?: SessionStatus
  }
): Promise<{ data: AdvisorySession[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('advisory_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getAdvisorySession(
  sessionId: string
): Promise<{ data: AdvisorySession | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('advisory_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  return { data, error }
}

export async function createAdvisorySession(
  userId: string,
  session: {
    title: string
    topic: string
  }
): Promise<{ data: AdvisorySession | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('advisory_sessions')
    .insert({
      user_id: userId,
      ...session
    })
    .select()
    .single()

  return { data, error }
}

export async function updateAdvisorySession(
  sessionId: string,
  updates: Partial<Omit<AdvisorySession, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>>
): Promise<{ data: AdvisorySession | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('advisory_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  return { data, error }
}

export async function completeAdvisorySession(
  sessionId: string
): Promise<{ data: AdvisorySession | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('advisory_sessions')
    .update({ status: 'completed' })
    .eq('id', sessionId)
    .select()
    .single()

  return { data, error }
}

export async function deleteAdvisorySession(
  sessionId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('advisory_sessions')
    .delete()
    .eq('id', sessionId)

  return { error }
}

export async function getActiveSessions(
  userId: string
): Promise<{ data: AdvisorySession[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('advisory_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function bulkDeleteSessions(
  sessionIds: string[]
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('advisory_sessions')
    .delete()
    .in('id', sessionIds)

  return { error }
}

// ============================================================================
// SESSION MESSAGES (4 functions)
// ============================================================================

export async function getSessionMessages(
  sessionId: string
): Promise<{ data: SessionMessage[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('session_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  return { data, error }
}

export async function createSessionMessage(
  message: {
    session_id: string
    role: string
    content: string
  }
): Promise<{ data: SessionMessage | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('session_messages')
    .insert(message)
    .select()
    .single()

  return { data, error }
}

export async function bulkCreateSessionMessages(
  messages: {
    session_id: string
    role: string
    content: string
  }[]
): Promise<{ data: SessionMessage[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('session_messages')
    .insert(messages)
    .select()

  return { data, error }
}

export async function deleteSessionMessage(
  messageId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('session_messages')
    .delete()
    .eq('id', messageId)

  return { error }
}

// ============================================================================
// GROWTH FORECASTS (6 functions)
// ============================================================================

export async function getGrowthForecasts(
  userId: string,
  filters?: {
    period?: ForecastPeriod
    year?: number
  }
): Promise<{ data: GrowthForecast[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('growth_forecasts')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })

  if (filters?.period) {
    query = query.eq('period', filters.period)
  }
  if (filters?.year) {
    query = query.eq('year', filters.year)
  }

  const { data, error } = await query
  return { data, error }
}

export async function createGrowthForecast(
  userId: string,
  forecast: {
    period: ForecastPeriod
    year: number
    quarter?: number
    month?: number
    revenue_forecast: number
    project_count_forecast: number
    growth_rate: number
    confidence_score: number
    assumptions?: string[]
    milestones?: string[]
  }
): Promise<{ data: GrowthForecast | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('growth_forecasts')
    .insert({
      user_id: userId,
      ...forecast
    })
    .select()
    .single()

  return { data, error }
}

export async function updateGrowthForecast(
  forecastId: string,
  updates: Partial<Omit<GrowthForecast, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: GrowthForecast | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('growth_forecasts')
    .update(updates)
    .eq('id', forecastId)
    .select()
    .single()

  return { data, error }
}

export async function deleteGrowthForecast(
  forecastId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('growth_forecasts')
    .delete()
    .eq('id', forecastId)

  return { error }
}

export async function getLatestForecasts(
  userId: string,
  limit: number = 5
): Promise<{ data: GrowthForecast[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('growth_forecasts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function bulkCreateForecasts(
  userId: string,
  forecasts: {
    period: ForecastPeriod
    year: number
    quarter?: number
    month?: number
    revenue_forecast: number
    project_count_forecast: number
    growth_rate: number
    confidence_score: number
    assumptions?: string[]
    milestones?: string[]
  }[]
): Promise<{ data: GrowthForecast[] | null; error: any }> {
  const supabase = createClient()
  const withUserId = forecasts.map(f => ({ user_id: userId, ...f }))
  const { data, error } = await supabase
    .from('growth_forecasts')
    .insert(withUserId)
    .select()

  return { data, error }
}

// ============================================================================
// ANALYTICS (2 functions)
// ============================================================================

export async function getAdvisoryAnalytics(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: AdvisoryAnalytics[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('advisory_analytics')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getUserBusinessStats(
  userId: string
): Promise<{ data: any; error: any }> {
  const supabase = createClient()

  // Get all analyses
  const { data: analyses, error: analysesError } = await supabase
    .from('project_analyses')
    .select('*')
    .eq('user_id', userId)

  if (analysesError) {
    return { data: null, error: analysesError }
  }

  // Get all sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('advisory_sessions')
    .select('*')
    .eq('user_id', userId)

  if (sessionsError) {
    return { data: null, error: sessionsError }
  }

  const stats = {
    total_analyses: analyses?.length || 0,
    avg_profitability_score: analyses?.length
      ? analyses.reduce((sum, a) => sum + a.profitability_score, 0) / analyses.length
      : 0,
    avg_risk_score: analyses?.length
      ? analyses.reduce((sum, a) => sum + a.risk_score, 0) / analyses.length
      : 0,
    total_revenue_analyzed: analyses?.reduce((sum, a) => sum + a.budget, 0) || 0,
    total_estimated_profit: analyses?.reduce((sum, a) => sum + a.estimated_profit, 0) || 0,
    total_sessions: sessions?.length || 0,
    active_sessions: sessions?.filter(s => s.status === 'active').length || 0,
    completed_sessions: sessions?.filter(s => s.status === 'completed').length || 0
  }

  return { data: stats, error: null }
}
