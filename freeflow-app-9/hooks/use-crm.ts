'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadSource = 'website' | 'referral' | 'social' | 'advertising' | 'cold_outreach' | 'event' | 'other'
export type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'follow_up'
export type ContactType = 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor'
export type ContactStatus = 'active' | 'inactive' | 'vip' | 'churned' | 'new' | 'qualified'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  title?: string
  status: LeadStatus
  source: LeadSource
  score: number
  assignedTo?: string
  assignedToName?: string
  value: number
  currency: string
  tags: string[]
  notes?: string
  lastContactedAt?: string
  nextFollowUp?: string
  customFields?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  name: string
  leadId?: string
  contactId: string
  contactName: string
  companyName?: string
  stage: DealStage
  value: number
  currency: string
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  assignedTo: string
  assignedToName: string
  products: DealProduct[]
  activities: Activity[]
  notes?: string
  lostReason?: string
  createdAt: string
  updatedAt: string
}

export interface DealProduct {
  id: string
  name: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface Activity {
  id: string
  type: ActivityType
  subject: string
  description?: string
  relatedTo: string
  relatedType: 'lead' | 'deal' | 'contact'
  dueDate?: string
  completedAt?: string
  assignedTo: string
  assignedToName: string
  createdBy: string
  createdByName: string
  createdAt: string
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  title?: string
  avatar?: string
  type: ContactType
  status: ContactStatus
  tags: string[]
  deals: string[]
  totalValue: number
  leadScore: number
  lastActivity?: string
  createdAt: string
  updatedAt: string
}

export interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
  isDefault: boolean
  dealCount: number
  totalValue: number
  createdAt: string
}

export interface PipelineStage {
  id: string
  name: string
  order: number
  probability: number
  color: string
  dealCount: number
  value: number
}

export interface CRMStats {
  totalLeads: number
  qualifiedLeads: number
  totalDeals: number
  openDeals: number
  wonDeals: number
  lostDeals: number
  totalValue: number
  wonValue: number
  winRate: number
  averageDealSize: number
  salesCycle: number
  totalContacts: number
  vipContacts: number
}

// ============================================================================
// DATABASE MAPPERS
// ============================================================================

// Map database contact to UI Contact interface
function mapDbContactToContact(dbContact: any): Contact {
  return {
    id: dbContact.id,
    firstName: dbContact.contact_name?.split(' ')[0] || dbContact.first_name || '',
    lastName: dbContact.contact_name?.split(' ').slice(1).join(' ') || dbContact.last_name || '',
    email: dbContact.email || '',
    phone: dbContact.phone || undefined,
    company: dbContact.company_name || dbContact.company || undefined,
    title: dbContact.job_title || undefined,
    avatar: dbContact.avatar || undefined,
    type: (dbContact.contact_type || dbContact.type || 'lead') as ContactType,
    status: (dbContact.status || 'active') as ContactStatus,
    tags: dbContact.tags || [],
    deals: [],
    totalValue: parseFloat(dbContact.deal_value || dbContact.total_revenue || '0'),
    leadScore: dbContact.lead_score || 0,
    lastActivity: dbContact.last_contact_date || dbContact.last_contacted_at || dbContact.updated_at,
    createdAt: dbContact.created_at,
    updatedAt: dbContact.updated_at,
  }
}

