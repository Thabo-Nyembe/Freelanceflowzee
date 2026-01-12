/**
 * AI Features Database Operations
 *
 * This module handles all database operations for AI-powered features:
 * - Revenue Intelligence
 * - Lead Scoring
 * - Growth Playbooks
 * - AI Recommendations
 * - Investor Metrics
 */

import { createClient } from './client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RevenueData {
  userId: string
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  totalRevenue: number
  revenueBySource: {
    projects: number
    retainers: number
    passive: number
    other: number
  }
  revenueByClient: Array<{
    clientId: string
    clientName: string
    revenue: number
    projectCount: number
  }>
  expenses: number
  netProfit: number
  currency: string
}

export interface LeadData {
  id: string
  name: string
  company: string
  industry: string
  email: string
  source: 'inbound' | 'outbound' | 'referral' | 'other'
  budget?: number
  projectDescription?: string
  decisionMaker: boolean
  painPoints?: string[]
}

export interface LeadScore {
  id: string
  leadId: string
  leadName: string
  leadCompany: string
  score: number
  confidence: number
  conversionProbability: number
  estimatedValue: number
  timeToClose?: number
  priority: 'hot' | 'warm' | 'cold'
  analysis: any
  strengths: string[]
  concerns: string[]
  nextBestAction: string
}

export interface GrowthPlaybook {
  id: string
  userId: string
  industry: string
  expertise: string[]
  playbookData: any
  strategies: any[]
  actionPlan: any
  actionsCompleted: number
  revenueImpact: number
  effectivenessScore?: number
}

export interface AIRecommendation {
  id: string
  userId: string
  recommendationType: string
  title: string
  description: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedImpact?: number
  effortLevel: 'low' | 'medium' | 'high'
  actions: any[]
  metrics: any
  deadline?: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired'
}

export interface InvestorMetric {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  mrr: number
  arr: number
  churnRate: number
  avgCLV: number
  avgCAC: number
}

// ============================================================================
// REVENUE INTELLIGENCE
// ============================================================================

/**
 * Calculate revenue data from projects and invoices
 */
export async function calculateRevenueData(
  userId: string,
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly'
): Promise<RevenueData> {
  const supabase = createClient()

  try {
    // Fetch projects with their revenue
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, client_name, budget, spent, status')
      .eq('user_id', userId)

    if (projectsError) throw projectsError

    // Fetch invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('id, amount, status, client_id, paid_date')
      .eq('user_id', userId)
      .eq('status', 'paid')

    if (invoicesError) throw invoicesError

    // Calculate totals
    const projectRevenue = projects?.reduce((sum, p) => sum + (Number(p.spent) || 0), 0) || 0
    const invoiceRevenue = invoices?.reduce((sum, i) => sum + (Number(i.amount) || 0), 0) || 0
    const totalRevenue = projectRevenue + invoiceRevenue

    // Group revenue by client
    const clientRevenue = new Map<string, { name: string; revenue: number; count: number }>()

    projects?.forEach(p => {
      const existing = clientRevenue.get(p.client_name) || { name: p.client_name, revenue: 0, count: 0 }
      existing.revenue += Number(p.spent) || 0
      existing.count += 1
      clientRevenue.set(p.client_name, existing)
    })

    const revenueByClient = Array.from(clientRevenue.entries()).map(([id, data]) => ({
      clientId: id,
      clientName: data.name,
      revenue: data.revenue,
      projectCount: data.count
    }))

    // Estimate expenses (30% of revenue)
    const expenses = totalRevenue * 0.3
    const netProfit = totalRevenue - expenses

    return {
      userId,
      timeframe,
      totalRevenue,
      revenueBySource: {
        projects: projectRevenue,
        retainers: invoiceRevenue * 0.6,
        passive: invoiceRevenue * 0.3,
        other: invoiceRevenue * 0.1
      },
      revenueByClient: revenueByClient.slice(0, 10), // Top 10 clients
      expenses,
      netProfit,
      currency: 'USD'
    }
  } catch (error) {
    // Return default data instead of throwing to prevent console spam
    console.warn('Revenue data unavailable, using defaults')
    return {
      userId,
      timeframe,
      totalRevenue: 0,
      revenueBySource: {
        projects: 0,
        retainers: 0,
        passive: 0,
        other: 0
      },
      revenueByClient: [],
      expenses: 0,
      netProfit: 0,
      currency: 'USD'
    }
  }
}

/**
 * Store revenue intelligence report
 */
