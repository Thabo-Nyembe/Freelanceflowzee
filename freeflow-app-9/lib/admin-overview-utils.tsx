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
// MOCK DATA - ANALYTICS
// ============================================================================

export const MOCK_REVENUE_DATA: RevenueData[] = [
  { date: '2024-01-01', revenue: 45000, target: 40000, projectedRevenue: 47000 },
  { date: '2024-01-08', revenue: 52000, target: 45000, projectedRevenue: 54000 },
  { date: '2024-01-15', revenue: 48000, target: 45000, projectedRevenue: 51000 },
  { date: '2024-01-22', revenue: 61000, target: 50000, projectedRevenue: 63000 },
  { date: '2024-01-29', revenue: 58000, target: 50000, projectedRevenue: 60000 },
  { date: '2024-02-05', revenue: 67000, target: 55000, projectedRevenue: 70000 },
  { date: '2024-02-12', revenue: 72000, target: 60000, projectedRevenue: 75000 },
  { date: '2024-02-19', revenue: 69000, target: 60000, projectedRevenue: 72000 },
  { date: '2024-02-26', revenue: 78000, target: 65000, projectedRevenue: 81000 },
  { date: '2024-03-04', revenue: 84500, target: 70000, projectedRevenue: 88000 },
  { date: '2024-03-11', revenue: 91000, target: 75000, projectedRevenue: 95000 },
  { date: '2024-03-18', revenue: 88000, target: 75000, projectedRevenue: 92000 }
]

export const MOCK_CONVERSION_FUNNEL: ConversionFunnel[] = [
  { stage: 'Visitors', count: 15420, percentage: 100, dropOff: 0, icon: '👥' },
  { stage: 'Leads', count: 2314, percentage: 15, dropOff: 85, icon: '🎯' },
  { stage: 'Qualified', count: 926, percentage: 6, dropOff: 60, icon: '✅' },
  { stage: 'Proposals', count: 463, percentage: 3, dropOff: 50, icon: '📄' },
  { stage: 'Negotiations', count: 231, percentage: 1.5, dropOff: 50, icon: '🤝' },
  { stage: 'Customers', count: 139, percentage: 0.9, dropOff: 40, icon: '🎉' }
]

export const MOCK_TRAFFIC_SOURCES: TrafficSource[] = [
  { source: 'Organic Search', visitors: 6842, conversions: 487, conversionRate: 7.1, revenue: 156000, icon: '🔍', color: '#10b981' },
  { source: 'Direct', visitors: 3456, conversions: 312, conversionRate: 9.0, revenue: 98000, icon: '🌐', color: '#3b82f6' },
  { source: 'Social Media', visitors: 2145, conversions: 156, conversionRate: 7.3, revenue: 42000, icon: '📱', color: '#8b5cf6' },
  { source: 'Email Campaign', visitors: 1876, conversions: 267, conversionRate: 14.2, revenue: 87000, icon: '📧', color: '#f59e0b' },
  { source: 'Paid Ads', visitors: 1101, conversions: 89, conversionRate: 8.1, revenue: 28000, icon: '💰', color: '#ef4444' }
]

export const MOCK_ANALYTICS_INSIGHTS: AnalyticsInsight[] = [
  {
    id: 'insight-1',
    title: 'Email Campaign ROI Exceeding Targets',
    description: 'Email campaigns are generating 14.2% conversion rate, 40% above industry average. Consider increasing email marketing budget.',
    impact: 'high',
    category: 'conversion',
    actionable: true,
    potentialValue: 45000
  },
  {
    id: 'insight-2',
    title: 'Social Media Conversion Opportunity',
    description: 'Social media has high engagement but lower conversion. A/B testing landing pages could improve conversion by 3-5%.',
    impact: 'medium',
    category: 'conversion',
    actionable: true,
    potentialValue: 15000
  },
  {
    id: 'insight-3',
    title: 'Revenue Trending Above Projections',
    description: 'Current revenue is tracking 8% above monthly projections. Consider scaling operations to meet demand.',
    impact: 'high',
    category: 'revenue',
    actionable: true,
    potentialValue: 72000
  }
]

