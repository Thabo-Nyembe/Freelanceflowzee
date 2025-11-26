/**
 * Clients & CRM Utilities
 *
 * Comprehensive utilities for client relationship management (CRM).
 * Production-ready with real mock data and full TypeScript support.
 *
 * Features:
 * - Client management and tracking
 * - Contact information and communication history
 * - Project association and revenue tracking
 * - Lead scoring and qualification
 * - Activity timeline and notes
 * - Tags and categorization
 * - Health score calculation
 * - Analytics and reporting
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ClientsUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ClientStatus = 'active' | 'inactive' | 'lead' | 'prospect' | 'churned' | 'vip'
export type ClientType = 'individual' | 'business' | 'enterprise' | 'agency' | 'nonprofit'
export type ClientPriority = 'low' | 'medium' | 'high' | 'urgent'
export type CommunicationType = 'email' | 'phone' | 'meeting' | 'video_call' | 'message' | 'note'
export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note' | 'deal' | 'project_start' | 'project_end'

export interface Client {
  id: string
  userId: string

  // Basic Info
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  avatar?: string

  // Classification
  status: ClientStatus
  type: ClientType
  priority: ClientPriority

  // Location
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  timezone?: string

  // Business Info
  website?: string
  industry?: string
  companySize?: string

  // Financial
  totalRevenue: number
  lifetime Value: number
  averageProjectValue: number
  currency: string

  // Metrics
  projectsCount: number
  completedProjects: number
  activeProjects: number
  healthScore: number // 0-100
  leadScore: number // 0-100
  satisfactionScore: number // 1-5

  // Engagement
  lastContact?: Date
  nextFollowUp?: Date
  communicationFrequency: number // days

  // Tags & Categories
  tags: string[]
  categories: string[]

  // Social
  linkedinUrl?: string
  twitterUrl?: string
  facebookUrl?: string

  // Notes
  notes?: string
  internalNotes?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastActivityAt?: Date

  // Metadata
  metadata?: ClientMetadata
}

export interface ClientMetadata {
  source?: string // How they found you
  referredBy?: string
  preferredContact?: CommunicationType
  language?: string
  customFields?: Record<string, any>
  automationTags?: string[]
  segments?: string[]
}

export interface ClientProject {
  id: string
  clientId: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'cancelled' | 'on_hold'
  value: number
  currency: string
  startDate: Date
  endDate?: Date
  completedAt?: Date
}

export interface ClientCommunication {
  id: string
  clientId: string
  userId: string
  type: CommunicationType
  subject: string
  content: string
  direction: 'inbound' | 'outbound'
  timestamp: Date
  duration?: number // in minutes for calls/meetings
  attachments?: CommunicationAttachment[]
  metadata?: Record<string, any>
}

export interface CommunicationAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
}

export interface ClientActivity {
  id: string
  clientId: string
  userId?: string
  type: ActivityType
  title: string
  description?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ClientNote {
  id: string
  clientId: string
  userId: string
  content: string
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ClientStatistics {
  totalClients: number
  activeClients: number
  leadClients: number
  vipClients: number
  churnedClients: number
  totalRevenue: number
  averageClientValue: number
  averageHealthScore: number
  averageLeadScore: number
  topIndustries: IndustryStats[]
  topCountries: CountryStats[]
  clientsByType: TypeStats[]
  revenueByMonth: MonthlyRevenue[]
}

export interface IndustryStats {
  industry: string
  count: number
  revenue: number
  percentage: number
}

export interface CountryStats {
  country: string
  count: number
  revenue: number
  percentage: number
}

export interface TypeStats {
  type: ClientType
  count: number
  revenue: number
  percentage: number
}

export interface MonthlyRevenue {
  month: string
  year: number
  revenue: number
  clientsCount: number
  newClients: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'CLI-001',
    userId: 'USR-001',
    name: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Solutions',
    position: 'CTO',
    avatar: '/avatars/sarah.jpg',
    status: 'active',
    type: 'business',
    priority: 'high',
    address: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    postalCode: '94102',
    timezone: 'America/Los_Angeles',
    website: 'https://techcorp.com',
    industry: 'Technology',
    companySize: '50-200',
    totalRevenue: 145000,
    lifetimeValue: 145000,
    averageProjectValue: 48333,
    currency: 'USD',
    projectsCount: 3,
    completedProjects: 2,
    activeProjects: 1,
    healthScore: 95,
    leadScore: 90,
    satisfactionScore: 5,
    lastContact: new Date('2024-02-15'),
    nextFollowUp: new Date('2024-03-01'),
    communicationFrequency: 14,
    tags: ['enterprise', 'recurring', 'high-value'],
    categories: ['Technology', 'SaaS'],
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    twitterUrl: 'https://twitter.com/sarahj_tech',
    notes: 'Excellent client. Always pays on time. Looking to expand to mobile apps.',
    internalNotes: 'VIP client - prioritize all requests',
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2024-02-15'),
    lastActivityAt: new Date('2024-02-15'),
    metadata: {
      source: 'Referral',
      referredBy: 'John Smith',
      preferredContact: 'email',
      language: 'en',
      segments: ['High Value', 'Tech Industry', 'West Coast']
    }
  },
  {
    id: 'CLI-002',
    userId: 'USR-001',
    name: 'Michael Chen',
    email: 'michael@designstudio.com',
    phone: '+1 (555) 234-5678',
    company: 'Design Studio Pro',
    position: 'Creative Director',
    avatar: '/avatars/michael.jpg',
    status: 'active',
    type: 'business',
    priority: 'medium',
    address: '456 Creative Ave',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    postalCode: '10001',
    timezone: 'America/New_York',
    website: 'https://designstudiopro.com',
    industry: 'Design & Creative',
    companySize: '10-50',
    totalRevenue: 87000,
    lifetimeValue: 87000,
    averageProjectValue: 29000,
    currency: 'USD',
    projectsCount: 3,
    completedProjects: 2,
    activeProjects: 1,
    healthScore: 85,
    leadScore: 75,
    satisfactionScore: 4,
    lastContact: new Date('2024-02-10'),
    nextFollowUp: new Date('2024-02-25'),
    communicationFrequency: 21,
    tags: ['design', 'creative', 'agency'],
    categories: ['Design', 'Marketing'],
    linkedinUrl: 'https://linkedin.com/in/michaelchen',
    notes: 'Great communication. Prefers video calls for planning.',
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2024-02-10'),
    lastActivityAt: new Date('2024-02-10'),
    metadata: {
      source: 'Website',
      preferredContact: 'video_call',
      language: 'en',
      segments: ['Creative Industry', 'East Coast']
    }
  },
  {
    id: 'CLI-003',
    userId: 'USR-001',
    name: 'Emma Williams',
    email: 'emma@startup-xyz.com',
    phone: '+1 (555) 345-6789',
    company: 'StartupXYZ',
    position: 'Founder & CEO',
    avatar: '/avatars/emma.jpg',
    status: 'vip',
    type: 'business',
    priority: 'urgent',
    address: '789 Innovation Blvd',
    city: 'Austin',
    state: 'TX',
    country: 'United States',
    postalCode: '78701',
    timezone: 'America/Chicago',
    website: 'https://startupxyz.com',
    industry: 'Startups',
    companySize: '1-10',
    totalRevenue: 215000,
    lifetimeValue: 215000,
    averageProjectValue: 53750,
    currency: 'USD',
    projectsCount: 4,
    completedProjects: 3,
    activeProjects: 1,
    healthScore: 98,
    leadScore: 95,
    satisfactionScore: 5,
    lastContact: new Date('2024-02-18'),
    nextFollowUp: new Date('2024-02-22'),
    communicationFrequency: 7,
    tags: ['vip', 'startup', 'high-growth', 'long-term'],
    categories: ['Technology', 'Startups'],
    linkedinUrl: 'https://linkedin.com/in/emmawilliams',
    twitterUrl: 'https://twitter.com/emma_startup',
    notes: 'VIP client. Fast-growing startup. Multiple ongoing projects.',
    internalNotes: 'Top priority - assign best team members',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-02-18'),
    lastActivityAt: new Date('2024-02-18'),
    metadata: {
      source: 'LinkedIn',
      preferredContact: 'message',
      language: 'en',
      segments: ['VIP', 'Startup', 'High Growth', 'Central Time']
    }
  },
  {
    id: 'CLI-004',
    userId: 'USR-001',
    name: 'David Martinez',
    email: 'david@ecommerce-plus.com',
    phone: '+1 (555) 456-7890',
    company: 'E-commerce Plus',
    position: 'Operations Manager',
    status: 'active',
    type: 'business',
    priority: 'medium',
    city: 'Chicago',
    state: 'IL',
    country: 'United States',
    timezone: 'America/Chicago',
    website: 'https://ecommerceplus.com',
    industry: 'E-commerce',
    companySize: '50-200',
    totalRevenue: 62000,
    lifetimeValue: 62000,
    averageProjectValue: 31000,
    currency: 'USD',
    projectsCount: 2,
    completedProjects: 1,
    activeProjects: 1,
    healthScore: 80,
    leadScore: 70,
    satisfactionScore: 4,
    lastContact: new Date('2024-02-05'),
    nextFollowUp: new Date('2024-03-05'),
    communicationFrequency: 30,
    tags: ['ecommerce', 'retail'],
    categories: ['E-commerce', 'Retail'],
    notes: 'Seasonal projects. High volume during Q4.',
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-02-05'),
    lastActivityAt: new Date('2024-02-05'),
    metadata: {
      source: 'Google Ads',
      preferredContact: 'email',
      language: 'en',
      segments: ['E-commerce', 'Seasonal']
    }
  },
  {
    id: 'CLI-005',
    userId: 'USR-001',
    name: 'Lisa Anderson',
    email: 'lisa@nonprofit-org.org',
    phone: '+1 (555) 567-8901',
    company: 'NonProfit Foundation',
    position: 'Executive Director',
    status: 'active',
    type: 'nonprofit',
    priority: 'low',
    city: 'Seattle',
    state: 'WA',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    website: 'https://nonprofitfoundation.org',
    industry: 'NonProfit',
    companySize: '10-50',
    totalRevenue: 28000,
    lifetimeValue: 28000,
    averageProjectValue: 14000,
    currency: 'USD',
    projectsCount: 2,
    completedProjects: 2,
    activeProjects: 0,
    healthScore: 75,
    leadScore: 60,
    satisfactionScore: 5,
    lastContact: new Date('2024-01-15'),
    nextFollowUp: new Date('2024-04-01'),
    communicationFrequency: 60,
    tags: ['nonprofit', 'education', 'social-impact'],
    categories: ['NonProfit', 'Education'],
    notes: 'Budget-conscious. Mission-driven work.',
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date('2024-01-15'),
    lastActivityAt: new Date('2024-01-15'),
    metadata: {
      source: 'Referral',
      preferredContact: 'email',
      language: 'en',
      segments: ['NonProfit', 'Education']
    }
  },
  {
    id: 'CLI-006',
    userId: 'USR-001',
    name: 'James Wilson',
    email: 'james@consulting-firm.com',
    company: 'Wilson Consulting Group',
    position: 'Managing Partner',
    status: 'lead',
    type: 'business',
    priority: 'high',
    city: 'Boston',
    state: 'MA',
    country: 'United States',
    timezone: 'America/New_York',
    industry: 'Consulting',
    companySize: '200-500',
    totalRevenue: 0,
    lifetimeValue: 0,
    averageProjectValue: 0,
    currency: 'USD',
    projectsCount: 0,
    completedProjects: 0,
    activeProjects: 0,
    healthScore: 65,
    leadScore: 85,
    satisfactionScore: 0,
    lastContact: new Date('2024-02-18'),
    nextFollowUp: new Date('2024-02-23'),
    communicationFrequency: 5,
    tags: ['lead', 'enterprise', 'high-potential'],
    categories: ['Consulting', 'Professional Services'],
    notes: 'Promising lead. Interested in comprehensive rebranding.',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-18'),
    lastActivityAt: new Date('2024-02-18'),
    metadata: {
      source: 'Cold Outreach',
      preferredContact: 'phone',
      language: 'en',
      segments: ['Lead', 'Enterprise', 'East Coast']
    }
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get clients with optional filtering
 */
