/**
 * CRM Types
 * Complete type system for Customer Relationship Management
 */

export type ContactType = 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadSource = 'website' | 'referral' | 'social-media' | 'email-campaign' | 'event' | 'cold-outreach' | 'other'
export type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note' | 'deal-update'

export interface Contact {
  id: string
  type: ContactType
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  avatar?: string
  leadStatus?: LeadStatus
  leadSource?: LeadSource
  leadScore: number
  tags: string[]
  customFields: Record<string, any>
  address?: Address
  socialProfiles?: SocialProfiles
  createdAt: Date
  updatedAt: Date
  lastContactedAt?: Date
  assignedTo?: string
  ownedBy: string
  metadata: ContactMetadata
}

export interface Address {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface SocialProfiles {
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  website?: string
}

export interface ContactMetadata {
  totalDeals: number
  totalRevenue: number
  averageDealSize: number
  conversionRate: number
  lifetimeValue: number
  totalInteractions: number
  lastInteractionType?: ActivityType
  emailsOpened: number
  emailsClicked: number
}

export interface Lead {
  id: string
  contactId: string
  status: LeadStatus
  source: LeadSource
  score: number
  temperature: 'cold' | 'warm' | 'hot'
  priority: Priority
  estimatedValue: number
  estimatedCloseDate?: Date
  probability: number
  notes: string[]
  assignedTo: string
  createdAt: Date
  updatedAt: Date
  convertedAt?: Date
  convertedToDealId?: string
}

export interface Deal {
  id: string
  name: string
  contactId: string
  companyName: string
  stage: DealStage
  value: number
  probability: number
  expectedCloseDate: Date
  actualCloseDate?: Date
  priority: Priority
  description?: string
  products: DealProduct[]
  assignedTo: string
  ownedBy: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: Date
  updatedAt: Date
  lostReason?: string
  wonReason?: string
}

export interface DealProduct {
  id: string
  name: string
  quantity: number
  unitPrice: number
  discount: number
  tax: number
  total: number
}

export interface Pipeline {
  id: string
  name: string
  description?: string
  stages: PipelineStage[]
  deals: Deal[]
  createdAt: Date
  updatedAt: Date
  isDefault: boolean
}

export interface PipelineStage {
  id: string
  name: string
  order: number
  probability: number
  color: string
  dealCount: number
  totalValue: number
}

export interface Activity {
  id: string
  type: ActivityType
  subject: string
  description?: string
  contactId?: string
  dealId?: string
  assignedTo: string
  dueDate?: Date
  completedAt?: Date
  priority: Priority
  status: 'pending' | 'completed' | 'cancelled'
  duration?: number
  outcome?: string
  createdAt: Date
  updatedAt: Date
}

export interface EmailCampaign {
  id: string
  name: string
  subject: string
  content: string
  recipientList: string[]
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  scheduledAt?: Date
  sentAt?: Date
  stats: CampaignStats
  createdBy: string
  createdAt: Date
}

export interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  openRate: number
  clickRate: number
}

export interface Task {
  id: string
  title: string
  description?: string
  contactId?: string
  dealId?: string
  assignedTo: string
  dueDate?: Date
  completedAt?: Date
  priority: Priority
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: string
  content: string
  contactId?: string
  dealId?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  isPinned: boolean
  attachments?: string[]
}

export interface CRMStats {
  totalContacts: number
  totalLeads: number
  totalDeals: number
  totalRevenue: number
  averageDealSize: number
  conversionRate: number
  pipelineValue: number
  wonDealsThisMonth: number
  lostDealsThisMonth: number
  activitiesThisWeek: number
  contactsByType: Record<ContactType, number>
  leadsByStatus: Record<LeadStatus, number>
  dealsByStage: Record<DealStage, number>
  revenueByMonth: { month: string; revenue: number }[]
}

export interface ContactFilter {
  type?: ContactType[]
  status?: LeadStatus[]
  source?: LeadSource[]
  tags?: string[]
  assignedTo?: string[]
  search?: string
  scoreRange?: { min: number; max: number }
  dateRange?: { from: Date; to: Date }
}

export interface DealFilter {
  stage?: DealStage[]
  priority?: Priority[]
  assignedTo?: string[]
  valueRange?: { min: number; max: number }
  closeDateRange?: { from: Date; to: Date }
  search?: string
}