// ============================================================================
// MOCK DATA - CRM
// ============================================================================

export const MOCK_DEALS: Deal[] = [
  {
    id: 'deal-1',
    title: 'Enterprise Platform Migration',
    company: 'TechCorp Global',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah.j@techcorp.com',
    value: 125000,
    stage: 'negotiation',
    priority: 'hot',
    probability: 75,
    expectedCloseDate: '2024-04-15',
    lastContact: '2024-03-18',
    nextAction: 'Send final proposal with pricing options',
    assignedTo: 'Michael Chen',
    tags: ['enterprise', 'migration', 'high-value'],
    createdAt: '2024-02-10',
    source: 'referral'
  },
  {
    id: 'deal-2',
    title: 'Marketing Automation Setup',
    company: 'Growth Marketing Inc',
    contactName: 'David Kim',
    contactEmail: 'david@growthmarketing.io',
    value: 45000,
    stage: 'proposal',
    priority: 'warm',
    probability: 60,
    expectedCloseDate: '2024-04-20',
    lastContact: '2024-03-15',
    nextAction: 'Schedule demo call',
    assignedTo: 'Lisa Anderson',
    tags: ['marketing', 'automation'],
    createdAt: '2024-02-28',
    source: 'website'
  },
  {
    id: 'deal-3',
    title: 'Custom CRM Development',
    company: 'Sales Solutions Ltd',
    contactName: 'Emily Rodriguez',
    contactEmail: 'emily@salessolutions.com',
    value: 89000,
    stage: 'qualified',
    priority: 'hot',
    probability: 45,
    expectedCloseDate: '2024-05-01',
    lastContact: '2024-03-12',
    nextAction: 'Conduct needs assessment',
    assignedTo: 'Michael Chen',
    tags: ['custom', 'crm', 'development'],
    createdAt: '2024-03-01',
    source: 'linkedin'
  },
  {
    id: 'deal-4',
    title: 'Website Redesign & SEO',
    company: 'Boutique Fashion Co',
    contactName: 'James Wilson',
    contactEmail: 'james@boutiquefashion.com',
    value: 28000,
    stage: 'lead',
    priority: 'cold',
    probability: 20,
    expectedCloseDate: '2024-05-15',
    lastContact: '2024-03-10',
    nextAction: 'Send introductory email',
    assignedTo: 'Lisa Anderson',
    tags: ['website', 'seo', 'design'],
    createdAt: '2024-03-08',
    source: 'cold-outreach'
  },
  {
    id: 'deal-5',
    title: 'Analytics Dashboard Implementation',
    company: 'DataDriven Corp',
    contactName: 'Anna Thompson',
    contactEmail: 'anna@datadriven.io',
    value: 67000,
    stage: 'proposal',
    priority: 'warm',
    probability: 55,
    expectedCloseDate: '2024-04-25',
    lastContact: '2024-03-16',
    nextAction: 'Follow up on proposal',
    assignedTo: 'Michael Chen',
    tags: ['analytics', 'dashboard', 'data'],
    createdAt: '2024-02-20',
    source: 'referral'
  },
  {
    id: 'deal-6',
    title: 'Mobile App Development',
    company: 'FitLife Wellness',
    contactName: 'Robert Martinez',
    contactEmail: 'robert@fitlife.app',
    value: 156000,
    stage: 'negotiation',
    priority: 'hot',
    probability: 80,
    expectedCloseDate: '2024-04-10',
    lastContact: '2024-03-17',
    nextAction: 'Finalize contract terms',
    assignedTo: 'Lisa Anderson',
    tags: ['mobile', 'app', 'development', 'high-value'],
    createdAt: '2024-01-15',
    source: 'referral'
  }
]

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'contact-1',
    name: 'Sarah Johnson',
    email: 'sarah.j@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Global',
    position: 'CTO',
    linkedDeals: ['deal-1'],
    totalValue: 125000,
    lastContact: '2024-03-18',
    status: 'active',
    tags: ['decision-maker', 'technical'],
    source: 'referral'
  },
  {
    id: 'contact-2',
    name: 'David Kim',
    email: 'david@growthmarketing.io',
    phone: '+1 (555) 234-5678',
    company: 'Growth Marketing Inc',
    position: 'Marketing Director',
    linkedDeals: ['deal-2'],
    totalValue: 45000,
    lastContact: '2024-03-15',
    status: 'active',
    tags: ['marketing', 'influencer'],
    source: 'website'
  },
  {
    id: 'contact-3',
    name: 'Emily Rodriguez',
    email: 'emily@salessolutions.com',
    phone: '+1 (555) 345-6789',
    company: 'Sales Solutions Ltd',
    position: 'VP of Sales',
    linkedDeals: ['deal-3'],
    totalValue: 89000,
    lastContact: '2024-03-12',
    status: 'active',
    tags: ['decision-maker', 'sales'],
    source: 'linkedin'
  }
]

