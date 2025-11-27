/**
 * Email Marketing Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type EmailCampaignType = 'newsletter' | 'promotional' | 'transactional' | 'drip' | 'announcement' | 'custom'
export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
export type SubscriberStatus = 'subscribed' | 'unsubscribed' | 'bounced' | 'complained'
export type EmailEditorType = 'drag-drop' | 'html' | 'markdown'

export interface EmailCampaign {
  id: string
  user_id: string
  name: string
  subject: string
  preheader?: string
  type: EmailCampaignType
  status: EmailCampaignStatus
  from_name: string
  from_email: string
  reply_to?: string
  html_content: string
  plain_text_content?: string
  template_id?: string
  editor: EmailEditorType
  segment_id?: string
  recipient_count: number
  sent_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  bounced_count: number
  complained_count: number
  unsubscribed_count: number
  open_rate: number
  click_rate: number
  bounce_rate: number
  scheduled_at?: string
  sent_at?: string
  created_at: string
  updated_at: string
}

export interface EmailSubscriber {
  id: string
  user_id: string
  email: string
  first_name?: string
  last_name?: string
  status: SubscriberStatus
  tags: string[]
  custom_fields: Record<string, any>
  source: string
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  engagement_score: number
  ip_address?: string
  location: Record<string, any>
  preferences: Record<string, any>
  subscribed_at: string
  unsubscribed_at?: string
  last_emailed_at?: string
  last_opened_at?: string
  last_clicked_at?: string
  created_at: string
  updated_at: string
}

export interface EmailSegment {
  id: string
  user_id: string
  name: string
  description?: string
  criteria: Record<string, any>
  subscriber_count: number
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  user_id: string
  name: string
  description?: string
  category?: string
  html_content: string
  thumbnail_url?: string
  is_public: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

// CAMPAIGNS
export async function getEmailCampaigns(userId: string, filters?: { status?: EmailCampaignStatus; type?: EmailCampaignType }) {
  const supabase = createClient()
  let query = supabase.from('email_campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.type) query = query.eq('type', filters.type)
  return await query
}

export async function createEmailCampaign(userId: string, campaign: Partial<EmailCampaign>) {
  const supabase = createClient()
  return await supabase.from('email_campaigns').insert({ user_id: userId, ...campaign }).select().single()
}

export async function updateEmailCampaign(campaignId: string, updates: Partial<EmailCampaign>) {
  const supabase = createClient()
  return await supabase.from('email_campaigns').update(updates).eq('id', campaignId).select().single()
}

export async function scheduleCampaign(campaignId: string, scheduledAt: string) {
  const supabase = createClient()
  return await supabase.from('email_campaigns').update({ status: 'scheduled', scheduled_at: scheduledAt }).eq('id', campaignId).select().single()
}

export async function sendCampaign(campaignId: string) {
  const supabase = createClient()
  return await supabase.from('email_campaigns').update({ status: 'sending' }).eq('id', campaignId).select().single()
}

export async function deleteEmailCampaign(campaignId: string) {
  const supabase = createClient()
  return await supabase.from('email_campaigns').delete().eq('id', campaignId)
}

// SUBSCRIBERS
export async function getEmailSubscribers(userId: string, filters?: { status?: SubscriberStatus }) {
  const supabase = createClient()
  let query = supabase.from('email_subscribers').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  return await query
}

export async function createEmailSubscriber(userId: string, subscriber: Partial<EmailSubscriber>) {
  const supabase = createClient()
  return await supabase.from('email_subscribers').insert({ user_id: userId, ...subscriber }).select().single()
}

export async function updateEmailSubscriber(subscriberId: string, updates: Partial<EmailSubscriber>) {
  const supabase = createClient()
  return await supabase.from('email_subscribers').update(updates).eq('id', subscriberId).select().single()
}

export async function unsubscribeEmail(subscriberId: string) {
  const supabase = createClient()
  return await supabase.from('email_subscribers').update({ status: 'unsubscribed' }).eq('id', subscriberId).select().single()
}

export async function deleteEmailSubscriber(subscriberId: string) {
  const supabase = createClient()
  return await supabase.from('email_subscribers').delete().eq('id', subscriberId)
}

// SEGMENTS
export async function getEmailSegments(userId: string) {
  const supabase = createClient()
  return await supabase.from('email_segments').select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function createEmailSegment(userId: string, segment: Partial<EmailSegment>) {
  const supabase = createClient()
  return await supabase.from('email_segments').insert({ user_id: userId, ...segment }).select().single()
}

export async function updateEmailSegment(segmentId: string, updates: Partial<EmailSegment>) {
  const supabase = createClient()
  return await supabase.from('email_segments').update(updates).eq('id', segmentId).select().single()
}

export async function deleteEmailSegment(segmentId: string) {
  const supabase = createClient()
  return await supabase.from('email_segments').delete().eq('id', segmentId)
}

// TEMPLATES
export async function getEmailTemplates(userId: string, filters?: { category?: string }) {
  const supabase = createClient()
  let query = supabase.from('email_templates').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  return await query
}

export async function createEmailTemplate(userId: string, template: Partial<EmailTemplate>) {
  const supabase = createClient()
  return await supabase.from('email_templates').insert({ user_id: userId, ...template }).select().single()
}

export async function updateEmailTemplate(templateId: string, updates: Partial<EmailTemplate>) {
  const supabase = createClient()
  return await supabase.from('email_templates').update(updates).eq('id', templateId).select().single()
}

export async function deleteEmailTemplate(templateId: string) {
  const supabase = createClient()
  return await supabase.from('email_templates').delete().eq('id', templateId)
}

// STATS
export async function getEmailMarketingStats(userId: string) {
  const supabase = createClient()
  const [campaignsResult, subscribersResult, activeSubsResult, templatesResult] = await Promise.all([
    supabase.from('email_campaigns').select('id, sent_count, delivered_count, opened_count, clicked_count').eq('user_id', userId),
    supabase.from('email_subscribers').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('email_subscribers').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'subscribed'),
    supabase.from('email_templates').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  ])

  const totalSent = campaignsResult.data?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0
  const totalDelivered = campaignsResult.data?.reduce((sum, c) => sum + (c.delivered_count || 0), 0) || 0
  const totalOpened = campaignsResult.data?.reduce((sum, c) => sum + (c.opened_count || 0), 0) || 0
  const totalClicked = campaignsResult.data?.reduce((sum, c) => sum + (c.clicked_count || 0), 0) || 0

  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
  const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0

  return {
    data: {
      total_campaigns: campaignsResult.count || 0,
      total_subscribers: subscribersResult.count || 0,
      active_subscribers: activeSubsResult.count || 0,
      total_templates: templatesResult.count || 0,
      emails_sent: totalSent,
      emails_delivered: totalDelivered,
      emails_opened: totalOpened,
      emails_clicked: totalClicked,
      average_open_rate: avgOpenRate,
      average_click_rate: avgClickRate
    },
    error: campaignsResult.error || subscribersResult.error || activeSubsResult.error || templatesResult.error
  }
}
