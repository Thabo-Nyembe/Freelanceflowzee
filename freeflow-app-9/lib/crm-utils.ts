/**
 * CRM Utilities
 * Helper functions and mock data for CRM system
 */

import {
  Contact,
  Lead,
  Deal,
  Pipeline,
  Activity,
  CRMStats,
  ContactType,
  LeadStatus,
  LeadSource,
  DealStage,
  Priority
} from './crm-types'

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'contact-1',
    type: 'customer',
    firstName: 'John',
    lastName: 'Smith',
    displayName: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Inc',
    jobTitle: 'CEO',
    leadStatus: 'won',
    leadSource: 'referral',
    leadScore: 95,
    tags: ['enterprise', 'high-value', 'tech'],
    customFields: {},
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA'
    },
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/johnsmith',
      twitter: '@johnsmith'
    },
    createdAt: new Date(Date.now() - 86400000 * 180),
    updatedAt: new Date(),
    lastContactedAt: new Date(Date.now() - 86400000 * 3),
    assignedTo: 'user-1',
    ownedBy: 'user-1',
    metadata: {
      totalDeals: 3,
      totalRevenue: 150000,
      averageDealSize: 50000,
      conversionRate: 75,
      lifetimeValue: 150000,
      totalInteractions: 24,
      lastInteractionType: 'meeting',
      emailsOpened: 18,
      emailsClicked: 12
    }
  },
  {
    id: 'contact-2',
    type: 'lead',
    firstName: 'Sarah',
    lastName: 'Johnson',
    displayName: 'Sarah Johnson',
    email: 'sarah.j@startup.io',
    phone: '+1 (555) 234-5678',
    company: 'Startup.io',
    jobTitle: 'Founder',
    leadStatus: 'qualified',
    leadSource: 'website',
    leadScore: 78,
    tags: ['startup', 'saas', 'warm'],
    customFields: {},
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    lastContactedAt: new Date(Date.now() - 86400000 * 2),
    assignedTo: 'user-2',
    ownedBy: 'user-2',
    metadata: {
      totalDeals: 1,
      totalRevenue: 0,
      averageDealSize: 0,
      conversionRate: 0,
      lifetimeValue: 0,
      totalInteractions: 8,
      lastInteractionType: 'email',
      emailsOpened: 5,
      emailsClicked: 3
    }
  },
  {
    id: 'contact-3',
    type: 'prospect',
    firstName: 'Michael',
    lastName: 'Chen',
    displayName: 'Michael Chen',
    email: 'mchen@agency.com',
    phone: '+1 (555) 345-6789',
    company: 'Creative Agency',
    jobTitle: 'Creative Director',
    leadStatus: 'proposal',
    leadSource: 'social-media',
    leadScore: 85,
    tags: ['agency', 'creative', 'hot'],
    customFields: {},
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000),
    lastContactedAt: new Date(Date.now() - 86400000),
    assignedTo: 'user-1',
    ownedBy: 'user-1',
    metadata: {
      totalDeals: 1,
      totalRevenue: 0,
      averageDealSize: 35000,
      conversionRate: 0,
      lifetimeValue: 0,
      totalInteractions: 12,
      lastInteractionType: 'call',
      emailsOpened: 8,
      emailsClicked: 6
    }
  }
]

export const MOCK_DEALS: Deal[] = [
  {
    id: 'deal-1',
    name: 'Enterprise Platform Deal',
    contactId: 'contact-1',
    companyName: 'TechCorp Inc',
    stage: 'closed-won',
    value: 75000,
    probability: 100,
    expectedCloseDate: new Date(Date.now() - 86400000 * 30),
    actualCloseDate: new Date(Date.now() - 86400000 * 30),
    priority: 'high',
    description: 'Annual enterprise platform subscription',
    products: [
      {
        id: 'prod-1',
        name: 'Enterprise License',
        quantity: 1,
        unitPrice: 75000,
        discount: 0,
        tax: 0,
        total: 75000
      }
    ],
    assignedTo: 'user-1',
    ownedBy: 'user-1',
    tags: ['enterprise', 'annual'],
    customFields: {},
    createdAt: new Date(Date.now() - 86400000 * 90),
    updatedAt: new Date(Date.now() - 86400000 * 30),
    wonReason: 'Great product fit, competitive pricing'
  },
  {
    id: 'deal-2',
    name: 'Startup Growth Package',
    contactId: 'contact-2',
    companyName: 'Startup.io',
    stage: 'proposal',
    value: 25000,
    probability: 60,
    expectedCloseDate: new Date(Date.now() + 86400000 * 15),
    priority: 'medium',
    description: 'Growth package for scaling startup',
    products: [
      {
        id: 'prod-2',
        name: 'Growth Package',
        quantity: 1,
        unitPrice: 25000,
        discount: 2500,
        tax: 0,
        total: 22500
      }
    ],
    assignedTo: 'user-2',
    ownedBy: 'user-2',
    tags: ['startup', 'growth'],
    customFields: {},
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: 'deal-3',
    name: 'Agency Creative Suite',
    contactId: 'contact-3',
    companyName: 'Creative Agency',
    stage: 'negotiation',
    value: 35000,
    probability: 75,
    expectedCloseDate: new Date(Date.now() + 86400000 * 10),
    priority: 'high',
    description: 'Full creative suite for agency team',
    products: [
      {
        id: 'prod-3',
        name: 'Creative Suite',
        quantity: 1,
        unitPrice: 35000,
        discount: 0,
        tax: 0,
        total: 35000
      }
    ],
    assignedTo: 'user-1',
    ownedBy: 'user-1',
    tags: ['agency', 'creative'],
    customFields: {},
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000)
  }
]

