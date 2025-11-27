/**
 * Lead Generation Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type LeadGenSource = 'website' | 'landing-page' | 'social-media' | 'email' | 'referral' | 'paid-ads' | 'organic' | 'other'
export type LeadGenStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'
export type LeadGenScore = 'cold' | 'warm' | 'hot'
export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
export type LandingPageStatus = 'draft' | 'published' | 'archived'
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'

export interface LeadGenLead {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  source: LeadGenSource
  status: LeadGenStatus
  score: number
  score_label: LeadGenScore
  tags: string[]
  custom_fields: Record<string, any>
  assigned_to?: string
  page_views: number
  form_submissions: number
  email_opens: number
  email_clicks: number
  time_on_site: number
  device_type?: string
  location: Record<string, any>
  last_contacted_at?: string
  converted_at?: string
  created_at: string
  updated_at: string
}

export interface LeadGenCampaign {
  id: string
  user_id: string
  name: string
  description?: string
  type: string
  status: CampaignStatus
  start_date?: string
  end_date?: string
  budget: number
  spent: number
  leads_generated: number
  conversions: number
  roi: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface LeadGenLandingPage {
  id: string
  user_id: string
  campaign_id?: string
  name: string
  slug: string
  title: string
  description?: string
  status: LandingPageStatus
  template: string
  sections: any[]
  seo: Record<string, any>
  views: number
  unique_visitors: number
  submissions: number
  conversion_rate: number
  bounce_rate: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface LeadGenForm {
  id: string
  user_id: string
  landing_page_id?: string
  name: string
  description?: string
  settings: Record<string, any>
  submissions: number
  conversion_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LeadGenFormField {
  id: string
  form_id: string
  type: FormFieldType
  label: string
  placeholder?: string
  is_required: boolean
  options: string[]
  validation: Record<string, any>
  field_order: number
  created_at: string
}

// LEADS
export async function getLeadGenLeads(userId: string, filters?: { status?: LeadGenStatus; source?: LeadGenSource }) {
  const supabase = createClient()
  let query = supabase.from('lead_gen_leads').select('*').eq('user_id', userId).order('score', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.source) query = query.eq('source', filters.source)
  return await query
}

export async function createLeadGenLead(userId: string, lead: Partial<LeadGenLead>) {
  const supabase = createClient()
  return await supabase.from('lead_gen_leads').insert({ user_id: userId, ...lead }).select().single()
}

export async function updateLeadGenLead(leadId: string, updates: Partial<LeadGenLead>) {
  const supabase = createClient()
  return await supabase.from('lead_gen_leads').update(updates).eq('id', leadId).select().single()
}

export async function convertLead(leadId: string) {
  const supabase = createClient()
  return await supabase.from('lead_gen_leads').update({ status: 'converted' }).eq('id', leadId).select().single()
}

// CAMPAIGNS
export async function getLeadGenCampaigns(userId: string, filters?: { status?: CampaignStatus }) {
  const supabase = createClient()
  let query = supabase.from('lead_gen_campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  return await query
}

export async function createLeadGenCampaign(userId: string, campaign: Partial<LeadGenCampaign>) {
  const supabase = createClient()
  return await supabase.from('lead_gen_campaigns').insert({ user_id: userId, ...campaign }).select().single()
}

export async function updateLeadGenCampaign(campaignId: string, updates: Partial<LeadGenCampaign>) {
  const supabase = createClient()
  return await supabase.from('lead_gen_campaigns').update(updates).eq('id', campaignId).select().single()
}

// LANDING PAGES
export async function getLeadGenLandingPages(userId: string, filters?: { status?: LandingPageStatus }) {
  const supabase = createClient()
  let query = supabase.from('lead_gen_landing_pages').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  return await query
}

export async function createLeadGenLandingPage(userId: string, page: Partial<LeadGenLandingPage>) {
  const supabase = createClient()
  return await supabase.from('lead_gen_landing_pages').insert({ user_id: userId, ...page }).select().single()
}

export async function updateLeadGenLandingPage(pageId: string, updates: Partial<LeadGenLandingPage>) {
  const supabase = createClient()
  return await supabase.from('lead_gen_landing_pages').update(updates).eq('id', pageId).select().single()
}

export async function publishLandingPage(pageId: string) {
  const supabase = createClient()
  return await supabase.from('lead_gen_landing_pages').update({ status: 'published' }).eq('id', pageId).select().single()
}

// FORMS
export async function getLeadGenForms(userId: string) {
  const supabase = createClient()
  return await supabase.from('lead_gen_forms').select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function createLeadGenForm(userId: string, form: Partial<LeadGenForm>) {
  const supabase = createClient()
  return await supabase.from('lead_gen_forms').insert({ user_id: userId, ...form }).select().single()
}

export async function updateLeadGenForm(formId: string, updates: Partial<LeadGenForm>) {
  const supabase = createClient()
  return await supabase.from('lead_gen_forms').update(updates).eq('id', formId).select().single()
}

// FORM FIELDS
export async function getFormFields(formId: string) {
  const supabase = createClient()
  return await supabase.from('lead_gen_form_fields').select('*').eq('form_id', formId).order('field_order')
}

export async function addFormField(formId: string, field: Partial<LeadGenFormField>) {
  const supabase = createClient()
  return await supabase.from('lead_gen_form_fields').insert({ form_id: formId, ...field }).select().single()
}

export async function deleteFormField(fieldId: string) {
  const supabase = createClient()
  return await supabase.from('lead_gen_form_fields').delete().eq('id', fieldId)
}

// SUBMISSIONS
export async function submitForm(formId: string, leadId: string | null, data: Record<string, any>, metadata?: { ip_address?: string; user_agent?: string }) {
  const supabase = createClient()
  return await supabase.from('lead_gen_form_submissions').insert({ form_id: formId, lead_id: leadId, data, ...metadata }).select().single()
}

// STATS
export async function getLeadGenStats(userId: string) {
  const supabase = createClient()
  const [leadsResult, campaignsResult, pagesResult, formsResult] = await Promise.all([
    supabase.from('lead_gen_leads').select('id, score, status').eq('user_id', userId),
    supabase.from('lead_gen_campaigns').select('id, leads_generated, conversions, roi').eq('user_id', userId),
    supabase.from('lead_gen_landing_pages').select('id, views, submissions').eq('user_id', userId),
    supabase.from('lead_gen_forms').select('id, submissions').eq('user_id', userId)
  ])

  const totalLeads = leadsResult.count || 0
  const qualifiedLeads = leadsResult.data?.filter(l => l.status === 'qualified' || l.status === 'converted').length || 0
  const avgScore = leadsResult.data?.reduce((sum, l) => sum + (l.score || 0), 0) / (leadsResult.data?.length || 1) || 0
  const totalCampaignLeads = campaignsResult.data?.reduce((sum, c) => sum + (c.leads_generated || 0), 0) || 0
  const totalConversions = campaignsResult.data?.reduce((sum, c) => sum + (c.conversions || 0), 0) || 0
  const avgROI = campaignsResult.data?.reduce((sum, c) => sum + (c.roi || 0), 0) / (campaignsResult.data?.length || 1) || 0

  return {
    data: {
      total_leads: totalLeads,
      qualified_leads: qualifiedLeads,
      average_score: avgScore,
      total_campaigns: campaignsResult.count || 0,
      campaign_leads: totalCampaignLeads,
      conversions: totalConversions,
      average_roi: avgROI,
      total_pages: pagesResult.count || 0,
      total_forms: formsResult.count || 0
    },
    error: leadsResult.error || campaignsResult.error || pagesResult.error || formsResult.error
  }
}