export function getClients(
  userId?: string,
  filters?: {
    status?: ClientStatus
    type?: ClientType
    priority?: ClientPriority
    tags?: string[]
    minRevenue?: number
    minHealthScore?: number
  }
): Client[] {
  logger.debug('Getting clients', { userId, filters })

  let clients = [...MOCK_CLIENTS]

  if (userId) {
    clients = clients.filter(c => c.userId === userId)
  }

  if (filters?.status) {
    clients = clients.filter(c => c.status === filters.status)
  }

  if (filters?.type) {
    clients = clients.filter(c => c.type === filters.type)
  }

  if (filters?.priority) {
    clients = clients.filter(c => c.priority === filters.priority)
  }

  if (filters?.tags && filters.tags.length > 0) {
    clients = clients.filter(c =>
      filters.tags!.some(tag => c.tags.includes(tag))
    )
  }

  if (filters?.minRevenue) {
    clients = clients.filter(c => c.totalRevenue >= filters.minRevenue!)
  }

  if (filters?.minHealthScore) {
    clients = clients.filter(c => c.healthScore >= filters.minHealthScore!)
  }

  logger.debug('Clients filtered', { count: clients.length })
  return clients
}

/**
 * Get client by ID
 */
export function getClientById(clientId: string): Client | undefined {
  logger.debug('Getting client by ID', { clientId })
  const client = MOCK_CLIENTS.find(c => c.id === clientId)

  if (client) {
    logger.debug('Client found', { name: client.name })
  } else {
    logger.warn('Client not found', { clientId })
  }

  return client
}