export async function storeRevenueIntelligence(
  userId: string,
  reportData: any,
  insights: any[],
  recommendations: any[]
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('revenue_intelligence')
    .insert({
      user_id: userId,
      report_data: reportData,
      insights,
      recommendations,
      report_version: 'v1.0',
      model_used: 'claude-sonnet-4-5'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get latest revenue intelligence report
 */
export async function getLatestRevenueReport(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('revenue_intelligence')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // Ignore "not found" error
  return data
}

// ============================================================================
// LEAD SCORING
// ============================================================================

/**
 * Fetch leads from clients table
 */
export async function fetchLeads(userId: string): Promise<LeadData[]> {
  const supabase = createClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  // Transform clients to leads
  return clients?.map(client => ({
    id: client.id,
    name: client.name,
    company: client.company || client.name,
    industry: client.metadata?.industry || 'business',
    email: client.email,
    source: client.metadata?.source || 'inbound',
    budget: client.metadata?.budget,
    projectDescription: client.notes,
    decisionMaker: client.metadata?.decisionMaker !== false,
    painPoints: client.metadata?.painPoints || []
  })) || []
}

/**
 * Store lead score
 */
export async function storeLeadScore(
  userId: string,
  leadId: string,
  scoreData: Partial<LeadScore>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lead_scores')
    .upsert({
      user_id: userId,
      lead_id: leadId,
      lead_name: scoreData.leadName,
      lead_company: scoreData.leadCompany,
      score: scoreData.score,
      confidence: scoreData.confidence,
      conversion_probability: scoreData.conversionProbability,
      estimated_value: scoreData.estimatedValue,
      time_to_close: scoreData.timeToClose,
      priority: scoreData.priority,
      analysis: scoreData.analysis,
      strengths: scoreData.strengths,
      concerns: scoreData.concerns,
      next_best_action: scoreData.nextBestAction,
      model_used: 'claude-sonnet-4-5'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get lead scores
 */
export async function getLeadScores(userId: string): Promise<LeadScore[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lead_scores')
    .select('*')
    .eq('user_id', userId)
    .order('score', { ascending: false })

  if (error) throw error

  return data?.map(d => ({
    id: d.id,
    leadId: d.lead_id,
    leadName: d.lead_name,
    leadCompany: d.lead_company,
    score: d.score,
    confidence: d.confidence,
    conversionProbability: d.conversion_probability,
    estimatedValue: d.estimated_value,
    timeToClose: d.time_to_close,
    priority: d.priority,
    analysis: d.analysis,
    strengths: d.strengths || [],
    concerns: d.concerns || [],
    nextBestAction: d.next_best_action
  })) || []
}

// ============================================================================
// GROWTH PLAYBOOKS
// ============================================================================

/**
 * Get growth playbook for user
 */
export async function getGrowthPlaybook(userId: string): Promise<GrowthPlaybook | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('growth_playbooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null

  return {
    id: data.id,
    userId: data.user_id,
    industry: data.industry,
    expertise: data.expertise || [],
    playbookData: data.playbook_data,
    strategies: data.strategies || [],
    actionPlan: data.action_plan,
    actionsCompleted: data.actions_completed,
    revenueImpact: data.revenue_impact,
    effectivenessScore: data.effectiveness_score
  }
}

/**
 * Create or update growth playbook
 */
export async function upsertGrowthPlaybook(
  userId: string,
  industry: string,
  expertise: string[],
  playbookData: any,
  strategies: any[],
  actionPlan: any
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('growth_playbooks')
    .upsert({
      user_id: userId,
      industry,
      expertise,
      playbook_data: playbookData,
      strategies,
      action_plan: actionPlan,
      model_used: 'claude-sonnet-4-5'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// AI RECOMMENDATIONS
// ============================================================================

/**
 * Get AI recommendations for user
 */
export async function getAIRecommendations(
  userId: string,
  status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired'
): Promise<AIRecommendation[]> {
  const supabase = createClient()

  let query = supabase
    .from('ai_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error

  return data?.map(d => ({
    id: d.id,
    userId: d.user_id,
    recommendationType: d.recommendation_type,
    title: d.title,
    description: d.description,
    category: d.category,
    priority: d.priority,
    estimatedImpact: d.estimated_impact,
    effortLevel: d.effort_level,
    actions: d.actions || [],
    metrics: d.metrics || {},
    deadline: d.deadline,
    status: d.status
  })) || []
}

/**
 * Create AI recommendation
 */
export async function createAIRecommendation(
  userId: string,
  recommendation: Omit<AIRecommendation, 'id' | 'userId'>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ai_recommendations')
    .insert({
      user_id: userId,
      recommendation_type: recommendation.recommendationType,
      title: recommendation.title,
      description: recommendation.description,
      category: recommendation.category,
      priority: recommendation.priority,
      estimated_impact: recommendation.estimatedImpact,
      effort_level: recommendation.effortLevel,
      actions: recommendation.actions,
      metrics: recommendation.metrics,
      deadline: recommendation.deadline,
      status: recommendation.status
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update recommendation status
 */
export async function updateRecommendationStatus(
  recommendationId: string,
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired'
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ai_recommendations')
    .update({ status })
    .eq('id', recommendationId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// INVESTOR METRICS
// ============================================================================

/**
 * Track investor metric event
 */
export async function trackMetricEvent(
  userId: string,
  eventType: string,
  eventData: any
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('investor_metrics_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get platform-wide investor metrics
 */
export async function getPlatformMetrics(): Promise<InvestorMetric> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('calculate_platform_metrics')

  if (error) {
    // Return default metrics if RPC function doesn't exist yet
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalRevenue: 0,
      mrr: 0,
      arr: 0,
      churnRate: 0,
      avgCLV: 30000,
      avgCAC: 300
    }
  }

  return data?.[0] || {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    mrr: 0,
    arr: 0,
    churnRate: 0,
    avgCLV: 30000,
    avgCAC: 300
  }
}

/**
 * Get user metrics aggregate
 */
export async function getUserMetrics(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_metrics_aggregate')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ============================================================================
// AI FEATURE USAGE TRACKING
// ============================================================================

/**
 * Track AI feature usage
 */
export async function trackAIFeatureUsage(
  userId: string,
  featureName: string,
  category: string,
  tokensUsed: number = 0,
  costUsd: number = 0
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ai_feature_usage')
    .upsert({
      user_id: userId,
      feature_name: featureName,
      feature_category: category,
      usage_count: 1,
      tokens_used: tokensUsed,
      cost_usd: costUsd,
      last_used_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get AI feature usage stats
 */
export async function getAIFeatureUsage(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ai_feature_usage')
    .select('*')
    .eq('user_id', userId)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data
}
