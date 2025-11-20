/**
 * Client Portal Types
 * Complete type system for client management and portal access
 */

export type ClientStatus = 'active' | 'inactive' | 'onboarding' | 'churned' | 'prospect'
export type ClientTier = 'basic' | 'standard' | 'premium' | 'enterprise'
export type ProjectStatus = 'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type CommunicationType = 'email' | 'call' | 'meeting' | 'chat' | 'note'
export type FileCategory = 'contract' | 'invoice' | 'deliverable' | 'asset' | 'document' | 'other'
export type PortalAccessLevel = 'view-only' | 'limited' | 'full' | 'admin'

export interface Client {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone?: string
  website?: string
  logo?: string
  status: ClientStatus
  tier: ClientTier
  address?: Address
  industry?: string
  companySize?: string
  assignedTo: string[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
  lastContactedAt?: Date
  metadata: ClientMetadata
  portalAccess: PortalAccess
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface ClientMetadata {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalRevenue: number
  lifetimeValue: number
  averageProjectValue: number
  satisfactionScore: number
  onboardingProgress: number
  riskScore: number
  healthScore: number
}

export interface PortalAccess {
  enabled: boolean
  accessLevel: PortalAccessLevel
  lastLogin?: Date
  loginCount: number
  users: PortalUser[]
  customBranding: boolean
  features: PortalFeature[]
}

export interface PortalUser {
  id: string
  name: string
  email: string
  role: string
  accessLevel: PortalAccessLevel
  lastLogin?: Date
  invitedAt: Date
  acceptedAt?: Date
  status: 'pending' | 'active' | 'inactive'
}

export interface PortalFeature {
  id: string
  name: string
  enabled: boolean
  permissions: string[]
}

export interface ClientProject {
  id: string
  clientId: string
  name: string
  description?: string
  status: ProjectStatus
  priority: Priority
  startDate: Date
  endDate?: Date
  completionDate?: Date
  budget: number
  spent: number
  progress: number
  milestones: ProjectMilestone[]
  team: ProjectMember[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMilestone {
  id: string
  name: string
  description?: string
  dueDate: Date
  completedDate?: Date
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  deliverables: string[]
}

export interface ProjectMember {
  userId: string
  name: string
  role: string
  avatar?: string
  responsibilities: string[]
}

export interface Communication {
  id: string
  clientId: string
  type: CommunicationType
  subject: string
  content: string
  participants: string[]
  createdBy: string
  createdAt: Date
  attachments?: string[]
  isImportant: boolean
  tags: string[]
}

export interface ClientFile {
  id: string
  clientId: string
  projectId?: string
  name: string
  category: FileCategory
  url: string
  size: number
  mimeType: string
  uploadedBy: string
  uploadedAt: Date
  lastModified: Date
  isShared: boolean
  sharedWith: string[]
  tags: string[]
  version: number
  previousVersions?: FileVersion[]
}

export interface FileVersion {
  id: string
  version: number
  url: string
  uploadedBy: string
  uploadedAt: Date
  changeDescription?: string
}

export interface Contract {
  id: string
  clientId: string
  projectId?: string
  title: string
  type: 'service-agreement' | 'nda' | 'sow' | 'retainer' | 'other'
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'terminated'
  value: number
  startDate: Date
  endDate: Date
  signedDate?: Date
  terms: string
  fileUrl?: string
  signatories: Signatory[]
  renewalDate?: Date
  autoRenew: boolean
}

export interface Signatory {
  id: string
  name: string
  email: string
  role: string
  signedAt?: Date
  ipAddress?: string
}

export interface ClientActivity {
  id: string
  clientId: string
  type: 'project-update' | 'communication' | 'file-upload' | 'invoice' | 'payment' | 'portal-login' | 'other'
  title: string
  description: string
  userId?: string
  userName?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ClientInvoice {
  invoiceId: string
  invoiceNumber: string
  projectId?: string
  projectName?: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issueDate: Date
  dueDate: Date
  paidDate?: Date
}

export interface ClientStats {
  totalClients: number
  activeClients: number
  newClientsThisMonth: number
  churnedClients: number
  totalRevenue: number
  averageClientValue: number
  clientSatisfaction: number
  clientsByTier: Record<ClientTier, number>
  clientsByStatus: Record<ClientStatus, number>
  clientsByIndustry: { industry: string; count: number }[]
  topClients: { clientId: string; clientName: string; revenue: number }[]
}

export interface ClientFilter {
  status?: ClientStatus[]
  tier?: ClientTier[]
  industry?: string[]
  tags?: string[]
  assignedTo?: string[]
  search?: string
  revenueRange?: { min: number; max: number }
  dateRange?: { from: Date; to: Date }
}

export interface PortalSettings {
  customDomain?: string
  customLogo?: string
  customColors: {
    primary: string
    secondary: string
    accent: string
  }
  emailNotifications: boolean
  allowFileUpload: boolean
  allowComments: boolean
  showInvoices: boolean
  showProjects: boolean
  showFiles: boolean
  requireTwoFactor: boolean
}
