// ============================================================================
// BUSINESS ADMIN INTELLIGENCE UTILITIES
// ============================================================================
// Comprehensive TypeScript interfaces, mock data, and utility functions
// for the Business Admin Intelligence system with 6 major sections:
// 1. Analytics (Business Intelligence)
// 2. CRM (Sales Pipeline)
// 3. Invoicing (Billing Management)
// 4. Marketing (Leads & Campaigns)
// 5. Operations (User Management)
// 6. Automation (Workflows & Integrations)
// ============================================================================

import { ReactNode } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Zap,
  FileText,
  Send
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type DealPriority = 'hot' | 'warm' | 'cold'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted'
export type LeadScore = 'hot' | 'warm' | 'cold'
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'paused'
export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'guest'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type AutomationStatus = 'active' | 'paused' | 'error' | 'draft'
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'
export type MetricTrend = 'up' | 'down' | 'stable'
export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all'

// ============================================================================
// ANALYTICS INTERFACES
// ============================================================================

export interface RevenueData {
  date: string
  revenue: number
  target: number
  projectedRevenue?: number
}

export interface ConversionFunnel {
  stage: string
  count: number
  percentage: number
  dropOff: number
  icon: string
}

export interface TrafficSource {
  source: string
  visitors: number
  conversions: number
  conversionRate: number
  revenue: number
  icon: string
  color: string
}

export interface BusinessMetric {
  id: string
  label: string
  value: number
  previousValue: number
  change: number
  changePercent: number
  trend: MetricTrend
  format: 'currency' | 'number' | 'percentage'
  icon: ReactNode
  color: string
}

export interface AnalyticsInsight {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'revenue' | 'conversion' | 'traffic' | 'engagement'
  actionable: boolean
  potentialValue?: number
}

// ============================================================================
// CRM INTERFACES
// ============================================================================

export interface Deal {
  id: string
  title: string
  company: string
  contactName: string
  contactEmail: string
  value: number
  stage: DealStage
  priority: DealPriority
  probability: number
  expectedCloseDate: string
  lastContact: string
  nextAction: string
  assignedTo: string
  tags: string[]
  notes?: string
  createdAt: string
  source?: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  linkedDeals: string[]
  totalValue: number
  lastContact: string
  status: 'active' | 'inactive'
  tags: string[]
  source: string
  avatar?: string
}

export interface PipelineStats {
  totalValue: number
  dealCount: number
  averageDealSize: number
  winRate: number
  averageCycleTime: number
  conversionRate: number
}

// ============================================================================
// INVOICING INTERFACES
// ============================================================================

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
  taxable: boolean
}

export interface Invoice {
  id: string
  number: string
  clientId: string
  clientName: string
  clientEmail: string
  projectName?: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  paidDate?: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  amountPaid: number
  amountDue: number
  currency: string
  notes?: string
  terms?: string
  createdAt: string
  sentDate?: string
  remindersSent: number
  lastReminderDate?: string
}

export interface PaymentRecord {
  id: string
  invoiceId: string
  amount: number
  date: string
  method: string
  reference?: string
  status: 'completed' | 'pending' | 'failed'
}

export interface BillingStats {
  totalInvoiced: number
  totalPaid: number
  totalOutstanding: number
  overdueAmount: number
  averagePaymentTime: number
  onTimePaymentRate: number
}

// ============================================================================
// MARKETING INTERFACES
// ============================================================================

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  status: LeadStatus
  score: LeadScore
  scoreValue: number
  source: string
  campaign?: string
  assignedTo?: string
  lastContact?: string
  nextFollowUp?: string
  notes?: string
  tags: string[]
  createdAt: string
  interests: string[]
  engagementLevel: number
}

export interface Campaign {
  id: string
  name: string
  type: 'email' | 'social' | 'content' | 'ppc' | 'event'
  status: CampaignStatus
  startDate: string
  endDate?: string
  budget: number
  spent: number
  targetAudience: number
  reached: number
  engaged: number
  conversions: number
  revenue: number
  roi: number
  channels: string[]
  createdBy: string
  createdAt: string
  description?: string
}

export interface EmailMetrics {
  campaignId: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  openRate: number
  clickRate: number
  conversionRate: number
}

export interface MarketingStats {
  totalLeads: number
  qualifiedLeads: number
  convertedLeads: number
  conversionRate: number
  averageLeadScore: number
  activeCampaigns: number
  totalReach: number
  totalEngagement: number
  marketingROI: number
}

