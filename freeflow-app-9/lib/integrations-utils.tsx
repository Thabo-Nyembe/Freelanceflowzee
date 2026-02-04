// ============================================================================
// INTEGRATIONS UTILITIES - PRODUCTION
// ============================================================================
// Comprehensive integration management with OAuth, API keys, webhooks,
// third-party service connections, and sync monitoring
// ============================================================================

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('IntegrationsUtils')

// ============================================================================
// TYPESCRIPT TYPES & INTERFACES
// ============================================================================

export type IntegrationCategory =
  | 'payment'
  | 'communication'
  | 'productivity'
  | 'analytics'
  | 'storage'
  | 'marketing'
  | 'crm'
  | 'development'

export type IntegrationStatus = 'available' | 'connected' | 'disconnected' | 'error'
export type AuthType = 'oauth' | 'api-key' | 'basic' | 'webhook'
export type SetupDifficulty = 'easy' | 'medium' | 'hard'
export type SyncFrequency = 'realtime' | '5min' | '15min' | '1hour' | '6hour' | '24hour'
export type WebhookStatus = 'active' | 'inactive' | 'failed'

export interface Integration {
  id: string
  userId: string
  name: string
  description: string
  icon: string
  category: IntegrationCategory
  status: IntegrationStatus
  isPremium: boolean
  isPopular: boolean
  authType: AuthType
  connectedAt?: string
  lastSync?: string
  totalSyncs: number
  successRate: number
  dataTransferred: number // in MB
  features: string[]
  setupDifficulty: SetupDifficulty
  documentation: string
  webhookUrl?: string
  apiEndpoint?: string
  version?: string
  errorCount: number
  config?: IntegrationConfig
}

export interface IntegrationConfig {
  syncFrequency?: SyncFrequency
  autoSync?: boolean
  syncDirection?: 'inbound' | 'outbound' | 'bidirectional'
  dataMapping?: Record<string, string>
  filters?: Record<string, any>
  notifications?: {
    onSuccess?: boolean
    onError?: boolean
    onSync?: boolean
  }
  rateLimits?: {
    requestsPerHour?: number
    dataPerDay?: number
  }
  customSettings?: Record<string, any>
}

export interface IntegrationTemplate {
  id: string
  name: string
  description: string
  category: IntegrationCategory
  integrations: string[] // Integration IDs
  config: Record<string, any>
  setupSteps: string[]
  estimatedTime: number // in minutes
  difficulty: SetupDifficulty
  isPopular: boolean
  usageCount: number
}

export interface WebhookEvent {
  id: string
  integrationId: string
  userId: string
  eventType: string
  payload: any
  status: WebhookStatus
  response?: any
  responseTime?: number // in ms
  createdAt: string
  processedAt?: string
  retryCount: number
  errorMessage?: string
}

export interface SyncLog {
  id: string
  integrationId: string
  userId: string
  startedAt: string
  completedAt?: string
  status: 'running' | 'completed' | 'failed'
  recordsProcessed: number
  recordsFailed: number
  dataSize: number // in MB
  errorMessage?: string
  details?: any
}

