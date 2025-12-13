"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type IntegrationStatus = 'connected' | 'available' | 'disconnected' | 'configuring' | 'error'
type IntegrationCategory = 'crm' | 'marketing' | 'productivity' | 'communication' | 'analytics' | 'payment' | 'storage' | 'social'
type IntegrationType = 'native' | 'api' | 'webhook' | 'oauth' | 'zapier'

interface Integration {
  id: string
  name: string
  description: string
  provider: string
  logo: string
  category: IntegrationCategory
  type: IntegrationType
  status: IntegrationStatus
  users: number
  installs: number
  rating: number
  reviews: number
  lastUpdated: string
  version: string
  pricing: string
  features: string[]
  syncFrequency: string
  dataDirection: string
  setupTime: string
  tags: string[]
}

export default function IntegrationsMarketplacePage() {
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<IntegrationType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const integrations: Integration[] = [
    {
      id: 'int-001',
      name: 'Salesforce CRM',
      description: 'Two-way sync with Salesforce for contacts, leads, opportunities, and custom objects.',
      provider: 'Salesforce',
      logo: 'SF',
      category: 'crm',
      type: 'oauth',
      status: 'connected',
      users: 45200,
      installs: 67800,
      rating: 4.8,
      reviews: 3420,
      lastUpdated: '2024-01-15',
      version: '3.2.1',
      pricing: 'Free',
      features: ['Two-way Sync', 'Custom Objects', 'Real-time Updates', 'Field Mapping'],
      syncFrequency: 'Real-time',
      dataDirection: 'Bi-directional',
      setupTime: '10 minutes',
      tags: ['crm', 'sales', 'sync', 'enterprise']
    },
    {
      id: 'int-002',
      name: 'HubSpot Marketing',
      description: 'Connect with HubSpot to sync contacts, track campaigns, and manage marketing automation.',
      provider: 'HubSpot',
      logo: 'HS',
      category: 'marketing',
      type: 'oauth',
      status: 'connected',
      users: 38900,
      installs: 54200,
      rating: 4.7,
      reviews: 2890,
      lastUpdated: '2024-01-14',
      version: '2.8.5',
      pricing: 'Free',
      features: ['Contact Sync', 'Campaign Tracking', 'Form Integration', 'Email Analytics'],
      syncFrequency: 'Every 15 minutes',
      dataDirection: 'Bi-directional',
      setupTime: '5 minutes',
      tags: ['marketing', 'automation', 'email', 'campaigns']
    },
    {
      id: 'int-003',
      name: 'Slack Workspace',
      description: 'Get notifications, run commands, and collaborate directly from Slack channels.',
      provider: 'Slack',
      logo: 'SL',
      category: 'communication',
      type: 'webhook',
      status: 'connected',
      users: 52100,
      installs: 78600,
      rating: 4.9,
      reviews: 4560,
      lastUpdated: '2024-01-13',
      version: '4.1.2',
      pricing: 'Free',
      features: ['Notifications', 'Slash Commands', 'Bot Integration', 'File Sharing'],
      syncFrequency: 'Real-time',
      dataDirection: 'Bi-directional',
      setupTime: '3 minutes',
      tags: ['slack', 'communication', 'notifications', 'collaboration']
    },
    {
      id: 'int-004',
      name: 'Google Analytics',
      description: 'Track user behavior, monitor conversions, and analyze traffic with Google Analytics integration.',
      provider: 'Google',
      logo: 'GA',
      category: 'analytics',
      type: 'api',
      status: 'connected',
      users: 41800,
      installs: 62400,
      rating: 4.6,
      reviews: 2340,
      lastUpdated: '2024-01-12',
      version: '5.3.1',
      pricing: 'Free',
      features: ['Event Tracking', 'Custom Dimensions', 'Goal Tracking', 'E-commerce'],
      syncFrequency: 'Every 30 minutes',
      dataDirection: 'One-way (outbound)',
      setupTime: '8 minutes',
      tags: ['analytics', 'tracking', 'metrics', 'google']
    },
    {
      id: 'int-005',
      name: 'Stripe Payments',
      description: 'Process payments, manage subscriptions, and handle invoicing with Stripe integration.',
      provider: 'Stripe',
      logo: 'ST',
      category: 'payment',
      type: 'api',
      status: 'connected',
      users: 34500,
      installs: 48900,
      rating: 4.8,
      reviews: 3120,
      lastUpdated: '2024-01-11',
      version: '6.2.4',
      pricing: 'Free',
      features: ['Payment Processing', 'Subscriptions', 'Invoicing', 'Webhooks'],
      syncFrequency: 'Real-time',
      dataDirection: 'Bi-directional',
      setupTime: '15 minutes',
      tags: ['payment', 'stripe', 'billing', 'subscriptions']
    },
    {
      id: 'int-006',
      name: 'Dropbox Storage',
      description: 'Store and sync files with Dropbox, with automatic backup and file versioning.',
      provider: 'Dropbox',
      logo: 'DB',
      category: 'storage',
      type: 'oauth',
      status: 'available',
      users: 28700,
      installs: 41200,
      rating: 4.5,
      reviews: 1890,
      lastUpdated: '2024-01-10',
      version: '3.7.8',
      pricing: 'Free',
      features: ['File Sync', 'Auto Backup', 'Version Control', 'Shared Folders'],
      syncFrequency: 'Real-time',
      dataDirection: 'Bi-directional',
      setupTime: '5 minutes',
      tags: ['storage', 'dropbox', 'files', 'backup']
    },
    {
      id: 'int-007',
      name: 'Asana Projects',
      description: 'Sync tasks and projects with Asana for seamless project management integration.',
      provider: 'Asana',
      logo: 'AS',
      category: 'productivity',
      type: 'oauth',
      status: 'available',
      users: 32100,
      installs: 45800,
      rating: 4.7,
      reviews: 2560,
      lastUpdated: '2024-01-09',
      version: '2.9.3',
      pricing: 'Free',
      features: ['Task Sync', 'Project Management', 'Assignee Mapping', 'Status Updates'],
      syncFrequency: 'Every 5 minutes',
      dataDirection: 'Bi-directional',
      setupTime: '7 minutes',
      tags: ['productivity', 'tasks', 'projects', 'asana']
    },
    {
      id: 'int-008',
      name: 'Twitter/X API',
      description: 'Post updates, monitor mentions, and analyze engagement on Twitter/X platform.',
      provider: 'Twitter',
      logo: 'TW',
      category: 'social',
      type: 'api',
      status: 'available',
      users: 24600,
      installs: 36400,
      rating: 4.4,
      reviews: 1640,
      lastUpdated: '2024-01-08',
      version: '4.5.6',
      pricing: 'Free',
      features: ['Auto Posting', 'Mention Monitoring', 'Engagement Analytics', 'DM Integration'],
      syncFrequency: 'Every 15 minutes',
      dataDirection: 'Bi-directional',
      setupTime: '6 minutes',
      tags: ['social', 'twitter', 'x', 'social-media']
    },
    {
      id: 'int-009',
      name: 'Mailchimp Campaigns',
      description: 'Sync contacts and manage email campaigns with Mailchimp marketing platform.',
      provider: 'Mailchimp',
      logo: 'MC',
      category: 'marketing',
      type: 'oauth',
      status: 'available',
      users: 29400,
      installs: 42100,
      rating: 4.6,
      reviews: 2180,
      lastUpdated: '2024-01-07',
      version: '3.4.2',
      pricing: 'Free',
      features: ['Contact Sync', 'Campaign Management', 'List Segmentation', 'Analytics'],
      syncFrequency: 'Every 30 minutes',
      dataDirection: 'Bi-directional',
      setupTime: '8 minutes',
      tags: ['marketing', 'email', 'mailchimp', 'campaigns']
    },
    {
      id: 'int-010',
      name: 'Zoom Meetings',
      description: 'Schedule and manage Zoom meetings directly from your dashboard with calendar sync.',
      provider: 'Zoom',
      logo: 'ZM',
      category: 'communication',
      type: 'oauth',
      status: 'available',
      users: 36800,
      installs: 52700,
      rating: 4.7,
      reviews: 3280,
      lastUpdated: '2024-01-06',
      version: '5.1.9',
      pricing: 'Free',
      features: ['Meeting Scheduling', 'Calendar Sync', 'Recording Access', 'Participant Management'],
      syncFrequency: 'Real-time',
      dataDirection: 'Bi-directional',
      setupTime: '4 minutes',
      tags: ['communication', 'zoom', 'meetings', 'video']
    },
    {
      id: 'int-011',
      name: 'Zapier Automation',
      description: 'Connect to 5000+ apps through Zapier for unlimited automation possibilities.',
      provider: 'Zapier',
      logo: 'ZP',
      category: 'productivity',
      type: 'zapier',
      status: 'available',
      users: 18900,
      installs: 27600,
      rating: 4.5,
      reviews: 1420,
      lastUpdated: '2024-01-05',
      version: '2.6.1',
      pricing: 'Free',
      features: ['5000+ Apps', 'Multi-step Zaps', 'Conditional Logic', 'Custom Triggers'],
      syncFrequency: 'Variable',
      dataDirection: 'Bi-directional',
      setupTime: '10 minutes',
      tags: ['automation', 'zapier', 'workflow', 'integration']
    },
    {
      id: 'int-012',
      name: 'GitHub Repositories',
      description: 'Connect repositories, track commits, manage issues, and monitor pull requests.',
      provider: 'GitHub',
      logo: 'GH',
      category: 'productivity',
      type: 'oauth',
      status: 'available',
      users: 22400,
      installs: 34800,
      rating: 4.8,
      reviews: 2640,
      lastUpdated: '2024-01-04',
      version: '4.3.7',
      pricing: 'Free',
      features: ['Repo Sync', 'Issue Tracking', 'PR Monitoring', 'Commit Notifications'],
      syncFrequency: 'Real-time',
      dataDirection: 'Bi-directional',
      setupTime: '5 minutes',
      tags: ['development', 'github', 'code', 'repositories']
    }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    if (statusFilter !== 'all' && integration.status !== statusFilter) return false
    if (categoryFilter !== 'all' && integration.category !== categoryFilter) return false
    if (typeFilter !== 'all' && integration.type !== typeFilter) return false
    return true
  })

  const stats = [
    { label: 'Total Integrations', value: '342', trend: '+28', trendLabel: 'this month' },
    { label: 'Connected', value: '28', trend: '+5', trendLabel: 'vs last week' },
    { label: 'Total Users', value: '892K', trend: '+42%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: '4.7/5', trend: '+0.3', trendLabel: 'improvement' }
  ]

  const quickActions = [
    { label: 'Browse All', icon: '🔍', onClick: () => console.log('Browse All') },
    { label: 'My Integrations', icon: '🔗', onClick: () => console.log('My Integrations') },
    { label: 'Popular', icon: '⭐', onClick: () => console.log('Popular') },
    { label: 'Featured', icon: '✨', onClick: () => console.log('Featured') },
    { label: 'Categories', icon: '📂', onClick: () => console.log('Categories') },
    { label: 'API Docs', icon: '📚', onClick: () => console.log('API Docs') },
    { label: 'Build Custom', icon: '🛠️', onClick: () => console.log('Build Custom') },
    { label: 'Support', icon: '💬', onClick: () => console.log('Support') }
  ]

  const recentActivity = [
    { label: 'Salesforce CRM connected successfully', time: '4 min ago', type: 'connect' },
    { label: 'Slack notifications configured', time: '11 min ago', type: 'config' },
    { label: 'HubSpot sync completed (1,247 contacts)', time: '23 min ago', type: 'sync' },
    { label: 'Stripe payment integration updated', time: '1 hour ago', type: 'update' },
    { label: 'Google Analytics tracking enabled', time: '2 hours ago', type: 'enable' },
    { label: 'New integration: Zoom Meetings available', time: '3 hours ago', type: 'new' }
  ]

  const topIntegrations = filteredIntegrations
    .sort((a, b) => b.users - a.users)
    .slice(0, 5)
    .map((integration, index) => ({
      rank: index + 1,
      label: integration.name,
      value: integration.users.toLocaleString(),
      change: index === 0 ? '+45%' : index === 1 ? '+38%' : index === 2 ? '+32%' : index === 3 ? '+26%' : '+22%'
    }))

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700'
      case 'available': return 'bg-blue-100 text-blue-700'
      case 'disconnected': return 'bg-gray-100 text-gray-700'
      case 'configuring': return 'bg-yellow-100 text-yellow-700'
      case 'error': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: IntegrationCategory) => {
    switch (category) {
      case 'crm': return 'bg-blue-100 text-blue-700'
      case 'marketing': return 'bg-purple-100 text-purple-700'
      case 'productivity': return 'bg-green-100 text-green-700'
      case 'communication': return 'bg-pink-100 text-pink-700'
      case 'analytics': return 'bg-orange-100 text-orange-700'
      case 'payment': return 'bg-teal-100 text-teal-700'
      case 'storage': return 'bg-indigo-100 text-indigo-700'
      case 'social': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: IntegrationType) => {
    switch (type) {
      case 'native': return 'bg-blue-100 text-blue-700'
      case 'api': return 'bg-green-100 text-green-700'
      case 'webhook': return 'bg-purple-100 text-purple-700'
      case 'oauth': return 'bg-orange-100 text-orange-700'
      case 'zapier': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Integrations Marketplace
          </h1>
          <p className="text-gray-600 mt-1">Connect your favorite tools and services</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Browse Integrations
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
          <PillButton active={statusFilter === 'connected'} onClick={() => setStatusFilter('connected')}>Connected</PillButton>
          <PillButton active={statusFilter === 'available'} onClick={() => setStatusFilter('available')}>Available</PillButton>
          <PillButton active={statusFilter === 'disconnected'} onClick={() => setStatusFilter('disconnected')}>Disconnected</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'crm'} onClick={() => setCategoryFilter('crm')}>CRM</PillButton>
          <PillButton active={categoryFilter === 'marketing'} onClick={() => setCategoryFilter('marketing')}>Marketing</PillButton>
          <PillButton active={categoryFilter === 'communication'} onClick={() => setCategoryFilter('communication')}>Communication</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All Types</PillButton>
          <PillButton active={typeFilter === 'oauth'} onClick={() => setTypeFilter('oauth')}>OAuth</PillButton>
          <PillButton active={typeFilter === 'api'} onClick={() => setTypeFilter('api')}>API</PillButton>
          <PillButton active={typeFilter === 'webhook'} onClick={() => setTypeFilter('webhook')}>Webhook</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integrations List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Available Integrations ({filteredIntegrations.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredIntegrations.map(integration => (
                <div key={integration.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(integration.type)}`}>
                      {integration.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-gray-500">Users</div>
                      <div className="font-semibold">{integration.users.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Sync</div>
                      <div className="font-semibold">{integration.syncFrequency}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Data Flow</div>
                      <div className="font-semibold text-xs">{integration.dataDirection}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Setup Time</div>
                      <div className="font-semibold">{integration.setupTime}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{integration.rating}</span>
                      <span className="text-gray-500">({integration.reviews})</span>
                    </div>
                    <span className="text-teal-600 font-medium">{integration.pricing}</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    {integration.status === 'connected' ? (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded text-xs font-medium hover:bg-teal-100">
                          Configure
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded text-xs font-medium hover:bg-teal-100">
                          Connect
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Learn More
                        </button>
                      </>
                    )}
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
              <MiniKPI label="Connected" value="28" />
              <MiniKPI label="Available" value="314" />
              <MiniKPI label="Active Syncs" value="18" />
              <MiniKPI label="API Calls Today" value="24.6K" />
            </div>
          </div>

          {/* Top Integrations */}
          <RankingList title="Most Popular Integrations" items={topIntegrations} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="Integration Categories"
            items={[
              { label: 'Communication', value: 28, color: 'from-pink-400 to-pink-600' },
              { label: 'CRM', value: 24, color: 'from-blue-400 to-blue-600' },
              { label: 'Marketing', value: 20, color: 'from-purple-400 to-purple-600' },
              { label: 'Productivity', value: 16, color: 'from-green-400 to-green-600' },
              { label: 'Analytics', value: 12, color: 'from-orange-400 to-orange-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