/**
 * Create new client
 */
export function createClient(data: Partial<Client>): Client {
  logger.info('Creating client', {
    name: data.name,
    email: data.email,
    company: data.company
  })

  const client: Client = {
    id: `CLI-${String(MOCK_CLIENTS.length + 1).padStart(3, '0')}`,
    userId: data.userId || 'USR-001',
    name: data.name || 'Unknown Client',
    email: data.email || '',
    phone: data.phone,
    company: data.company,
    position: data.position,
    avatar: data.avatar,
    status: data.status || 'lead',
    type: data.type || 'individual',
    priority: data.priority || 'medium',
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    postalCode: data.postalCode,
    timezone: data.timezone,
    website: data.website,
    industry: data.industry,
    companySize: data.companySize,
    totalRevenue: data.totalRevenue || 0,
    lifetimeValue: data.lifetimeValue || 0,
    averageProjectValue: data.averageProjectValue || 0,
    currency: data.currency || 'USD',
    projectsCount: data.projectsCount || 0,
    completedProjects: data.completedProjects || 0,
    activeProjects: data.activeProjects || 0,
    healthScore: data.healthScore || 50,
    leadScore: data.leadScore || 50,
    satisfactionScore: data.satisfactionScore || 0,
    lastContact: data.lastContact,
    nextFollowUp: data.nextFollowUp,
    communicationFrequency: data.communicationFrequency || 30,
    tags: data.tags || [],
    categories: data.categories || [],
    linkedinUrl: data.linkedinUrl,
    twitterUrl: data.twitterUrl,
    facebookUrl: data.facebookUrl,
    notes: data.notes,
    internalNotes: data.internalNotes,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: data.lastActivityAt,
    metadata: data.metadata
  }

  logger.info('Client created', {
    id: client.id,
    name: client.name,
    company: client.company
  })

  return client
}