// ============================================================================
// OPERATIONS INTERFACES
// ============================================================================

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  status: UserStatus
  department: string
  joinDate: string
  lastActive: string
  permissions: string[]
  assignedProjects: number
  completedTasks: number
  productivityScore: number
  phoneExtension?: string
  location?: string
}

export interface Permission {
  id: string
  category: string
  action: string
  description: string
  roles: UserRole[]
}

export interface Role {
  id: string
  name: UserRole
  displayName: string
  description: string
  permissions: string[]
  memberCount: number
  isCustom: boolean
}

export interface OperationsStats {
  totalMembers: number
  activeMembers: number
  pendingInvites: number
  averageProductivity: number
  totalPermissions: number
  customRoles: number
}

// ============================================================================
// AUTOMATION INTERFACES
// ============================================================================

export interface Workflow {
  id: string
  name: string
  description: string
  status: AutomationStatus
  trigger: string
  actions: WorkflowAction[]
  runsCount: number
  successRate: number
  lastRun?: string
  nextRun?: string
  createdBy: string
  createdAt: string
  tags: string[]
  timeSaved: number
}

export interface WorkflowAction {
  id: string
  type: string
  config: Record<string, any>
  order: number
}

export interface Integration {
  id: string
  name: string
  category: string
  status: IntegrationStatus
  description: string
  icon: string
  connectedDate?: string
  lastSync?: string
  syncFrequency?: string
  dataPoints: number
  isPopular: boolean
  isPremium: boolean
}

export interface AutomationStats {
  activeWorkflows: number
  totalRuns: number
  successRate: number
  timeSaved: number
  connectedIntegrations: number
  availableIntegrations: number
}

// ============================================================================
// DASHBOARD INTERFACES
// ============================================================================

export interface AdminDashboardStats {
  totalRevenue: number
  revenueGrowth: number
  activeClients: number
  clientGrowth: number
  hotLeads: number
  leadGrowth: number
  emailOpenRate: number
  openRateChange: number
  totalDeals: number
  pipelineValue: number
  overdueInvoices: number
  outstandingAmount: number
  activeCampaigns: number
  campaignROI: number
  teamMembers: number
  activeWorkflows: number
}


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get icon component for deal stage
 */
export function getDealStageIcon(stage: DealStage): ReactNode {
  const icons: Record<DealStage, ReactNode> = {
    lead: <Target className="w-4 h-4" />,
    qualified: <CheckCircle className="w-4 h-4" />,
    proposal: <FileText className="w-4 h-4" />,
    negotiation: <Users className="w-4 h-4" />,
    won: <CheckCircle className="w-4 h-4 text-green-500" />,
    lost: <XCircle className="w-4 h-4 text-red-500" />
  }
  return icons[stage]
}

/**
 * Get color class for deal stage
 */
export function getDealStageColor(stage: DealStage): string {
  const colors: Record<DealStage, string> = {
    lead: 'bg-blue-100 text-blue-700 border-blue-200',
    qualified: 'bg-purple-100 text-purple-700 border-purple-200',
    proposal: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
    won: 'bg-green-100 text-green-700 border-green-200',
    lost: 'bg-red-100 text-red-700 border-red-200'
  }
  return colors[stage]
}

/**
 * Get icon component for deal priority
 */
export function getDealPriorityIcon(priority: DealPriority): ReactNode {
  const icons: Record<DealPriority, ReactNode> = {
    hot: <span className="text-red-500">🔥</span>,
    warm: <span className="text-orange-500">☀️</span>,
    cold: <span className="text-blue-500">❄️</span>
  }
  return icons[priority]
}

/**
 * Get color class for invoice status
 */
export function getInvoiceStatusColor(status: InvoiceStatus): string {
  const colors: Record<InvoiceStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    paid: 'bg-green-100 text-green-700 border-green-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200'
  }
  return colors[status]
}

/**
 * Get icon component for invoice status
 */
export function getInvoiceStatusIcon(status: InvoiceStatus): ReactNode {
  const icons: Record<InvoiceStatus, ReactNode> = {
    draft: <FileText className="w-4 h-4" />,
    sent: <Send className="w-4 h-4" />,
    paid: <CheckCircle className="w-4 h-4" />,
    overdue: <AlertCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />
  }
  return icons[status]
}

/**
 * Get color class for lead status
 */