export const MOCK_PIPELINE_STATS: PipelineStats = {
  totalValue: 510000,
  dealCount: 6,
  averageDealSize: 85000,
  winRate: 42.5,
  averageCycleTime: 45,
  conversionRate: 18.5
}

// ============================================================================
// MOCK DATA - INVOICING
// ============================================================================

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    number: 'INV-2024-001',
    clientId: 'client-1',
    clientName: 'TechCorp Global',
    clientEmail: 'billing@techcorp.com',
    projectName: 'Enterprise Platform Migration',
    status: 'paid',
    issueDate: '2024-02-01',
    dueDate: '2024-02-15',
    paidDate: '2024-02-10',
    items: [
      { id: 'item-1', description: 'Platform Architecture Design', quantity: 1, rate: 15000, amount: 15000, taxable: true },
      { id: 'item-2', description: 'Development (200 hours)', quantity: 200, rate: 150, amount: 30000, taxable: true },
      { id: 'item-3', description: 'Testing & QA', quantity: 1, rate: 8000, amount: 8000, taxable: true }
    ],
    subtotal: 53000,
    taxRate: 10,
    taxAmount: 5300,
    total: 58300,
    amountPaid: 58300,
    amountDue: 0,
    currency: 'USD',
    terms: 'Net 15',
    createdAt: '2024-02-01',
    sentDate: '2024-02-01',
    remindersSent: 0
  },
  {
    id: 'inv-2',
    number: 'INV-2024-002',
    clientId: 'client-2',
    clientName: 'Growth Marketing Inc',
    clientEmail: 'accounts@growthmarketing.io',
    projectName: 'Marketing Automation Setup',
    status: 'sent',
    issueDate: '2024-03-01',
    dueDate: '2024-03-31',
    items: [
      { id: 'item-4', description: 'Initial Setup & Configuration', quantity: 1, rate: 12000, amount: 12000, taxable: true },
      { id: 'item-5', description: 'Integration Development', quantity: 1, rate: 8000, amount: 8000, taxable: true },
      { id: 'item-6', description: 'Training & Documentation', quantity: 1, rate: 3000, amount: 3000, taxable: true }
    ],
    subtotal: 23000,
    taxRate: 10,
    taxAmount: 2300,
    total: 25300,
    amountPaid: 0,
    amountDue: 25300,
    currency: 'USD',
    terms: 'Net 30',
    createdAt: '2024-03-01',
    sentDate: '2024-03-01',
    remindersSent: 1,
    lastReminderDate: '2024-03-15'
  },
  {
    id: 'inv-3',
    number: 'INV-2024-003',
    clientId: 'client-3',
    clientName: 'FitLife Wellness',
    clientEmail: 'finance@fitlife.app',
    projectName: 'Mobile App Development - Phase 1',
    status: 'overdue',
    issueDate: '2024-02-15',
    dueDate: '2024-03-01',
    items: [
      { id: 'item-7', description: 'App Design (UI/UX)', quantity: 1, rate: 18000, amount: 18000, taxable: true },
      { id: 'item-8', description: 'iOS Development', quantity: 1, rate: 25000, amount: 25000, taxable: true },
      { id: 'item-9', description: 'Android Development', quantity: 1, rate: 25000, amount: 25000, taxable: true }
    ],
    subtotal: 68000,
    taxRate: 10,
    taxAmount: 6800,
    total: 74800,
    amountPaid: 0,
    amountDue: 74800,
    currency: 'USD',
    terms: 'Net 15',
    createdAt: '2024-02-15',
    sentDate: '2024-02-15',
    remindersSent: 3,
    lastReminderDate: '2024-03-15'
  },
  {
    id: 'inv-4',
    number: 'INV-2024-004',
    clientId: 'client-4',
    clientName: 'DataDriven Corp',
    clientEmail: 'billing@datadriven.io',
    projectName: 'Analytics Dashboard - Monthly Retainer',
    status: 'draft',
    issueDate: '2024-03-20',
    dueDate: '2024-04-05',
    items: [
      { id: 'item-10', description: 'Dashboard Maintenance', quantity: 1, rate: 5000, amount: 5000, taxable: true },
      { id: 'item-11', description: 'Custom Reports (10 hours)', quantity: 10, rate: 180, amount: 1800, taxable: true },
      { id: 'item-12', description: 'Support & Updates', quantity: 1, rate: 2000, amount: 2000, taxable: true }
    ],
    subtotal: 8800,
    taxRate: 10,
    taxAmount: 880,
    total: 9680,
    amountPaid: 0,
    amountDue: 9680,
    currency: 'USD',
    terms: 'Net 15',
    createdAt: '2024-03-20',
    remindersSent: 0
  }
]

