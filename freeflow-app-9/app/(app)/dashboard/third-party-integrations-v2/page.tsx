"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type IntegrationStatus = 'active' | 'pending' | 'inactive' | 'error' | 'testing'
type IntegrationCategory = 'saas' | 'database' | 'cloud' | 'messaging' | 'ecommerce' | 'collaboration' | 'monitoring' | 'deployment'
type AuthMethod = 'api-key' | 'oauth2' | 'basic-auth' | 'jwt' | 'custom'

interface ThirdPartyIntegration {
  id: string
  name: string
  description: string
  provider: string
  logo: string
  category: IntegrationCategory
  authMethod: AuthMethod
  status: IntegrationStatus
  users: number
  apiCalls: number
  uptime: number
  responseTime: number
  lastSync: string
  lastUpdated: string
  version: string
  endpoints: number
  rateLimit: string
  documentation: string
  support: string
  features: string[]
  tags: string[]
}

export default function ThirdPartyIntegrationsPage() {
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all')
  const [authFilter, setAuthFilter] = useState<AuthMethod | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const integrations: ThirdPartyIntegration[] = [
    {
      id: 'tpi-001',
      name: 'AWS Services',
      description: 'Amazon Web Services integration for cloud storage, compute, and database services with S3, EC2, and RDS.',
      provider: 'Amazon',
      logo: 'AWS',
      category: 'cloud',
      authMethod: 'api-key',
      status: 'active',
      users: 89200,
      apiCalls: 2456700,
      uptime: 99.9,
      responseTime: 145,
      lastSync: '2 min ago',
      lastUpdated: '2024-01-15',
      version: '3.8.2',
      endpoints: 47,
      rateLimit: '10,000/hour',
      documentation: 'https://docs.aws.amazon.com',
      support: 'Enterprise Support',
      features: ['S3 Storage', 'EC2 Compute', 'RDS Database', 'Lambda Functions', 'CloudFront CDN'],
      tags: ['cloud', 'aws', 'storage', 'compute']
    },
    {
      id: 'tpi-002',
      name: 'Google Cloud Platform',
      description: 'GCP integration for cloud infrastructure, machine learning, data analytics, and managed services.',
      provider: 'Google',
      logo: 'GCP',
      category: 'cloud',
      authMethod: 'oauth2',
      status: 'active',
      users: 76400,
      apiCalls: 1987500,
      uptime: 99.95,
      responseTime: 132,
      lastSync: '5 min ago',
      lastUpdated: '2024-01-14',
      version: '4.2.1',
      endpoints: 52,
      rateLimit: '15,000/hour',
      documentation: 'https://cloud.google.com/docs',
      support: 'Premium Support',
      features: ['Cloud Storage', 'Compute Engine', 'BigQuery', 'Cloud SQL', 'AI/ML APIs'],
      tags: ['cloud', 'gcp', 'ml', 'analytics']
    },
    {
      id: 'tpi-003',
      name: 'PostgreSQL Database',
      description: 'Direct PostgreSQL database integration for data storage, queries, and real-time replication.',
      provider: 'PostgreSQL',
      logo: 'PG',
      category: 'database',
      authMethod: 'basic-auth',
      status: 'active',
      users: 124600,
      apiCalls: 3876200,
      uptime: 99.8,
      responseTime: 89,
      lastSync: '1 min ago',
      lastUpdated: '2024-01-13',
      version: '15.2',
      endpoints: 12,
      rateLimit: 'Unlimited',
      documentation: 'https://postgresql.org/docs',
      support: 'Community Support',
      features: ['ACID Compliance', 'JSON Support', 'Full-text Search', 'Replication', 'Extensions'],
      tags: ['database', 'postgresql', 'sql', 'relational']
    },
    {
      id: 'tpi-004',
      name: 'SendGrid Email',
      description: 'Email delivery service for transactional emails, marketing campaigns, and email analytics.',
      provider: 'Twilio SendGrid',
      logo: 'SG',
      category: 'messaging',
      authMethod: 'api-key',
      status: 'active',
      users: 98500,
      apiCalls: 4562300,
      uptime: 99.99,
      responseTime: 156,
      lastSync: '3 min ago',
      lastUpdated: '2024-01-12',
      version: '3.5.7',
      endpoints: 24,
      rateLimit: '50,000/day',
      documentation: 'https://sendgrid.com/docs',
      support: 'Email & Chat',
      features: ['Email Delivery', 'Templates', 'Analytics', 'A/B Testing', 'Webhooks'],
      tags: ['email', 'messaging', 'transactional', 'marketing']
    },
    {
      id: 'tpi-005',
      name: 'Shopify Platform',
      description: 'E-commerce platform integration for products, orders, customers, and inventory management.',
      provider: 'Shopify',
      logo: 'SP',
      category: 'ecommerce',
      authMethod: 'oauth2',
      status: 'active',
      users: 67800,
      apiCalls: 2134500,
      uptime: 99.92,
      responseTime: 178,
      lastSync: '8 min ago',
      lastUpdated: '2024-01-11',
      version: '2023-10',
      endpoints: 68,
      rateLimit: '2,000/hour',
      documentation: 'https://shopify.dev/docs',
      support: 'Partner Support',
      features: ['Product Sync', 'Order Management', 'Customer Data', 'Inventory', 'Webhooks'],
      tags: ['ecommerce', 'shopify', 'products', 'orders']
    },
    {
      id: 'tpi-006',
      name: 'Twilio Messaging',
      description: 'SMS, voice, and video communication APIs for programmable messaging and voice calls.',
      provider: 'Twilio',
      logo: 'TW',
      category: 'messaging',
      authMethod: 'api-key',
      status: 'active',
      users: 82100,
      apiCalls: 3245600,
      uptime: 99.95,
      responseTime: 142,
      lastSync: '4 min ago',
      lastUpdated: '2024-01-10',
      version: '2024-01-01',
      endpoints: 34,
      rateLimit: '100,000/day',
      documentation: 'https://twilio.com/docs',
      support: '24/7 Support',
      features: ['SMS', 'Voice Calls', 'Video', 'WhatsApp', 'Programmable Chat'],
      tags: ['sms', 'messaging', 'voice', 'twilio']
    },
    {
      id: 'tpi-007',
      name: 'MongoDB Atlas',
      description: 'Cloud-hosted MongoDB database service with automatic scaling, backups, and monitoring.',
      provider: 'MongoDB',
      logo: 'MDB',
      category: 'database',
      authMethod: 'custom',
      status: 'active',
      users: 94700,
      apiCalls: 2987400,
      uptime: 99.87,
      responseTime: 98,
      lastSync: '2 min ago',
      lastUpdated: '2024-01-09',
      version: '6.0',
      endpoints: 18,
      rateLimit: 'Unlimited',
      documentation: 'https://docs.mongodb.com',
      support: 'Premium Support',
      features: ['Auto-scaling', 'Backups', 'Monitoring', 'Atlas Search', 'Charts'],
      tags: ['database', 'mongodb', 'nosql', 'cloud']
    },
    {
      id: 'tpi-008',
      name: 'Jira Software',
      description: 'Project management and issue tracking integration for agile teams and software development.',
      provider: 'Atlassian',
      logo: 'JR',
      category: 'collaboration',
      authMethod: 'oauth2',
      status: 'pending',
      users: 56300,
      apiCalls: 1567800,
      uptime: 99.85,
      responseTime: 168,
      lastSync: '12 min ago',
      lastUpdated: '2024-01-08',
      version: 'Cloud v9',
      endpoints: 42,
      rateLimit: '5,000/hour',
      documentation: 'https://developer.atlassian.com',
      support: 'Partner Support',
      features: ['Issue Tracking', 'Sprint Management', 'Workflows', 'Automation', 'Reporting'],
      tags: ['project', 'jira', 'agile', 'collaboration']
    },
    {
      id: 'tpi-009',
      name: 'Datadog Monitoring',
      description: 'Infrastructure monitoring, APM, log management, and security monitoring platform.',
      provider: 'Datadog',
      logo: 'DD',
      category: 'monitoring',
      authMethod: 'api-key',
      status: 'active',
      users: 45600,
      apiCalls: 5678900,
      uptime: 99.98,
      responseTime: 124,
      lastSync: '1 min ago',
      lastUpdated: '2024-01-07',
      version: '7.48.0',
      endpoints: 56,
      rateLimit: '100,000/hour',
      documentation: 'https://docs.datadoghq.com',
      support: 'Enterprise Support',
      features: ['Infrastructure Monitoring', 'APM', 'Log Management', 'Dashboards', 'Alerts'],
      tags: ['monitoring', 'observability', 'logs', 'metrics']
    },
    {
      id: 'tpi-010',
      name: 'Redis Cache',
      description: 'In-memory data store for caching, session management, and real-time analytics.',
      provider: 'Redis Labs',
      logo: 'RD',
      category: 'database',
      authMethod: 'basic-auth',
      status: 'active',
      users: 112400,
      apiCalls: 8934500,
      uptime: 99.93,
      responseTime: 12,
      lastSync: '30 sec ago',
      lastUpdated: '2024-01-06',
      version: '7.2',
      endpoints: 8,
      rateLimit: 'Unlimited',
      documentation: 'https://redis.io/docs',
      support: 'Community Support',
      features: ['Caching', 'Session Store', 'Pub/Sub', 'Streams', 'JSON Support'],
      tags: ['cache', 'redis', 'memory', 'performance']
    },
    {
      id: 'tpi-011',
      name: 'Vercel Deployment',
      description: 'Frontend deployment platform with edge functions, analytics, and CDN distribution.',
      provider: 'Vercel',
      logo: 'VR',
      category: 'deployment',
      authMethod: 'jwt',
      status: 'active',
      users: 72900,
      apiCalls: 1876300,
      uptime: 99.96,
      responseTime: 78,
      lastSync: '6 min ago',
      lastUpdated: '2024-01-05',
      version: '2024.1',
      endpoints: 28,
      rateLimit: '10,000/hour',
      documentation: 'https://vercel.com/docs',
      support: 'Email Support',
      features: ['Edge Functions', 'Analytics', 'CDN', 'Preview Deployments', 'Monitoring'],
      tags: ['deployment', 'hosting', 'edge', 'frontend']
    },
    {
      id: 'tpi-012',
      name: 'Confluent Kafka',
      description: 'Event streaming platform for real-time data pipelines, stream processing, and event-driven architectures.',
      provider: 'Confluent',
      logo: 'KF',
      category: 'messaging',
      authMethod: 'api-key',
      status: 'testing',
      users: 34200,
      apiCalls: 6234700,
      uptime: 99.89,
      responseTime: 156,
      lastSync: '15 min ago',
      lastUpdated: '2024-01-04',
      version: '3.4.0',
      endpoints: 22,
      rateLimit: 'Unlimited',
      documentation: 'https://docs.confluent.io',
      support: 'Enterprise Support',
      features: ['Event Streaming', 'Stream Processing', 'Connectors', 'Schema Registry', 'ksqlDB'],
      tags: ['kafka', 'streaming', 'events', 'messaging']
    }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    if (statusFilter !== 'all' && integration.status !== statusFilter) return false
    if (categoryFilter !== 'all' && integration.category !== categoryFilter) return false
    if (authFilter !== 'all' && integration.authMethod !== authFilter) return false
    return true
  })

  const stats = [
    { label: 'Total Integrations', value: '156', trend: '+18', trendLabel: 'this month' },
    { label: 'Active Connections', value: '42', trend: '+7', trendLabel: 'vs last week' },
    { label: 'API Calls Today', value: '1.2M', trend: '+34%', trendLabel: 'vs yesterday' },
    { label: 'Avg Uptime', value: '99.9%', trend: '+0.05%', trendLabel: 'improvement' }
  ]

  const quickActions = [
    { label: 'Browse All', icon: '🔌', onClick: () => console.log('Browse All') },
    { label: 'Active Integrations', icon: '✅', onClick: () => console.log('Active') },
    { label: 'API Logs', icon: '📋', onClick: () => console.log('API Logs') },
    { label: 'Monitor Health', icon: '💚', onClick: () => console.log('Monitor Health') },
    { label: 'API Keys', icon: '🔑', onClick: () => console.log('API Keys') },
    { label: 'Documentation', icon: '📚', onClick: () => console.log('Documentation') },
    { label: 'Add Custom', icon: '➕', onClick: () => console.log('Add Custom') },
    { label: 'Settings', icon: '⚙️', onClick: () => console.log('Settings') }
  ]

  const recentActivity = [
    { label: 'AWS Services: 24.5K API calls completed', time: '2 min ago', type: 'api' },
    { label: 'PostgreSQL: Sync completed successfully', time: '6 min ago', type: 'sync' },
    { label: 'SendGrid: 2,340 emails delivered', time: '14 min ago', type: 'delivery' },
    { label: 'Jira integration status changed to pending', time: '28 min ago', type: 'status' },
    { label: 'Datadog: New alert configured', time: '1 hour ago', type: 'config' },
    { label: 'Shopify: Product inventory synced', time: '2 hours ago', type: 'sync' }
  ]

  const topIntegrations = filteredIntegrations
    .sort((a, b) => b.apiCalls - a.apiCalls)
    .slice(0, 5)
    .map((integration, index) => ({
      rank: index + 1,
      label: integration.name,
      value: integration.apiCalls.toLocaleString(),
      change: index === 0 ? '+56%' : index === 1 ? '+48%' : index === 2 ? '+42%' : index === 3 ? '+36%' : '+30%'
    }))

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      case 'error': return 'bg-red-100 text-red-700'
      case 'testing': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: IntegrationCategory) => {
    switch (category) {
      case 'saas': return 'bg-blue-100 text-blue-700'
      case 'database': return 'bg-green-100 text-green-700'
      case 'cloud': return 'bg-purple-100 text-purple-700'
      case 'messaging': return 'bg-pink-100 text-pink-700'
      case 'ecommerce': return 'bg-orange-100 text-orange-700'
      case 'collaboration': return 'bg-teal-100 text-teal-700'
      case 'monitoring': return 'bg-indigo-100 text-indigo-700'
      case 'deployment': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAuthColor = (auth: AuthMethod) => {
    switch (auth) {
      case 'api-key': return 'bg-blue-100 text-blue-700'
      case 'oauth2': return 'bg-green-100 text-green-700'
      case 'basic-auth': return 'bg-purple-100 text-purple-700'
      case 'jwt': return 'bg-orange-100 text-orange-700'
      case 'custom': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            Third-Party Integrations
          </h1>
          <p className="text-gray-600 mt-1">Connect and manage external services and APIs</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Add Integration
        </button>
      </div>

      {/* Stats Grid */}
      <StatGrid stats={stats} />

      {/* Quick Actions */}
      <BentoQuickAction actions={quickActions} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <PillButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All Status</PillButton>
          <PillButton active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>Active</PillButton>
          <PillButton active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')}>Pending</PillButton>
          <PillButton active={statusFilter === 'testing'} onClick={() => setStatusFilter('testing')}>Testing</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'cloud'} onClick={() => setCategoryFilter('cloud')}>Cloud</PillButton>
          <PillButton active={categoryFilter === 'database'} onClick={() => setCategoryFilter('database')}>Database</PillButton>
          <PillButton active={categoryFilter === 'messaging'} onClick={() => setCategoryFilter('messaging')}>Messaging</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={authFilter === 'all'} onClick={() => setAuthFilter('all')}>All Auth</PillButton>
          <PillButton active={authFilter === 'api-key'} onClick={() => setAuthFilter('api-key')}>API Key</PillButton>
          <PillButton active={authFilter === 'oauth2'} onClick={() => setAuthFilter('oauth2')}>OAuth2</PillButton>
          <PillButton active={authFilter === 'jwt'} onClick={() => setAuthFilter('jwt')}>JWT</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integrations List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Integrations ({filteredIntegrations.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredIntegrations.map(integration => (
                <div key={integration.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {integration.logo}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{integration.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{integration.provider} • v{integration.version}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{integration.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(integration.category)}`}>
                      {integration.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getAuthColor(integration.authMethod)}`}>
                      {integration.authMethod}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-gray-500">API Calls</div>
                      <div className="font-semibold">{integration.apiCalls.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Response Time</div>
                      <div className="font-semibold">{integration.responseTime}ms</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Uptime</div>
                      <div className="font-semibold text-green-600">{integration.uptime}%</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Endpoints</div>
                      <div className="font-semibold">{integration.endpoints}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Uptime</span>
                      <span className="text-xs font-semibold">{integration.uptime}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${integration.uptime}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-gray-500">Last sync: {integration.lastSync}</span>
                    <span className="text-gray-500">{integration.rateLimit}</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <button className="flex-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-100">
                      Configure
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                      View Logs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <MiniKPI label="Active" value="42" />
              <MiniKPI label="Pending" value="8" />
              <MiniKPI label="API Calls/min" value="2.4K" />
              <MiniKPI label="Avg Uptime" value="99.9%" />
            </div>
          </div>

          {/* Top Integrations */}
          <RankingList title="Most Used Integrations" items={topIntegrations} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="Integration Categories"
            items={[
              { label: 'Database', value: 28, color: 'from-green-400 to-green-600' },
              { label: 'Cloud', value: 24, color: 'from-purple-400 to-purple-600' },
              { label: 'Messaging', value: 20, color: 'from-pink-400 to-pink-600' },
              { label: 'Collaboration', value: 16, color: 'from-teal-400 to-teal-600' },
              { label: 'Monitoring', value: 12, color: 'from-indigo-400 to-indigo-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
