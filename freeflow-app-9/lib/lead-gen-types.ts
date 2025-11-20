/**
 * Lead Generation Types
 * Complete type system for lead capture and conversion optimization
 */

export type LeadSource = 'website' | 'landing-page' | 'social-media' | 'email' | 'referral' | 'paid-ads' | 'organic' | 'other'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'
export type LeadScore = 'cold' | 'warm' | 'hot'
export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
export type LandingPageStatus = 'draft' | 'published' | 'archived'
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'
export type NurtureStatus = 'pending' | 'in-progress' | 'completed' | 'failed'

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  source: LeadSource
  status: LeadStatus
  score: number
  scoreLabel: LeadScore
  tags: string[]
  customFields: Record<string, any>
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  lastContactedAt?: Date
  convertedAt?: Date
  metadata: LeadMetadata
}

export interface LeadMetadata {
  pageViews: number
  formSubmissions: number
  emailOpens: number
  emailClicks: number
  downloadedAssets: string[]
  visitedPages: string[]
  timeOnSite: number
  deviceType: string
  browser: string
  location?: {
    city?: string
    country?: string
  }
}

export interface LeadForm {
  id: string
  name: string
  description?: string
  fields: FormField[]
  settings: FormSettings
  submissions: number
  conversionRate: number
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface FormField {
  id: string
  type: FormFieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: FieldValidation
  defaultValue?: any
  order: number
}

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
  customError?: string
}

export interface FormSettings {
  submitButtonText: string
  successMessage: string
  redirectUrl?: string
  notificationEmail?: string
  allowFileUpload: boolean
  maxFileSize: number
  enableCaptcha: boolean
  doubleOptIn: boolean
  tags: string[]
  autoAssign?: string
}

export interface LandingPage {
  id: string
  name: string
  slug: string
  title: string
  description?: string
  status: LandingPageStatus
  template: string
  sections: PageSection[]
  seo: SEOSettings
  formId?: string
  stats: LandingPageStats
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface PageSection {
  id: string
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'form' | 'content' | 'custom'
  title?: string
  content: Record<string, any>
  order: number
  isVisible: boolean
}

export interface SEOSettings {
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogImage?: string
  canonicalUrl?: string
}

export interface LandingPageStats {
  views: number
  uniqueVisitors: number
  submissions: number
  conversionRate: number
  averageTimeOnPage: number
  bounceRate: number
}

export interface LeadCampaign {
  id: string
  name: string
  description?: string
  type: 'email' | 'social' | 'paid-ads' | 'content' | 'webinar' | 'multi-channel'
  status: CampaignStatus
  startDate: Date
  endDate?: Date
  budget?: number
  spent?: number
  landingPageId?: string
  formId?: string
  targetAudience: string
  goals: CampaignGoal[]
  stats: CampaignStats
  createdAt: Date
  updatedAt: Date
}

export interface CampaignGoal {
  id: string
  metric: 'leads' | 'conversions' | 'revenue' | 'engagement'
  target: number
  current: number
  progress: number
}

export interface CampaignStats {
  impressions: number
  clicks: number
  clickThroughRate: number
  leads: number
  conversions: number
  conversionRate: number
  costPerLead: number
  costPerConversion: number
  roi: number
}

export interface LeadMagnet {
  id: string
  name: string
  type: 'ebook' | 'whitepaper' | 'checklist' | 'template' | 'webinar' | 'trial' | 'demo' | 'other'
  description: string
  fileUrl?: string
  thumbnailUrl?: string
  formId: string
  downloads: number
  conversionRate: number
  createdAt: Date
  isActive: boolean
}

export interface NurtureSequence {
  id: string
  name: string
  description?: string
  trigger: 'form-submission' | 'tag-added' | 'score-threshold' | 'manual'
  triggerValue?: any
  steps: NurtureStep[]
  status: NurtureStatus
  enrolledLeads: number
  completedLeads: number
  completionRate: number
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface NurtureStep {
  id: string
  type: 'email' | 'sms' | 'task' | 'tag' | 'score-update' | 'wait'
  delay: number
  delayUnit: 'minutes' | 'hours' | 'days'
  content: Record<string, any>
  order: number
  stats: {
    sent: number
    opened?: number
    clicked?: number
    completed: number
  }
}

export interface ABTest {
  id: string
  name: string
  type: 'landing-page' | 'form' | 'email'
  status: 'draft' | 'running' | 'completed'
  variants: TestVariant[]
  winnerVariantId?: string
  startDate?: Date
  endDate?: Date
  trafficSplit: number[]
  conversionGoal: string
  stats: ABTestStats
}

export interface TestVariant {
  id: string
  name: string
  description?: string
  isControl: boolean
  resourceId: string
  traffic: number
  conversions: number
  conversionRate: number
}

export interface ABTestStats {
  totalVisitors: number
  totalConversions: number
  confidenceLevel: number
  statisticalSignificance: boolean
}

export interface LeadGenStats {
  totalLeads: number
  newLeadsToday: number
  newLeadsThisWeek: number
  newLeadsThisMonth: number
  conversionRate: number
  averageLeadScore: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  leadsBySource: { source: LeadSource; count: number; conversionRate: number }[]
  leadsByStatus: Record<LeadStatus, number>
  topPerformingForms: { formId: string; formName: string; submissions: number }[]
  topPerformingPages: { pageId: string; pageName: string; conversions: number }[]
}

export interface LeadFilter {
  status?: LeadStatus[]
  score?: LeadScore[]
  source?: LeadSource[]
  tags?: string[]
  assignedTo?: string[]
  dateRange?: { from: Date; to: Date }
  search?: string
}
