import type {
  Integration,
  ConnectedIntegration,
  IntegrationTemplate,
  IntegrationMetrics,
  IntegrationStatus,
  IntegrationCategory
} from './integrations-types'

// Available Integrations
export const AVAILABLE_INTEGRATIONS: Integration[] = [
  // Payment
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and manage subscriptions',
    category: 'payment',
    icon: '💳',
    status: 'connected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: true,
    website: 'https://stripe.com',
    documentationUrl: 'https://stripe.com/docs'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Process payments worldwide',
    category: 'payment',
    icon: '💰',
    status: 'disconnected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: true,
    website: 'https://paypal.com',
    documentationUrl: 'https://developer.paypal.com'
  },

  // Communication
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team messaging and notifications',
    category: 'communication',
    icon: '💬',
    status: 'connected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: true,
    website: 'https://slack.com',
    documentationUrl: 'https://api.slack.com'
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Community communication platform',
    category: 'communication',
    icon: '🎮',
    status: 'disconnected',
    authType: 'webhook',
    isPremium: false,
    isPopular: false,
    website: 'https://discord.com',
    documentationUrl: 'https://discord.com/developers'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS and voice communication',
    category: 'communication',
    icon: '📱',
    status: 'disconnected',
    authType: 'api-key',
    isPremium: true,
    isPopular: true,
    website: 'https://twilio.com',
    documentationUrl: 'https://www.twilio.com/docs'
  },

  // Productivity
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Gmail, Calendar, Drive integration',
    category: 'productivity',
    icon: '📧',
    status: 'connected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: true,
    website: 'https://workspace.google.com',
    documentationUrl: 'https://developers.google.com/workspace'
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Outlook, OneDrive, Teams',
    category: 'productivity',
    icon: '🏢',
    status: 'disconnected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: true,
    website: 'https://www.microsoft.com/microsoft-365',
    documentationUrl: 'https://docs.microsoft.com/graph'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Notes and knowledge management',
    category: 'productivity',
    icon: '📝',
    status: 'disconnected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: true,
    website: 'https://notion.so',
    documentationUrl: 'https://developers.notion.com'
  },

  // Analytics
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Website analytics and insights',
    category: 'analytics',
    icon: '📊',
    status: 'connected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: true,
    website: 'https://analytics.google.com',
    documentationUrl: 'https://developers.google.com/analytics'
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Product analytics platform',
    category: 'analytics',
    icon: '📈',
    status: 'disconnected',
    authType: 'api-key',
    isPremium: true,
    isPopular: false,
    website: 'https://mixpanel.com',
    documentationUrl: 'https://developer.mixpanel.com'
  },

  // Storage
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Cloud file storage and sharing',
    category: 'storage',
    icon: '📦',
    status: 'disconnected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: true,
    website: 'https://dropbox.com',
    documentationUrl: 'https://www.dropbox.com/developers'
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Scalable cloud storage',
    category: 'storage',
    icon: '☁️',
    status: 'disconnected',
    authType: 'api-key',
    isPremium: true,
    isPopular: true,
    website: 'https://aws.amazon.com/s3',
    documentationUrl: 'https://docs.aws.amazon.com/s3'
  },

  // Marketing
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing automation',
    category: 'marketing',
    icon: '🐵',
    status: 'disconnected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: true,
    website: 'https://mailchimp.com',
    documentationUrl: 'https://mailchimp.com/developer'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing and CRM platform',
    category: 'crm',
    icon: '🎯',
    status: 'disconnected',
    authType: 'oauth2',
    isPremium: true,
    isPopular: true,
    website: 'https://hubspot.com',
    documentationUrl: 'https://developers.hubspot.com'
  },

  // Development
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code hosting and collaboration',
    category: 'development',
    icon: '🐙',
    status: 'connected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: true,
    website: 'https://github.com',
    documentationUrl: 'https://docs.github.com'
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'DevOps platform',
    category: 'development',
    icon: '🦊',
    status: 'disconnected',
    authType: 'oauth2',
    isPremium: false,
    isPopular: false,
    website: 'https://gitlab.com',
    documentationUrl: 'https://docs.gitlab.com'
  },

  // Automation
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect and automate workflows',
    category: 'productivity',
    icon: '⚡',
    status: 'disconnected',
    authType: 'api-key',
    isPremium: true,
    isPopular: true,
    website: 'https://zapier.com',
    documentationUrl: 'https://platform.zapier.com'
  }
]