export interface IntegrationsStats {
  totalIntegrations: number
  connectedIntegrations: number
  byCategory: Record<IntegrationCategory, number>
  byStatus: Record<IntegrationStatus, number>
  totalSyncs: number
  totalDataTransferred: number
  averageSuccessRate: number
  mostUsedIntegration?: { name: string; syncCount: number }
  recentErrors: number
  lastUpdated: string
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const integrationData = [
  // Payment
  { name: 'Stripe', icon: 'CreditCard', category: 'payment', description: 'Online payment processing', isPremium: false, isPopular: true, authType: 'api-key', setupDifficulty: 'easy', features: ['Payments', 'Subscriptions', 'Invoicing', 'Connect'] },
  { name: 'PayPal', icon: 'CreditCard', category: 'payment', description: 'Global payment platform', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'easy', features: ['Checkout', 'Payouts', 'Subscriptions'] },
  { name: 'Square', icon: 'CreditCard', category: 'payment', description: 'Payment and point of sale', isPremium: false, isPopular: false, authType: 'oauth', setupDifficulty: 'medium', features: ['POS', 'Online', 'Invoices'] },
  { name: 'Braintree', icon: 'CreditCard', category: 'payment', description: 'PayPal payment gateway', isPremium: true, isPopular: false, authType: 'api-key', setupDifficulty: 'medium', features: ['Payments', 'Vault', 'Marketplace'] },

  // Communication
  { name: 'Slack', icon: 'MessageSquare', category: 'communication', description: 'Team collaboration platform', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'easy', features: ['Messaging', 'Channels', 'Notifications', 'Bots'] },
  { name: 'Discord', icon: 'MessageSquare', category: 'communication', description: 'Voice and text chat', isPremium: false, isPopular: true, authType: 'webhook', setupDifficulty: 'easy', features: ['Webhooks', 'Bots', 'Voice'] },
  { name: 'Twilio', icon: 'Mail', category: 'communication', description: 'SMS and voice API', isPremium: true, isPopular: true, authType: 'api-key', setupDifficulty: 'medium', features: ['SMS', 'Voice', 'Video', 'WhatsApp'] },
  { name: 'SendGrid', icon: 'Mail', category: 'communication', description: 'Email delivery service', isPremium: false, isPopular: true, authType: 'api-key', setupDifficulty: 'easy', features: ['Email', 'Templates', 'Analytics'] },
  { name: 'Mailchimp', icon: 'Mail', category: 'communication', description: 'Email marketing platform', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'easy', features: ['Campaigns', 'Automation', 'Lists'] },

  // Productivity
  { name: 'Google Calendar', icon: 'Calendar', category: 'productivity', description: 'Calendar and scheduling', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'medium', features: ['Events', 'Sync', 'Reminders'] },
  { name: 'Notion', icon: 'Folder', category: 'productivity', description: 'Notes and collaboration', isPremium: false, isPopular: true, authType: 'api-key', setupDifficulty: 'medium', features: ['Databases', 'Pages', 'Sync'] },
  { name: 'Trello', icon: 'Layout', category: 'productivity', description: 'Project management boards', isPremium: false, isPopular: true, authType: 'api-key', setupDifficulty: 'easy', features: ['Boards', 'Cards', 'Automation'] },
  { name: 'Asana', icon: 'CheckSquare', category: 'productivity', description: 'Work management platform', isPremium: true, isPopular: true, authType: 'oauth', setupDifficulty: 'medium', features: ['Projects', 'Tasks', 'Teams'] },
  { name: 'Monday.com', icon: 'Layout', category: 'productivity', description: 'Work operating system', isPremium: true, isPopular: false, authType: 'api-key', setupDifficulty: 'medium', features: ['Boards', 'Automations', 'Dashboards'] },

  // Analytics
  { name: 'Google Analytics', icon: 'BarChart', category: 'analytics', description: 'Web analytics platform', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'medium', features: ['Traffic', 'Events', 'Conversions'] },
  { name: 'Mixpanel', icon: 'BarChart', category: 'analytics', description: 'Product analytics', isPremium: true, isPopular: true, authType: 'api-key', setupDifficulty: 'medium', features: ['Events', 'Funnels', 'Retention'] },
  { name: 'Amplitude', icon: 'BarChart', category: 'analytics', description: 'Digital analytics', isPremium: true, isPopular: false, authType: 'api-key', setupDifficulty: 'hard', features: ['Behavior', 'Cohorts', 'Experiments'] },
  { name: 'Segment', icon: 'BarChart', category: 'analytics', description: 'Customer data platform', isPremium: true, isPopular: true, authType: 'api-key', setupDifficulty: 'medium', features: ['Sources', 'Destinations', 'Protocols'] },

  // Storage
  { name: 'Google Drive', icon: 'Cloud', category: 'storage', description: 'Cloud file storage', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'easy', features: ['Files', 'Sharing', 'Sync'] },
  { name: 'Dropbox', icon: 'Cloud', category: 'storage', description: 'Cloud storage platform', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'easy', features: ['Files', 'Paper', 'Sign'] },
  { name: 'AWS S3', icon: 'Database', category: 'storage', description: 'Object storage service', isPremium: true, isPopular: true, authType: 'api-key', setupDifficulty: 'hard', features: ['Buckets', 'CDN', 'Lifecycle'] },
  { name: 'OneDrive', icon: 'Cloud', category: 'storage', description: 'Microsoft cloud storage', isPremium: false, isPopular: false, authType: 'oauth', setupDifficulty: 'medium', features: ['Files', 'Office', 'Sharing'] },

  // Marketing
  { name: 'HubSpot', icon: 'Users', category: 'marketing', description: 'Marketing automation', isPremium: true, isPopular: true, authType: 'oauth', setupDifficulty: 'medium', features: ['CRM', 'Marketing', 'Sales'] },
  { name: 'Facebook Ads', icon: 'Share2', category: 'marketing', description: 'Social advertising', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'medium', features: ['Campaigns', 'Insights', 'Pixels'] },
  { name: 'Google Ads', icon: 'Search', category: 'marketing', description: 'Search advertising', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'medium', features: ['Campaigns', 'Keywords', 'Analytics'] },
  { name: 'Intercom', icon: 'MessageCircle', category: 'marketing', description: 'Customer messaging', isPremium: true, isPopular: false, authType: 'api-key', setupDifficulty: 'medium', features: ['Chat', 'Bots', 'Campaigns'] },

  // CRM
  { name: 'Salesforce', icon: 'Users', category: 'crm', description: 'Customer relationship management', isPremium: true, isPopular: true, authType: 'oauth', setupDifficulty: 'hard', features: ['Contacts', 'Opportunities', 'Reports'] },
  { name: 'Pipedrive', icon: 'Users', category: 'crm', description: 'Sales CRM platform', isPremium: true, isPopular: true, authType: 'api-key', setupDifficulty: 'medium', features: ['Deals', 'Contacts', 'Pipeline'] },
  { name: 'Zoho CRM', icon: 'Users', category: 'crm', description: 'Cloud-based CRM', isPremium: false, isPopular: false, authType: 'oauth', setupDifficulty: 'medium', features: ['Leads', 'Accounts', 'Workflows'] },
  { name: 'Freshsales', icon: 'Users', category: 'crm', description: 'Sales force automation', isPremium: true, isPopular: false, authType: 'api-key', setupDifficulty: 'medium', features: ['Contacts', 'Deals', 'Email'] },

  // Development
  { name: 'GitHub', icon: 'Code', category: 'development', description: 'Code hosting platform', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'easy', features: ['Repos', 'Issues', 'Actions', 'Webhooks'] },
  { name: 'GitLab', icon: 'Code', category: 'development', description: 'DevOps platform', isPremium: false, isPopular: true, authType: 'oauth', setupDifficulty: 'medium', features: ['Repos', 'CI/CD', 'Issues'] },
  { name: 'Jira', icon: 'CheckSquare', category: 'development', description: 'Issue tracking software', isPremium: true, isPopular: true, authType: 'oauth', setupDifficulty: 'medium', features: ['Issues', 'Sprints', 'Boards'] },
  { name: 'Vercel', icon: 'Zap', category: 'development', description: 'Deployment platform', isPremium: false, isPopular: true, authType: 'api-key', setupDifficulty: 'easy', features: ['Deploy', 'Analytics', 'Edge'] },
  { name: 'Heroku', icon: 'Cloud', category: 'development', description: 'Cloud platform', isPremium: true, isPopular: false, authType: 'api-key', setupDifficulty: 'medium', features: ['Dynos', 'Add-ons', 'Pipelines'] }
]

const categories: IntegrationCategory[] = [
  'payment', 'communication', 'productivity', 'analytics',
  'storage', 'marketing', 'crm', 'development'
]

const statuses: IntegrationStatus[] = ['available', 'connected', 'disconnected', 'error']

export function generateMockIntegrations(count: number = 35, userId: string = 'user-1'): Integration[] {
  logger.info('Generating mock integrations', { count, userId })

  const integrations: Integration[] = []
  const now = new Date()

  integrationData.forEach((data, i) => {
    const isConnected = Math.random() > 0.6
    const hasError = isConnected && Math.random() > 0.9
    const status: IntegrationStatus = hasError ? 'error' : (isConnected ? 'connected' : 'available')
    const connectedAt = isConnected ? new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000) : undefined
    const totalSyncs = isConnected ? Math.floor(Math.random() * 5000) : 0

    integrations.push({
      id: `integration-${i + 1}`,
      userId,
      name: data.name,
      description: data.description,
      icon: data.icon,
      category: data.category as IntegrationCategory,
      status,
      isPremium: data.isPremium,
      isPopular: data.isPopular,
      authType: data.authType as AuthType,
      connectedAt: connectedAt?.toISOString(),
      lastSync: isConnected ? new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
      totalSyncs,
      successRate: isConnected ? 85 + Math.random() * 14 : 0,
      dataTransferred: isConnected ? Math.floor(Math.random() * 10000) : 0,
      features: data.features,
      setupDifficulty: data.setupDifficulty as SetupDifficulty,
      documentation: `https://docs.${data.name.toLowerCase().replace(/\s+/g, '')}.com`,
      webhookUrl: data.authType === 'webhook' ? `https://api.app.com/webhooks/${data.name.toLowerCase()}` : undefined,
      apiEndpoint: `https://api.${data.name.toLowerCase().replace(/\s+/g, '')}.com/v1`,
      version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
      errorCount: hasError ? Math.floor(Math.random() * 10) + 1 : 0,
      config: isConnected ? {
        syncFrequency: (['realtime', '5min', '15min', '1hour', '6hour', '24hour'] as SyncFrequency[])[Math.floor(Math.random() * 6)],
        autoSync: Math.random() > 0.3,
        syncDirection: (['inbound', 'outbound', 'bidirectional'] as const)[Math.floor(Math.random() * 3)],
        notifications: {
          onSuccess: Math.random() > 0.5,
          onError: true,
          onSync: Math.random() > 0.7
        },
        rateLimits: {
          requestsPerHour: [100, 500, 1000, 5000][Math.floor(Math.random() * 4)],
          dataPerDay: [100, 500, 1000, 5000][Math.floor(Math.random() * 4)]
        }
      } : undefined
    })
  })