// Map database contact to UI Lead interface
function mapDbContactToLead(dbContact: any): Lead {
  const statusMap: Record<string, LeadStatus> = {
    'new': 'new',
    'contacted': 'contacted',
    'qualified': 'qualified',
    'proposal': 'proposal',
    'negotiation': 'negotiation',
    'won': 'won',
    'lost': 'lost',
    'active': 'contacted',
    'vip': 'qualified',
    'inactive': 'lost',
    'churned': 'lost',
  }

  const sourceMap: Record<string, LeadSource> = {
    'website': 'website',
    'referral': 'referral',
    'social_media': 'social',
    'social-media': 'social',
    'email': 'advertising',
    'email-campaign': 'advertising',
    'event': 'event',
    'cold-outreach': 'cold_outreach',
    'cold_outreach': 'cold_outreach',
    'other': 'other',
  }

  return {
    id: dbContact.id,
    name: dbContact.contact_name || `${dbContact.first_name || ''} ${dbContact.last_name || ''}`.trim() || 'Unknown',
    email: dbContact.email || '',
    phone: dbContact.phone || undefined,
    company: dbContact.company_name || dbContact.company || undefined,
    title: dbContact.job_title || undefined,
    status: statusMap[dbContact.lead_status || dbContact.status] || 'new',
    source: sourceMap[dbContact.lead_source] || 'other',
    score: dbContact.lead_score || 0,
    assignedTo: dbContact.assigned_to || dbContact.assigned_to_id || undefined,
    assignedToName: dbContact.assigned_to_name || dbContact.account_owner_name || 'Unassigned',
    value: parseFloat(dbContact.deal_value || dbContact.estimated_value || '0'),
    currency: 'USD',
    tags: dbContact.tags || [],
    notes: dbContact.notes || undefined,
    lastContactedAt: dbContact.last_contact_date || dbContact.last_contacted_at || undefined,
    nextFollowUp: dbContact.next_followup_date || undefined,
    customFields: dbContact.custom_fields || undefined,
    createdAt: dbContact.created_at,
    updatedAt: dbContact.updated_at,
  }
}

// Map database deal to UI Deal interface
function mapDbDealToDeal(dbDeal: any): Deal {
  const stageMap: Record<string, DealStage> = {
    'discovery': 'discovery',
    'qualification': 'qualification',
    'proposal': 'proposal',
    'negotiation': 'negotiation',
    'closed-won': 'closed_won',
    'closed_won': 'closed_won',
    'closed-lost': 'closed_lost',
    'closed_lost': 'closed_lost',
    'prospecting': 'discovery',
  }

  return {
    id: dbDeal.id,
    name: dbDeal.deal_name || dbDeal.name || 'Untitled Deal',
    leadId: dbDeal.lead_id || undefined,
    contactId: dbDeal.contact_id || '',
    contactName: dbDeal.contact_name || '',
    companyName: dbDeal.company_name || undefined,
    stage: stageMap[dbDeal.deal_stage || dbDeal.stage] || 'discovery',
    value: parseFloat(dbDeal.deal_value || dbDeal.value || '0'),
    currency: 'USD',
    probability: dbDeal.probability_percentage || dbDeal.probability || 0,
    expectedCloseDate: dbDeal.expected_close_date || undefined,
    actualCloseDate: dbDeal.actual_close_date || undefined,
    assignedTo: dbDeal.assigned_to || '',
    assignedToName: dbDeal.owner_name || dbDeal.assigned_to_name || 'Unassigned',
    products: dbDeal.products || [],
    activities: [],
    notes: dbDeal.description || dbDeal.notes || undefined,
    lostReason: dbDeal.lost_reason || undefined,
    createdAt: dbDeal.created_at,
    updatedAt: dbDeal.updated_at,
  }
}

// Map database activity to UI Activity interface
function mapDbActivityToActivity(dbActivity: any): Activity {
  const typeMap: Record<string, ActivityType> = {
    'call': 'call',
    'email': 'email',
    'meeting': 'meeting',
    'note': 'note',
    'task': 'task',
    'follow_up': 'follow_up',
    'deal-update': 'note',
  }

  return {
    id: dbActivity.id,
    type: typeMap[dbActivity.activity_type || dbActivity.type] || 'note',
    subject: dbActivity.subject || dbActivity.title || '',
    description: dbActivity.description || undefined,
    relatedTo: dbActivity.contact_id || dbActivity.deal_id || '',
    relatedType: dbActivity.deal_id ? 'deal' : 'contact',
    dueDate: dbActivity.due_date || undefined,
    completedAt: dbActivity.completed_at || (dbActivity.status === 'completed' ? dbActivity.updated_at : undefined),
    assignedTo: dbActivity.assigned_to || '',
    assignedToName: dbActivity.assigned_to_name || 'You',
    createdBy: dbActivity.user_id || '',
    createdByName: 'You',
    createdAt: dbActivity.created_at,
  }
}

// ============================================================================
// HOOK
// ============================================================================

interface UseCRMOptions {
  enableRealtime?: boolean
}