/**
 * Calculate health score based on various factors
 */
export function calculateHealthScore(client: Client): number {
  logger.debug('Calculating health score', { clientId: client.id })

  let score = 0

  // Revenue contribution (30 points)
  if (client.totalRevenue > 100000) score += 30
  else if (client.totalRevenue > 50000) score += 25
  else if (client.totalRevenue > 10000) score += 20
  else if (client.totalRevenue > 0) score += 10

  // Project activity (20 points)
  if (client.activeProjects > 0) score += 20
  else if (client.completedProjects > 5) score += 15
  else if (client.completedProjects > 0) score += 10

  // Communication frequency (20 points)
  const daysSinceContact = client.lastContact
    ? Math.floor((new Date().getTime() - new Date(client.lastContact).getTime()) / (1000 * 60 * 60 * 24))
    : 365

  if (daysSinceContact < 7) score += 20
  else if (daysSinceContact < 14) score += 15
  else if (daysSinceContact < 30) score += 10
  else if (daysSinceContact < 90) score += 5

  // Satisfaction (20 points)
  if (client.satisfactionScore === 5) score += 20
  else if (client.satisfactionScore === 4) score += 15
  else if (client.satisfactionScore === 3) score += 10
  else if (client.satisfactionScore > 0) score += 5

  // Status (10 points)
  if (client.status === 'vip') score += 10
  else if (client.status === 'active') score += 8
  else if (client.status === 'lead') score += 5

  logger.debug('Health score calculated', { clientId: client.id, score })
  return Math.min(score, 100)
}

/**
 * Calculate lead score based on qualification criteria
 */