export function getLeadStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    contacted: 'bg-purple-100 text-purple-700 border-purple-200',
    qualified: 'bg-green-100 text-green-700 border-green-200',
    unqualified: 'bg-gray-100 text-gray-700 border-gray-200',
    converted: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }
  return colors[status]
}

/**
 * Get color class for lead score
 */
export function getLeadScoreColor(score: LeadScore): string {
  const colors: Record<LeadScore, string> = {
    hot: 'bg-red-500 text-white',
    warm: 'bg-orange-500 text-white',
    cold: 'bg-blue-500 text-white'
  }
  return colors[score]
}

/**
 * Get color class for campaign status
 */
export function getCampaignStatusColor(status: CampaignStatus): string {
  const colors: Record<CampaignStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-purple-100 text-purple-700 border-purple-200',
    paused: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }
  return colors[status]
}

/**
 * Get color class for user role
 */
export function getUserRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    owner: 'bg-purple-100 text-purple-700 border-purple-200',
    admin: 'bg-blue-100 text-blue-700 border-blue-200',
    manager: 'bg-green-100 text-green-700 border-green-200',
    member: 'bg-gray-100 text-gray-700 border-gray-200',
    guest: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }
  return colors[role]
}

/**
 * Get color class for user status
 */
export function getUserStatusColor(status: UserStatus): string {
  const colors: Record<UserStatus, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    suspended: 'bg-red-100 text-red-700 border-red-200'
  }
  return colors[status]
}

/**
 * Get color class for automation status
 */
export function getAutomationStatusColor(status: AutomationStatus): string {
  const colors: Record<AutomationStatus, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200'
  }
  return colors[status]
}

/**
 * Get icon component for automation status
 */
export function getAutomationStatusIcon(status: AutomationStatus): ReactNode {
  const icons: Record<AutomationStatus, ReactNode> = {
    active: <Zap className="w-4 h-4 text-green-500" />,
    paused: <Clock className="w-4 h-4 text-yellow-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    draft: <FileText className="w-4 h-4 text-gray-500" />
  }
  return icons[status]
}

/**
 * Get color class for integration status
 */
export function getIntegrationStatusColor(status: IntegrationStatus): string {
  const colors: Record<IntegrationStatus, string> = {
    connected: 'bg-green-100 text-green-700 border-green-200',
    disconnected: 'bg-gray-100 text-gray-700 border-gray-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }
  return colors[status]
}

/**
 * Get trend icon component
 */
export function getTrendIcon(trend: MetricTrend): ReactNode {
  const icons: Record<MetricTrend, ReactNode> = {
    up: <TrendingUp className="w-4 h-4 text-green-500" />,
    down: <TrendingDown className="w-4 h-4 text-red-500" />,
    stable: <Minus className="w-4 h-4 text-gray-500" />
  }
  return icons[trend]
}

/**
 * Format currency value
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
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/**
 * Calculate deal probability based on stage
 */
export function calculateDealProbability(stage: DealStage): number {
  const probabilities: Record<DealStage, number> = {
    lead: 10,
    qualified: 25,
    proposal: 50,
    negotiation: 75,
    won: 100,
    lost: 0
  }
  return probabilities[stage]
}

/**
 * Calculate invoice days overdue
 */
export function calculateDaysOverdue(dueDate: string): number {
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = now.getTime() - due.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Calculate ROI
 */
export function calculateROI(revenue: number, cost: number): number {
  if (cost === 0) return 0
  return ((revenue - cost) / cost) * 100
}

/**
 * Filter deals by stage
 */
export function filterDealsByStage(deals: Deal[], stage: DealStage): Deal[] {
  return deals.filter(deal => deal.stage === stage)
}

/**
 * Filter invoices by status
 */
export function filterInvoicesByStatus(invoices: Invoice[], status: InvoiceStatus): Invoice[] {
  return invoices.filter(invoice => invoice.status === status)
}

/**
 * Filter leads by status
 */
export function filterLeadsByStatus(leads: Lead[], status: LeadStatus): Lead[] {
  return leads.filter(lead => lead.status === status)
}

/**
 * Filter campaigns by status
 */
export function filterCampaignsByStatus(campaigns: Campaign[], status: CampaignStatus): Campaign[] {
  return campaigns.filter(campaign => campaign.status === status)
}

/**
 * Sort deals by value
 */
export function sortDealsByValue(deals: Deal[], ascending: boolean = false): Deal[] {
  return [...deals].sort((a, b) => ascending ? a.value - b.value : b.value - a.value)
}

/**
 * Sort leads by score
 */
export function sortLeadsByScore(leads: Lead[], ascending: boolean = false): Lead[] {
  return [...leads].sort((a, b) => ascending ? a.scoreValue - b.scoreValue : b.scoreValue - a.scoreValue)
}

/**
 * Get deals by priority
 */
export function getDealsByPriority(deals: Deal[], priority: DealPriority): Deal[] {
  return deals.filter(deal => deal.priority === priority)
}

/**
 * Get high-value deals (above threshold)
 */
export function getHighValueDeals(deals: Deal[], threshold: number = 50000): Deal[] {
  return deals.filter(deal => deal.value >= threshold)
}

/**
 * Calculate total pipeline value
 */
export function calculateTotalPipelineValue(deals: Deal[]): number {
  return deals.reduce((sum, deal) => sum + deal.value, 0)
}

/**
 * Calculate weighted pipeline value (by probability)
 */
export function calculateWeightedPipelineValue(deals: Deal[]): number {
  return deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)
}

/**
 * Get overdue invoices
 */
export function getOverdueInvoices(invoices: Invoice[]): Invoice[] {
  const now = new Date()
  return invoices.filter(invoice => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') return false
    return new Date(invoice.dueDate) < now
  })
}