export function useCRM(options: UseCRMOptions = {}) {
  const { enableRealtime = true } = options
  const supabase = createClient()

  // State
  const [leads, setLeads] = useState<Lead[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<CRMStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Default pipeline stages
  const pipelines: Pipeline[] = useMemo(() => [{
    id: 'default',
    name: 'Sales Pipeline',
    stages: [
      { id: 'discovery', name: 'Discovery', order: 1, probability: 10, color: '#3b82f6', dealCount: 0, value: 0 },
      { id: 'qualification', name: 'Qualification', order: 2, probability: 30, color: '#22c55e', dealCount: 0, value: 0 },
      { id: 'proposal', name: 'Proposal', order: 3, probability: 60, color: '#f59e0b', dealCount: 0, value: 0 },
      { id: 'negotiation', name: 'Negotiation', order: 4, probability: 80, color: '#8b5cf6', dealCount: 0, value: 0 },
      { id: 'closed_won', name: 'Closed Won', order: 5, probability: 100, color: '#10b981', dealCount: 0, value: 0 },
    ],
    isDefault: true,
    dealCount: deals.length,
    totalValue: deals.reduce((sum, d) => sum + d.value, 0),
    createdAt: new Date().toISOString(),
  }], [deals])

  // ============================================================================
  // FETCH FUNCTIONS
  // ============================================================================

  const fetchContacts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapDbContactToContact)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      return []
    }
  }, [supabase])

  const fetchLeads = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Fetch from crm_contacts where type is 'lead' or 'prospect'
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('user_id', user.id)
        .in('contact_type', ['lead', 'prospect'])
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapDbContactToLead)
    } catch (err) {
      console.error('Error fetching leads:', err)
      return []
    }
  }, [supabase])

  const fetchDeals = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('crm_deals')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map(mapDbDealToDeal)
    } catch (err) {
      console.error('Error fetching deals:', err)
      return []
    }
  }, [supabase])

  const fetchActivities = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      return (data || []).map(mapDbActivityToActivity)
    } catch (err) {
      console.error('Error fetching activities:', err)
      return []
    }
  }, [supabase])

  const fetchCRM = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [fetchedContacts, fetchedLeads, fetchedDeals, fetchedActivities] = await Promise.all([
        fetchContacts(),
        fetchLeads(),
        fetchDeals(),
        fetchActivities(),
      ])

      setContacts(fetchedContacts)
      setLeads(fetchedLeads)
      setDeals(fetchedDeals)
      setActivities(fetchedActivities)

      // Calculate stats
      const openDeals = fetchedDeals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
      const wonDeals = fetchedDeals.filter(d => d.stage === 'closed_won')
      const lostDeals = fetchedDeals.filter(d => d.stage === 'closed_lost')
      const closedDeals = [...wonDeals, ...lostDeals]

      setStats({
        totalLeads: fetchedLeads.length,
        qualifiedLeads: fetchedLeads.filter(l => l.status === 'qualified').length,
        totalDeals: fetchedDeals.length,
        openDeals: openDeals.length,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
        totalValue: fetchedDeals.reduce((sum, d) => sum + d.value, 0),
        wonValue: wonDeals.reduce((sum, d) => sum + d.value, 0),
        winRate: closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0,
        averageDealSize: fetchedDeals.length > 0 ? fetchedDeals.reduce((sum, d) => sum + d.value, 0) / fetchedDeals.length : 0,
        salesCycle: 28,
        totalContacts: fetchedContacts.length,
        vipContacts: fetchedContacts.filter(c => c.status === 'vip').length,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch CRM data'))
    } finally {
      setIsLoading(false)
    }
  }, [fetchContacts, fetchLeads, fetchDeals, fetchActivities])

  // ============================================================================
  // LEAD OPERATIONS
  // ============================================================================

  const createLead = useCallback(async (data: Partial<Lead>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const sourceMap: Record<string, string> = {
        'website': 'website',
        'referral': 'referral',
        'social': 'social-media',
        'advertising': 'email-campaign',
        'cold_outreach': 'cold-outreach',
        'event': 'event',
        'other': 'other',
      }

      const { data: result, error } = await supabase
        .from('crm_contacts')
        .insert({
          user_id: user.id,
          contact_name: data.name,
          email: data.email,
          phone: data.phone || null,
          company_name: data.company || null,
          job_title: data.title || null,
          contact_type: 'lead',
          status: 'new',
          lead_status: data.status || 'new',
          lead_source: sourceMap[data.source || 'other'] || 'other',
          lead_score: data.score || 50,
          deal_value: data.value || 0,
          tags: data.tags || [],
          notes: data.notes || null,
          next_followup_date: data.nextFollowUp || null,
        })
        .select()
        .single()

      if (error) throw error

      const newLead = mapDbContactToLead(result)
      setLeads(prev => [newLead, ...prev])
      return { success: true, lead: newLead }
    } catch (err) {
      console.error('Error creating lead:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create lead' }
    }
  }, [supabase])

  const updateLead = useCallback(async (leadId: string, updates: Partial<Lead>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const dbUpdates: Record<string, any> = {}
      if (updates.name) dbUpdates.contact_name = updates.name
      if (updates.email) dbUpdates.email = updates.email
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone
      if (updates.company !== undefined) dbUpdates.company_name = updates.company
      if (updates.title !== undefined) dbUpdates.job_title = updates.title
      if (updates.status) dbUpdates.lead_status = updates.status
      if (updates.score !== undefined) dbUpdates.lead_score = updates.score
      if (updates.value !== undefined) dbUpdates.deal_value = updates.value
      if (updates.tags) dbUpdates.tags = updates.tags
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes
      if (updates.nextFollowUp !== undefined) dbUpdates.next_followup_date = updates.nextFollowUp
      if (updates.lastContactedAt) dbUpdates.last_contact_date = updates.lastContactedAt

      const { error } = await supabase
        .from('crm_contacts')
        .update(dbUpdates)
        .eq('id', leadId)
        .eq('user_id', user.id)

      if (error) throw error

      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
      return { success: true }
    } catch (err) {
      console.error('Error updating lead:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update lead' }
    }
  }, [supabase])

  const deleteLead = useCallback(async (leadId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Soft delete
      const { error } = await supabase
        .from('crm_contacts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', leadId)
        .eq('user_id', user.id)

      if (error) throw error

      setLeads(prev => prev.filter(l => l.id !== leadId))
      return { success: true }
    } catch (err) {
      console.error('Error deleting lead:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete lead' }
    }
  }, [supabase])

  const convertLead = useCallback(async (leadId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const lead = leads.find(l => l.id === leadId)
      if (!lead) return { success: false, error: 'Lead not found' }

      // Update the contact type to 'customer'
      const { error: updateError } = await supabase
        .from('crm_contacts')
        .update({
          contact_type: 'customer',
          status: 'active',
          lead_status: 'won',
          conversion_date: new Date().toISOString(),
        })
        .eq('id', leadId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Create a new deal for the converted lead
      const { data: dealData, error: dealError } = await supabase
        .from('crm_deals')
        .insert({
          user_id: user.id,
          contact_id: leadId,
          deal_name: `${lead.company || lead.name} Deal`,
          company_name: lead.company || lead.name,
          contact_name: lead.name,
          deal_stage: 'discovery',
          deal_value: lead.value,
          probability_percentage: 10,
          assigned_to: user.id,
          owner_name: 'You',
        })
        .select()
        .single()

      if (dealError) throw dealError

      // Update local state
      const newContact: Contact = {
        id: leadId,
        firstName: lead.name.split(' ')[0] || '',
        lastName: lead.name.split(' ').slice(1).join(' ') || '',
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        title: lead.title,
        type: 'customer',
        status: 'active',
        tags: lead.tags,
        deals: [dealData.id],
        totalValue: lead.value,
        leadScore: lead.score,
        createdAt: lead.createdAt,
        updatedAt: new Date().toISOString(),
      }

      const newDeal = mapDbDealToDeal(dealData)

      setContacts(prev => [newContact, ...prev])
      setDeals(prev => [newDeal, ...prev])
      setLeads(prev => prev.filter(l => l.id !== leadId))

      return { success: true, contact: newContact, deal: newDeal }
    } catch (err) {
      console.error('Error converting lead:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to convert lead' }
    }
  }, [supabase, leads])

  // ============================================================================
  // DEAL OPERATIONS
  // ============================================================================

  const createDeal = useCallback(async (data: Partial<Deal>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const stageMap: Record<string, string> = {
        'discovery': 'discovery',
        'qualification': 'qualification',
        'proposal': 'proposal',
        'negotiation': 'negotiation',
        'closed_won': 'closed-won',
        'closed_lost': 'closed-lost',
      }

      const { data: result, error } = await supabase
        .from('crm_deals')
        .insert({
          user_id: user.id,
          contact_id: data.contactId || null,
          deal_name: data.name,
          company_name: data.companyName || '',
          contact_name: data.contactName || '',
          deal_stage: stageMap[data.stage || 'discovery'] || 'discovery',
          deal_value: data.value || 0,
          probability_percentage: data.probability || 10,
          expected_close_date: data.expectedCloseDate || null,
          assigned_to: user.id,
          owner_name: data.assignedToName || 'You',
          description: data.notes || null,
        })
        .select()
        .single()

      if (error) throw error

      const newDeal = mapDbDealToDeal(result)
      setDeals(prev => [newDeal, ...prev])
      return { success: true, deal: newDeal }
    } catch (err) {
      console.error('Error creating deal:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create deal' }
    }
  }, [supabase])

  const updateDeal = useCallback(async (dealId: string, updates: Partial<Deal>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const stageMap: Record<string, string> = {
        'discovery': 'discovery',
        'qualification': 'qualification',
        'proposal': 'proposal',
        'negotiation': 'negotiation',
        'closed_won': 'closed-won',
        'closed_lost': 'closed-lost',
      }

      const dbUpdates: Record<string, any> = {}
      if (updates.name) dbUpdates.deal_name = updates.name
      if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName
      if (updates.contactName !== undefined) dbUpdates.contact_name = updates.contactName
      if (updates.stage) dbUpdates.deal_stage = stageMap[updates.stage] || updates.stage
      if (updates.value !== undefined) dbUpdates.deal_value = updates.value
      if (updates.probability !== undefined) dbUpdates.probability_percentage = updates.probability
      if (updates.expectedCloseDate !== undefined) dbUpdates.expected_close_date = updates.expectedCloseDate
      if (updates.actualCloseDate !== undefined) dbUpdates.actual_close_date = updates.actualCloseDate
      if (updates.notes !== undefined) dbUpdates.description = updates.notes
      if (updates.lostReason !== undefined) dbUpdates.lost_reason = updates.lostReason

      const { error } = await supabase
        .from('crm_deals')
        .update(dbUpdates)
        .eq('id', dealId)
        .eq('user_id', user.id)

      if (error) throw error

      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
      return { success: true }
    } catch (err) {
      console.error('Error updating deal:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update deal' }
    }
  }, [supabase])

  const deleteDeal = useCallback(async (dealId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Soft delete
      const { error } = await supabase
        .from('crm_deals')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', dealId)
        .eq('user_id', user.id)

      if (error) throw error

      setDeals(prev => prev.filter(d => d.id !== dealId))
      return { success: true }
    } catch (err) {
      console.error('Error deleting deal:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete deal' }
    }
  }, [supabase])

  const moveDeal = useCallback(async (dealId: string, newStage: DealStage) => {
    const probabilityMap: Record<DealStage, number> = {
      discovery: 10,
      qualification: 30,
      proposal: 60,
      negotiation: 80,
      closed_won: 100,
      closed_lost: 0,
    }

    return updateDeal(dealId, {
      stage: newStage,
      probability: probabilityMap[newStage],
      actualCloseDate: ['closed_won', 'closed_lost'].includes(newStage) ? new Date().toISOString() : undefined,
    })
  }, [updateDeal])

  const winDeal = useCallback(async (dealId: string) => {
    return moveDeal(dealId, 'closed_won')
  }, [moveDeal])

  const loseDeal = useCallback(async (dealId: string, reason?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('crm_deals')
        .update({
          deal_stage: 'closed-lost',
          probability_percentage: 0,
          actual_close_date: new Date().toISOString(),
          lost_reason: reason || null,
        })
        .eq('id', dealId)
        .eq('user_id', user.id)

      if (error) throw error

      setDeals(prev => prev.map(d => d.id === dealId ? {
        ...d,
        stage: 'closed_lost',
        probability: 0,
        actualCloseDate: new Date().toISOString(),
        lostReason: reason,
        updatedAt: new Date().toISOString(),
      } : d))

      return { success: true }
    } catch (err) {
      console.error('Error losing deal:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to lose deal' }
    }
  }, [supabase])

  // ============================================================================
  // CONTACT OPERATIONS
  // ============================================================================

  const createContact = useCallback(async (data: Partial<Contact>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('crm_contacts')
        .insert({
          user_id: user.id,
          contact_name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email,
          phone: data.phone || null,
          company_name: data.company || null,
          job_title: data.title || null,
          contact_type: data.type || 'customer',
          status: data.status || 'active',
          tags: data.tags || [],
          lead_score: data.leadScore || 50,
        })
        .select()
        .single()

      if (error) throw error

      const newContact = mapDbContactToContact(result)
      setContacts(prev => [newContact, ...prev])
      return { success: true, contact: newContact }
    } catch (err) {
      console.error('Error creating contact:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create contact' }
    }
  }, [supabase])

  const updateContact = useCallback(async (contactId: string, updates: Partial<Contact>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const dbUpdates: Record<string, any> = {}
      if (updates.firstName || updates.lastName) {
        dbUpdates.contact_name = `${updates.firstName || ''} ${updates.lastName || ''}`.trim()
      }
      if (updates.email) dbUpdates.email = updates.email
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone
      if (updates.company !== undefined) dbUpdates.company_name = updates.company
      if (updates.title !== undefined) dbUpdates.job_title = updates.title
      if (updates.type) dbUpdates.contact_type = updates.type
      if (updates.status) dbUpdates.status = updates.status
      if (updates.tags) dbUpdates.tags = updates.tags
      if (updates.leadScore !== undefined) dbUpdates.lead_score = updates.leadScore

      const { error } = await supabase
        .from('crm_contacts')
        .update(dbUpdates)
        .eq('id', contactId)
        .eq('user_id', user.id)

      if (error) throw error

      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
      return { success: true }
    } catch (err) {
      console.error('Error updating contact:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update contact' }
    }
  }, [supabase])

  const deleteContact = useCallback(async (contactId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Soft delete
      const { error } = await supabase
        .from('crm_contacts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', contactId)
        .eq('user_id', user.id)

      if (error) throw error

      setContacts(prev => prev.filter(c => c.id !== contactId))
      return { success: true }
    } catch (err) {
      console.error('Error deleting contact:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete contact' }
    }
  }, [supabase])

  // ============================================================================
  // ACTIVITY OPERATIONS
  // ============================================================================

  const createActivity = useCallback(async (data: Partial<Activity>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const typeMap: Record<string, string> = {
        'call': 'call',
        'email': 'email',
        'meeting': 'meeting',
        'note': 'note',
        'task': 'task',
        'follow_up': 'task',
      }

      const { data: result, error } = await supabase
        .from('crm_activities')
        .insert({
          user_id: user.id,
          type: typeMap[data.type || 'note'] || 'note',
          subject: data.subject,
          description: data.description || null,
          contact_id: data.relatedType === 'contact' ? data.relatedTo : null,
          deal_id: data.relatedType === 'deal' ? data.relatedTo : null,
          assigned_to: user.id,
          due_date: data.dueDate || null,
          status: 'pending',
          priority: 'medium',
        })
        .select()
        .single()

      if (error) throw error

      const newActivity = mapDbActivityToActivity(result)
      setActivities(prev => [newActivity, ...prev])
      return { success: true, activity: newActivity }
    } catch (err) {
      console.error('Error creating activity:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create activity' }
    }
  }, [supabase])

  const completeActivity = useCallback(async (activityId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('crm_activities')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', activityId)
        .eq('user_id', user.id)

      if (error) throw error

      setActivities(prev => prev.map(a => a.id === activityId ? { ...a, completedAt: new Date().toISOString() } : a))
      return { success: true }
    } catch (err) {
      console.error('Error completing activity:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to complete activity' }
    }
  }, [supabase])

  // ============================================================================
  // SEARCH AND FILTER
  // ============================================================================

  const search = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const refresh = useCallback(async () => {
    await fetchCRM()
  }, [fetchCRM])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial fetch
  useEffect(() => {
    fetchCRM()
  }, [fetchCRM])

  // Realtime subscriptions
  useEffect(() => {
    if (!enableRealtime) return

    let contactsChannel: RealtimeChannel | null = null
    let dealsChannel: RealtimeChannel | null = null
    let activitiesChannel: RealtimeChannel | null = null

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      contactsChannel = supabase
        .channel('crm_contacts_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_contacts' }, () => {
          fetchContacts().then(setContacts)
          fetchLeads().then(setLeads)
        })
        .subscribe()

      dealsChannel = supabase
        .channel('crm_deals_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_deals' }, () => {
          fetchDeals().then(setDeals)
        })
        .subscribe()

      activitiesChannel = supabase
        .channel('crm_activities_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_activities' }, () => {
          fetchActivities().then(setActivities)
        })
        .subscribe()
    }

    setupSubscriptions()

    return () => {
      if (contactsChannel) supabase.removeChannel(contactsChannel)
      if (dealsChannel) supabase.removeChannel(dealsChannel)
      if (activitiesChannel) supabase.removeChannel(activitiesChannel)
    }
  }, [enableRealtime, supabase, fetchContacts, fetchLeads, fetchDeals, fetchActivities])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads
    const q = searchQuery.toLowerCase()
    return leads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q)
    )
  }, [leads, searchQuery])

  const filteredDeals = useMemo(() => {
    if (!searchQuery) return deals
    const q = searchQuery.toLowerCase()
    return deals.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.contactName.toLowerCase().includes(q) ||
      d.companyName?.toLowerCase().includes(q)
    )
  }, [deals, searchQuery])

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts
    const q = searchQuery.toLowerCase()
    return contacts.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    )
  }, [contacts, searchQuery])

  const leadsByStatus = useMemo(() => {
    const grouped: Record<string, Lead[]> = {}
    leads.forEach(l => {
      if (!grouped[l.status]) grouped[l.status] = []
      grouped[l.status].push(l)
    })
    return grouped
  }, [leads])

  const dealsByStage = useMemo(() => {
    const grouped: Record<string, Deal[]> = {}
    deals.forEach(d => {
      if (!grouped[d.stage]) grouped[d.stage] = []
      grouped[d.stage].push(d)
    })
    return grouped
  }, [deals])

  const openDeals = useMemo(() => deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)), [deals])
  const wonDeals = useMemo(() => deals.filter(d => d.stage === 'closed_won'), [deals])
  const lostDeals = useMemo(() => deals.filter(d => d.stage === 'closed_lost'), [deals])
  const upcomingActivities = useMemo(() =>
    activities
      .filter(a => !a.completedAt && a.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()),
    [activities]
  )

  const leadStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
  const leadSources: LeadSource[] = ['website', 'referral', 'social', 'advertising', 'cold_outreach', 'event', 'other']
  const dealStages: DealStage[] = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
  const activityTypes: ActivityType[] = ['call', 'email', 'meeting', 'note', 'task', 'follow_up']

  return {
    // Data
    leads: filteredLeads,
    deals: filteredDeals,
    contacts: filteredContacts,
    pipelines,
    activities,
    stats,

    // Grouped data
    leadsByStatus,
    dealsByStage,
    openDeals,
    wonDeals,
    lostDeals,
    upcomingActivities,

    // Constants
    leadStatuses,
    leadSources,
    dealStages,
    activityTypes,

    // State
    isLoading,
    error,
    searchQuery,

    // Actions
    refresh,
    search,

    // Lead operations
    createLead,
    updateLead,
    deleteLead,
    convertLead,

    // Deal operations
    createDeal,
    updateDeal,
    deleteDeal,
    moveDeal,
    winDeal,
    loseDeal,

    // Contact operations
    createContact,
    updateContact,
    deleteContact,

    // Activity operations
    createActivity,
    completeActivity,
  }
}

export default useCRM
