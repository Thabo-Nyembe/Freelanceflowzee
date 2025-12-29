// Integrations & Marketplace Data
// For app store, integrations, plugins, and third-party connections

export interface Integration {
  id: string
  name: string
  description: string
  shortDescription: string
  icon: string
  category: string
  vendor: string
  status: 'connected' | 'available' | 'coming_soon'
  popular: boolean
  featured: boolean
  installCount: number
  rating: number
  reviews: number
  pricing: 'free' | 'paid' | 'freemium'
  priceAmount?: number
  features: string[]
  permissions: string[]
  lastSync?: string
  connectedAt?: string
  config?: Record<string, unknown>
}

export interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive' | 'failed'
  secret: string
  createdAt: string
  lastTriggered?: string
  successRate: number
  totalDeliveries: number
}

export interface ApiKey {
  id: string
  name: string
  key: string
  prefix: string
  scopes: string[]
  status: 'active' | 'revoked' | 'expired'
  createdAt: string
  lastUsed: string
  expiresAt?: string
  usageCount: number
  rateLimit: number
}

// Connected Integrations
export const INTEGRATIONS: Integration[] = [
  {
    id: 'int-001',
    name: 'Slack',
    description: 'Get real-time notifications, share updates, and collaborate with your team directly in Slack channels.',
    shortDescription: 'Team communication & notifications',
    icon: '/integrations/slack.svg',
    category: 'Communication',
    vendor: 'Slack Technologies',
    status: 'connected',
    popular: true,
    featured: true,
    installCount: 45000,
    rating: 4.8,
    reviews: 2340,
    pricing: 'free',
    features: ['Real-time notifications', 'Channel posting', 'Slash commands', 'Interactive messages'],
    permissions: ['Read channels', 'Post messages', 'Upload files'],
    lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    connectedAt: '2024-06-15T10:00:00Z',
    config: { workspace: 'freeflow-team', defaultChannel: '#general' }
  },
  {
    id: 'int-002',
    name: 'Google Workspace',
    description: 'Sync calendars, import documents, and streamline workflows with Google Workspace integration.',
    shortDescription: 'Calendar, Drive & Gmail sync',
    icon: '/integrations/google.svg',
    category: 'Productivity',
    vendor: 'Google',
    status: 'connected',
    popular: true,
    featured: true,
    installCount: 68000,
    rating: 4.7,
    reviews: 3120,
    pricing: 'free',
    features: ['Calendar sync', 'Drive integration', 'Gmail connect', 'Contacts sync'],
    permissions: ['Read calendar', 'Manage drive files', 'Send emails'],
    lastSync: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    connectedAt: '2024-03-01T09:00:00Z',
    config: { calendarId: 'primary', driveFolder: 'FreeFlow' }
  },
  {
    id: 'int-003',
    name: 'Stripe',
    description: 'Process payments, manage subscriptions, and handle billing directly within FreeFlow.',
    shortDescription: 'Payment processing & billing',
    icon: '/integrations/stripe.svg',
    category: 'Finance',
    vendor: 'Stripe Inc',
    status: 'connected',
    popular: true,
    featured: true,
    installCount: 32000,
    rating: 4.9,
    reviews: 1890,
    pricing: 'free',
    features: ['Payment processing', 'Subscription management', 'Invoice generation', 'Revenue analytics'],
    permissions: ['Process payments', 'Manage customers', 'View transactions'],
    lastSync: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    connectedAt: '2024-01-15T08:00:00Z',
    config: { mode: 'live', webhookEnabled: true }
  },
  {
    id: 'int-004',
    name: 'Figma',
    description: 'Import designs directly from Figma, sync design tokens, and maintain design-dev handoff.',
    shortDescription: 'Design sync & collaboration',
    icon: '/integrations/figma.svg',
    category: 'Design',
    vendor: 'Figma Inc',
    status: 'connected',
    popular: true,
    featured: false,
    installCount: 28000,
    rating: 4.6,
    reviews: 1456,
    pricing: 'free',
    features: ['Design import', 'Token sync', 'Component library', 'Version history'],
    permissions: ['Read files', 'Access projects'],
    lastSync: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    connectedAt: '2024-08-20T11:00:00Z',
    config: { teamId: 'design-team', autoSync: true }
  },
  {
    id: 'int-005',
    name: 'GitHub',
    description: 'Connect repositories, track issues, and automate workflows with GitHub integration.',
    shortDescription: 'Code & issue tracking',
    icon: '/integrations/github.svg',
    category: 'Development',
    vendor: 'GitHub Inc',
    status: 'connected',
    popular: true,
    featured: false,
    installCount: 42000,
    rating: 4.8,
    reviews: 2890,
    pricing: 'free',
    features: ['Repository sync', 'Issue tracking', 'PR notifications', 'Actions integration'],
    permissions: ['Read repositories', 'Manage issues', 'Webhook access'],
    lastSync: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    connectedAt: '2024-02-10T14:00:00Z',
    config: { org: 'freeflow-io', repos: ['main-app', 'api', 'mobile'] }
  },
  {
    id: 'int-006',
    name: 'Salesforce',
    description: 'Sync contacts, opportunities, and accounts with your Salesforce CRM.',
    shortDescription: 'CRM data sync',
    icon: '/integrations/salesforce.svg',
    category: 'CRM',
    vendor: 'Salesforce',
    status: 'available',
    popular: true,
    featured: true,
    installCount: 18000,
    rating: 4.5,
    reviews: 890,
    pricing: 'paid',
    priceAmount: 49,
    features: ['Contact sync', 'Opportunity tracking', 'Account management', 'Custom objects'],
    permissions: ['Read/write contacts', 'Manage opportunities']
  },
  {
    id: 'int-007',
    name: 'Notion',
    description: 'Connect your Notion workspace for seamless documentation and knowledge management.',
    shortDescription: 'Docs & knowledge base',
    icon: '/integrations/notion.svg',
    category: 'Productivity',
    vendor: 'Notion Labs',
    status: 'available',
    popular: true,
    featured: false,
    installCount: 24000,
    rating: 4.7,
    reviews: 1230,
    pricing: 'free',
    features: ['Page sync', 'Database integration', 'Embed support', 'Two-way sync'],
    permissions: ['Read pages', 'Create pages', 'Database access']
  },
  {
    id: 'int-008',
    name: 'Jira',
    description: 'Sync projects, issues, and sprints with Atlassian Jira for development teams.',
    shortDescription: 'Project & issue management',
    icon: '/integrations/jira.svg',
    category: 'Development',
    vendor: 'Atlassian',
    status: 'available',
    popular: true,
    featured: false,
    installCount: 15000,
    rating: 4.4,
    reviews: 780,
    pricing: 'free',
    features: ['Issue sync', 'Sprint tracking', 'Backlog management', 'Custom fields'],
    permissions: ['Read/write issues', 'Manage sprints']
  },
  {
    id: 'int-009',
    name: 'Zapier',
    description: 'Connect FreeFlow with 5000+ apps through Zapier automations.',
    shortDescription: 'Automation & workflows',
    icon: '/integrations/zapier.svg',
    category: 'Automation',
    vendor: 'Zapier Inc',
    status: 'connected',
    popular: true,
    featured: true,
    installCount: 35000,
    rating: 4.6,
    reviews: 1560,
    pricing: 'freemium',
    features: ['Triggers', 'Actions', 'Multi-step zaps', 'Filters'],
    permissions: ['Trigger webhooks', 'API access'],
    connectedAt: '2024-05-01T10:00:00Z',
    config: { activeZaps: 12 }
  },
  {
    id: 'int-010',
    name: 'HubSpot',
    description: 'Sync marketing, sales, and customer data with HubSpot CRM.',
    shortDescription: 'Marketing & sales CRM',
    icon: '/integrations/hubspot.svg',
    category: 'CRM',
    vendor: 'HubSpot Inc',
    status: 'available',
    popular: true,
    featured: false,
    installCount: 12000,
    rating: 4.5,
    reviews: 650,
    pricing: 'free',
    features: ['Contact sync', 'Deal tracking', 'Email campaigns', 'Analytics'],
    permissions: ['Read/write contacts', 'Manage deals', 'Send emails']
  },
]