  logger.info('Mock integrations generated successfully', {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    premium: integrations.filter(i => i.isPremium).length
  })

  return integrations
}

export function generateMockTemplates(count: number = 10): IntegrationTemplate[] {
  logger.info('Generating mock integration templates', { count })

  const templates: IntegrationTemplate[] = [
    {
      id: 'template-1',
      name: 'E-commerce Starter',
      description: 'Essential integrations for online stores',
      category: 'payment',
      integrations: ['integration-1', 'integration-2', 'integration-19'],
      config: { autoSetup: true },
      setupSteps: ['Connect Stripe', 'Set up payment methods', 'Configure webhooks', 'Test payments'],
      estimatedTime: 15,
      difficulty: 'easy',
      isPopular: true,
      usageCount: 1847
    },
    {
      id: 'template-2',
      name: 'Team Communication',
      description: 'Streamline team collaboration',
      category: 'communication',
      integrations: ['integration-5', 'integration-6', 'integration-8'],
      config: { channels: ['general', 'notifications'] },
      setupSteps: ['Connect Slack', 'Set up channels', 'Configure notifications', 'Invite team'],
      estimatedTime: 10,
      difficulty: 'easy',
      isPopular: true,
      usageCount: 2134
    },
    {
      id: 'template-3',
      name: 'Marketing Automation',
      description: 'Complete marketing stack',
      category: 'marketing',
      integrations: ['integration-23', 'integration-24', 'integration-9'],
      config: { campaigns: true, analytics: true },
      setupSteps: ['Connect HubSpot', 'Set up campaigns', 'Configure tracking', 'Launch'],
      estimatedTime: 45,
      difficulty: 'hard',
      isPopular: true,
      usageCount: 986
    },
    {
      id: 'template-4',
      name: 'Analytics Dashboard',
      description: 'Track all your metrics',
      category: 'analytics',
      integrations: ['integration-16', 'integration-17', 'integration-18'],
      config: { dashboards: ['overview', 'conversion', 'retention'] },
      setupSteps: ['Connect Google Analytics', 'Set up tracking', 'Create dashboards', 'Share reports'],
      estimatedTime: 30,
      difficulty: 'medium',
      isPopular: true,
      usageCount: 1523
    },
    {
      id: 'template-5',
      name: 'Developer Workflow',
      description: 'Complete DevOps setup',
      category: 'development',
      integrations: ['integration-31', 'integration-32', 'integration-33'],
      config: { ci: true, cd: true },
      setupSteps: ['Connect GitHub', 'Set up CI/CD', 'Configure webhooks', 'Deploy'],
      estimatedTime: 60,
      difficulty: 'hard',
      isPopular: true,
      usageCount: 1245
    },
    {
      id: 'template-6',
      name: 'Sales CRM',
      description: 'Manage your sales pipeline',
      category: 'crm',
      integrations: ['integration-27', 'integration-28', 'integration-23'],
      config: { pipeline: true, automation: true },
      setupSteps: ['Connect Salesforce', 'Import contacts', 'Set up pipeline', 'Configure automation'],
      estimatedTime: 40,
      difficulty: 'medium',
      isPopular: false,
      usageCount: 567
    },
    {
      id: 'template-7',
      name: 'Cloud Storage Sync',
      description: 'Sync files across platforms',
      category: 'storage',
      integrations: ['integration-20', 'integration-21', 'integration-22'],
      config: { sync: 'bidirectional' },
      setupSteps: ['Connect Google Drive', 'Select folders', 'Configure sync', 'Start syncing'],
      estimatedTime: 20,
      difficulty: 'easy',
      isPopular: false,
      usageCount: 823
    },
    {
      id: 'template-8',
      name: 'Project Management',
      description: 'Centralize project tracking',
      category: 'productivity',
      integrations: ['integration-11', 'integration-12', 'integration-13'],
      config: { boards: true, automation: true },
      setupSteps: ['Connect Trello', 'Create boards', 'Set up automation', 'Invite team'],
      estimatedTime: 25,
      difficulty: 'medium',
      isPopular: true,
      usageCount: 1678
    },
    {
      id: 'template-9',
      name: 'Customer Support',
      description: 'Enhance customer service',
      category: 'communication',
      integrations: ['integration-7', 'integration-26', 'integration-5'],
      config: { ticketing: true, live_chat: true },
      setupSteps: ['Connect Twilio', 'Set up channels', 'Configure routing', 'Train team'],
      estimatedTime: 35,
      difficulty: 'medium',
      isPopular: false,
      usageCount: 445
    },
    {
      id: 'template-10',
      name: 'Full Stack Startup',
      description: 'Everything you need to launch',
      category: 'development',
      integrations: ['integration-1', 'integration-5', 'integration-16', 'integration-31', 'integration-20'],
      config: { complete: true },
      setupSteps: ['Payment processing', 'Team communication', 'Analytics', 'Version control', 'File storage'],
      estimatedTime: 90,
      difficulty: 'hard',
      isPopular: true,
      usageCount: 2789
    }
  ]

  return templates.slice(0, count)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function searchIntegrations(integrations: Integration[], searchTerm: string): Integration[] {
  if (!searchTerm.trim()) return integrations

  const term = searchTerm.toLowerCase()
  logger.debug('Searching integrations', { searchTerm: term, totalIntegrations: integrations.length })

  const results = integrations.filter(integration =>
    integration.name.toLowerCase().includes(term) ||
    integration.description.toLowerCase().includes(term) ||
    integration.category.toLowerCase().includes(term) ||
    integration.features.some(f => f.toLowerCase().includes(term))
  )

  logger.debug('Search completed', { resultsCount: results.length })
  return results
}

export function filterByCategory(integrations: Integration[], category: IntegrationCategory | 'all'): Integration[] {
  if (category === 'all') return integrations

  logger.debug('Filtering by category', { category })
  return integrations.filter(i => i.category === category)
}

export function filterByStatus(integrations: Integration[], status: IntegrationStatus | 'all'): Integration[] {
  if (status === 'all') return integrations

  logger.debug('Filtering by status', { status })
  return integrations.filter(i => i.status === status)
}

export function sortIntegrations(
  integrations: Integration[],
  sortBy: 'name' | 'popularity' | 'category' | 'status'
): Integration[] {
  logger.debug('Sorting integrations', { sortBy, count: integrations.length })

  const sorted = [...integrations].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)

      case 'popularity':
        if (a.isPopular && !b.isPopular) return -1
        if (!a.isPopular && b.isPopular) return 1
        return b.totalSyncs - a.totalSyncs

      case 'category':
        return a.category.localeCompare(b.category)

      case 'status':
        const statusOrder: Record<IntegrationStatus, number> = {
          connected: 0,
          available: 1,
          disconnected: 2,
          error: 3
        }
        return statusOrder[a.status] - statusOrder[b.status]

      default:
        return 0
    }
  })

  return sorted
}

