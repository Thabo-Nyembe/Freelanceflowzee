"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type ExtensionStatus = 'enabled' | 'disabled' | 'installing' | 'updating' | 'error'
type ExtensionCategory = 'browser' | 'desktop' | 'mobile' | 'api' | 'workflow' | 'integration' | 'utility' | 'enhancement'
type ExtensionType = 'official' | 'verified' | 'third-party' | 'experimental' | 'legacy'

interface Extension {
  id: string
  name: string
  description: string
  version: string
  developer: string
  category: ExtensionCategory
  type: ExtensionType
  status: ExtensionStatus
  users: number
  downloads: number
  rating: number
  totalReviews: number
  lastUpdated: string
  releaseDate: string
  size: string
  platform: string
  permissions: string[]
  features: string[]
  compatibility: string[]
  tags: string[]
}

export default function ExtensionsPage() {
  const [statusFilter, setStatusFilter] = useState<ExtensionStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ExtensionCategory | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ExtensionType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const extensions: Extension[] = [
    {
      id: 'ext-001',
      name: 'Chrome Dashboard Extension',
      description: 'Access your dashboard directly from Chrome with quick actions, notifications, and real-time updates.',
      version: '3.5.2',
      developer: 'Official Team',
      category: 'browser',
      type: 'official',
      status: 'enabled',
      users: 67800,
      downloads: 89400,
      rating: 4.8,
      totalReviews: 4230,
      lastUpdated: '2024-01-15',
      releaseDate: '2023-03-12',
      size: '1.8 MB',
      platform: 'Chrome, Edge, Brave',
      permissions: ['tabs', 'notifications', 'storage'],
      features: ['Quick Actions', 'Live Updates', 'Shortcuts', 'Dark Mode'],
      compatibility: ['Chrome 90+', 'Edge 90+', 'Brave 1.0+'],
      tags: ['browser', 'chrome', 'dashboard', 'productivity']
    },
    {
      id: 'ext-002',
      name: 'Desktop App Companion',
      description: 'Native desktop application with offline support, system tray integration, and keyboard shortcuts.',
      version: '2.8.4',
      developer: 'Official Team',
      category: 'desktop',
      type: 'official',
      status: 'enabled',
      users: 54200,
      downloads: 72600,
      rating: 4.7,
      totalReviews: 3180,
      lastUpdated: '2024-01-14',
      releaseDate: '2023-05-20',
      size: '42.3 MB',
      platform: 'Windows, macOS, Linux',
      permissions: ['filesystem', 'notifications', 'system-tray'],
      features: ['Offline Mode', 'Auto-sync', 'System Integration', 'Hotkeys'],
      compatibility: ['Windows 10+', 'macOS 11+', 'Ubuntu 20.04+'],
      tags: ['desktop', 'offline', 'native', 'cross-platform']
    },
    {
      id: 'ext-003',
      name: 'Mobile Productivity Suite',
      description: 'Full-featured mobile app with gesture controls, widgets, and seamless cloud synchronization.',
      version: '4.1.8',
      developer: 'Official Team',
      category: 'mobile',
      type: 'official',
      status: 'enabled',
      users: 48900,
      downloads: 124500,
      rating: 4.6,
      totalReviews: 5670,
      lastUpdated: '2024-01-13',
      releaseDate: '2023-01-15',
      size: '68.4 MB',
      platform: 'iOS, Android',
      permissions: ['camera', 'storage', 'notifications'],
      features: ['Widgets', 'Gestures', 'Cloud Sync', 'Biometric Auth'],
      compatibility: ['iOS 14+', 'Android 10+'],
      tags: ['mobile', 'ios', 'android', 'widgets']
    },
    {
      id: 'ext-004',
      name: 'Advanced API Gateway',
      description: 'Enterprise-grade API extension with rate limiting, caching, and advanced authentication options.',
      version: '5.2.1',
      developer: 'Enterprise Solutions',
      category: 'api',
      type: 'verified',
      status: 'enabled',
      users: 42100,
      downloads: 58700,
      rating: 4.9,
      totalReviews: 2340,
      lastUpdated: '2024-01-12',
      releaseDate: '2023-07-08',
      size: '3.2 MB',
      platform: 'Server-side',
      permissions: ['api-access', 'rate-limiting', 'caching'],
      features: ['Rate Limiting', 'OAuth 2.0', 'GraphQL', 'Webhooks'],
      compatibility: ['Node.js 16+', 'Python 3.8+', 'Java 11+'],
      tags: ['api', 'gateway', 'enterprise', 'security']
    },
    {
      id: 'ext-005',
      name: 'Workflow Automation Pro',
      description: 'Create powerful automated workflows with visual builder, scheduling, and conditional logic.',
      version: '3.9.6',
      developer: 'Automation Inc',
      category: 'workflow',
      type: 'verified',
      status: 'enabled',
      users: 38600,
      downloads: 51200,
      rating: 4.7,
      totalReviews: 2890,
      lastUpdated: '2024-01-11',
      releaseDate: '2023-04-22',
      size: '4.5 MB',
      platform: 'Web, API',
      permissions: ['workflows', 'scheduling', 'webhooks'],
      features: ['Visual Builder', 'Scheduling', 'Conditions', 'Templates'],
      compatibility: ['All platforms'],
      tags: ['workflow', 'automation', 'no-code', 'scheduler']
    },
    {
      id: 'ext-006',
      name: 'Slack Integration Plus',
      description: 'Deep Slack integration with commands, notifications, interactive messages, and bot functionality.',
      version: '2.4.3',
      developer: 'Integration Team',
      category: 'integration',
      type: 'official',
      status: 'enabled',
      users: 34800,
      downloads: 46900,
      rating: 4.5,
      totalReviews: 2160,
      lastUpdated: '2024-01-10',
      releaseDate: '2023-06-14',
      size: '2.1 MB',
      platform: 'Slack',
      permissions: ['chat:write', 'commands', 'bot'],
      features: ['Slash Commands', 'Notifications', 'Bot', 'Interactive Messages'],
      compatibility: ['Slack Workspace'],
      tags: ['slack', 'integration', 'messaging', 'bot']
    },
    {
      id: 'ext-007',
      name: 'Data Export & Import Tool',
      description: 'Bulk data operations with support for CSV, JSON, XML, Excel, and custom format mappings.',
      version: '1.7.9',
      developer: 'Data Tools Co',
      category: 'utility',
      type: 'verified',
      status: 'enabled',
      users: 29200,
      downloads: 38600,
      rating: 4.4,
      totalReviews: 1540,
      lastUpdated: '2024-01-09',
      releaseDate: '2023-09-05',
      size: '3.8 MB',
      platform: 'Web, API',
      permissions: ['data-read', 'data-write', 'export'],
      features: ['Bulk Import', 'Export Formats', 'Mapping', 'Validation'],
      compatibility: ['All platforms'],
      tags: ['data', 'export', 'import', 'csv']
    },
    {
      id: 'ext-008',
      name: 'Advanced Search & Filters',
      description: 'Enhanced search capabilities with fuzzy matching, filters, saved searches, and search analytics.',
      version: '2.6.2',
      developer: 'Search Labs',
      category: 'enhancement',
      type: 'verified',
      status: 'enabled',
      users: 25700,
      downloads: 34200,
      rating: 4.6,
      totalReviews: 1820,
      lastUpdated: '2024-01-08',
      releaseDate: '2023-08-17',
      size: '2.9 MB',
      platform: 'Web',
      permissions: ['search', 'analytics'],
      features: ['Fuzzy Search', 'Advanced Filters', 'Saved Searches', 'Analytics'],
      compatibility: ['Modern browsers'],
      tags: ['search', 'filters', 'analytics', 'enhancement']
    },
    {
      id: 'ext-009',
      name: 'Microsoft Teams Connector',
      description: 'Seamless Microsoft Teams integration with channels, meetings, and file sharing capabilities.',
      version: '1.9.1',
      developer: 'Integration Team',
      category: 'integration',
      type: 'official',
      status: 'enabled',
      users: 22400,
      downloads: 31800,
      rating: 4.3,
      totalReviews: 1260,
      lastUpdated: '2024-01-07',
      releaseDate: '2023-10-23',
      size: '2.4 MB',
      platform: 'Microsoft Teams',
      permissions: ['teams:read', 'teams:write', 'meetings'],
      features: ['Channel Integration', 'Meeting Bot', 'File Sharing', 'Notifications'],
      compatibility: ['Microsoft Teams'],
      tags: ['teams', 'microsoft', 'integration', 'meetings']
    },
    {
      id: 'ext-010',
      name: 'Custom Theme Engine',
      description: 'Create and apply custom themes with live preview, color schemes, and typography controls.',
      version: '3.2.5',
      developer: 'Design Studio',
      category: 'enhancement',
      type: 'verified',
      status: 'enabled',
      users: 19800,
      downloads: 27400,
      rating: 4.5,
      totalReviews: 1450,
      lastUpdated: '2024-01-06',
      releaseDate: '2023-02-28',
      size: '1.6 MB',
      platform: 'Web',
      permissions: ['themes', 'ui-customize'],
      features: ['Theme Builder', 'Live Preview', 'Color Picker', 'Typography'],
      compatibility: ['Modern browsers'],
      tags: ['themes', 'design', 'customization', 'ui']
    },
    {
      id: 'ext-011',
      name: 'Zapier Integration Hub',
      description: 'Connect to 5000+ apps via Zapier with pre-built templates and custom workflow creation.',
      version: '2.1.7',
      developer: 'Integration Team',
      category: 'integration',
      type: 'official',
      status: 'enabled',
      users: 16500,
      downloads: 23700,
      rating: 4.7,
      totalReviews: 980,
      lastUpdated: '2024-01-05',
      releaseDate: '2023-11-12',
      size: '1.9 MB',
      platform: 'Web, API',
      permissions: ['zapier:connect', 'webhooks'],
      features: ['5000+ Apps', 'Templates', 'Custom Zaps', 'Auto-sync'],
      compatibility: ['Zapier account required'],
      tags: ['zapier', 'integration', 'automation', 'apps']
    },
    {
      id: 'ext-012',
      name: 'Performance Optimizer',
      description: 'Optimize application performance with caching, lazy loading, and resource compression.',
      version: '1.5.4',
      developer: 'Performance Team',
      category: 'utility',
      type: 'experimental',
      status: 'enabled',
      users: 14200,
      downloads: 19800,
      rating: 4.2,
      totalReviews: 720,
      lastUpdated: '2024-01-04',
      releaseDate: '2023-12-01',
      size: '2.7 MB',
      platform: 'Web',
      permissions: ['cache', 'optimization'],
      features: ['Caching', 'Lazy Loading', 'Compression', 'Analytics'],
      compatibility: ['Modern browsers'],
      tags: ['performance', 'optimization', 'caching', 'speed']
    }
  ]

  const filteredExtensions = extensions.filter(extension => {
    if (statusFilter !== 'all' && extension.status !== statusFilter) return false
    if (categoryFilter !== 'all' && extension.category !== categoryFilter) return false
    if (typeFilter !== 'all' && extension.type !== typeFilter) return false
    return true
  })

  const stats = [
    { label: 'Total Extensions', value: '248', trend: '+16', trendLabel: 'this month' },
    { label: 'Enabled Extensions', value: '189', trend: '+12', trendLabel: 'vs last week' },
    { label: 'Total Users', value: '542K', trend: '+34%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: '4.5/5', trend: '+0.3', trendLabel: 'improvement' }
  ]

  const quickActions = [
    { label: 'Browse Extensions', icon: '🔍', onClick: () => console.log('Browse Extensions') },
    { label: 'Install Extension', icon: '⬇️', onClick: () => console.log('Install Extension') },
    { label: 'My Extensions', icon: '📦', onClick: () => console.log('My Extensions') },
    { label: 'Extension Settings', icon: '⚙️', onClick: () => console.log('Extension Settings') },
    { label: 'Developer Center', icon: '💻', onClick: () => console.log('Developer Center') },
    { label: 'Documentation', icon: '📚', onClick: () => console.log('Documentation') },
    { label: 'Build Extension', icon: '🛠️', onClick: () => console.log('Build Extension') },
    { label: 'Support', icon: '💬', onClick: () => console.log('Support') }
  ]

  const recentActivity = [
    { label: 'Extension "Chrome Dashboard" updated to v3.5.2', time: '8 min ago', type: 'update' },
    { label: 'New extension "Performance Optimizer" installed', time: '15 min ago', type: 'install' },
    { label: 'Extension "Desktop App" reached 50K users', time: '32 min ago', type: 'milestone' },
    { label: '"Mobile Suite" compatibility updated', time: '1 hour ago', type: 'compatibility' },
    { label: 'Extension "API Gateway" received 5-star review', time: '2 hours ago', type: 'review' },
    { label: '4 extensions updated to latest versions', time: '3 hours ago', type: 'update' }
  ]

  const topExtensions = filteredExtensions
    .sort((a, b) => b.users - a.users)
    .slice(0, 5)
    .map((extension, index) => ({
      rank: index + 1,
      label: extension.name,
      value: extension.users.toLocaleString(),
      change: index === 0 ? '+38%' : index === 1 ? '+32%' : index === 2 ? '+26%' : index === 3 ? '+20%' : '+16%'
    }))

  const getStatusColor = (status: ExtensionStatus) => {
    switch (status) {
      case 'enabled': return 'bg-green-100 text-green-700'
      case 'disabled': return 'bg-gray-100 text-gray-700'
      case 'installing': return 'bg-blue-100 text-blue-700'
      case 'updating': return 'bg-yellow-100 text-yellow-700'
      case 'error': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: ExtensionCategory) => {
    switch (category) {
      case 'browser': return 'bg-blue-100 text-blue-700'
      case 'desktop': return 'bg-purple-100 text-purple-700'
      case 'mobile': return 'bg-pink-100 text-pink-700'
      case 'api': return 'bg-green-100 text-green-700'
      case 'workflow': return 'bg-orange-100 text-orange-700'
      case 'integration': return 'bg-teal-100 text-teal-700'
      case 'utility': return 'bg-indigo-100 text-indigo-700'
      case 'enhancement': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: ExtensionType) => {
    switch (type) {
      case 'official': return 'bg-blue-100 text-blue-700'
      case 'verified': return 'bg-green-100 text-green-700'
      case 'third-party': return 'bg-purple-100 text-purple-700'
      case 'experimental': return 'bg-yellow-100 text-yellow-700'
      case 'legacy': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Extensions
          </h1>
          <p className="text-gray-600 mt-1">Enhance your platform with powerful extensions</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Browse Extensions
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
          <PillButton active={statusFilter === 'enabled'} onClick={() => setStatusFilter('enabled')}>Enabled</PillButton>
          <PillButton active={statusFilter === 'disabled'} onClick={() => setStatusFilter('disabled')}>Disabled</PillButton>
          <PillButton active={statusFilter === 'updating'} onClick={() => setStatusFilter('updating')}>Updating</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'browser'} onClick={() => setCategoryFilter('browser')}>Browser</PillButton>
          <PillButton active={categoryFilter === 'desktop'} onClick={() => setCategoryFilter('desktop')}>Desktop</PillButton>
          <PillButton active={categoryFilter === 'mobile'} onClick={() => setCategoryFilter('mobile')}>Mobile</PillButton>
          <PillButton active={categoryFilter === 'integration'} onClick={() => setCategoryFilter('integration')}>Integration</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All Types</PillButton>
          <PillButton active={typeFilter === 'official'} onClick={() => setTypeFilter('official')}>Official</PillButton>
          <PillButton active={typeFilter === 'verified'} onClick={() => setTypeFilter('verified')}>Verified</PillButton>
          <PillButton active={typeFilter === 'third-party'} onClick={() => setTypeFilter('third-party')}>Third-Party</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Extensions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Installed Extensions ({filteredExtensions.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredExtensions.map(extension => (
                <div key={extension.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{extension.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">v{extension.version} • {extension.size} • {extension.developer}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{extension.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(extension.status)}`}>
                      {extension.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(extension.category)}`}>
                      {extension.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(extension.type)}`}>
                      {extension.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-gray-500">Users</div>
                      <div className="font-semibold">{extension.users.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Downloads</div>
                      <div className="font-semibold">{extension.downloads.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-1">Platform</div>
                    <div className="text-xs font-medium">{extension.platform}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{extension.rating}</span>
                      <span className="text-gray-500">({extension.totalReviews})</span>
                    </div>
                    <span className="text-gray-500">Updated {extension.lastUpdated}</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <button className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100">
                      Configure
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                      Disable
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
              <MiniKPI label="Enabled Extensions" value="189" />
              <MiniKPI label="Disabled" value="42" />
              <MiniKPI label="Need Update" value="17" />
              <MiniKPI label="Total Downloads" value="1.2M" />
            </div>
          </div>

          {/* Top Extensions */}
          <RankingList title="Most Popular Extensions" items={topExtensions} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="Extension Categories"
            items={[
              { label: 'Browser', value: 26, color: 'from-blue-400 to-blue-600' },
              { label: 'Desktop', value: 22, color: 'from-purple-400 to-purple-600' },
              { label: 'Mobile', value: 18, color: 'from-pink-400 to-pink-600' },
              { label: 'Integration', value: 20, color: 'from-teal-400 to-teal-600' },
              { label: 'Utility', value: 14, color: 'from-indigo-400 to-indigo-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
