// Admin Marketing System - Supabase Queries
// Comprehensive queries for lead management, campaign tracking, email automation, and marketing analytics

import { createClient } from '@/lib/supabase/client'
import { DatabaseError, toDbError, JsonValue } from '@/lib/types/database'

// ============================================================================
// TYPES
// ============================================================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadScore = 'cold' | 'warm' | 'hot'
export type LeadSource = 'website' | 'referral' | 'social' | 'email' | 'event' | 'manual' | 'advertising'
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived'
export type CampaignType = 'email' | 'social' | 'content' | 'ppc' | 'seo' | 'event' | 'partnership'
export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent'

export interface MarketingLead {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  status: LeadStatus
  score: LeadScore
  score_value: number
  source: LeadSource
  interests?: string[]
  tags?: string[]
  engagement_level: number
  last_contact?: string
  next_follow_up?: string
  assigned_to?: string
  estimated_value?: number
  notes?: string
  settings?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface MarketingCampaign {
  id: string
  user_id: string
  name: string
  description?: string
  type: CampaignType
  status: CampaignStatus
  budget: number
  spent: number
  start_date: string
  end_date?: string
  target_audience?: string[]
  channels?: string[]
  tags?: string[]
  created_by?: string
  settings?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface CampaignGoal {
  id: string
  campaign_id: string
  name: string
  target: number
  current: number
  unit: string
  settings?: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface CampaignMetrics {
  id: string
  campaign_id: string
  impressions: number
  clicks: number
  conversions: number
  leads: number
  revenue: number
  ctr: number
  conversion_rate: number
  roi: number
  cost_per_lead: number
  cost_per_conversion: number
  date: string
  settings?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface EmailCampaign {
  id: string
  campaign_id: string
  subject: string
  preview_text: string
  content: string
  status: EmailCampaignStatus
  scheduled_for?: string
  sent_at?: string
  recipients_count: number
  sent_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  bounced_count: number
  unsubscribed_count: number
  settings?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface MarketingStats {
  id: string
  user_id: string
  total_leads: number
  total_campaigns: number
  active_campaigns: number
  conversion_rate: number
  average_deal_value: number
  total_revenue: number
  marketing_spend: number
  roi: number
  leads_this_month: number
  campaigns_this_month: number
  date: string
  settings?: Record<string, JsonValue>
  metadata?: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

// ============================================================================
// MARKETING LEADS QUERIES
// ============================================================================

/**
 * Create a new marketing lead
 */
export async function createLead(userId: string, leadData: Partial<MarketingLead>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_leads')
    .insert({
      user_id: userId,
      ...leadData
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all leads for a user
 */
export async function getLeads(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get leads by status
 */
export async function getLeadsByStatus(userId: string, status: LeadStatus) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_leads')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get hot leads (score = 'hot')
 */
export async function getHotLeads(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_leads')
    .select('*')
    .eq('user_id', userId)
    .eq('score', 'hot')
    .order('score_value', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get leads by source
 */
export async function getLeadsBySource(userId: string, source: LeadSource) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_leads')
    .select('*')
    .eq('user_id', userId)
    .eq('source', source)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Update a lead
 */
export async function updateLead(leadId: string, updates: Partial<MarketingLead>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_leads')
    .update(updates)
    .eq('id', leadId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update lead status
 */
export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_leads')
    .update({
      status,
      last_contact: new Date().toISOString()
    })
    .eq('id', leadId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update lead score
 */
export async function updateLeadScore(leadId: string, score: LeadScore, scoreValue: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_leads')
    .update({ score, score_value: scoreValue })
    .eq('id', leadId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a lead
 */
export async function deleteLead(leadId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('marketing_leads')
    .delete()
    .eq('id', leadId)

  if (error) throw error
}

/**
 * Search leads by name, email, or company
 */
export async function searchLeads(userId: string, searchQuery: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_leads')
    .select('*')
    .eq('user_id', userId)
    .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================================================
// MARKETING CAMPAIGNS QUERIES
// ============================================================================

/**
 * Create a new marketing campaign
 */
export async function createCampaign(userId: string, campaignData: Partial<MarketingCampaign>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .insert({
      user_id: userId,
      ...campaignData
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all campaigns for a user
 */
export async function getCampaigns(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get campaigns by status
 */
export async function getCampaignsByStatus(userId: string, status: CampaignStatus) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get campaigns by type
 */
export async function getCampaignsByType(userId: string, type: CampaignType) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get active campaigns
 */
export async function getActiveCampaigns(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Update a campaign
 */
export async function updateCampaign(campaignId: string, updates: Partial<MarketingCampaign>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(campaignId: string, status: CampaignStatus) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .update({ status })
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('marketing_campaigns')
    .delete()
    .eq('id', campaignId)

  if (error) throw error
}

// ============================================================================
// CAMPAIGN GOALS QUERIES
// ============================================================================

/**
 * Create a campaign goal
 */
export async function createCampaignGoal(campaignId: string, goalData: Partial<CampaignGoal>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaign_goals')
    .insert({
      campaign_id: campaignId,
      ...goalData
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get goals for a campaign
 */
export async function getCampaignGoals(campaignId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaign_goals')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Update a campaign goal
 */
export async function updateCampaignGoal(goalId: string, updates: Partial<CampaignGoal>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaign_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(goalId: string, current: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaign_goals')
    .update({ current })
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a campaign goal
 */
export async function deleteCampaignGoal(goalId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('campaign_goals')
    .delete()
    .eq('id', goalId)

  if (error) throw error
}

// ============================================================================
// CAMPAIGN METRICS QUERIES
// ============================================================================

/**
 * Record campaign metrics for a specific date
 */
export async function recordCampaignMetrics(campaignId: string, metricsData: Partial<CampaignMetrics>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaign_metrics')
    .upsert({
      campaign_id: campaignId,
      date: metricsData.date || new Date().toISOString().split('T')[0],
      ...metricsData
    }, {
      onConflict: 'campaign_id,date'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get metrics for a campaign
 */
export async function getCampaignMetrics(campaignId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaign_metrics')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get campaign metrics for date range
 */
export async function getCampaignMetricsByDateRange(
  campaignId: string,
  startDate: string,
  endDate: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaign_metrics')
    .select('*')
    .eq('campaign_id', campaignId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Get aggregate metrics for a campaign
 */
export async function getCampaignAggregateMetrics(campaignId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('campaign_metrics')
    .select('*')
    .eq('campaign_id', campaignId)

  if (error) throw error

  if (!data || data.length === 0) {
    return {
      total_impressions: 0,
      total_clicks: 0,
      total_conversions: 0,
      total_leads: 0,
      total_revenue: 0,
      average_ctr: 0,
      average_conversion_rate: 0,
      overall_roi: 0
    }
  }

  const totals = data.reduce((acc, metric) => ({
    total_impressions: acc.total_impressions + metric.impressions,
    total_clicks: acc.total_clicks + metric.clicks,
    total_conversions: acc.total_conversions + metric.conversions,
    total_leads: acc.total_leads + metric.leads,
    total_revenue: acc.total_revenue + metric.revenue
  }), {
    total_impressions: 0,
    total_clicks: 0,
    total_conversions: 0,
    total_leads: 0,
    total_revenue: 0
  })

  const average_ctr = totals.total_impressions > 0
    ? (totals.total_clicks / totals.total_impressions) * 100
    : 0

  const average_conversion_rate = totals.total_clicks > 0
    ? (totals.total_conversions / totals.total_clicks) * 100
    : 0

  return {
    ...totals,
    average_ctr: parseFloat(average_ctr.toFixed(2)),
    average_conversion_rate: parseFloat(average_conversion_rate.toFixed(2)),
    overall_roi: data[0]?.roi || 0
  }
}

// ============================================================================
// EMAIL CAMPAIGNS QUERIES
// ============================================================================

/**
 * Create an email campaign
 */
export async function createEmailCampaign(campaignId: string, emailData: Partial<EmailCampaign>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('email_campaigns')
    .insert({
      campaign_id: campaignId,
      ...emailData
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get email campaigns for a campaign
 */
export async function getEmailCampaigns(campaignId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Update email campaign
 */
export async function updateEmailCampaign(emailCampaignId: string, updates: Partial<EmailCampaign>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('email_campaigns')
    .update(updates)
    .eq('id', emailCampaignId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update email campaign status
 */
export async function updateEmailCampaignStatus(emailCampaignId: string, status: EmailCampaignStatus) {
  const supabase = createClient()

  const updates: { status: EmailCampaignStatus; sent_at?: string } = { status }

  if (status === 'sent') {
    updates.sent_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('email_campaigns')
    .update(updates)
    .eq('id', emailCampaignId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update email campaign metrics
 */
export async function updateEmailCampaignMetrics(
  emailCampaignId: string,
  metrics: {
    sent_count?: number
    delivered_count?: number
    opened_count?: number
    clicked_count?: number
    bounced_count?: number
    unsubscribed_count?: number
  }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('email_campaigns')
    .update(metrics)
    .eq('id', emailCampaignId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete an email campaign
 */
export async function deleteEmailCampaign(emailCampaignId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('email_campaigns')
    .delete()
    .eq('id', emailCampaignId)

  if (error) throw error
}

// ============================================================================
// MARKETING STATS QUERIES
// ============================================================================

/**
 * Record marketing stats for a specific date
 */
export async function recordMarketingStats(userId: string, statsData: Partial<MarketingStats>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_stats')
    .upsert({
      user_id: userId,
      date: statsData.date || new Date().toISOString().split('T')[0],
      ...statsData
    }, {
      onConflict: 'user_id,date'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get marketing stats for a user
 */
export async function getMarketingStats(userId: string, limit: number = 30) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_stats')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get latest marketing stats
 */
export async function getLatestMarketingStats(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_stats')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // Return default stats if none exist
    return {
      total_leads: 0,
      total_campaigns: 0,
      active_campaigns: 0,
      conversion_rate: 0,
      average_deal_value: 0,
      total_revenue: 0,
      marketing_spend: 0,
      roi: 0,
      leads_this_month: 0,
      campaigns_this_month: 0
    }
  }

  return data
}

/**
 * Get marketing stats by date range
 */
export async function getMarketingStatsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('marketing_stats')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

// ============================================================================
// COMPREHENSIVE DASHBOARD QUERIES
// ============================================================================

/**
 * Get complete marketing dashboard data
 */
export async function getMarketingDashboard(userId: string) {
  const supabase = createClient()

  const [
    leads,
    campaigns,
    stats,
    hotLeads,
    activeCampaigns
  ] = await Promise.all([
    getLeads(userId),
    getCampaigns(userId),
    getLatestMarketingStats(userId),
    getHotLeads(userId),
    getActiveCampaigns(userId)
  ])

  return {
    leads,
    campaigns,
    stats,
    hotLeads,
    activeCampaigns,
    summary: {
      total_leads: leads.length,
      total_campaigns: campaigns.length,
      hot_leads: hotLeads.length,
      active_campaigns: activeCampaigns.length,
      conversion_rate: stats.conversion_rate || 0,
      roi: stats.roi || 0
    }
  }
}

/**
 * Get marketing performance overview
 */
export async function getMarketingPerformance(userId: string, days: number = 30) {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = new Date().toISOString().split('T')[0]

  const stats = await getMarketingStatsByDateRange(userId, startDateStr, endDateStr)

  if (!stats || stats.length === 0) {
    return {
      total_leads: 0,
      total_revenue: 0,
      total_spend: 0,
      average_roi: 0,
      average_conversion_rate: 0
    }
  }

  const totals = stats.reduce((acc, stat) => ({
    total_leads: acc.total_leads + stat.leads_this_month,
    total_revenue: acc.total_revenue + stat.total_revenue,
    total_spend: acc.total_spend + stat.marketing_spend
  }), {
    total_leads: 0,
    total_revenue: 0,
    total_spend: 0
  })

  const average_roi = stats.reduce((sum, stat) => sum + stat.roi, 0) / stats.length
  const average_conversion_rate = stats.reduce((sum, stat) => sum + stat.conversion_rate, 0) / stats.length

  return {
    ...totals,
    average_roi: parseFloat(average_roi.toFixed(2)),
    average_conversion_rate: parseFloat(average_conversion_rate.toFixed(2))
  }
}

/**
 * Get lead conversion funnel
 */
export async function getLeadConversionFunnel(userId: string) {
  const supabase = createClient()

  const leads = await getLeads(userId)

  const funnel = {
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    won: 0,
    lost: 0
  }

  leads.forEach(lead => {
    funnel[lead.status] = (funnel[lead.status] || 0) + 1
  })

  return funnel
}

/**
 * Get campaign performance comparison
 */
export async function getCampaignPerformanceComparison(userId: string) {
  const supabase = createClient()

  const campaigns = await getCampaigns(userId)

  const performance = await Promise.all(
    campaigns.map(async (campaign) => {
      const metrics = await getCampaignAggregateMetrics(campaign.id)
      return {
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        campaign_type: campaign.type,
        status: campaign.status,
        budget: campaign.budget,
        spent: campaign.spent,
        ...metrics
      }
    })
  )

  return performance.sort((a, b) => b.overall_roi - a.overall_roi)
}

// Missing function stubs - to be fully implemented

// Interfaces for function return types
interface ConvertedLead {
  id: string
  status: string
  converted_at: string
  [key: string]: JsonValue
}

interface CampaignRecord {
  id: string
  status: string
  updated_at: string
  [key: string]: JsonValue
}

interface EmailCampaignRecord {
  id: string
  status: string
  sent_at?: string
  [key: string]: JsonValue
}

interface CampaignMetricRecord {
  id: string
  user_id?: string
  campaign_id: string
  metric_name?: string
  metric_value?: number
  date?: string
  updated_at?: string
  [key: string]: JsonValue
}

export async function convertLead(
  leadId: string
): Promise<{ data: ConvertedLead | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads')
    .update({ status: 'converted', converted_at: new Date().toISOString() })
    .eq('id', leadId)
    .select()
    .single()
  return { data, error: error ? toDbError(error) : null }
}

export async function pauseCampaign(
  campaignId: string
): Promise<{ data: CampaignRecord | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('campaigns')
    .update({ status: 'paused', updated_at: new Date().toISOString() })
    .eq('id', campaignId)
    .select()
    .single()
  return { data, error: error ? toDbError(error) : null }
}

export async function resumeCampaign(
  campaignId: string
): Promise<{ data: CampaignRecord | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('campaigns')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', campaignId)
    .select()
    .single()
  return { data, error: error ? toDbError(error) : null }
}

export async function sendEmailCampaign(
  campaignId: string
): Promise<{ data: EmailCampaignRecord | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('email_campaigns')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', campaignId)
    .select()
    .single()
  return { data, error: error ? toDbError(error) : null }
}

export async function createCampaignMetric(
  userId: string,
  metric: {
    campaign_id: string
    metric_name: string
    metric_value: number
    date?: string
  }
): Promise<{ data: CampaignMetricRecord | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('campaign_metrics')
    .insert({ user_id: userId, ...metric })
    .select()
    .single()
  return { data, error: error ? toDbError(error) : null }
}

export async function updateCampaignMetric(
  metricId: string,
  updates: Partial<{ metric_value: number; metric_name: string }>
): Promise<{ data: CampaignMetricRecord | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('campaign_metrics')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', metricId)
    .select()
    .single()
  return { data, error: error ? toDbError(error) : null }
}

export async function deleteCampaignMetric(
  metricId: string
): Promise<{ data: null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('campaign_metrics')
    .delete()
    .eq('id', metricId)
  return { data: null, error: error ? toDbError(error) : null }
}

export async function getEmailCampaignsByStatus(
  userId: string,
  status: string
): Promise<EmailCampaignRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
  if (error) return []
  return (data as EmailCampaignRecord[]) || []
}

export async function getLeadConversionRate(
  userId: string
): Promise<number> {
  const supabase = createClient()
  const [total, converted] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('leads').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'converted')
  ])
  const totalCount = total.count || 0
  const convertedCount = converted.count || 0
  return totalCount > 0 ? (convertedCount / totalCount) * 100 : 0
}

export async function getCampaignROI(
  campaignId: string
): Promise<number> {
  const supabase = createClient()
  const { data } = await supabase
    .from('campaigns')
    .select('budget, revenue')
    .eq('id', campaignId)
    .single()
  if (!data) return 0
  const budget = data.budget || 0
  const revenue = data.revenue || 0
  return budget > 0 ? ((revenue - budget) / budget) * 100 : 0
}