export function calculateLeadScore(client: Client): number {
  logger.debug('Calculating lead score', { clientId: client.id })

  let score = 0

  // Company size (20 points)
  if (client.companySize === '200-500' || client.companySize === '500+') score += 20
  else if (client.companySize === '50-200') score += 15
  else if (client.companySize === '10-50') score += 10
  else if (client.companySize) score += 5

  // Industry fit (20 points)
  const highValueIndustries = ['Technology', 'Finance', 'Healthcare', 'E-commerce']
  if (client.industry && highValueIndustries.includes(client.industry)) score += 20
  else if (client.industry) score += 10

  // Engagement level (20 points)
  if (client.lastContact) {
    const daysSinceContact = Math.floor(
      (new Date().getTime() - new Date(client.lastContact).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceContact < 7) score += 20
    else if (daysSinceContact < 14) score += 15
    else if (daysSinceContact < 30) score += 10
  }

  // Budget indicators (20 points)
  if (client.totalRevenue > 50000) score += 20
  else if (client.totalRevenue > 10000) score += 15
  else if (client.totalRevenue > 0) score += 10

  // Decision maker (10 points)
  const decisionMakerTitles = ['CEO', 'CTO', 'CFO', 'Founder', 'Director', 'VP', 'President']
  if (client.position && decisionMakerTitles.some(title => client.position!.includes(title))) {
    score += 10
  }

  // Geographic location (10 points)
  const highValueCountries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia']
  if (client.country && highValueCountries.includes(client.country)) score += 10

  logger.debug('Lead score calculated', { clientId: client.id, score })
  return Math.min(score, 100)
}

/**
 * Calculate client statistics
 */
export function calculateClientStatistics(clients: Client[]): ClientStatistics {
  logger.debug('Calculating client statistics', { clientsCount: clients.length })

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === 'active').length
  const leadClients = clients.filter(c => c.status === 'lead').length
  const vipClients = clients.filter(c => c.status === 'vip').length
  const churnedClients = clients.filter(c => c.status === 'churned').length

  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0)
  const averageClientValue = totalClients > 0 ? totalRevenue / totalClients : 0

  const averageHealthScore = totalClients > 0
    ? clients.reduce((sum, c) => sum + c.healthScore, 0) / totalClients
    : 0

  const averageLeadScore = totalClients > 0
    ? clients.reduce((sum, c) => sum + c.leadScore, 0) / totalClients
    : 0

  // Top industries
  const industryMap = new Map<string, { count: number; revenue: number }>()
  clients.forEach(c => {
    if (c.industry) {
      const current = industryMap.get(c.industry) || { count: 0, revenue: 0 }
      industryMap.set(c.industry, {
        count: current.count + 1,
        revenue: current.revenue + c.totalRevenue
      })
    }
  })

  const topIndustries: IndustryStats[] = Array.from(industryMap.entries())
    .map(([industry, stats]) => ({
      industry,
      count: stats.count,
      revenue: stats.revenue,
      percentage: (stats.count / totalClients) * 100
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const stats: ClientStatistics = {
    totalClients,
    activeClients,
    leadClients,
    vipClients,
    churnedClients,
    totalRevenue,
    averageClientValue,
    averageHealthScore,
    averageLeadScore,
    topIndustries,
    topCountries: [],
    clientsByType: [],
    revenueByMonth: []
  }

  logger.debug('Client statistics calculated', stats)
  return stats
}

/**
 * Search clients
 */
export function searchClients(
  query: string,
  clients: Client[] = MOCK_CLIENTS
): Client[] {
  logger.debug('Searching clients', { query })

  const lowerQuery = query.toLowerCase()

  const results = clients.filter(client =>
    client.name.toLowerCase().includes(lowerQuery) ||
    client.email.toLowerCase().includes(lowerQuery) ||
    (client.company?.toLowerCase().includes(lowerQuery) || false) ||
    (client.phone?.toLowerCase().includes(lowerQuery) || false) ||
    client.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )

  logger.debug('Search completed', { query, resultsCount: results.length })
  return results
}

/**
 * Sort clients
 */
export function sortClients(
  clients: Client[],
  sortBy: 'name' | 'revenue' | 'health' | 'lead' | 'created' | 'lastContact',
  order: 'asc' | 'desc' = 'desc'
): Client[] {
  logger.debug('Sorting clients', { sortBy, order })

  const sorted = [...clients].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'revenue':
        comparison = a.totalRevenue - b.totalRevenue
        break
      case 'health':
        comparison = a.healthScore - b.healthScore
        break
      case 'lead':
        comparison = a.leadScore - b.leadScore
        break
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'lastContact':
        const aContact = a.lastContact ? new Date(a.lastContact).getTime() : 0
        const bContact = b.lastContact ? new Date(b.lastContact).getTime() : 0
        comparison = aContact - bContact
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  logger.debug('Clients sorted', { count: sorted.length })
  return sorted
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Get client status color
 */
export function getClientStatusColor(status: ClientStatus): string {
  const colors = {
    active: 'green',
    inactive: 'gray',
    lead: 'blue',
    prospect: 'purple',
    churned: 'red',
    vip: 'yellow'
  }

  return colors[status] || 'gray'
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: ClientPriority): string {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  }

  return colors[priority] || 'gray'
}

logger.info('Clients utilities initialized', {
  mockClients: MOCK_CLIENTS.length
})
