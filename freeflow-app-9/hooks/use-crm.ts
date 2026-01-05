'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadSource = 'website' | 'referral' | 'social' | 'advertising' | 'cold_outreach' | 'event' | 'other'
export type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'follow_up'

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
  tags: string[]
  deals: string[]
  totalValue: number
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
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockLeads: Lead[] = [
  { id: 'lead-1', name: 'John Smith', email: 'john@techcorp.com', phone: '+1-555-0100', company: 'TechCorp', title: 'CTO', status: 'qualified', source: 'website', score: 85, assignedTo: 'user-1', assignedToName: 'Alex Chen', value: 50000, currency: 'USD', tags: ['enterprise', 'high-priority'], lastContactedAt: '2024-03-18', nextFollowUp: '2024-03-22', createdAt: '2024-03-10', updatedAt: '2024-03-18' },
  { id: 'lead-2', name: 'Sarah Johnson', email: 'sarah@startup.io', company: 'StartupIO', title: 'CEO', status: 'contacted', source: 'referral', score: 72, assignedTo: 'user-2', assignedToName: 'Sarah Miller', value: 25000, currency: 'USD', tags: ['startup'], lastContactedAt: '2024-03-15', createdAt: '2024-03-12', updatedAt: '2024-03-15' },
  { id: 'lead-3', name: 'Mike Wilson', email: 'mike@agency.com', phone: '+1-555-0200', company: 'Creative Agency', title: 'Director', status: 'new', source: 'social', score: 45, value: 15000, currency: 'USD', tags: ['agency'], createdAt: '2024-03-18', updatedAt: '2024-03-18' }
]

const mockDeals: Deal[] = [
  { id: 'deal-1', name: 'TechCorp Enterprise Package', contactId: 'contact-1', contactName: 'John Smith', companyName: 'TechCorp', stage: 'proposal', value: 50000, currency: 'USD', probability: 60, expectedCloseDate: '2024-04-15', assignedTo: 'user-1', assignedToName: 'Alex Chen', products: [{ id: 'p1', name: 'Enterprise License', quantity: 1, unitPrice: 40000, discount: 0, total: 40000 }, { id: 'p2', name: 'Support Package', quantity: 1, unitPrice: 10000, discount: 0, total: 10000 }], activities: [], createdAt: '2024-03-10', updatedAt: '2024-03-18' },
  { id: 'deal-2', name: 'StartupIO Starter', contactId: 'contact-2', contactName: 'Sarah Johnson', companyName: 'StartupIO', stage: 'discovery', value: 25000, currency: 'USD', probability: 30, assignedTo: 'user-2', assignedToName: 'Sarah Miller', products: [], activities: [], createdAt: '2024-03-15', updatedAt: '2024-03-18' }
]

const mockContacts: Contact[] = [
  { id: 'contact-1', firstName: 'John', lastName: 'Smith', email: 'john@techcorp.com', phone: '+1-555-0100', company: 'TechCorp', title: 'CTO', tags: ['enterprise'], deals: ['deal-1'], totalValue: 50000, lastActivity: '2024-03-18', createdAt: '2024-03-10', updatedAt: '2024-03-18' },
  { id: 'contact-2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@startup.io', company: 'StartupIO', title: 'CEO', tags: ['startup'], deals: ['deal-2'], totalValue: 25000, lastActivity: '2024-03-15', createdAt: '2024-03-12', updatedAt: '2024-03-15' }
]

const mockPipelines: Pipeline[] = [
  { id: 'pipe-1', name: 'Sales Pipeline', stages: [
    { id: 'stage-1', name: 'Discovery', order: 1, probability: 10, color: '#3b82f6', dealCount: 5, value: 125000 },
    { id: 'stage-2', name: 'Qualification', order: 2, probability: 30, color: '#22c55e', dealCount: 3, value: 75000 },
    { id: 'stage-3', name: 'Proposal', order: 3, probability: 60, color: '#f59e0b', dealCount: 2, value: 100000 },
    { id: 'stage-4', name: 'Negotiation', order: 4, probability: 80, color: '#8b5cf6', dealCount: 1, value: 40000 },
    { id: 'stage-5', name: 'Closed Won', order: 5, probability: 100, color: '#10b981', dealCount: 8, value: 320000 }
  ], isDefault: true, dealCount: 19, totalValue: 660000, createdAt: '2024-01-01' }
]

const mockStats: CRMStats = {
  totalLeads: 45,
  qualifiedLeads: 18,
  totalDeals: 19,
  openDeals: 11,
  wonDeals: 8,
  lostDeals: 3,
  totalValue: 660000,
  wonValue: 320000,
  winRate: 72.7,
  averageDealSize: 40000,
  salesCycle: 28
}

// ============================================================================
// HOOK
// ============================================================================

interface UseCRMOptions {
  
}

