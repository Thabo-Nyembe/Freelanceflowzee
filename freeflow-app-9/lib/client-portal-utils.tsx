/**
 * 🏢 CLIENT PORTAL UTILITIES
 * Comprehensive utilities for client relationship management and portal access
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('Client-Portal-Utils')

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export type ClientStatus = 'active' | 'onboarding' | 'inactive' | 'churned'
export type ClientTier = 'basic' | 'standard' | 'premium' | 'enterprise'
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
export type CommunicationType = 'email' | 'call' | 'meeting' | 'message' | 'note'
export type FileCategory = 'contract' | 'invoice' | 'proposal' | 'report' | 'deliverable' | 'other'
export type AccessLevel = 'view' | 'comment' | 'edit' | 'admin'
export type HealthStatus = 'excellent' | 'good' | 'warning' | 'critical'

export interface PortalClient {
  id: string
  userId: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  website?: string
  status: ClientStatus
  tier: ClientTier
  activeProjects: number
  completedProjects: number
  totalRevenue: number
  monthlyRevenue: number
  healthScore: number
  healthStatus: HealthStatus
  lastContact: Date
  nextFollowUp: Date
  tags: string[]
  notes: string
  address?: string
  industry?: string
  companySize?: string
  timezone: string
  preferredContact: CommunicationType
  npsScore?: number
  satisfactionRating: number
  contractStartDate: Date
  contractEndDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PortalProject {
  id: string
  clientId: string
  userId: string
  name: string
  description: string
  status: ProjectStatus
  budget: number
  spent: number
  remaining: number
  progress: number
  startDate: Date
  endDate: Date
  deadline: Date
  team: string[]
  milestones: ProjectMilestone[]
  deliverables: string[]
  risks: ProjectRisk[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  tags: string[]
  isStarred: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMilestone {
  id: string
  title: string
  description: string
  dueDate: Date
  completed: boolean
  completedAt?: Date
  progress: number
}

export interface ProjectRisk {
  id: string
  type: 'budget' | 'timeline' | 'scope' | 'quality' | 'resource'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  mitigation: string
  status: 'open' | 'mitigated' | 'closed'
}

export interface PortalCommunication {
  id: string
  clientId: string
  userId: string
  type: CommunicationType
  subject: string
  content: string
  summary: string
  outcome?: string
  actionItems: string[]
  attachments: string[]
  participants: string[]
  duration?: number
  scheduledFor?: Date
  createdAt: Date
  createdBy: string
}

export interface PortalFile {
  id: string
  clientId: string
  projectId?: string
  userId: string
  name: string
  category: FileCategory
  size: number
  mimeType: string
  url: string
  accessLevel: AccessLevel
  uploadedAt: Date
  uploadedBy: string
  version: number
  versionHistory: FileVersion[]
  expiresAt?: Date
  isShared: boolean
  sharedWith: string[]
  downloadCount: number
  lastDownloaded?: Date
}

export interface FileVersion {
  version: number
  uploadedAt: Date
  uploadedBy: string
  size: number
  changes: string
}

export interface PortalInvoice {
  id: string
  clientId: string
  projectId?: string
  invoiceNumber: string
  amount: number
  tax: number
  total: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  items: InvoiceItem[]
  notes?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface ClientActivity {
  id: string
  clientId: string
  type: 'project' | 'communication' | 'file' | 'payment' | 'meeting' | 'milestone'
  title: string
  description: string
  timestamp: Date
  userId: string
  metadata?: Record<string, any>
}

export interface ClientMetrics {
  clientId: string
  totalRevenue: number
  averageProjectValue: number
  projectCompletionRate: number
  onTimeDeliveryRate: number
  clientSatisfaction: number
  communicationFrequency: number
  responseTime: number
  retentionScore: number
  growthRate: number
  lastUpdated: Date
}

// ============================================================================
// MOCK DATA - 20 Portal Clients
// ============================================================================

const companyNames = [
  'Acme Corporation', 'TechStart Inc', 'Global Dynamics', 'Innovate Labs',
  'Digital Solutions', 'Creative Agency', 'Enterprise Systems', 'Smart Tech',
  'Future Ventures', 'Prime Industries', 'Nexus Corp', 'Velocity Labs',
  'Quantum Systems', 'Stellar Group', 'Apex Solutions', 'Horizon Tech',
  'Summit Enterprises', 'Catalyst Inc', 'Momentum Digital', 'Zenith Partners'
]

const contactNames = [
  'John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'David Wilson',
  'Lisa Martinez', 'Robert Taylor', 'Jennifer Brown', 'William Garcia', 'Mary Lee'
]

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing',
  'Education', 'Real Estate', 'Legal', 'Marketing', 'Consulting'
]

export const mockPortalClients: PortalClient[] = Array.from({ length: 20 }, (_, i) => {
  const statuses: ClientStatus[] = ['active', 'active', 'active', 'onboarding', 'inactive']
  const tiers: ClientTier[] = ['basic', 'standard', 'premium', 'enterprise']
  const healthScores = [85, 90, 95, 75, 80, 70, 65, 88, 92, 78]

  const createdDate = new Date()
  createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365))

  const lastContactDate = new Date()
  lastContactDate.setDate(lastContactDate.getDate() - Math.floor(Math.random() * 30))

  const nextFollowUpDate = new Date()
  nextFollowUpDate.setDate(nextFollowUpDate.getDate() + Math.floor(Math.random() * 14))

  const contractStartDate = new Date(createdDate)
  const contractEndDate = new Date(contractStartDate)
  contractEndDate.setFullYear(contractEndDate.getFullYear() + 1)

  const healthScore = healthScores[i % healthScores.length]
  let healthStatus: HealthStatus
  if (healthScore >= 90) healthStatus = 'excellent'
  else if (healthScore >= 75) healthStatus = 'good'
  else if (healthScore >= 60) healthStatus = 'warning'
  else healthStatus = 'critical'

  return {
    id: `PC-${String(i + 1).padStart(4, '0')}`,
    userId: 'user_demo_123',
    companyName: companyNames[i % companyNames.length],
    contactPerson: contactNames[i % contactNames.length],
    email: `${contactNames[i % contactNames.length].toLowerCase().replace(' ', '.')}@${companyNames[i % companyNames.length].toLowerCase().replace(' ', '')}.com`,
    phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    website: `https://www.${companyNames[i % companyNames.length].toLowerCase().replace(' ', '')}.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    tier: tiers[Math.floor(Math.random() * tiers.length)],
    activeProjects: Math.floor(Math.random() * 5) + 1,
    completedProjects: Math.floor(Math.random() * 20) + 5,
    totalRevenue: Math.floor(Math.random() * 500000) + 50000,
    monthlyRevenue: Math.floor(Math.random() * 20000) + 5000,
    healthScore,
    healthStatus,
    lastContact: lastContactDate,
    nextFollowUp: nextFollowUpDate,
    tags: ['important', 'tech', 'enterprise', 'priority'].slice(0, Math.floor(Math.random() * 3) + 1),
    notes: `Key client in ${industries[i % industries.length]} sector. Regular communication and updates needed.`,
    address: `${Math.floor(Math.random() * 9999) + 1} Main St, City, State 12345`,
    industry: industries[i % industries.length],
    companySize: ['1-10', '11-50', '51-200', '201-500', '500+'][Math.floor(Math.random() * 5)],
    timezone: 'America/New_York',
    preferredContact: ['email', 'call', 'meeting'][Math.floor(Math.random() * 3)] as CommunicationType,
    npsScore: Math.floor(Math.random() * 5) + 6, // 6-10
    satisfactionRating: 3.5 + Math.random() * 1.5, // 3.5-5.0
    contractStartDate,
    contractEndDate,
    createdAt: createdDate,
    updatedAt: new Date()
  }
})

// ============================================================================
// MOCK DATA - 30 Portal Projects
// ============================================================================

const projectNames = [
  'Website Redesign', 'Mobile App Development', 'Brand Identity', 'Marketing Campaign',
  'System Integration', 'Data Migration', 'Cloud Infrastructure', 'Security Audit',
  'API Development', 'E-commerce Platform', 'CRM Implementation', 'Analytics Dashboard',
  'Payment Gateway', 'Content Management', 'Social Media Strategy', 'SEO Optimization'
]

export const mockPortalProjects: PortalProject[] = Array.from({ length: 30 }, (_, i) => {
  const statuses: ProjectStatus[] = ['planning', 'active', 'on-hold', 'completed', 'cancelled']
  const priorities = ['low', 'medium', 'high', 'critical'] as const

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60))

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 90) + 30)

  const budget = Math.floor(Math.random() * 100000) + 10000
  const spent = Math.floor(budget * (Math.random() * 0.8))
  const progress = Math.floor(Math.random() * 100)

  const client = mockPortalClients[i % mockPortalClients.length]

  return {
    id: `PP-${String(i + 1).padStart(4, '0')}`,
    clientId: client.id,
    userId: 'user_demo_123',
    name: projectNames[i % projectNames.length],
    description: `Comprehensive ${projectNames[i % projectNames.length]} project for ${client.companyName}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    budget,
    spent,
    remaining: budget - spent,
    progress,
    startDate,
    endDate,
    deadline: endDate,
    team: ['John Doe', 'Jane Smith', 'Bob Johnson'].slice(0, Math.floor(Math.random() * 3) + 1),
    milestones: [
      {
        id: 'M1',
        title: 'Phase 1: Discovery',
        description: 'Initial research and planning',
        dueDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        completed: progress > 25,
        completedAt: progress > 25 ? new Date() : undefined,
        progress: Math.min(100, progress * 4)
      },
      {
        id: 'M2',
        title: 'Phase 2: Development',
        description: 'Build and implementation',
        dueDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        completed: progress > 75,
        completedAt: progress > 75 ? new Date() : undefined,
        progress: Math.max(0, (progress - 25) * 2)
      }
    ],
    deliverables: ['Requirements Document', 'Design Mockups', 'Final Product', 'Documentation'],
    risks: [
      {
        id: 'R1',
        type: 'timeline',
        severity: 'medium',
        description: 'Potential delay in third-party integration',
        mitigation: 'Early coordination with vendor',
        status: 'open'
      }
    ],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    category: ['design', 'development', 'marketing', 'consulting'][Math.floor(Math.random() * 4)],
    tags: ['urgent', 'strategic', 'maintenance'].slice(0, Math.floor(Math.random() * 2) + 1),
    isStarred: Math.random() > 0.8,
    createdAt: startDate,
    updatedAt: new Date()
  }
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function getClientsByStatus(clients: PortalClient[], status: ClientStatus): PortalClient[] {
  logger.debug('Filtering clients by status', { status, totalClients: clients.length })
  return clients.filter(c => c.status === status)
}

export function getClientsByTier(clients: PortalClient[], tier: ClientTier): PortalClient[] {
  logger.debug('Filtering clients by tier', { tier, totalClients: clients.length })
  return clients.filter(c => c.tier === tier)
}

export function getClientsByHealthStatus(clients: PortalClient[], healthStatus: HealthStatus): PortalClient[] {
  logger.debug('Filtering clients by health status', { healthStatus, totalClients: clients.length })
  return clients.filter(c => c.healthStatus === healthStatus)
}

export function getActiveClients(clients: PortalClient[]): PortalClient[] {
  logger.debug('Getting active clients', { totalClients: clients.length })
  return clients.filter(c => c.status === 'active')
}

export function getClientsAtRisk(clients: PortalClient[]): PortalClient[] {
  logger.debug('Getting clients at risk', { totalClients: clients.length })
  return clients.filter(c => c.healthStatus === 'warning' || c.healthStatus === 'critical')
}

export function getTopRevenueClients(clients: PortalClient[], limit: number = 10): PortalClient[] {
  logger.debug('Getting top revenue clients', { limit, totalClients: clients.length })
  return [...clients].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, limit)
}

export function searchClients(clients: PortalClient[], query: string): PortalClient[] {
  const searchLower = query.toLowerCase()
  logger.debug('Searching clients', { query, totalClients: clients.length })

  return clients.filter(c =>
    c.companyName.toLowerCase().includes(searchLower) ||
    c.contactPerson.toLowerCase().includes(searchLower) ||
    c.email.toLowerCase().includes(searchLower) ||
    c.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
    (c.industry && c.industry.toLowerCase().includes(searchLower))
  )
}

export function sortClients(
  clients: PortalClient[],
  sortBy: 'name' | 'revenue' | 'health' | 'recent'
): PortalClient[] {
  logger.debug('Sorting clients', { sortBy, totalClients: clients.length })

  return [...clients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.companyName.localeCompare(b.companyName)
      case 'revenue':
        return b.totalRevenue - a.totalRevenue
      case 'health':
        return b.healthScore - a.healthScore
      case 'recent':
        return b.lastContact.getTime() - a.lastContact.getTime()
      default:
        return 0
    }
  })
}

export function getProjectsByStatus(projects: PortalProject[], status: ProjectStatus): PortalProject[] {
  logger.debug('Filtering projects by status', { status, totalProjects: projects.length })
  return projects.filter(p => p.status === status)
}

export function getProjectsByClient(projects: PortalProject[], clientId: string): PortalProject[] {
  logger.debug('Getting projects for client', { clientId, totalProjects: projects.length })
  return projects.filter(p => p.clientId === clientId)
}

export function getActiveProjects(projects: PortalProject[]): PortalProject[] {
  logger.debug('Getting active projects', { totalProjects: projects.length })
  return projects.filter(p => p.status === 'active')
}

export function getOverdueProjects(projects: PortalProject[]): PortalProject[] {
  const now = new Date()
  logger.debug('Getting overdue projects', { totalProjects: projects.length })
  return projects.filter(p => p.deadline < now && p.status !== 'completed')
}

export function getProjectsOverBudget(projects: PortalProject[]): PortalProject[] {
  logger.debug('Getting projects over budget', { totalProjects: projects.length })
  return projects.filter(p => p.spent > p.budget)
}

export function calculateClientHealth(client: PortalClient): {
  score: number
  status: HealthStatus
  factors: string[]
} {
  let score = 100
  const factors: string[] = []

  // Revenue trend
  if (client.monthlyRevenue < 1000) {
    score -= 20
    factors.push('Low monthly revenue')
  }

  // Communication frequency
  const daysSinceContact = Math.floor(
    (Date.now() - client.lastContact.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSinceContact > 30) {
    score -= 15
    factors.push('Infrequent communication')
  }

  // Active projects
  if (client.activeProjects === 0) {
    score -= 25
    factors.push('No active projects')
  }

  // Satisfaction rating
  if (client.satisfactionRating < 3.5) {
    score -= 20
    factors.push('Low satisfaction rating')
  }

  let status: HealthStatus
  if (score >= 90) status = 'excellent'
  else if (score >= 75) status = 'good'
  else if (score >= 60) status = 'warning'
  else status = 'critical'

  if (factors.length === 0) factors.push('All metrics healthy')

  logger.debug('Client health calculated', { clientId: client.id, score, status, factors })

  return { score, status, factors }
}

export function calculatePortalStats(clients: PortalClient[], projects: PortalProject[]) {
  logger.debug('Calculating portal statistics')

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === 'active').length
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0)
  const monthlyRevenue = clients.reduce((sum, c) => sum + c.monthlyRevenue, 0)

  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length

  const avgHealthScore = clients.reduce((sum, c) => sum + c.healthScore, 0) / totalClients
  const avgSatisfaction = clients.reduce((sum, c) => sum + c.satisfactionRating, 0) / totalClients

  const atRiskClients = clients.filter(c => c.healthStatus === 'warning' || c.healthStatus === 'critical').length

  const stats = {
    totalClients,
    activeClients,
    inactiveClients: totalClients - activeClients,
    totalRevenue,
    monthlyRevenue,
    avgRevenuePerClient: totalRevenue / totalClients,
    totalProjects,
    activeProjects,
    completedProjects,
    projectCompletionRate: (completedProjects / totalProjects) * 100,
    avgHealthScore,
    avgSatisfaction,
    atRiskClients,
    clientRetentionRate: ((totalClients - clients.filter(c => c.status === 'churned').length) / totalClients) * 100
  }

  logger.info('Portal statistics calculated', stats)
  return stats
}

export function getClientStatusColor(status: ClientStatus): string {
  const colors = {
    active: 'bg-green-100 text-green-800',
    onboarding: 'bg-blue-100 text-blue-800',
    inactive: 'bg-gray-100 text-gray-800',
    churned: 'bg-red-100 text-red-800'
  }
  return colors[status]
}

export function getClientTierColor(tier: ClientTier): string {
  const colors = {
    basic: 'bg-gray-100 text-gray-800',
    standard: 'bg-blue-100 text-blue-800',
    premium: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-orange-100 text-orange-800'
  }
  return colors[tier]
}

export function getHealthStatusColor(status: HealthStatus): string {
  const colors = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  }
  return colors[status]
}

export function getProjectStatusColor(status: ProjectStatus): string {
  const colors = {
    planning: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status]
}

logger.info('Client Portal utilities initialized', {
  mockClients: mockPortalClients.length,
  mockProjects: mockPortalProjects.length
})