export const MOCK_BILLING_STATS: BillingStats = {
  totalInvoiced: 168080,
  totalPaid: 58300,
  totalOutstanding: 109780,
  overdueAmount: 74800,
  averagePaymentTime: 12,
  onTimePaymentRate: 67.5
}

// ============================================================================
// MOCK DATA - MARKETING
// ============================================================================

export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Jennifer Martinez',
    email: 'jennifer@innovatetech.com',
    phone: '+1 (555) 456-7890',
    company: 'InnovateTech Solutions',
    position: 'Product Manager',
    status: 'qualified',
    score: 'hot',
    scoreValue: 92,
    source: 'webinar',
    campaign: 'Q1 Product Launch',
    assignedTo: 'Michael Chen',
    lastContact: '2024-03-17',
    nextFollowUp: '2024-03-20',
    tags: ['enterprise', 'saas', 'qualified'],
    createdAt: '2024-03-10',
    interests: ['automation', 'analytics', 'integration'],
    engagementLevel: 8.5
  },
  {
    id: 'lead-2',
    name: 'Alex Thompson',
    email: 'alex@startupxyz.io',
    phone: '+1 (555) 567-8901',
    company: 'StartupXYZ',
    position: 'Founder & CEO',
    status: 'contacted',
    score: 'warm',
    scoreValue: 78,
    source: 'linkedin',
    campaign: 'Startup Outreach Program',
    assignedTo: 'Lisa Anderson',
    lastContact: '2024-03-16',
    nextFollowUp: '2024-03-22',
    tags: ['startup', 'founder', 'tech'],
    createdAt: '2024-03-12',
    interests: ['crm', 'sales-automation'],
    engagementLevel: 6.8
  },
  {
    id: 'lead-3',
    name: 'Maria Garcia',
    email: 'maria@retailpro.com',
    phone: '+1 (555) 678-9012',
    company: 'RetailPro International',
    position: 'Operations Director',
    status: 'new',
    score: 'hot',
    scoreValue: 88,
    source: 'content-download',
    campaign: 'eCommerce Guide',
    tags: ['retail', 'ecommerce'],
    createdAt: '2024-03-18',
    interests: ['inventory', 'pos-integration', 'analytics'],
    engagementLevel: 7.2
  },
  {
    id: 'lead-4',
    name: 'Kevin Patel',
    email: 'kevin@consultinggroup.com',
    company: 'Strategic Consulting Group',
    position: 'Senior Consultant',
    status: 'qualified',
    score: 'warm',
    scoreValue: 71,
    source: 'referral',
    assignedTo: 'Michael Chen',
    lastContact: '2024-03-14',
    nextFollowUp: '2024-03-25',
    tags: ['consulting', 'b2b'],
    createdAt: '2024-03-05',
    interests: ['reporting', 'client-management'],
    engagementLevel: 6.3
  },
  {
    id: 'lead-5',
    name: 'Rachel Kim',
    email: 'rachel@healthtech.io',
    phone: '+1 (555) 789-0123',
    company: 'HealthTech Innovations',
    position: 'VP of Technology',
    status: 'converted',
    score: 'hot',
    scoreValue: 95,
    source: 'paid-ads',
    campaign: 'Healthcare Tech Campaign',
    assignedTo: 'Lisa Anderson',
    lastContact: '2024-03-18',
    tags: ['healthcare', 'enterprise', 'converted'],
    createdAt: '2024-02-28',
    interests: ['compliance', 'security', 'hipaa'],
    engagementLevel: 9.1,
    notes: 'Converted to deal-7. High interest in HIPAA-compliant solutions.'
  }
]

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Q1 Product Launch',
    type: 'email',
    status: 'active',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    budget: 15000,
    spent: 9800,
    targetAudience: 5000,
    reached: 4650,
    engaged: 1860,
    conversions: 186,
    revenue: 124000,
    roi: 1165,
    channels: ['email', 'linkedin', 'webinar'],
    createdBy: 'Marketing Team',
    createdAt: '2024-02-15',
    description: 'Launch campaign for new automation features'
  },
  {
    id: 'campaign-2',
    name: 'Startup Outreach Program',
    type: 'social',
    status: 'active',
    startDate: '2024-03-10',
    endDate: '2024-04-10',
    budget: 8000,
    spent: 3200,
    targetAudience: 3000,
    reached: 2100,
    engaged: 630,
    conversions: 42,
    revenue: 28000,
    roi: 775,
    channels: ['linkedin', 'twitter', 'facebook'],
    createdBy: 'Growth Team',
    createdAt: '2024-03-01',
    description: 'Targeted outreach to early-stage startups'
  },
  {
    id: 'campaign-3',
    name: 'eCommerce Guide',
    type: 'content',
    status: 'completed',
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    budget: 5000,
    spent: 4800,
    targetAudience: 10000,
    reached: 8500,
    engaged: 2550,
    conversions: 340,
    revenue: 89000,
    roi: 1754,
    channels: ['blog', 'seo', 'email'],
    createdBy: 'Content Team',
    createdAt: '2024-01-15',
    description: 'Comprehensive guide for eCommerce businesses'
  },
  {
    id: 'campaign-4',
    name: 'Healthcare Tech Campaign',
    type: 'ppc',
    status: 'active',
    startDate: '2024-02-15',
    budget: 20000,
    spent: 16500,
    targetAudience: 2000,
    reached: 1840,
    engaged: 552,
    conversions: 92,
    revenue: 156000,
    roi: 845,
    channels: ['google-ads', 'linkedin-ads'],
    createdBy: 'Performance Marketing',
    createdAt: '2024-02-01',
    description: 'Targeted ads for healthcare technology decision makers'
  }
]

