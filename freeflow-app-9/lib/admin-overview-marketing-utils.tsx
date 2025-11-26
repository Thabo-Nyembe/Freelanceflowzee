// ============================================================================
// ADMIN MARKETING UTILITIES - PRODUCTION
// ============================================================================
// Comprehensive marketing management with leads, campaigns, email automation,
// analytics, conversion tracking, and ROI monitoring
// ============================================================================

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AdminMarketingUtils')

// ============================================================================
// TYPESCRIPT TYPES & INTERFACES
// ============================================================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadScore = 'cold' | 'warm' | 'hot'
export type LeadSource = 'website' | 'referral' | 'social' | 'email' | 'event' | 'manual' | 'advertising'
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived'
export type CampaignType = 'email' | 'social' | 'content' | 'ppc' | 'seo' | 'event' | 'partnership'
export type EngagementLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface Lead {
  id: string
  userId: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  status: LeadStatus
  score: LeadScore
  scoreValue: number // 0-100
  source: LeadSource
  interests: string[]
  tags: string[]
  engagementLevel: EngagementLevel
  lastContact?: string
  nextFollowUp?: string
  assignedTo?: string
  estimatedValue?: number
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  userId: string
  name: string
  description: string
  type: CampaignType
  status: CampaignStatus
  budget: number
  spent: number
  startDate: string
  endDate?: string
  targetAudience: string[]
  goals: CampaignGoal[]
  channels: string[]
  content?: CampaignContent
  metrics: CampaignMetrics
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CampaignGoal {
  id: string
  name: string
  target: number
  current: number
  unit: string
}

export interface CampaignContent {
  subject?: string
  message?: string
  images?: string[]
  links?: string[]
  callToAction?: string
}

export interface CampaignMetrics {
  impressions: number
  clicks: number
  conversions: number
  leads: number
  revenue: number
  ctr: number // Click-through rate
  conversionRate: number
  roi: number // Return on investment
  costPerLead: number
  costPerConversion: number
}

export interface EmailCampaign {
  id: string
  campaignId: string
  userId: string
  subject: string
  content: string
  fromName: string
  fromEmail: string
  replyTo: string
  recipients: number
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  openRate: number
  clickRate: number
  bounceRate: number
  scheduledAt?: string
  sentAt?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent'
  createdAt: string
  updatedAt: string
}

export interface MarketingAnalytics {
  totalLeads: number
  qualifiedLeads: number
  convertedLeads: number
  conversionRate: number
  averageLeadValue: number
  totalRevenue: number
  bySource: Record<LeadSource, number>
  byStatus: Record<LeadStatus, number>
  byScore: Record<LeadScore, number>
  topCampaigns: { campaignId: string; name: string; roi: number }[]
  monthlyTrend: { month: string; leads: number; conversions: number }[]
  lastUpdated: string
}

export interface MarketingStats {
  totalLeads: number
  newLeadsThisMonth: number
  qualifiedLeads: number
  hotLeads: number
  conversionRate: number
  totalCampaigns: number
  activeCampaigns: number
  totalBudget: number
  totalSpent: number
  totalRevenue: number
  roi: number
  averageLeadScore: number
  topPerformingCampaign?: { name: string; roi: number }
  lastUpdated: string
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const leadNames = [
  'John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'David Wilson',
  'Lisa Anderson', 'Tom Brown', 'Anna Martinez', 'James Taylor', 'Maria Garcia',
  'Robert Lee', 'Jennifer White', 'William Harris', 'Jessica Thompson', 'Daniel Clark',
  'Michelle Lewis', 'Christopher Walker', 'Amanda Hall', 'Matthew Allen', 'Laura Young'
]

const companies = [
  'Tech Corp', 'Digital Solutions', 'Innovation Labs', 'Cloud Systems', 'Data Analytics Inc',
  'Smart Technologies', 'Future Enterprises', 'Global Networks', 'Cyber Security Pro', 'AI Ventures'
]

const leadSources: LeadSource[] = ['website', 'referral', 'social', 'email', 'event', 'manual', 'advertising']
const leadStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const campaignTypes: CampaignType[] = ['email', 'social', 'content', 'ppc', 'seo', 'event', 'partnership']

export function generateMockLeads(count: number = 50, userId: string = 'user-1'): Lead[] {
  logger.info('Generating mock leads', { count, userId })

  const leads: Lead[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const scoreValue = Math.floor(Math.random() * 100)
    const score: LeadScore = scoreValue >= 70 ? 'hot' : scoreValue >= 40 ? 'warm' : 'cold'
    const status = leadStatuses[i % leadStatuses.length]
    const createdAt = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000)

    leads.push({
      id: `lead-${i + 1}`,
      userId,
      name: leadNames[i % leadNames.length],
      email: `${leadNames[i % leadNames.length].toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      company: Math.random() > 0.3 ? companies[Math.floor(Math.random() * companies.length)] : undefined,
      position: Math.random() > 0.3 ? ['CEO', 'CTO', 'VP Sales', 'Marketing Director', 'Manager'][Math.floor(Math.random() * 5)] : undefined,
      status,
      score,
      scoreValue,
      source: leadSources[Math.floor(Math.random() * leadSources.length)],
      interests: ['product', 'pricing', 'demo', 'integration'].slice(0, Math.floor(Math.random() * 4) + 1),
      tags: ['enterprise', 'hot-lead', 'follow-up', 'demo-requested'].slice(0, Math.floor(Math.random() * 4) + 1),
      engagementLevel: (Math.floor(Math.random() * 10) + 1) as EngagementLevel,
      lastContact: Math.random() > 0.5 ? new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      nextFollowUp: Math.random() > 0.6 ? new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      assignedTo: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 5) + 1}` : undefined,
      estimatedValue: Math.random() > 0.4 ? Math.floor(Math.random() * 100000) + 5000 : undefined,
      notes: Math.random() > 0.5 ? 'Interested in enterprise plan. Schedule follow-up call.' : undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.info('Mock leads generated successfully', {
    total: leads.length,
    hot: leads.filter(l => l.score === 'hot').length,
    qualified: leads.filter(l => l.status === 'qualified').length
  })

  return leads
}

export function generateMockCampaigns(count: number = 15, userId: string = 'user-1'): Campaign[] {
  logger.info('Generating mock campaigns', { count, userId })

  const campaigns: Campaign[] = []
  const now = new Date()

  const campaignNames = [
    'Summer Sale 2024', 'Product Launch Campaign', 'Black Friday Promotion', 'Lead Generation Drive',
    'Brand Awareness Q4', 'Customer Retention Program', 'Email Nurture Series', 'Social Media Blitz',
    'Content Marketing Push', 'PPC Optimization', 'SEO Strategy Implementation', 'Partnership Outreach',
    'Event Promotion', 'Webinar Series', 'Holiday Campaign'
  ]

  for (let i = 0; i < count; i++) {
    const type = campaignTypes[i % campaignTypes.length]
    const budget = (Math.floor(Math.random() * 100) + 10) * 1000
    const spent = Math.floor(budget * (Math.random() * 0.8 + 0.2))
    const impressions = Math.floor(Math.random() * 100000) + 10000
    const clicks = Math.floor(impressions * (Math.random() * 0.05))
    const conversions = Math.floor(clicks * (Math.random() * 0.2))
    const revenue = conversions * (Math.floor(Math.random() * 500) + 100)

    const startDate = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000)
    const isActive = i < 5

    campaigns.push({
      id: `campaign-${i + 1}`,
      userId,
      name: campaignNames[i],
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} campaign to drive engagement and conversions`,
      type,
      status: isActive ? 'active' : (Math.random() > 0.5 ? 'completed' : 'paused'),
      budget,
      spent,
      startDate: startDate.toISOString(),
      endDate: Math.random() > 0.3 ? new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      targetAudience: ['B2B', 'Enterprise', 'SMB', 'Startups'].slice(0, Math.floor(Math.random() * 3) + 1),
      goals: [
        { id: 'goal-1', name: 'Leads', target: 100, current: Math.floor(Math.random() * 120), unit: 'leads' },
        { id: 'goal-2', name: 'Conversions', target: 20, current: Math.floor(Math.random() * 25), unit: 'sales' }
      ],
      channels: ['email', 'social', 'website', 'ads'].slice(0, Math.floor(Math.random() * 4) + 1),
      content: {
        subject: `${campaignNames[i]} - Special Offer`,
        message: 'Compelling campaign message...',
        callToAction: 'Get Started Now'
      },
      metrics: {
        impressions,
        clicks,
        conversions,
        leads: Math.floor(conversions * 1.5),
        revenue,
        ctr: clicks / impressions * 100,
        conversionRate: conversions / clicks * 100,
        roi: ((revenue - spent) / spent) * 100,
        costPerLead: spent / Math.max(conversions * 1.5, 1),
        costPerConversion: spent / Math.max(conversions, 1)
      },
      tags: ['active', 'high-priority', 'automated'].slice(0, Math.floor(Math.random() * 3) + 1),
      createdBy: userId,
      createdAt: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.info('Mock campaigns generated successfully', {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length
  })

  return campaigns
}

export function generateMockEmailCampaigns(count: number = 10, userId: string = 'user-1'): EmailCampaign[] {
  logger.info('Generating mock email campaigns', { count, userId })

  const emailCampaigns: EmailCampaign[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const recipients = Math.floor(Math.random() * 10000) + 1000
    const sent = Math.floor(recipients * (0.95 + Math.random() * 0.05))
    const delivered = Math.floor(sent * (0.95 + Math.random() * 0.05))
    const opened = Math.floor(delivered * (Math.random() * 0.3 + 0.1))
    const clicked = Math.floor(opened * (Math.random() * 0.2))
    const bounced = sent - delivered
    const unsubscribed = Math.floor(delivered * (Math.random() * 0.01))

    emailCampaigns.push({
      id: `email-${i + 1}`,
      campaignId: `campaign-${i + 1}`,
      userId,
      subject: `Newsletter ${i + 1} - Latest Updates`,
      content: 'Email content here...',
      fromName: 'Marketing Team',
      fromEmail: 'marketing@company.com',
      replyTo: 'support@company.com',
      recipients,
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      unsubscribed,
      openRate: (opened / delivered) * 100,
      clickRate: (clicked / delivered) * 100,
      bounceRate: (bounced / sent) * 100,
      scheduledAt: Math.random() > 0.5 ? new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      sentAt: Math.random() > 0.3 ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      status: Math.random() > 0.7 ? 'draft' : (Math.random() > 0.5 ? 'sent' : 'scheduled'),
      createdAt: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.info('Mock email campaigns generated successfully', { total: emailCampaigns.length })
  return emailCampaigns
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function searchLeads(leads: Lead[], searchTerm: string): Lead[] {
  if (!searchTerm.trim()) return leads

  const term = searchTerm.toLowerCase()
  logger.debug('Searching leads', { searchTerm: term, totalLeads: leads.length })

  const results = leads.filter(lead =>
    lead.name.toLowerCase().includes(term) ||
    lead.email.toLowerCase().includes(term) ||
    lead.company?.toLowerCase().includes(term) ||
    lead.tags.some(tag => tag.toLowerCase().includes(term))
  )

  logger.debug('Search completed', { resultsCount: results.length })
  return results
}

export function filterByStatus(leads: Lead[], status: LeadStatus | 'all'): Lead[] {
  if (status === 'all') return leads

  logger.debug('Filtering by status', { status })
  return leads.filter(l => l.status === status)
}

export function filterByScore(leads: Lead[], score: LeadScore | 'all'): Lead[] {
  if (score === 'all') return leads

  logger.debug('Filtering by score', { score })
  return leads.filter(l => l.score === score)
}

export function filterBySource(leads: Lead[], source: LeadSource | 'all'): Lead[] {
  if (source === 'all') return leads

  logger.debug('Filtering by source', { source })
  return leads.filter(l => l.source === source)
}

export function sortLeads(leads: Lead[], sortBy: 'name' | 'score' | 'date' | 'value'): Lead[] {
  logger.debug('Sorting leads', { sortBy, count: leads.length })

  const sorted = [...leads].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)

      case 'score':
        return b.scoreValue - a.scoreValue

      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

      case 'value':
        return (b.estimatedValue || 0) - (a.estimatedValue || 0)

      default:
        return 0
    }
  })

  return sorted
}

export function calculateMarketingStats(leads: Lead[], campaigns: Campaign[]): MarketingStats {
  logger.debug('Calculating marketing statistics', { totalLeads: leads.length, totalCampaigns: campaigns.length })

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const newLeadsThisMonth = leads.filter(l => new Date(l.createdAt) >= monthStart).length
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length
  const hotLeads = leads.filter(l => l.score === 'hot').length
  const wonLeads = leads.filter(l => l.status === 'won').length

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0)
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0)

  const topCampaign = campaigns.length > 0
    ? campaigns.reduce((max, c) => c.metrics.roi > (max?.metrics.roi || 0) ? c : max, campaigns[0])
    : undefined

  const stats: MarketingStats = {
    totalLeads: leads.length,
    newLeadsThisMonth,
    qualifiedLeads,
    hotLeads,
    conversionRate: leads.length > 0 ? (wonLeads / leads.length) * 100 : 0,
    totalCampaigns: campaigns.length,
    activeCampaigns,
    totalBudget,
    totalSpent,
    totalRevenue,
    roi: totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0,
    averageLeadScore: leads.length > 0 ? leads.reduce((sum, l) => sum + l.scoreValue, 0) / leads.length : 0,
    topPerformingCampaign: topCampaign ? { name: topCampaign.name, roi: topCampaign.metrics.roi } : undefined,
    lastUpdated: new Date().toISOString()
  }

  logger.info('Statistics calculated', {
    totalLeads: stats.totalLeads,
    conversionRate: stats.conversionRate.toFixed(1),
    roi: stats.roi.toFixed(1)
  })

  return stats
}

export function exportLeadsData(leads: Lead[], format: 'csv' | 'json'): Blob {
  logger.info('Exporting leads data', { count: leads.length, format })

  if (format === 'json') {
    const data = JSON.stringify(leads, null, 2)
    return new Blob([data], { type: 'application/json' })
  }

  // CSV export
  let csv = 'Name,Email,Company,Status,Score,Score Value,Source,Created At\n'
  leads.forEach(lead => {
    csv += `"${lead.name}","${lead.email}","${lead.company || ''}","${lead.status}","${lead.score}",${lead.scoreValue},"${lead.source}","${lead.createdAt}"\n`
  })

  return new Blob([csv], { type: 'text/csv' })
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  logger as marketingLogger
}
