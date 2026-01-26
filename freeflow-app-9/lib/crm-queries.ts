/**
 * CRM Query Library
 */

import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

/**
 * Address structure for contacts
 */
export interface ContactAddress {
  street?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  [key: string]: string | undefined
}

/**
 * Social profile links for contacts
 */
export interface SocialProfiles {
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  github?: string
  website?: string
  [key: string]: string | undefined
}

/**
 * Deal close updates structure
 */
interface DealCloseUpdates {
  stage: 'closed-won' | 'closed-lost'
  won_reason?: string
  lost_reason?: string
}

/**
 * Activity completion updates structure
 */
interface ActivityCompleteUpdates {
  status: 'completed'
  outcome?: string
}

export type ContactType = 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadSource = 'website' | 'referral' | 'social-media' | 'email-campaign' | 'event' | 'cold-outreach' | 'other'
export type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent'
export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note' | 'deal-update'
export type ActivityStatus = 'pending' | 'completed' | 'cancelled'

export interface CRMContact {
  id: string
  user_id: string
  type: ContactType
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  avatar?: string
  lead_status?: LeadStatus
  lead_source?: LeadSource
  lead_score: number
  tags: string[]
  custom_fields: Record<string, JsonValue>
  address: ContactAddress
  social_profiles: SocialProfiles
  last_contacted_at?: string
  assigned_to?: string
  total_deals: number
  total_revenue: number
  lifetime_value: number
  total_interactions: number
  created_at: string
  updated_at: string
}

export interface CRMLead {
  id: string
  contact_id: string
  user_id: string
  status: LeadStatus
  source: LeadSource
  score: number
  temperature: string
  priority: PriorityLevel
  estimated_value: number
  estimated_close_date?: string
  probability: number
  notes: string[]
  assigned_to: string
  converted_at?: string
  converted_to_deal_id?: string
  created_at: string
  updated_at: string
}

export interface CRMDeal {
  id: string
  user_id: string
  contact_id: string
  name: string
  company_name: string
  stage: DealStage
  value: number
  probability: number
  expected_close_date?: string
  actual_close_date?: string
  priority: PriorityLevel
  description?: string
  assigned_to: string
  tags: string[]
  custom_fields: Record<string, JsonValue>
  lost_reason?: string
  won_reason?: string
  created_at: string
  updated_at: string
}

export interface CRMDealProduct {
  id: string
  deal_id: string
  name: string
  quantity: number
  unit_price: number
  discount: number
  tax: number
  total: number
  created_at: string
  updated_at: string
}

export interface CRMActivity {
  id: string
  user_id: string
  type: ActivityType
  subject: string
  description?: string
  contact_id?: string
  deal_id?: string
  assigned_to: string
  due_date?: string
  completed_at?: string
  priority: PriorityLevel
  status: ActivityStatus
  duration: number
  outcome?: string
  created_at: string
  updated_at: string
}

export interface CRMNote {
  id: string
  user_id: string
  content: string
  contact_id?: string
  deal_id?: string
  is_pinned: boolean
  attachments: string[]
  created_at: string
  updated_at: string
}