export const MOCK_MARKETING_STATS: MarketingStats = {
  totalLeads: 1847,
  qualifiedLeads: 612,
  convertedLeads: 186,
  conversionRate: 10.1,
  averageLeadScore: 73.5,
  activeCampaigns: 3,
  totalReach: 17090,
  totalEngagement: 5592,
  marketingROI: 1135
}

// ============================================================================
// MOCK DATA - OPERATIONS
// ============================================================================

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'admin',
    status: 'active',
    department: 'Sales',
    joinDate: '2023-01-15',
    lastActive: '2024-03-18 14:23',
    permissions: ['deals.manage', 'contacts.manage', 'invoices.view', 'analytics.view', 'team.view'],
    assignedProjects: 8,
    completedTasks: 247,
    productivityScore: 92,
    phoneExtension: 'ext. 1001',
    location: 'New York, NY'
  },
  {
    id: 'user-2',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    role: 'admin',
    status: 'active',
    department: 'Marketing',
    joinDate: '2023-03-20',
    lastActive: '2024-03-18 15:45',
    permissions: ['campaigns.manage', 'leads.manage', 'analytics.view', 'content.create', 'team.view'],
    assignedProjects: 6,
    completedTasks: 189,
    productivityScore: 88,
    phoneExtension: 'ext. 1002',
    location: 'San Francisco, CA'
  },
  {
    id: 'user-3',
    name: 'James Rodriguez',
    email: 'james.rodriguez@company.com',
    role: 'manager',
    status: 'active',
    department: 'Operations',
    joinDate: '2023-06-10',
    lastActive: '2024-03-18 13:12',
    permissions: ['projects.manage', 'team.view', 'reports.view', 'invoices.view'],
    assignedProjects: 12,
    completedTasks: 312,
    productivityScore: 94,
    phoneExtension: 'ext. 1003',
    location: 'Austin, TX'
  },
  {
    id: 'user-4',
    name: 'Sarah Williams',
    email: 'sarah.williams@company.com',
    role: 'member',
    status: 'active',
    department: 'Development',
    joinDate: '2023-08-05',
    lastActive: '2024-03-18 16:30',
    permissions: ['projects.view', 'tasks.manage', 'files.upload'],
    assignedProjects: 4,
    completedTasks: 156,
    productivityScore: 87,
    phoneExtension: 'ext. 1004',
    location: 'Remote'
  },
  {
    id: 'user-5',
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'member',
    status: 'active',
    department: 'Design',
    joinDate: '2023-09-12',
    lastActive: '2024-03-18 12:45',
    permissions: ['projects.view', 'tasks.manage', 'files.upload', 'content.create'],
    assignedProjects: 5,
    completedTasks: 198,
    productivityScore: 90,
    phoneExtension: 'ext. 1005',
    location: 'Los Angeles, CA'
  },
  {
    id: 'user-6',
    name: 'Emily Johnson',
    email: 'emily.johnson@company.com',
    role: 'guest',
    status: 'pending',
    department: 'Consulting',
    joinDate: '2024-03-15',
    lastActive: '2024-03-17 10:20',
    permissions: ['projects.view'],
    assignedProjects: 1,
    completedTasks: 3,
    productivityScore: 0,
    location: 'Remote'
  }
]

