/**
 * CRM Utilities
 * Helper functions and mock data for CRM system
 */

import {
  Contact,
  Deal,
  Pipeline,
  Activity,
  CRMStats,
  ContactType,
  LeadStatus,
  DealStage,
  Priority
} from './crm-types'

// MIGRATED: Batch #10 - Removed mock data, using database hooks
export const MOCK_CONTACTS: Contact[] = []

export const MOCK_DEALS: Deal[] = []

export const MOCK_PIPELINE: Pipeline = {
  id: 'pipeline-1',
  name: 'Sales Pipeline',
  description: 'Main sales pipeline',
  stages: [],
  deals: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  isDefault: true
}

export const MOCK_ACTIVITIES: Activity[] = []

export const MOCK_CRM_STATS: CRMStats = {
  totalContacts: 0,
  totalLeads: 0,
  totalDeals: 0,
  totalRevenue: 0,
  averageDealSize: 0,
  conversionRate: 0,
  pipelineValue: 0,
  wonDealsThisMonth: 0,
  lostDealsThisMonth: 0,
  activitiesThisWeek: 0,
  contactsByType: {
    lead: 0,
    prospect: 0,
    customer: 0,
    partner: 0,
    vendor: 0
  },
  leadsByStatus: {
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    won: 0,
    lost: 0
  },
  dealsByStage: {
    discovery: 0,
    qualification: 0,
    proposal: 0,
    negotiation: 0,
    'closed-won': 0,
    'closed-lost': 0
  },
  revenueByMonth: []
}

// Helper Functions
export function getContactTypeColor(type: ContactType): string {
  const colors: Record<ContactType, string> = {
    lead: 'bg-blue-100 text-blue-700',
    prospect: 'bg-purple-100 text-purple-700',
    customer: 'bg-green-100 text-green-700',
    partner: 'bg-yellow-100 text-yellow-700',
    vendor: 'bg-gray-100 text-gray-700'
  }
  return colors[type]
}

export function getLeadStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-indigo-100 text-indigo-700',
    qualified: 'bg-purple-100 text-purple-700',
    proposal: 'bg-yellow-100 text-yellow-700',
    negotiation: 'bg-orange-100 text-orange-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700'
  }
  return colors[status]
}

export function getDealStageColor(stage: DealStage): string {
  const colors: Record<DealStage, string> = {
    discovery: 'bg-blue-100 text-blue-700',
    qualification: 'bg-purple-100 text-purple-700',
    proposal: 'bg-yellow-100 text-yellow-700',
    negotiation: 'bg-orange-100 text-orange-700',
    'closed-won': 'bg-green-100 text-green-700',
    'closed-lost': 'bg-red-100 text-red-700'
  }
  return colors[stage]
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    low: 'text-gray-500',
    medium: 'text-blue-500',
    high: 'text-orange-500',
    urgent: 'text-red-500'
  }
  return colors[priority]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function calculateDealTotal(products: Deal['products']): number {
  return products.reduce((sum, product) => sum + product.total, 0)
}

export function getLeadTemperature(score: number): 'cold' | 'warm' | 'hot' {
  if (score >= 80) return 'hot'
  if (score >= 50) return 'warm'
  return 'cold'
}

export function calculateConversionRate(won: number, total: number): number {
  if (total === 0) return 0
  return Math.round((won / total) * 100)
}

export function getDaysUntilClose(date: Date): number {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function formatDaysUntilClose(date: Date): string {
  const days = getDaysUntilClose(date)
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `${days} days`
}

export function filterContacts(contacts: Contact[], filters: any): Contact[] {
  return contacts.filter(contact => {
    if (filters.type && filters.type.length > 0 && !filters.type.includes(contact.type)) return false
    if (filters.status && filters.status.length > 0 && !filters.status.includes(contact.leadStatus)) return false
    if (filters.source && filters.source.length > 0 && !filters.source.includes(contact.leadSource)) return false
    if (filters.assignedTo && filters.assignedTo.length > 0 && !filters.assignedTo.includes(contact.assignedTo)) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        contact.firstName.toLowerCase().includes(search) ||
        contact.lastName.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        contact.company?.toLowerCase().includes(search)
      )
    }
    return true
  })
}

export function sortContacts(contacts: Contact[], sortBy: string): Contact[] {
  const sorted = [...contacts]

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.displayName.localeCompare(b.displayName))
    case 'score':
      return sorted.sort((a, b) => b.leadScore - a.leadScore)
    case 'recent':
      return sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    case 'value':
      return sorted.sort((a, b) => b.metadata.lifetimeValue - a.metadata.lifetimeValue)
    default:
      return sorted
  }
}

export function filterDeals(deals: Deal[], filters: any): Deal[] {
  return deals.filter(deal => {
    if (filters.stage && filters.stage.length > 0 && !filters.stage.includes(deal.stage)) return false
    if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(deal.priority)) return false
    if (filters.assignedTo && filters.assignedTo.length > 0 && !filters.assignedTo.includes(deal.assignedTo)) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        deal.name.toLowerCase().includes(search) ||
        deal.companyName.toLowerCase().includes(search)
      )
    }
    return true
  })
}

export function sortDeals(deals: Deal[], sortBy: string): Deal[] {
  const sorted = [...deals]

  switch (sortBy) {
    case 'value':
      return sorted.sort((a, b) => b.value - a.value)
    case 'probability':
      return sorted.sort((a, b) => b.probability - a.probability)
    case 'closeDate':
      return sorted.sort((a, b) => a.expectedCloseDate.getTime() - b.expectedCloseDate.getTime())
    case 'recent':
      return sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    default:
      return sorted
  }
}

export function getActivityIcon(type: Activity['type']): string {
  const icons = {
    call: '📞',
    email: '✉️',
    meeting: '🤝',
    task: '✓',
    note: '📝',
    'deal-update': '💼'
  }
  return icons[type] || '📋'
}

export function calculatePipelineMetrics(pipeline: Pipeline) {
  const totalValue = pipeline.stages.reduce((sum, stage) => sum + stage.totalValue, 0)
  const totalDeals = pipeline.stages.reduce((sum, stage) => sum + stage.dealCount, 0)
  const weightedValue = pipeline.stages.reduce(
    (sum, stage) => sum + (stage.totalValue * stage.probability / 100),
    0
  )

  return {
    totalValue,
    totalDeals,
    weightedValue,
    averageDealSize: totalDeals > 0 ? totalValue / totalDeals : 0
  }
}