// Connected Integrations
export const CONNECTED_INTEGRATIONS: ConnectedIntegration[] = [
  {
    integrationId: 'stripe',
    connectedAt: new Date('2025-01-01'),
    lastSync: new Date('2025-01-21'),
    config: {
      autoSync: true,
      syncFrequency: 'real-time',
      features: { payments: true, subscriptions: true, customers: true }
    },
    credentials: {
      accessToken: 'sk_live_***',
      expiresAt: new Date('2026-01-01')
    },
    syncStats: {
      totalSyncs: 245,
      successfulSyncs: 243,
      failedSyncs: 2,
      lastSyncTime: new Date('2025-01-21'),
      lastSyncStatus: 'success',
      dataTransferred: 125000
    }
  },
  {
    integrationId: 'slack',
    connectedAt: new Date('2025-01-05'),
    lastSync: new Date('2025-01-21'),
    config: {
      autoSync: true,
      syncFrequency: 'real-time',
      features: { notifications: true, mentions: true, channels: true }
    },
    credentials: {
      accessToken: 'xoxb-***'
    },
    syncStats: {
      totalSyncs: 156,
      successfulSyncs: 156,
      failedSyncs: 0,
      lastSyncTime: new Date('2025-01-21'),
      lastSyncStatus: 'success',
      dataTransferred: 45000
    }
  },
  {
    integrationId: 'google-workspace',
    connectedAt: new Date('2025-01-10'),
    lastSync: new Date('2025-01-21'),
    config: {
      autoSync: true,
      syncFrequency: 'hourly',
      features: { gmail: true, calendar: true, drive: false }
    },
    credentials: {
      accessToken: 'ya29.***',
      refreshToken: '1//***',
      expiresAt: new Date('2025-01-22')
    },
    syncStats: {
      totalSyncs: 89,
      successfulSyncs: 87,
      failedSyncs: 2,
      lastSyncTime: new Date('2025-01-21'),
      lastSyncStatus: 'success',
      dataTransferred: 234000
    }
  },
  {
    integrationId: 'google-analytics',
    connectedAt: new Date('2025-01-15'),
    lastSync: new Date('2025-01-21'),
    config: {
      autoSync: true,
      syncFrequency: 'daily',
      features: { reports: true, realtime: true }
    },
    credentials: {
      accessToken: 'ya29.***'
    },
    syncStats: {
      totalSyncs: 7,
      successfulSyncs: 7,
      failedSyncs: 0,
      lastSyncTime: new Date('2025-01-21'),
      lastSyncStatus: 'success',
      dataTransferred: 12000
    }
  },
  {
    integrationId: 'github',
    connectedAt: new Date('2025-01-18'),
    lastSync: new Date('2025-01-21'),
    config: {
      autoSync: false,
      features: { repos: true, issues: true, pullRequests: true }
    },
    credentials: {
      accessToken: 'ghp_***'
    },
    syncStats: {
      totalSyncs: 12,
      successfulSyncs: 12,
      failedSyncs: 0,
      lastSyncTime: new Date('2025-01-21'),
      lastSyncStatus: 'success',
      dataTransferred: 34000
    }
  }
]

// Integration Templates
export const INTEGRATION_TEMPLATES: IntegrationTemplate[] = [
  {
    id: 'payment-notifications',
    name: 'Payment Notifications',
    description: 'Send Slack notification for new Stripe payments',
    integrations: ['stripe', 'slack'],
    workflow: 'stripe-payment → slack-message',
    icon: '💰',
    usageCount: 456
  },
  {
    id: 'calendar-sync',
    name: 'Calendar Sync',
    description: 'Sync Google Calendar with internal system',
    integrations: ['google-workspace'],
    workflow: 'google-calendar → kazi-calendar',
    icon: '📅',
    usageCount: 234
  },
  {
    id: 'backup-files',
    name: 'Automatic File Backup',
    description: 'Backup files to Dropbox daily',
    integrations: ['dropbox'],
    workflow: 'kazi-files → dropbox',
    icon: '💾',
    usageCount: 189
  }
]

// Integration Metrics
export const INTEGRATION_METRICS: IntegrationMetrics = {
  totalIntegrations: AVAILABLE_INTEGRATIONS.length,
  connectedIntegrations: CONNECTED_INTEGRATIONS.length,
  totalSyncs: 509,
  successRate: 98.8,
  averageSyncTime: 1.2,
  dataTransferred: 450000,
  mostPopular: ['Stripe', 'Slack', 'Google Workspace']
}

// Helper Functions
export function getStatusColor(status: IntegrationStatus): string {
  const colors: Record<IntegrationStatus, string> = {
    connected: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    disconnected: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  }
  return colors[status]
}

export function getCategoryIcon(category: IntegrationCategory): string {
  const icons: Record<IntegrationCategory, string> = {
    payment: '💳',
    communication: '💬',
    productivity: '📋',
    analytics: '📊',
    storage: '📦',
    marketing: '📢',
    crm: '🤝',
    development: '💻'
  }
  return icons[category]
}

export function getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
  return AVAILABLE_INTEGRATIONS.filter(i => i.category === category)
}

export function getConnectedCount(): number {
  return AVAILABLE_INTEGRATIONS.filter(i => i.status === 'connected').length
}

export function formatDataSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