export const MOCK_ROLES: Role[] = [
  {
    id: 'role-1',
    name: 'owner',
    displayName: 'Owner',
    description: 'Full access to all features and settings',
    permissions: ['*'],
    memberCount: 1,
    isCustom: false
  },
  {
    id: 'role-2',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Manage users, projects, and most settings',
    permissions: ['users.manage', 'projects.manage', 'deals.manage', 'invoices.manage', 'analytics.view', 'settings.manage'],
    memberCount: 2,
    isCustom: false
  },
  {
    id: 'role-3',
    name: 'manager',
    displayName: 'Manager',
    description: 'Manage projects and team members',
    permissions: ['projects.manage', 'team.view', 'reports.view', 'tasks.manage'],
    memberCount: 1,
    isCustom: false
  },
  {
    id: 'role-4',
    name: 'member',
    displayName: 'Member',
    description: 'Standard team member access',
    permissions: ['projects.view', 'tasks.manage', 'files.upload', 'comments.create'],
    memberCount: 2,
    isCustom: false
  },
  {
    id: 'role-5',
    name: 'guest',
    displayName: 'Guest',
    description: 'Limited view-only access',
    permissions: ['projects.view'],
    memberCount: 1,
    isCustom: false
  }
]

export const MOCK_OPERATIONS_STATS: OperationsStats = {
  totalMembers: 6,
  activeMembers: 5,
  pendingInvites: 1,
  averageProductivity: 90.2,
  totalPermissions: 24,
  customRoles: 0
}

// ============================================================================
// MOCK DATA - AUTOMATION
// ============================================================================

