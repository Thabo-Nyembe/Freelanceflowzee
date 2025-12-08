/**
 * Email Marketing Types
 * Complete type system for email campaigns and automation
 */

export type CampaignType = 'newsletter' | 'promotional' | 'transactional' | 'drip' | 'announcement' | 'custom'
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
export type SubscriberStatus = 'subscribed' | 'unsubscribed' | 'bounced' | 'complained'
export type SegmentCriteria = 'tag' | 'activity' | 'location' | 'custom-field' | 'engagement'
export type AutomationTrigger = 'subscriber-added' | 'tag-added' | 'link-clicked' | 'email-opened' | 'date' | 'custom'
export type EmailEditor = 'drag-drop' | 'html' | 'markdown'

export interface EmailCampaign {
  id: string
  name: string
  subject: string
  preheader?: string
  type: CampaignType
  status: CampaignStatus
  fromName: string
  fromEmail: string
  replyTo?: string
  content: EmailContent
  segmentId?: string
  recipientCount: number
  scheduledAt?: Date
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
  stats: CampaignStats
  abTest?: ABTestConfig
}

export interface EmailContent {
  html: string
  plainText: string
  template?: string
  editor: EmailEditor
  blocks?: ContentBlock[]
}

export interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'button' | 'divider' | 'social' | 'custom'
  content: Record<string, any>
  order: number
}

export interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
  unsubscribed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  clickToOpenRate: number
  unsubscribeRate: number
  bounceRate: number
  revenue?: number
}

export interface ABTestConfig {
  enabled: boolean
  variantA: {
    subject: string
    percentage: number
  }
  variantB: {
    subject: string
    percentage: number
  }
  winnerCriteria: 'open-rate' | 'click-rate'
  testDuration: number
  winnerSubject?: string
}

export interface Subscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  status: SubscriberStatus
  tags: string[]
  customFields: Record<string, any>
  source: string
  subscribedAt: Date
  unsubscribedAt?: Date
  lastEmailedAt?: Date
  engagement: SubscriberEngagement
  metadata: SubscriberMetadata
}

export interface SubscriberEngagement {
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  lastOpenedAt?: Date
  lastClickedAt?: Date
  averageOpenRate: number
  averageClickRate: number
  engagementScore: number
}

export interface SubscriberMetadata {
  ipAddress?: string
  userAgent?: string
  location?: {
    country?: string
    city?: string
    timezone?: string
  }
  preferences: {
    frequency?: 'daily' | 'weekly' | 'monthly'
    topics?: string[]
  }
}

export interface Segment {
  id: string
  name: string
  description?: string
  criteria: SegmentRule[]
  subscriberCount: number
  isStatic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SegmentRule {
  id: string
  field: string
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'in' | 'not-in'
  value: any
  condition: 'and' | 'or'
}

export interface EmailTemplate {
  id: string
  name: string
  description?: string
  category: 'newsletter' | 'promotional' | 'transactional' | 'welcome' | 'custom'
  thumbnail?: string
  content: EmailContent
  isPublic: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Automation {
  id: string
  name: string
  description?: string
  trigger: AutomationTrigger
  triggerConfig: Record<string, any>
  status: 'active' | 'paused' | 'draft'
  steps: AutomationStep[]
  subscriberCount: number
  completedCount: number
  conversionRate: number
  createdAt: Date
  updatedAt: Date
}

export interface AutomationStep {
  id: string
  type: 'send-email' | 'wait' | 'add-tag' | 'remove-tag' | 'update-field' | 'webhook'
  delay?: number
  delayUnit?: 'minutes' | 'hours' | 'days'
  config: Record<string, any>
  order: number
  stats: {
    entered: number
    completed: number
    failed: number
  }
}

export interface EmailList {
  id: string
  name: string
  description?: string
  subscriberCount: number
  activeSubscribers: number
  defaultFrom: {
    name: string
    email: string
  }
  doubleOptIn: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface EmailStats {
  totalSubscribers: number
  activeSubscribers: number
  newSubscribersToday: number
  newSubscribersThisWeek: number
  newSubscribersThisMonth: number
  unsubscribedThisMonth: number
  totalCampaigns: number
  campaignsSent: number
  campaignsScheduled: number
  averageOpenRate: number
  averageClickRate: number
  revenueThisMonth: number
  topPerformingCampaigns: { campaignId: string; campaignName: string; openRate: number }[]
  subscriberGrowth: { month: string; subscribers: number }[]
}

export interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  secret?: string
  createdAt: Date
  lastTriggeredAt?: Date
}

export interface DomainSettings {
  domain: string
  verified: boolean
  dkimRecord: string
  spfRecord: string
  dmarcRecord: string
  verifiedAt?: Date
}
