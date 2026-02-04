/**
 * Email Agent Setup Utilities
 *
 * Comprehensive setup wizard management for email agent integrations including
 * email providers, AI, calendar, payments, SMS, and CRM systems.
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('EmailAgentSetupUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SetupStep = 'welcome' | 'email' | 'ai' | 'calendar' | 'payments' | 'sms' | 'crm' | 'review' | 'complete'
export type IntegrationType = 'email' | 'ai' | 'calendar' | 'payment' | 'sms' | 'crm'
export type IntegrationStatus = 'not_configured' | 'configuring' | 'testing' | 'connected' | 'error' | 'disconnected'
export type EmailProvider = 'gmail' | 'outlook' | 'imap' | 'resend' | 'sendgrid'
export type AIProvider = 'openai' | 'anthropic' | 'both' | 'google' | 'cohere'
export type CalendarProvider = 'google' | 'outlook' | 'apple' | 'none'
export type PaymentProvider = 'stripe' | 'paypal' | 'square' | 'none'
export type SMSProvider = 'twilio' | 'vonage' | 'messagebird' | 'none'
export type CRMProvider = 'hubspot' | 'salesforce' | 'pipedrive' | 'zoho' | 'none'

export interface Integration {
  id: string
  name: string
  type: IntegrationType
  provider: string
  status: IntegrationStatus
  required: boolean
  icon: string
  description: string
  config?: IntegrationConfig
  error?: string
  testResults?: TestResults
  connectedAt?: string
  lastSynced?: string
}

export interface IntegrationConfig {
  provider: string
  credentials: Record<string, any>
  settings: Record<string, any>
  webhookUrl?: string
  apiEndpoint?: string
  enabled: boolean
}

export interface TestResults {
  success: boolean
  latency?: number // milliseconds
  error?: string
  testedAt: string
  details?: Record<string, any>
}

export interface SetupConfig {
  email: EmailConfig
  ai: AIConfig
  calendar?: CalendarConfig
  payments?: PaymentConfig
  sms?: SMSConfig
  crm?: CRMConfig
}

export interface EmailConfig {
  provider: EmailProvider
  credentials?: {
    email?: string
    password?: string
    apiKey?: string
    host?: string
    port?: number
    secure?: boolean
  }
  settings?: {
    autoReply?: boolean
    forwardTo?: string
    signature?: string
    maxEmailsPerDay?: number
  }
}

export interface AIConfig {
  provider: AIProvider
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
  settings?: {
    enableSentimentAnalysis?: boolean
    enableAutoResponse?: boolean
    responseStyle?: 'professional' | 'friendly' | 'casual'
  }
}

export interface CalendarConfig {
  provider: CalendarProvider
  credentials?: any
  settings?: {
    defaultDuration?: number
    bufferTime?: number
    workingHours?: {
      start: string
      end: string
    }
  }
}

export interface PaymentConfig {
  provider: PaymentProvider
  credentials?: {
    apiKey?: string
    secretKey?: string
    webhookSecret?: string
  }
  settings?: {
    currency?: string
    acceptedMethods?: string[]
  }
}

export interface SMSConfig {
  provider: SMSProvider
  credentials?: {
    accountSid?: string
    authToken?: string
    phoneNumber?: string
  }
  settings?: {
    enableWhatsApp?: boolean
    defaultCountryCode?: string
  }
}

export interface CRMConfig {
  provider: CRMProvider
  credentials?: {
    apiKey?: string
    domain?: string
  }
  settings?: {
    syncInterval?: number
    autoCreateContacts?: boolean
  }
}

export interface SetupProgress {
  currentStep: SetupStep
  completedSteps: SetupStep[]
  totalSteps: number
  percentage: number
  integrations: {
    required: number
    configured: number
    optional: number
  }
}

export interface ProviderTemplate {
  provider: string
  name: string
  icon: string
  color: string
  recommended: boolean
  features: string[]
  setup: {
    difficulty: 'easy' | 'medium' | 'hard'
    estimatedTime: number // minutes
    requirements: string[]
  }
  pricing?: {
    tier: 'free' | 'paid' | 'freemium'
    startingPrice?: string
  }
}

// ============================================================================
// PROVIDER TEMPLATES
// ============================================================================

export const emailProviders: ProviderTemplate[] = [
  {
    provider: 'gmail',
    name: 'Gmail',
    icon: 'Mail',
    color: 'bg-red-500',
    recommended: true,
    features: ['OAuth 2.0', 'High deliverability', 'Free tier', 'Easy setup'],
    setup: {
      difficulty: 'easy',
      estimatedTime: 5,
      requirements: ['Google Account', 'OAuth consent screen']
    },
    pricing: {
      tier: 'free'
    }
  },
  {
    provider: 'outlook',
    name: 'Outlook',
    icon: 'Mail',
    color: 'bg-blue-500',
    recommended: true,
    features: ['Microsoft Graph API', 'Enterprise ready', 'Office 365 integration'],
    setup: {
      difficulty: 'easy',
      estimatedTime: 5,
      requirements: ['Microsoft Account', 'Azure AD app']
    },
    pricing: {
      tier: 'free'
    }
  },
  {
    provider: 'resend',
    name: 'Resend',
    icon: 'Mail',
    color: 'bg-purple-500',
    recommended: false,
    features: ['Developer-first', 'API-based', 'Analytics', 'High deliverability'],
    setup: {
      difficulty: 'easy',
      estimatedTime: 2,
      requirements: ['Resend account', 'API key', 'Domain verification']
    },
    pricing: {
      tier: 'freemium',
      startingPrice: '$0/mo (3k emails)'
    }
  },
  {
    provider: 'sendgrid',
    name: 'SendGrid',
    icon: 'Mail',
    color: 'bg-cyan-500',
    recommended: false,
    features: ['Enterprise scale', 'Advanced analytics', 'Template engine'],
    setup: {
      difficulty: 'medium',
      estimatedTime: 10,
      requirements: ['SendGrid account', 'API key', 'Sender authentication']
    },
    pricing: {
      tier: 'freemium',
      startingPrice: '$0/mo (100 emails/day)'
    }
  },
  {
    provider: 'imap',
    name: 'IMAP',
    icon: 'Mail',
    color: 'bg-gray-500',
    recommended: false,
    features: ['Any email provider', 'Direct access', 'Full control'],
    setup: {
      difficulty: 'hard',
      estimatedTime: 15,
      requirements: ['IMAP credentials', 'App password', 'Security settings']
    },
    pricing: {
      tier: 'free'
    }
  }
]

export const aiProviders: ProviderTemplate[] = [
  {
    provider: 'openai',
    name: 'OpenAI',
    icon: 'Brain',
    color: 'bg-green-500',
    recommended: true,
    features: ['GPT-4', 'Function calling', 'Vision', 'Most popular'],
    setup: {
      difficulty: 'easy',
      estimatedTime: 2,
      requirements: ['OpenAI account', 'API key']
    },
    pricing: {
      tier: 'paid',
      startingPrice: '$0.03/1K tokens'
    }
  },
  {
    provider: 'anthropic',
    name: 'Anthropic',
    icon: 'Brain',
    color: 'bg-orange-500',
    recommended: true,
    features: ['Claude 3.5', 'Long context', 'Safer outputs', 'Code generation'],
    setup: {
      difficulty: 'easy',
      estimatedTime: 2,
      requirements: ['Anthropic account', 'API key']
    },
    pricing: {
      tier: 'paid',
      startingPrice: '$0.25/1M tokens'
    }
  },
  {
    provider: 'google',
    name: 'Google AI',
    icon: 'Brain',
    color: 'bg-blue-500',
    recommended: false,
    features: ['Gemini Pro', 'Multimodal', 'Free tier', 'Google integration'],
    setup: {
      difficulty: 'medium',
      estimatedTime: 5,
      requirements: ['Google Cloud account', 'API key', 'Project setup']
    },
    pricing: {
      tier: 'freemium',
      startingPrice: 'Free tier available'
    }
  }
]

export const calendarProviders: ProviderTemplate[] = [
  {
    provider: 'google',
    name: 'Google Calendar',
    icon: 'Calendar',
    color: 'bg-blue-500',
    recommended: true,
    features: ['Easy integration', 'Free', 'Most popular', 'Mobile sync'],
    setup: {
      difficulty: 'easy',
      estimatedTime: 5,
      requirements: ['Google account', 'OAuth setup']
    },
    pricing: {
      tier: 'free'
    }
  },
  {
    provider: 'outlook',
    name: 'Outlook Calendar',
    icon: 'Calendar',
    color: 'bg-indigo-500',
    recommended: true,
    features: ['Office 365', 'Enterprise features', 'Teams integration'],
    setup: {
      difficulty: 'easy',
      estimatedTime: 5,
      requirements: ['Microsoft account', 'Graph API access']
    },
    pricing: {
      tier: 'free'
    }
  }
]

export const paymentProviders: ProviderTemplate[] = [
  {
    provider: 'stripe',
    name: 'Stripe',
    icon: 'CreditCard',
    color: 'bg-purple-500',
    recommended: true,
    features: ['Most popular', 'Global', 'Low fees', 'Great docs'],
    setup: {
      difficulty: 'medium',
      estimatedTime: 10,
      requirements: ['Stripe account', 'API keys', 'Webhook setup']
    },
    pricing: {
      tier: 'paid',
      startingPrice: '2.9% + $0.30/transaction'
    }
  }
]

export const smsProviders: ProviderTemplate[] = [
  {
    provider: 'twilio',
    name: 'Twilio',
    icon: 'MessageSquare',
    color: 'bg-red-500',
    recommended: true,
    features: ['SMS + WhatsApp', 'Global coverage', 'Reliable', 'Programmable'],
    setup: {
      difficulty: 'medium',
      estimatedTime: 10,
      requirements: ['Twilio account', 'Phone number', 'API credentials']
    },
    pricing: {
      tier: 'paid',
      startingPrice: '$0.0075/SMS'
    }
  }
]

export const crmProviders: ProviderTemplate[] = [
  {
    provider: 'hubspot',
    name: 'HubSpot',
    icon: 'Users',
    color: 'bg-orange-500',
    recommended: true,
    features: ['Free tier', 'Full CRM', 'Marketing tools', 'Easy API'],
    setup: {
      difficulty: 'easy',
      estimatedTime: 5,
      requirements: ['HubSpot account', 'API key']
    },
    pricing: {
      tier: 'freemium',
      startingPrice: 'Free tier available'
    }
  },
  {
    provider: 'salesforce',
    name: 'Salesforce',
    icon: 'Users',
    color: 'bg-blue-500',
    recommended: false,
    features: ['Enterprise grade', 'Customizable', 'Industry leader'],
    setup: {
      difficulty: 'hard',
      estimatedTime: 20,
      requirements: ['Salesforce account', 'Connected app', 'OAuth setup']
    },
    pricing: {
      tier: 'paid',
      startingPrice: '$25/user/month'
    }
  }
]

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

export function generateMockIntegrations(count: number = 6, userId: string = 'user-1'): Integration[] {
  const types: IntegrationType[] = ['email', 'ai', 'calendar', 'payment', 'sms', 'crm']
  const statuses: IntegrationStatus[] = ['not_configured', 'configuring', 'testing', 'connected', 'error']

  const templates = [
    { type: 'email', name: 'Email', provider: 'Gmail', icon: 'Mail', required: true },
    { type: 'ai', name: 'AI Provider', provider: 'OpenAI', icon: 'Brain', required: true },
    { type: 'calendar', name: 'Calendar', provider: 'Google Calendar', icon: 'Calendar', required: false },
    { type: 'payment', name: 'Payments', provider: 'Stripe', icon: 'CreditCard', required: false },
    { type: 'sms', name: 'SMS/WhatsApp', provider: 'Twilio', icon: 'MessageSquare', required: false },
    { type: 'crm', name: 'CRM', provider: 'HubSpot', icon: 'Users', required: false }
  ]

  return templates.slice(0, count).map((template, i) => ({
    id: `integration-${i + 1}`,
    name: template.name,
    type: template.type as IntegrationType,
    provider: template.provider,
    status: i < 2 ? 'connected' : statuses[i % statuses.length],
    required: template.required,
    icon: template.icon,
    description: `${template.provider} integration for ${template.name.toLowerCase()}`,
    config: i < 2 ? {
      provider: template.provider.toLowerCase(),
      credentials: { apiKey: `***${Math.random().toString(36).substring(7)}` },
      settings: { enabled: true },
      enabled: true
    } : undefined,
    testResults: i < 2 ? {
      success: true,
      latency: Math.floor(Math.random() * 500) + 100,
      testedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      details: { message: 'Connection successful' }
    } : undefined,
    connectedAt: i < 2 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    lastSynced: i < 2 ? new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString() : undefined
  }))
}

export function generateMockSetupProgress(currentStep: SetupStep = 'email'): SetupProgress {
  const steps: SetupStep[] = ['welcome', 'email', 'ai', 'calendar', 'payments', 'sms', 'crm', 'review', 'complete']
  const currentIndex = steps.indexOf(currentStep)
  const completedSteps = steps.slice(0, currentIndex)

  return {
    currentStep,
    completedSteps,
    totalSteps: steps.length,
    percentage: Math.floor((currentIndex / steps.length) * 100),
    integrations: {
      required: 2,
      configured: currentIndex >= 2 ? 2 : currentIndex >= 1 ? 1 : 0,
      optional: 4
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculateSetupProgress(integrations: Integration[]): number {
  const requiredIntegrations = integrations.filter(i => i.required)
  const configuredRequired = requiredIntegrations.filter(i => i.status === 'connected').length
  const optionalIntegrations = integrations.filter(i => !i.required)
  const configuredOptional = optionalIntegrations.filter(i => i.status === 'connected').length

  // Required integrations count for 70%, optional for 30%
  const requiredProgress = requiredIntegrations.length > 0
    ? (configuredRequired / requiredIntegrations.length) * 70
    : 0

  const optionalProgress = optionalIntegrations.length > 0
    ? (configuredOptional / optionalIntegrations.length) * 30
    : 0

  return Math.floor(requiredProgress + optionalProgress)
}

export function getIntegrationsByStatus(integrations: Integration[], status: IntegrationStatus): Integration[] {
  return integrations.filter(i => i.status === status)
}

export function getIntegrationsByType(integrations: Integration[], type: IntegrationType): Integration[] {
  return integrations.filter(i => i.type === type)
}

export function getRequiredIntegrations(integrations: Integration[]): Integration[] {
  return integrations.filter(i => i.required)
}

export function getOptionalIntegrations(integrations: Integration[]): Integration[] {
  return integrations.filter(i => !i.required)
}

export function isSetupComplete(integrations: Integration[]): boolean {
  const requiredIntegrations = getRequiredIntegrations(integrations)
  return requiredIntegrations.every(i => i.status === 'connected')
}

export function getNextStep(currentStep: SetupStep, skipOptional: boolean = false): SetupStep | null {
  const allSteps: SetupStep[] = ['welcome', 'email', 'ai', 'calendar', 'payments', 'sms', 'crm', 'review', 'complete']
  const requiredSteps: SetupStep[] = ['welcome', 'email', 'ai', 'review', 'complete']

  const steps = skipOptional ? requiredSteps : allSteps
  const currentIndex = steps.indexOf(currentStep)

  if (currentIndex === -1 || currentIndex === steps.length - 1) {
    return null
  }

  return steps[currentIndex + 1]
}

export function getPreviousStep(currentStep: SetupStep): SetupStep | null {
  const steps: SetupStep[] = ['welcome', 'email', 'ai', 'calendar', 'payments', 'sms', 'crm', 'review', 'complete']
  const currentIndex = steps.indexOf(currentStep)

  if (currentIndex <= 0) {
    return null
  }

  return steps[currentIndex - 1]
}

export function validateEmailConfig(config: EmailConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.provider) {
    errors.push('Email provider is required')
  }

  if (config.provider === 'imap') {
    if (!config.credentials?.host) errors.push('IMAP host is required')
    if (!config.credentials?.port) errors.push('IMAP port is required')
    if (!config.credentials?.email) errors.push('Email address is required')
    if (!config.credentials?.password) errors.push('Password is required')
  } else if (config.provider !== 'gmail' && config.provider !== 'outlook') {
    if (!config.credentials?.apiKey) errors.push('API key is required')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateAIConfig(config: AIConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.provider) {
    errors.push('AI provider is required')
  }

  if (!config.apiKey) {
    errors.push('API key is required')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '***'
  return apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4)
}

export function getProviderTemplate(type: IntegrationType, provider: string): ProviderTemplate | undefined {
  const providers = {
    email: emailProviders,
    ai: aiProviders,
    calendar: calendarProviders,
    payment: paymentProviders,
    sms: smsProviders,
    crm: crmProviders
  }

  return providers[type]?.find(p => p.provider === provider.toLowerCase())
}

export function estimateTotalSetupTime(integrations: Integration[]): number {
  let totalTime = 0

  for (const integration of integrations) {
    const template = getProviderTemplate(integration.type, integration.provider)
    if (template && integration.status !== 'connected') {
      totalTime += template.setup.estimatedTime
    }
  }

  return totalTime
}

export function getSetupRecommendations(integrations: Integration[]): string[] {
  const recommendations: string[] = []

  const emailIntegration = integrations.find(i => i.type === 'email')
  const aiIntegration = integrations.find(i => i.type === 'ai')

  if (!emailIntegration || emailIntegration.status !== 'connected') {
    recommendations.push('Connect your email to start automating responses')
  }

  if (!aiIntegration || aiIntegration.status !== 'connected') {
    recommendations.push('Add AI to enable intelligent email processing')
  }

  const calendarIntegration = integrations.find(i => i.type === 'calendar')
  if (!calendarIntegration || calendarIntegration.status !== 'connected') {
    recommendations.push('Connect calendar for automatic scheduling')
  }

  const paymentIntegration = integrations.find(i => i.type === 'payment')
  if (!paymentIntegration || paymentIntegration.status !== 'connected') {
    recommendations.push('Add payment processing to accept bookings')
  }

  return recommendations
}