// Webhooks
export const WEBHOOKS: Webhook[] = [
  {
    id: 'wh-001',
    name: 'Slack Notifications',
    url: 'https://example.com/mock-webhook/slack-notifications',
    events: ['project.created', 'task.completed', 'deal.won'],
    status: 'active',
    secret: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2024-06-15T10:00:00Z',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    successRate: 99.8,
    totalDeliveries: 4523
  },
  {
    id: 'wh-002',
    name: 'CRM Sync',
    url: 'https://api.salesforce.com/webhooks/freeflow',
    events: ['contact.created', 'contact.updated', 'deal.stage_changed'],
    status: 'active',
    secret: 'whsec_yyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    createdAt: '2024-08-01T14:00:00Z',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    successRate: 98.5,
    totalDeliveries: 2890
  },
  {
    id: 'wh-003',
    name: 'Analytics Tracker',
    url: 'https://analytics.internal.freeflow.io/events',
    events: ['user.login', 'project.created', 'file.uploaded', 'ai.request'],
    status: 'active',
    secret: 'whsec_zzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
    createdAt: '2024-03-01T09:00:00Z',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    successRate: 100,
    totalDeliveries: 156789
  },
  {
    id: 'wh-004',
    name: 'Payment Processor',
    url: 'https://billing.freeflow.io/stripe-events',
    events: ['payment.received', 'subscription.created', 'subscription.cancelled'],
    status: 'active',
    secret: 'whsec_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    createdAt: '2024-01-15T08:00:00Z',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    successRate: 99.9,
    totalDeliveries: 8934
  },
]