// CONTACTS
export async function getCRMContacts(userId: string, filters?: { type?: ContactType; status?: LeadStatus }) {
  const supabase = createClient()
  let query = supabase.from('crm_contacts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('lead_status', filters.status)
  return await query
}

export async function createCRMContact(userId: string, contact: Partial<CRMContact>) {
  const supabase = createClient()
  return await supabase.from('crm_contacts').insert({ user_id: userId, ...contact }).select().single()
}

export async function updateCRMContact(contactId: string, updates: Partial<CRMContact>) {
  const supabase = createClient()
  return await supabase.from('crm_contacts').update(updates).eq('id', contactId).select().single()
}

export async function deleteCRMContact(contactId: string) {
  const supabase = createClient()
  return await supabase.from('crm_contacts').delete().eq('id', contactId)
}

// LEADS
export async function getCRMLeads(userId: string, filters?: { status?: LeadStatus; assignedTo?: string }) {
  const supabase = createClient()
  let query = supabase.from('crm_leads').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
  return await query
}

export async function createCRMLead(userId: string, lead: Partial<CRMLead>) {
  const supabase = createClient()
  return await supabase.from('crm_leads').insert({ user_id: userId, ...lead }).select().single()
}

export async function updateCRMLead(leadId: string, updates: Partial<CRMLead>) {
  const supabase = createClient()
  return await supabase.from('crm_leads').update(updates).eq('id', leadId).select().single()
}

export async function convertLeadToDeal(leadId: string, dealId: string) {
  const supabase = createClient()
  return await supabase.from('crm_leads').update({ status: 'won', converted_to_deal_id: dealId }).eq('id', leadId).select().single()
}

export async function deleteCRMLead(leadId: string) {
  const supabase = createClient()
  return await supabase.from('crm_leads').delete().eq('id', leadId)
}

// DEALS
export async function getCRMDeals(userId: string, filters?: { stage?: DealStage; assignedTo?: string }) {
  const supabase = createClient()
  let query = supabase.from('crm_deals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.stage) query = query.eq('stage', filters.stage)
  if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
  return await query
}

export async function createCRMDeal(userId: string, deal: Partial<CRMDeal>) {
  const supabase = createClient()
  return await supabase.from('crm_deals').insert({ user_id: userId, ...deal }).select().single()
}

export async function updateCRMDeal(dealId: string, updates: Partial<CRMDeal>) {
  const supabase = createClient()
  return await supabase.from('crm_deals').update(updates).eq('id', dealId).select().single()
}

export async function closeDeal(dealId: string, stage: 'closed-won' | 'closed-lost', reason?: string) {
  const supabase = createClient()
  const updates: DealCloseUpdates = { stage }
  if (stage === 'closed-won' && reason) updates.won_reason = reason
  if (stage === 'closed-lost' && reason) updates.lost_reason = reason
  return await supabase.from('crm_deals').update(updates).eq('id', dealId).select().single()
}

export async function deleteCRMDeal(dealId: string) {
  const supabase = createClient()
  return await supabase.from('crm_deals').delete().eq('id', dealId)
}

// DEAL PRODUCTS
export async function getDealProducts(dealId: string) {
  const supabase = createClient()
  return await supabase.from('crm_deal_products').select('*').eq('deal_id', dealId)
}

export async function addDealProduct(dealId: string, product: Partial<CRMDealProduct>) {
  const supabase = createClient()
  return await supabase.from('crm_deal_products').insert({ deal_id: dealId, ...product }).select().single()
}

export async function updateDealProduct(productId: string, updates: Partial<CRMDealProduct>) {
  const supabase = createClient()
  return await supabase.from('crm_deal_products').update(updates).eq('id', productId).select().single()
}

export async function deleteDealProduct(productId: string) {
  const supabase = createClient()
  return await supabase.from('crm_deal_products').delete().eq('id', productId)
}

// ACTIVITIES
export async function getCRMActivities(userId: string, filters?: { contactId?: string; dealId?: string; status?: ActivityStatus }) {
  const supabase = createClient()
  let query = supabase.from('crm_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.contactId) query = query.eq('contact_id', filters.contactId)
  if (filters?.dealId) query = query.eq('deal_id', filters.dealId)
  if (filters?.status) query = query.eq('status', filters.status)
  return await query
}

export async function createCRMActivity(userId: string, activity: Partial<CRMActivity>) {
  const supabase = createClient()
  return await supabase.from('crm_activities').insert({ user_id: userId, ...activity }).select().single()
}

export async function updateCRMActivity(activityId: string, updates: Partial<CRMActivity>) {
  const supabase = createClient()
  return await supabase.from('crm_activities').update(updates).eq('id', activityId).select().single()
}

export async function completeActivity(activityId: string, outcome?: string) {
  const supabase = createClient()
  const updates: ActivityCompleteUpdates = { status: 'completed' }
  if (outcome) updates.outcome = outcome
  return await supabase.from('crm_activities').update(updates).eq('id', activityId).select().single()
}

export async function deleteCRMActivity(activityId: string) {
  const supabase = createClient()
  return await supabase.from('crm_activities').delete().eq('id', activityId)
}

// NOTES
export async function getCRMNotes(userId: string, filters?: { contactId?: string; dealId?: string }) {
  const supabase = createClient()
  let query = supabase.from('crm_notes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.contactId) query = query.eq('contact_id', filters.contactId)
  if (filters?.dealId) query = query.eq('deal_id', filters.dealId)
  return await query
}

export async function createCRMNote(userId: string, note: Partial<CRMNote>) {
  const supabase = createClient()
  return await supabase.from('crm_notes').insert({ user_id: userId, ...note }).select().single()
}

export async function toggleNotePin(noteId: string, isPinned: boolean) {
  const supabase = createClient()
  return await supabase.from('crm_notes').update({ is_pinned: isPinned }).eq('id', noteId).select().single()
}

export async function deleteCRMNote(noteId: string) {
  const supabase = createClient()
  return await supabase.from('crm_notes').delete().eq('id', noteId)
}

// STATS
export async function getCRMStats(userId: string) {
  const supabase = createClient()
  const [contactsResult, leadsResult, dealsResult, wonDealsResult, activitiesResult] = await Promise.all([
    supabase.from('crm_contacts').select('id, total_revenue', { count: 'exact' }).eq('user_id', userId),
    supabase.from('crm_leads').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('crm_deals').select('id, value', { count: 'exact' }).eq('user_id', userId),
    supabase.from('crm_deals').select('id, value', { count: 'exact' }).eq('user_id', userId).eq('stage', 'closed-won'),
    supabase.from('crm_activities').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'pending')
  ])

  const totalRevenue = contactsResult.data?.reduce((sum, c) => sum + (c.total_revenue || 0), 0) || 0
  const pipelineValue = dealsResult.data?.reduce((sum, d) => sum + (d.value || 0), 0) || 0
  const wonDealsValue = wonDealsResult.data?.reduce((sum, d) => sum + (d.value || 0), 0) || 0

  return {
    data: {
      total_contacts: contactsResult.count || 0,
      total_leads: leadsResult.count || 0,
      total_deals: dealsResult.count || 0,
      total_revenue: totalRevenue,
      pipeline_value: pipelineValue,
      won_deals: wonDealsResult.count || 0,
      won_deals_value: wonDealsValue,
      pending_activities: activitiesResult.count || 0
    },
    error: contactsResult.error || leadsResult.error || dealsResult.error || wonDealsResult.error || activitiesResult.error
  }
}