/**
 * Calculate total outstanding amount
 */
export function calculateTotalOutstanding(invoices: Invoice[]): number {
  return invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.amountDue, 0)
}

/**
 * Get hot leads
 */
export function getHotLeads(leads: Lead[]): Lead[] {
  return leads.filter(lead => lead.score === 'hot')
}

/**
 * Calculate average lead score
 */
export function calculateAverageLeadScore(leads: Lead[]): number {
  if (leads.length === 0) return 0
  const total = leads.reduce((sum, lead) => sum + lead.scoreValue, 0)
  return total / leads.length
}

/**
 * Get active campaigns
 */
export function getActiveCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns.filter(campaign => campaign.status === 'active')
}

/**
 * Calculate total campaign ROI
 */
export function calculateTotalCampaignROI(campaigns: Campaign[]): number {
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0)
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
  return calculateROI(totalRevenue, totalSpent)
}

/**
 * Get active team members
 */
export function getActiveTeamMembers(members: TeamMember[]): TeamMember[] {
  return members.filter(member => member.status === 'active')
}

/**
 * Calculate average productivity score
 */
export function calculateAverageProductivity(members: TeamMember[]): number {
  const activeMembers = getActiveTeamMembers(members)
  if (activeMembers.length === 0) return 0
  const total = activeMembers.reduce((sum, member) => sum + member.productivityScore, 0)
  return total / activeMembers.length
}

/**
 * Get active workflows
 */
export function getActiveWorkflows(workflows: Workflow[]): Workflow[] {
  return workflows.filter(workflow => workflow.status === 'active')
}

/**
 * Calculate total time saved by workflows
 */
export function calculateTotalTimeSaved(workflows: Workflow[]): number {
  return workflows.reduce((sum, workflow) => sum + workflow.timeSaved, 0)
}

/**
 * Get connected integrations
 */
export function getConnectedIntegrations(integrations: Integration[]): Integration[] {
  return integrations.filter(integration => integration.status === 'connected')
}

/**
 * Search functionality
 */
export function searchDeals(deals: Deal[], query: string): Deal[] {
  const lowerQuery = query.toLowerCase()
  return deals.filter(deal =>
    deal.title.toLowerCase().includes(lowerQuery) ||
    deal.company.toLowerCase().includes(lowerQuery) ||
    deal.contactName.toLowerCase().includes(lowerQuery)
  )
}

export function searchLeads(leads: Lead[], query: string): Lead[] {
  const lowerQuery = query.toLowerCase()
  return leads.filter(lead =>
    lead.name.toLowerCase().includes(lowerQuery) ||
    lead.email.toLowerCase().includes(lowerQuery) ||
    (lead.company && lead.company.toLowerCase().includes(lowerQuery))
  )
}

export function searchInvoices(invoices: Invoice[], query: string): Invoice[] {
  const lowerQuery = query.toLowerCase()
  return invoices.filter(invoice =>
    invoice.number.toLowerCase().includes(lowerQuery) ||
    invoice.clientName.toLowerCase().includes(lowerQuery) ||
    (invoice.projectName && invoice.projectName.toLowerCase().includes(lowerQuery))
  )
}