export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'Lead Qualification Automation',
    description: 'Automatically score and qualify leads based on engagement and profile data',
    status: 'active',
    trigger: 'New lead created',
    actions: [
      { id: 'action-1', type: 'Calculate lead score', config: { criteria: ['company_size', 'engagement', 'industry'] }, order: 1 },
      { id: 'action-2', type: 'Assign to sales rep', config: { rule: 'round-robin' }, order: 2 },
      { id: 'action-3', type: 'Send welcome email', config: { template: 'lead-welcome' }, order: 3 },
      { id: 'action-4', type: 'Create task', config: { assignee: 'sales-rep', dueIn: '24h' }, order: 4 }
    ],
    runsCount: 847,
    successRate: 96.5,
    lastRun: '2024-03-18 15:23',
    createdBy: 'Lisa Anderson',
    createdAt: '2024-01-10',
    tags: ['sales', 'leads', 'automation'],
    timeSaved: 42
  },
  {
    id: 'workflow-2',
    name: 'Invoice Payment Reminders',
    description: 'Send automated reminders for overdue invoices',
    status: 'active',
    trigger: 'Invoice overdue by 7 days',
    actions: [
      { id: 'action-5', type: 'Send reminder email', config: { template: 'payment-reminder' }, order: 1 },
      { id: 'action-6', type: 'Notify account manager', config: { channel: 'slack' }, order: 2 },
      { id: 'action-7', type: 'Update invoice status', config: { status: 'overdue' }, order: 3 }
    ],
    runsCount: 23,
    successRate: 100,
    lastRun: '2024-03-15 09:00',
    nextRun: '2024-03-22 09:00',
    createdBy: 'Michael Chen',
    createdAt: '2024-02-01',
    tags: ['finance', 'invoicing', 'reminders'],
    timeSaved: 8
  },
  {
    id: 'workflow-3',
    name: 'Deal Stage Progression',
    description: 'Automate actions when deals move through pipeline stages',
    status: 'active',
    trigger: 'Deal stage changed',
    actions: [
      { id: 'action-8', type: 'Send notification', config: { recipients: ['team', 'manager'] }, order: 1 },
      { id: 'action-9', type: 'Update deal probability', config: { basedOn: 'historical-data' }, order: 2 },
      { id: 'action-10', type: 'Create follow-up task', config: { dueIn: '48h' }, order: 3 },
      { id: 'action-11', type: 'Log activity', config: { type: 'stage-change' }, order: 4 }
    ],
    runsCount: 156,
    successRate: 98.7,
    lastRun: '2024-03-18 14:10',
    createdBy: 'Michael Chen',
    createdAt: '2024-01-20',
    tags: ['crm', 'deals', 'pipeline'],
    timeSaved: 26
  },
  {
    id: 'workflow-4',
    name: 'Campaign Performance Alerts',
    description: 'Monitor campaign metrics and alert team of anomalies',
    status: 'active',
    trigger: 'Daily at 9:00 AM',
    actions: [
      { id: 'action-12', type: 'Check campaign metrics', config: { metrics: ['roi', 'conversion', 'spend'] }, order: 1 },
      { id: 'action-13', type: 'Generate report', config: { format: 'pdf' }, order: 2 },
      { id: 'action-14', type: 'Send to marketing team', config: { channel: 'email' }, order: 3 }
    ],
    runsCount: 78,
    successRate: 100,
    lastRun: '2024-03-18 09:00',
    nextRun: '2024-03-19 09:00',
    createdBy: 'Lisa Anderson',
    createdAt: '2024-02-10',
    tags: ['marketing', 'campaigns', 'analytics'],
    timeSaved: 18
  },
  {
    id: 'workflow-5',
    name: 'New Client Onboarding',
    description: 'Streamline onboarding process for new clients',
    status: 'draft',
    trigger: 'Deal marked as won',
    actions: [
      { id: 'action-15', type: 'Create client account', config: {}, order: 1 },
      { id: 'action-16', type: 'Send welcome package', config: { template: 'client-welcome' }, order: 2 },
      { id: 'action-17', type: 'Schedule kickoff meeting', config: { dueIn: '72h' }, order: 3 },
      { id: 'action-18', type: 'Assign account manager', config: { rule: 'workload-balance' }, order: 4 },
      { id: 'action-19', type: 'Create project', config: { template: 'standard-onboarding' }, order: 5 }
    ],
    runsCount: 0,
    successRate: 0,
    createdBy: 'James Rodriguez',
    createdAt: '2024-03-15',
    tags: ['clients', 'onboarding', 'automation'],
    timeSaved: 0
  }
]