// API Keys
export const API_KEYS: ApiKey[] = [
  {
    id: 'key-001',
    name: 'Production API',
    key: 'demo_key_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    prefix: 'demo_key_',
    scopes: ['read', 'write', 'delete'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    usageCount: 2845632,
    rateLimit: 10000
  },
  {
    id: 'key-002',
    name: 'Mobile App',
    key: 'demo_key_mobile_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    prefix: 'demo_key_',
    scopes: ['read', 'write'],
    status: 'active',
    createdAt: '2024-03-15T10:00:00Z',
    lastUsed: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    usageCount: 1256789,
    rateLimit: 5000
  },
  {
    id: 'key-003',
    name: 'Third-party Integration',
    key: 'demo_key_integration_zzzzzzzzzzzzzzzzzzzzzzzz',
    prefix: 'demo_key_',
    scopes: ['read'],
    status: 'active',
    createdAt: '2024-06-01T14:00:00Z',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    expiresAt: '2025-06-01T14:00:00Z',
    usageCount: 456123,
    rateLimit: 1000
  },
  {
    id: 'key-004',
    name: 'Test Environment',
    key: 'sk_test_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    prefix: 'sk_test_',
    scopes: ['read', 'write', 'delete'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    usageCount: 89456,
    rateLimit: 10000
  },
]

// Integration Categories
export const INTEGRATION_CATEGORIES = [
  { id: 'communication', name: 'Communication', count: 8, icon: 'MessageSquare' },
  { id: 'productivity', name: 'Productivity', count: 12, icon: 'Zap' },
  { id: 'finance', name: 'Finance', count: 6, icon: 'DollarSign' },
  { id: 'design', name: 'Design', count: 5, icon: 'Palette' },
  { id: 'development', name: 'Development', count: 10, icon: 'Code' },
  { id: 'crm', name: 'CRM', count: 7, icon: 'Users' },
  { id: 'automation', name: 'Automation', count: 4, icon: 'Workflow' },
  { id: 'analytics', name: 'Analytics', count: 5, icon: 'BarChart' },
]

// Integration Stats
export const INTEGRATION_STATS = {
  totalIntegrations: 57,
  connectedIntegrations: 6,
  activeWebhooks: 4,
  apiKeys: 4,
  totalApiCalls: 4647000,
  webhookDeliveries: 172136,
  successRate: 99.6,
}