export function calculateIntegrationsStats(integrations: Integration[]): IntegrationsStats {
  logger.debug('Calculating integrations statistics', { totalIntegrations: integrations.length })

  const byCategory: Record<IntegrationCategory, number> = {
    payment: 0,
    communication: 0,
    productivity: 0,
    analytics: 0,
    storage: 0,
    marketing: 0,
    crm: 0,
    development: 0
  }

  const byStatus: Record<IntegrationStatus, number> = {
    available: 0,
    connected: 0,
    disconnected: 0,
    error: 0
  }

  let totalSyncs = 0
  let totalDataTransferred = 0
  let totalSuccessRate = 0
  let connectedCount = 0
  let mostUsedIntegration: { name: string; syncCount: number } | undefined
  let recentErrors = 0

  integrations.forEach(integration => {
    byCategory[integration.category]++
    byStatus[integration.status]++
    totalSyncs += integration.totalSyncs
    totalDataTransferred += integration.dataTransferred

    if (integration.status === 'connected') {
      totalSuccessRate += integration.successRate
      connectedCount++
    }

    if (integration.status === 'error') {
      recentErrors += integration.errorCount
    }

    if (!mostUsedIntegration || integration.totalSyncs > mostUsedIntegration.syncCount) {
      mostUsedIntegration = { name: integration.name, syncCount: integration.totalSyncs }
    }
  })

  const stats: IntegrationsStats = {
    totalIntegrations: integrations.length,
    connectedIntegrations: byStatus.connected,
    byCategory,
    byStatus,
    totalSyncs,
    totalDataTransferred,
    averageSuccessRate: connectedCount > 0 ? totalSuccessRate / connectedCount : 0,
    mostUsedIntegration,
    recentErrors,
    lastUpdated: new Date().toISOString()
  }

  logger.info('Statistics calculated', {
    totalIntegrations: stats.totalIntegrations,
    connected: stats.connectedIntegrations,
    mostUsed: stats.mostUsedIntegration?.name
  })

  return stats
}

export function exportIntegrationConfig(integration: Integration): Blob {
  logger.info('Exporting integration config', { integrationId: integration.id, integrationName: integration.name })

  const config = {
    name: integration.name,
    category: integration.category,
    authType: integration.authType,
    features: integration.features,
    config: integration.config,
    apiEndpoint: integration.apiEndpoint,
    webhookUrl: integration.webhookUrl,
    version: integration.version,
    exportedAt: new Date().toISOString()
  }

  const data = JSON.stringify(config, null, 2)
  return new Blob([data], { type: 'application/json' })
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  logger as integrationsLogger
}