export const MOCK_PIPELINE: Pipeline = {
  id: 'pipeline-1',
  name: 'Sales Pipeline',
  description: 'Main sales pipeline',
  stages: [
    {
      id: 'stage-1',
      name: 'Discovery',
      order: 1,
      probability: 10,
      color: '#3b82f6',
      dealCount: 5,
      totalValue: 50000
    },
    {
      id: 'stage-2',
      name: 'Qualification',
      order: 2,
      probability: 25,
      color: '#8b5cf6',
      dealCount: 4,
      totalValue: 80000
    },
    {
      id: 'stage-3',
      name: 'Proposal',
      order: 3,
      probability: 50,
      color: '#f59e0b',
      dealCount: 3,
      totalValue: 95000
    },
    {
      id: 'stage-4',
      name: 'Negotiation',
      order: 4,
      probability: 75,
      color: '#10b981',
      dealCount: 2,
      totalValue: 70000
    },
    {
      id: 'stage-5',
      name: 'Closed Won',
      order: 5,
      probability: 100,
      color: '#22c55e',
      dealCount: 8,
      totalValue: 320000
    },
    {
      id: 'stage-6',
      name: 'Closed Lost',
      order: 6,
      probability: 0,
      color: '#ef4444',
      dealCount: 3,
      totalValue: 0
    }
  ],
  deals: MOCK_DEALS,
  createdAt: new Date(Date.now() - 86400000 * 365),
  updatedAt: new Date(),
  isDefault: true
}

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'activity-1',
    type: 'meeting',
    subject: 'Product Demo with TechCorp',
    description: 'Showcase enterprise features',
    contactId: 'contact-1',
    dealId: 'deal-1',
    assignedTo: 'user-1',
    dueDate: new Date(Date.now() + 86400000 * 2),
    priority: 'high',
    status: 'pending',
    duration: 60,
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date()
  },
  {
    id: 'activity-2',
    type: 'call',
    subject: 'Follow-up call with Sarah',
    contactId: 'contact-2',
    dealId: 'deal-2',
    assignedTo: 'user-2',
    dueDate: new Date(Date.now() + 86400000),
    priority: 'medium',
    status: 'pending',
    duration: 30,
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date()
  }
]

export const MOCK_CRM_STATS: CRMStats = {
  totalContacts: 248,
  totalLeads: 89,
  totalDeals: 45,
  totalRevenue: 1250000,
  averageDealSize: 27778,
  conversionRate: 32,
  pipelineValue: 495000,
  wonDealsThisMonth: 8,
  lostDealsThisMonth: 2,
  activitiesThisWeek: 24,
  contactsByType: {
    lead: 89,
    prospect: 67,
    customer: 78,
    partner: 10,
    vendor: 4
  },
  leadsByStatus: {
    new: 25,
    contacted: 18,
    qualified: 22,
    proposal: 12,
    negotiation: 8,
    won: 78,
    lost: 45
  },
  dealsByStage: {
    discovery: 5,
    qualification: 8,
    proposal: 12,
    negotiation: 6,
    'closed-won': 78,
    'closed-lost': 12
  },
  revenueByMonth: [
    { month: 'Jan', revenue: 85000 },
    { month: 'Feb', revenue: 95000 },
    { month: 'Mar', revenue: 120000 },
    { month: 'Apr', revenue: 110000 },
    { month: 'May', revenue: 135000 },
    { month: 'Jun', revenue: 125000 }
  ]
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