export const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: 'int-1',
    name: 'Stripe',
    category: 'Payments',
    status: 'connected',
    description: 'Accept payments and manage subscriptions',
    icon: '💳',
    connectedDate: '2024-01-15',
    lastSync: '2024-03-18 16:00',
    syncFrequency: 'Real-time',
    dataPoints: 1247,
    isPopular: true,
    isPremium: false
  },
  {
    id: 'int-2',
    name: 'Slack',
    category: 'Communication',
    status: 'connected',
    description: 'Team notifications and collaboration',
    icon: '💬',
    connectedDate: '2024-01-10',
    lastSync: '2024-03-18 15:45',
    syncFrequency: 'Real-time',
    dataPoints: 3421,
    isPopular: true,
    isPremium: false
  },
  {
    id: 'int-3',
    name: 'Google Calendar',
    category: 'Productivity',
    status: 'connected',
    description: 'Sync meetings and events',
    icon: '📅',
    connectedDate: '2024-02-01',
    lastSync: '2024-03-18 14:30',
    syncFrequency: 'Every 15 minutes',
    dataPoints: 892,
    isPopular: true,
    isPremium: false
  },
  {
    id: 'int-4',
    name: 'Mailchimp',
    category: 'Marketing',
    status: 'connected',
    description: 'Email marketing automation',
    icon: '📧',
    connectedDate: '2024-02-15',
    lastSync: '2024-03-18 12:00',
    syncFrequency: 'Hourly',
    dataPoints: 5643,
    isPopular: true,
    isPremium: false
  },
  {
    id: 'int-5',
    name: 'Zapier',
    category: 'Automation',
    status: 'connected',
    description: 'Connect with 5000+ apps',
    icon: '⚡',
    connectedDate: '2024-01-20',
    lastSync: '2024-03-18 16:15',
    syncFrequency: 'Real-time',
    dataPoints: 2156,
    isPopular: true,
    isPremium: true
  },
  {
    id: 'int-6',
    name: 'QuickBooks',
    category: 'Accounting',
    status: 'disconnected',
    description: 'Accounting and bookkeeping',
    icon: '📊',
    isPopular: true,
    isPremium: false,
    dataPoints: 0
  },
  {
    id: 'int-7',
    name: 'Salesforce',
    category: 'CRM',
    status: 'disconnected',
    description: 'Enterprise CRM integration',
    icon: '☁️',
    isPopular: true,
    isPremium: true,
    dataPoints: 0
  },
  {
    id: 'int-8',
    name: 'HubSpot',
    category: 'Marketing',
    status: 'disconnected',
    description: 'Inbound marketing platform',
    icon: '🎯',
    isPopular: true,
    isPremium: true,
    dataPoints: 0
  }
]

export const MOCK_AUTOMATION_STATS: AutomationStats = {
  activeWorkflows: 4,
  totalRuns: 1104,
  successRate: 97.8,
  timeSaved: 94,
  connectedIntegrations: 5,
  availableIntegrations: 8
}

// ============================================================================
// MOCK DATA - DASHBOARD
// ============================================================================

export const MOCK_ADMIN_DASHBOARD_STATS: AdminDashboardStats = {
  totalRevenue: 284500,
  revenueGrowth: 16.2,
  activeClients: 38,
  clientGrowth: 8.5,
  hotLeads: 145,
  leadGrowth: 12.3,
  emailOpenRate: 42.5,
  openRateChange: 5.2,
  totalDeals: 6,
  pipelineValue: 510000,
  overdueInvoices: 1,
  outstandingAmount: 109780,
  activeCampaigns: 3,
  campaignROI: 1135,
  teamMembers: 6,
  activeWorkflows: 4
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
