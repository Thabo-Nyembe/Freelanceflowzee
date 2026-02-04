/**
 * Email Agent Utilities
 *
 * Comprehensive email automation and intelligence system with AI-powered analysis,
 * automatic responses, quotation generation, booking management, and approval workflows.
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('EmailAgentUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type EmailIntent = 'quote_request' | 'inquiry' | 'booking' | 'complaint' | 'follow_up' | 'support' | 'payment' | 'general'
export type EmailSentiment = 'positive' | 'neutral' | 'negative' | 'urgent'
export type EmailPriority = 'critical' | 'high' | 'medium' | 'low'
export type EmailCategory = 'sales' | 'booking' | 'support' | 'billing' | 'general' | 'spam'
export type EmailStatus = 'pending' | 'processing' | 'processed' | 'responded' | 'archived' | 'flagged'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type ApprovalType = 'response' | 'quotation' | 'booking' | 'refund' | 'discount'

export interface EmailMessage {
  id: string
  userId: string
  from: string
  to: string
  subject: string
  body: string
  htmlBody?: string
  receivedAt: string
  readAt?: string
  analysis?: EmailAnalysis
  response?: EmailResponse
  quotation?: Quotation
  booking?: Booking
  status: EmailStatus
  hasResponse: boolean
  hasQuotation: boolean
  hasBooking: boolean
  threadId?: string
  attachments?: EmailAttachment[]
  createdAt: string
  updatedAt: string
}

export interface EmailAnalysis {
  intent: EmailIntent
  sentiment: EmailSentiment
  priority: EmailPriority
  category: EmailCategory
  summary: string
  keyPoints: string[]
  extractedInfo: {
    name?: string
    company?: string
    phone?: string
    deadline?: string
    budget?: string
    requirements?: string[]
  }
  requiresQuotation: boolean
  requiresBooking: boolean
  requiresHumanReview: boolean
  confidenceScore: number
  processingTime: number
  analyzedAt: string
}

export interface EmailResponse {
  id: string
  emailId: string
  subject: string
  body: string
  tone: 'professional' | 'friendly' | 'formal' | 'casual'
  generatedAt: string
  approvedAt?: string
  sentAt?: string
  approvedBy?: string
  status: ApprovalStatus
}

export interface Quotation {
  id: string
  emailId: string
  clientName: string
  projectName: string
  items: QuotationItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  validUntil: string
  terms: string[]
  notes?: string
  status: ApprovalStatus
  generatedAt: string
  approvedAt?: string
  sentAt?: string
}

export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Booking {
  id: string
  emailId: string
  clientName: string
  clientEmail: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  duration: number
  notes?: string
  status: ApprovalStatus
  confirmedDate?: string
  confirmedTime?: string
  generatedAt: string
  approvedAt?: string
}

export interface EmailAttachment {
  id: string
  filename: string
  mimeType: string
  size: number
  url: string
}

export interface ApprovalWorkflow {
  id: string
  userId: string
  type: ApprovalType
  status: ApprovalStatus
  priority: EmailPriority
  emailId: string
  itemId: string
  itemData: any
  requestedBy: string
  approvedBy?: string
  rejectedBy?: string
  reason?: string
  expiresAt: string
  createdAt: string
  processedAt?: string
}

export interface EmailStatistics {
  totalEmailsReceived: number
  totalEmailsProcessed: number
  responsesGenerated: number
  responsesSent: number
  quotationsGenerated: number
  quotationsSent: number
  bookingsCreated: number
  bookingsConfirmed: number
  approvalsPending: number
  approvalsApproved: number
  approvalsRejected: number
  avgResponseTime: number
  avgConfidenceScore: number
  avgProcessingTime: number
}

export interface AgentConfiguration {
  id: string
  userId: string
  enabled: boolean
  autoRespond: boolean
  requireApproval: boolean
  autoApproveThreshold: number
  responseTemplate: string
  quotationTemplate: string
  workingHours: {
    enabled: boolean
    start: string
    end: string
    timezone: string
  }
  filters: {
    blockedSenders: string[]
    blockedDomains: string[]
    keywords: string[]
  }
  integrations: {
    email: boolean
    calendar: boolean
    payment: boolean
    crm: boolean
  }
  updatedAt: string
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const sampleEmails = [
  {
    from: 'john.smith@example.com',
    subject: 'Need a quote for web development project',
    body: 'Hi, I need a professional website for my business. Looking for a modern design with e-commerce functionality. Budget around $5000. Need it completed in 2 months.',
    intent: 'quote_request' as EmailIntent,
    sentiment: 'positive' as EmailSentiment,
    priority: 'high' as EmailPriority,
    category: 'sales' as EmailCategory
  },
  {
    from: 'sarah.johnson@company.com',
    subject: 'Book a consultation for next week',
    body: 'I would like to schedule a consultation to discuss our marketing needs. Available Monday-Wednesday next week.',
    intent: 'booking' as EmailIntent,
    sentiment: 'neutral' as EmailSentiment,
    priority: 'medium' as EmailPriority,
    category: 'booking' as EmailCategory
  },
  {
    from: 'mike.davis@startup.io',
    subject: 'Following up on proposal',
    body: 'Just checking in on the proposal we discussed last week. When can we expect to move forward?',
    intent: 'follow_up' as EmailIntent,
    sentiment: 'neutral' as EmailSentiment,
    priority: 'medium' as EmailPriority,
    category: 'sales' as EmailCategory
  },
  {
    from: 'lisa.brown@enterprise.com',
    subject: 'URGENT: Payment issue',
    body: 'We have been charged twice for the same invoice. This needs to be resolved immediately.',
    intent: 'complaint' as EmailIntent,
    sentiment: 'negative' as EmailSentiment,
    priority: 'critical' as EmailPriority,
    category: 'billing' as EmailCategory
  },
  {
    from: 'david.wilson@tech.com',
    subject: 'Question about your services',
    body: 'Can you provide more information about your consulting services and pricing?',
    intent: 'inquiry' as EmailIntent,
    sentiment: 'positive' as EmailSentiment,
    priority: 'low' as EmailPriority,
    category: 'general' as EmailCategory
  }
]

export function generateMockEmails(count: number = 50, userId: string = 'user-1'): EmailMessage[] {
  const emails: EmailMessage[] = []
  const statuses: EmailStatus[] = ['pending', 'processing', 'processed', 'responded', 'archived']

  for (let i = 0; i < count; i++) {
    const sample = sampleEmails[i % sampleEmails.length]
    const status = i < 10 ? 'pending' : statuses[i % statuses.length]
    const hasAnalysis = status !== 'pending'

    emails.push({
      id: `email-${i + 1}`,
      userId,
      from: sample.from,
      to: 'you@business.com',
      subject: `${sample.subject} ${i > 4 ? `#${i + 1}` : ''}`,
      body: sample.body,
      receivedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      readAt: hasAnalysis ? new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      analysis: hasAnalysis ? {
        intent: sample.intent,
        sentiment: sample.sentiment,
        priority: sample.priority,
        category: sample.category,
        summary: `${sample.intent.replace('_', ' ')} from ${sample.from.split('@')[0]}`,
        keyPoints: [
          'Key point 1',
          'Key point 2',
          'Key point 3'
        ],
        extractedInfo: {
          name: sample.from.split('@')[0].replace('.', ' '),
          company: sample.from.split('@')[1].split('.')[0],
          budget: sample.intent === 'quote_request' ? '$' + (Math.floor(Math.random() * 10) + 1) * 1000 : undefined
        },
        requiresQuotation: sample.intent === 'quote_request',
        requiresBooking: sample.intent === 'booking',
        requiresHumanReview: sample.priority === 'critical',
        confidenceScore: 70 + Math.random() * 30,
        processingTime: Math.floor(Math.random() * 3000) + 500,
        analyzedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
      } : undefined,
      status,
      hasResponse: status === 'responded' || status === 'processed',
      hasQuotation: sample.intent === 'quote_request' && status !== 'pending',
      hasBooking: sample.intent === 'booking' && status !== 'pending',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.debug('Generated mock emails', { count: emails.length })
  return emails
}

export function generateMockQuotations(count: number = 20, userId: string = 'user-1'): Quotation[] {
  const quotations: Quotation[] = []
  const statuses: ApprovalStatus[] = ['pending', 'approved', 'rejected']

  for (let i = 0; i < count; i++) {
    const itemCount = Math.floor(Math.random() * 5) + 1
    const items: QuotationItem[] = []
    let subtotal = 0

    for (let j = 0; j < itemCount; j++) {
      const unitPrice = Math.floor(Math.random() * 5000) + 500
      const quantity = Math.floor(Math.random() * 3) + 1
      const total = unitPrice * quantity

      items.push({
        id: `item-${j + 1}`,
        description: `Service ${j + 1}`,
        quantity,
        unitPrice,
        total
      })

      subtotal += total
    }

    const tax = Math.floor(subtotal * 0.1)
    const discount = Math.floor(Math.random() * 500)
    const total = subtotal + tax - discount

    quotations.push({
      id: `quotation-${i + 1}`,
      emailId: `email-${i + 1}`,
      clientName: `Client ${i + 1}`,
      projectName: `Project ${i + 1}`,
      items,
      subtotal,
      tax,
      discount,
      total,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      terms: [
        '50% deposit required',
        'Net 30 payment terms',
        'Quote valid for 30 days'
      ],
      status: statuses[i % statuses.length],
      generatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      approvedAt: i % 3 !== 0 ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      sentAt: i % 3 === 1 ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : undefined
    })
  }

  logger.debug('Generated mock quotations', { count: quotations.length })
  return quotations
}

export function generateMockApprovals(count: number = 15, userId: string = 'user-1'): ApprovalWorkflow[] {
  const approvals: ApprovalWorkflow[] = []
  const types: ApprovalType[] = ['response', 'quotation', 'booking', 'refund', 'discount']
  const statuses: ApprovalStatus[] = ['pending', 'approved', 'rejected']
  const priorities: EmailPriority[] = ['critical', 'high', 'medium', 'low']

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length]
    const status = i < 5 ? 'pending' : statuses[i % statuses.length]

    approvals.push({
      id: `approval-${i + 1}`,
      userId,
      type,
      status,
      priority: priorities[i % priorities.length],
      emailId: `email-${i + 1}`,
      itemId: `item-${i + 1}`,
      itemData: {
        type,
        description: `${type} request #${i + 1}`,
        amount: type === 'quotation' || type === 'refund' ? Math.floor(Math.random() * 5000) + 1000 : undefined
      },
      requestedBy: 'AI Agent',
      approvedBy: status === 'approved' ? userId : undefined,
      rejectedBy: status === 'rejected' ? userId : undefined,
      reason: status === 'rejected' ? 'Does not meet requirements' : undefined,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
      processedAt: status !== 'pending' ? new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString() : undefined
    })
  }

  logger.debug('Generated mock approvals', { count: approvals.length })
  return approvals
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculateEmailStatistics(emails: EmailMessage[], approvals: ApprovalWorkflow[]): EmailStatistics {
  const processedEmails = emails.filter(e => e.analysis)
  const respondedEmails = emails.filter(e => e.hasResponse)
  const quotationEmails = emails.filter(e => e.hasQuotation)
  const bookingEmails = emails.filter(e => e.hasBooking)

  const pendingApprovals = approvals.filter(a => a.status === 'pending')
  const approvedApprovals = approvals.filter(a => a.status === 'approved')
  const rejectedApprovals = approvals.filter(a => a.status === 'rejected')

  const avgResponseTime = processedEmails.length > 0
    ? processedEmails.reduce((sum, email) => {
        if (email.analysis && email.readAt) {
          const received = new Date(email.receivedAt).getTime()
          const read = new Date(email.readAt).getTime()
          return sum + (read - received)
        }
        return sum
      }, 0) / processedEmails.length / 1000 / 60 // convert to minutes
    : 0

  const avgConfidenceScore = processedEmails.length > 0
    ? processedEmails.reduce((sum, email) => sum + (email.analysis?.confidenceScore || 0), 0) / processedEmails.length
    : 0

  const avgProcessingTime = processedEmails.length > 0
    ? processedEmails.reduce((sum, email) => sum + (email.analysis?.processingTime || 0), 0) / processedEmails.length
    : 0

  return {
    totalEmailsReceived: emails.length,
    totalEmailsProcessed: processedEmails.length,
    responsesGenerated: respondedEmails.length,
    responsesSent: respondedEmails.filter(e => e.status === 'responded').length,
    quotationsGenerated: quotationEmails.length,
    quotationsSent: quotationEmails.filter(e => e.status === 'responded').length,
    bookingsCreated: bookingEmails.length,
    bookingsConfirmed: bookingEmails.filter(e => e.status === 'processed').length,
    approvalsPending: pendingApprovals.length,
    approvalsApproved: approvedApprovals.length,
    approvalsRejected: rejectedApprovals.length,
    avgResponseTime: Math.floor(avgResponseTime),
    avgConfidenceScore: Math.floor(avgConfidenceScore),
    avgProcessingTime: Math.floor(avgProcessingTime)
  }
}

export function searchEmails(emails: EmailMessage[], query: string): EmailMessage[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return emails

  return emails.filter(email =>
    email.from.toLowerCase().includes(lowerQuery) ||
    email.subject.toLowerCase().includes(lowerQuery) ||
    email.body.toLowerCase().includes(lowerQuery) ||
    email.analysis?.category.toLowerCase().includes(lowerQuery) ||
    email.analysis?.intent.toLowerCase().includes(lowerQuery)
  )
}

export function filterEmailsByStatus(emails: EmailMessage[], status: EmailStatus | 'all'): EmailMessage[] {
  if (status === 'all') return emails
  return emails.filter(email => email.status === status)
}

export function filterEmailsByPriority(emails: EmailMessage[], priority: EmailPriority): EmailMessage[] {
  return emails.filter(email => email.analysis?.priority === priority)
}

export function filterEmailsByCategory(emails: EmailMessage[], category: EmailCategory): EmailMessage[] {
  return emails.filter(email => email.analysis?.category === category)
}

export function sortEmails(
  emails: EmailMessage[],
  sortBy: 'date' | 'priority' | 'status' = 'date',
  order: 'asc' | 'desc' = 'desc'
): EmailMessage[] {
  const sorted = [...emails].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
        break
      case 'priority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        const aPriority = a.analysis?.priority || 'low'
        const bPriority = b.analysis?.priority || 'low'
        comparison = priorityOrder[aPriority] - priorityOrder[bPriority]
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}

export function getPendingApprovals(approvals: ApprovalWorkflow[]): ApprovalWorkflow[] {
  return approvals.filter(a => a.status === 'pending')
}

export function getApprovalsByType(approvals: ApprovalWorkflow[], type: ApprovalType): ApprovalWorkflow[] {
  return approvals.filter(a => a.type === type)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.floor(minutes)}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function getPriorityColor(priority: EmailPriority): string {
  const colors = {
    critical: 'destructive',
    high: 'warning',
    medium: 'default',
    low: 'secondary'
  }
  return colors[priority]
}

export function getSentimentIcon(sentiment: EmailSentiment): string {
  const icons = {
    positive: '😊',
    neutral: '😐',
    negative: '😟',
    urgent: '⚠️'
  }
  return icons[sentiment]
}