export function useCRM(options: UseCRMOptions = {}) {
  const {  } = options

  const [leads, setLeads] = useState<Lead[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<CRMStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCRM = useCallback(async () => {
    }, [])

  const updateLead = useCallback(async (leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
    return { success: true }
  }, [])

  const deleteLead = useCallback(async (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId))
    return { success: true }
  }, [])

  const convertLead = useCallback(async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return { success: false, error: 'Lead not found' }

    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      firstName: lead.name.split(' ')[0] || '',
      lastName: lead.name.split(' ').slice(1).join(' ') || '',
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      title: lead.title,
      tags: lead.tags,
      deals: [],
      totalValue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      name: `${lead.company || lead.name} Deal`,
      leadId,
      contactId: newContact.id,
      contactName: lead.name,
      companyName: lead.company,
      stage: 'discovery',
      value: lead.value,
      currency: lead.currency,
      probability: 10,
      assignedTo: lead.assignedTo || 'user-1',
      assignedToName: lead.assignedToName || 'You',
      products: [],
      activities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setContacts(prev => [newContact, ...prev])
    setDeals(prev => [newDeal, ...prev])
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'won' as const } : l))

    return { success: true, contact: newContact, deal: newDeal }
  }, [leads])

  // Deal operations
  const createDeal = useCallback(async (data: Partial<Deal>) => {
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      name: data.name || '',
      contactId: data.contactId || '',
      contactName: data.contactName || '',
      stage: data.stage || 'discovery',
      value: data.value || 0,
      currency: data.currency || 'USD',
      probability: data.probability || 10,
      assignedTo: data.assignedTo || 'user-1',
      assignedToName: data.assignedToName || 'You',
      products: data.products || [],
      activities: data.activities || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as Deal
    setDeals(prev => [newDeal, ...prev])
    return { success: true, deal: newDeal }
  }, [])

  const updateDeal = useCallback(async (dealId: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    return { success: true }
  }, [])

  const deleteDeal = useCallback(async (dealId: string) => {
    setDeals(prev => prev.filter(d => d.id !== dealId))
    return { success: true }
  }, [])

  const moveDeal = useCallback(async (dealId: string, newStage: DealStage) => {
    const pipeline = pipelines.find(p => p.isDefault)
    const stage = pipeline?.stages.find(s => s.name.toLowerCase().replace(' ', '_') === newStage)
    const probability = stage?.probability || 0

    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage, probability, updatedAt: new Date().toISOString() } : d))
    return { success: true }
  }, [pipelines])

  const winDeal = useCallback(async (dealId: string) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: 'closed_won' as const, probability: 100, actualCloseDate: new Date().toISOString(), updatedAt: new Date().toISOString() } : d))
    return { success: true }
  }, [])

  const loseDeal = useCallback(async (dealId: string, reason?: string) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: 'closed_lost' as const, probability: 0, actualCloseDate: new Date().toISOString(), lostReason: reason, updatedAt: new Date().toISOString() } : d))
    return { success: true }
  }, [])

  // Contact operations
  const createContact = useCallback(async (data: Partial<Contact>) => {
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      tags: data.tags || [],
      deals: [],
      totalValue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as Contact
    setContacts(prev => [newContact, ...prev])
    return { success: true, contact: newContact }
  }, [])

  const updateContact = useCallback(async (contactId: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    return { success: true }
  }, [])

  const deleteContact = useCallback(async (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId))
    return { success: true }
  }, [])

  // Activity operations
  const createActivity = useCallback(async (data: Partial<Activity>) => {
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      type: data.type || 'note',
      subject: data.subject || '',
      relatedTo: data.relatedTo || '',
      relatedType: data.relatedType || 'lead',
      assignedTo: data.assignedTo || 'user-1',
      assignedToName: data.assignedToName || 'You',
      createdBy: 'user-1',
      createdByName: 'You',
      createdAt: new Date().toISOString(),
      ...data
    } as Activity
    setActivities(prev => [newActivity, ...prev])
    return { success: true, activity: newActivity }
  }, [])

  const completeActivity = useCallback(async (activityId: string) => {
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, completedAt: new Date().toISOString() } : a))
    return { success: true }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchCRM()
  }, [fetchCRM])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads
    const q = searchQuery.toLowerCase()
    return leads.filter(l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q))
  }, [leads, searchQuery])

  const filteredDeals = useMemo(() => {
    if (!searchQuery) return deals
    const q = searchQuery.toLowerCase()
    return deals.filter(d => d.name.toLowerCase().includes(q) || d.contactName.toLowerCase().includes(q))
  }, [deals, searchQuery])

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
  const upcomingActivities = useMemo(() => activities.filter(a => !a.completedAt && a.dueDate).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()), [activities])

  const leadStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
  const leadSources: LeadSource[] = ['website', 'referral', 'social', 'advertising', 'cold_outreach', 'event', 'other']
  const dealStages: DealStage[] = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
  const activityTypes: ActivityType[] = ['call', 'email', 'meeting', 'note', 'task', 'follow_up']

  return {
    leads: filteredLeads, deals: filteredDeals, contacts, pipelines, activities, stats,
    leadsByStatus, dealsByStage, openDeals, wonDeals, lostDeals, upcomingActivities,
    leadStatuses, leadSources, dealStages, activityTypes,
    isLoading, error, searchQuery,
    refresh, createLead, updateLead, deleteLead, convertLead,
    createDeal, updateDeal, deleteDeal, moveDeal, winDeal, loseDeal,
    createContact, updateContact, deleteContact, createActivity, completeActivity, search
  }
}

export default useCRM
