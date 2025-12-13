"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type PluginStatus = 'active' | 'inactive' | 'updating' | 'error' | 'disabled'
type PluginCategory = 'productivity' | 'security' | 'analytics' | 'integration' | 'communication' | 'automation' | 'ui-enhancement' | 'developer-tools'
type PluginType = 'core' | 'premium' | 'community' | 'enterprise' | 'beta'

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  category: PluginCategory
  type: PluginType
  status: PluginStatus
  installs: number
  activeUsers: number
  rating: number
  reviews: number
  lastUpdated: string
  size: string
  compatibility: string
  permissions: string[]
  apiCalls: number
  performance: number
  tags: string[]
}

export default function PluginsPage() {
  const [statusFilter, setStatusFilter] = useState<PluginStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<PluginCategory | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<PluginType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const plugins: Plugin[] = [
    {
      id: 'plugin-001',
      name: 'Advanced Security Suite',
      description: 'Comprehensive security plugin with 2FA, IP whitelisting, brute force protection, and security audit logs.',
      version: '4.2.1',
      author: 'Security Team',
      category: 'security',
      type: 'premium',
      status: 'active',
      installs: 54200,
      activeUsers: 48900,
      rating: 4.9,
      reviews: 3420,
      lastUpdated: '2024-01-15',
      size: '2.4 MB',
      compatibility: 'v3.0+',
      permissions: ['read_users', 'write_security', 'manage_sessions'],
      apiCalls: 12400,
      performance: 98,
      tags: ['security', '2fa', 'authentication', 'audit']
    },
    {
      id: 'plugin-002',
      name: 'Team Collaboration Pro',
      description: 'Enhanced team collaboration with real-time editing, video calls, screen sharing, and project management.',
      version: '3.8.5',
      author: 'Collaboration Inc',
      category: 'communication',
      type: 'premium',
      status: 'active',
      installs: 42800,
      activeUsers: 38600,
      rating: 4.7,
      reviews: 2840,
      lastUpdated: '2024-01-14',
      size: '3.1 MB',
      compatibility: 'v2.5+',
      permissions: ['read_teams', 'write_messages', 'manage_meetings'],
      apiCalls: 18900,
      performance: 95,
      tags: ['collaboration', 'video', 'chat', 'meetings']
    },
    {
      id: 'plugin-003',
      name: 'Analytics Dashboard Plus',
      description: 'Advanced analytics with custom dashboards, predictive insights, AI-powered recommendations, and data export.',
      version: '5.1.2',
      author: 'Analytics Corp',
      category: 'analytics',
      type: 'enterprise',
      status: 'active',
      installs: 38500,
      activeUsers: 34200,
      rating: 4.8,
      reviews: 2560,
      lastUpdated: '2024-01-13',
      size: '4.2 MB',
      compatibility: 'v3.2+',
      permissions: ['read_analytics', 'write_reports', 'access_data'],
      apiCalls: 24600,
      performance: 92,
      tags: ['analytics', 'dashboards', 'ai', 'insights']
    },
    {
      id: 'plugin-004',
      name: 'Workflow Automation Engine',
      description: 'Powerful automation engine with custom triggers, actions, conditions, and integrations with 100+ services.',
      version: '2.9.3',
      author: 'Automation Labs',
      category: 'automation',
      type: 'premium',
      status: 'active',
      installs: 35600,
      activeUsers: 31800,
      rating: 4.6,
      reviews: 2180,
      lastUpdated: '2024-01-12',
      size: '3.8 MB',
      compatibility: 'v2.8+',
      permissions: ['read_workflows', 'write_automation', 'manage_webhooks'],
      apiCalls: 32400,
      performance: 94,
      tags: ['automation', 'workflow', 'triggers', 'integrations']
    },
    {
      id: 'plugin-005',
      name: 'Productivity Booster',
      description: 'Boost productivity with keyboard shortcuts, quick actions, templates, and time tracking features.',
      version: '1.7.8',
      author: 'Productivity Inc',
      category: 'productivity',
      type: 'community',
      status: 'active',
      installs: 29400,
      activeUsers: 26100,
      rating: 4.5,
      reviews: 1890,
      lastUpdated: '2024-01-11',
      size: '1.6 MB',
      compatibility: 'v2.0+',
      permissions: ['read_tasks', 'write_shortcuts', 'manage_templates'],
      apiCalls: 8900,
      performance: 97,
      tags: ['productivity', 'shortcuts', 'templates', 'time-tracking']
    },
    {
      id: 'plugin-006',
      name: 'API Integration Hub',
      description: 'Connect to external APIs with pre-built connectors for Salesforce, HubSpot, Zendesk, and more.',
      version: '3.4.6',
      author: 'Integration Team',
      category: 'integration',
      type: 'enterprise',
      status: 'active',
      installs: 25800,
      activeUsers: 23400,
      rating: 4.7,
      reviews: 1640,
      lastUpdated: '2024-01-10',
      size: '5.1 MB',
      compatibility: 'v3.0+',
      permissions: ['read_api', 'write_integrations', 'manage_connections'],
      apiCalls: 45600,
      performance: 89,
      tags: ['api', 'integration', 'connectors', 'sync']
    },
    {
      id: 'plugin-007',
      name: 'UI Theme Customizer',
      description: 'Customize your interface with themes, color schemes, fonts, and layout options. 50+ pre-built themes.',
      version: '2.3.1',
      author: 'Design Studio',
      category: 'ui-enhancement',
      type: 'community',
      status: 'active',
      installs: 22100,
      activeUsers: 19800,
      rating: 4.4,
      reviews: 1420,
      lastUpdated: '2024-01-09',
      size: '2.8 MB',
      compatibility: 'v2.5+',
      permissions: ['read_themes', 'write_styles', 'manage_ui'],
      apiCalls: 3200,
      performance: 96,
      tags: ['themes', 'ui', 'customization', 'design']
    },
    {
      id: 'plugin-008',
      name: 'Developer Toolkit',
      description: 'Essential tools for developers: API explorer, code snippets, debugging tools, and performance profiler.',
      version: '4.5.2',
      author: 'Dev Tools Inc',
      category: 'developer-tools',
      type: 'core',
      status: 'active',
      installs: 18600,
      activeUsers: 16900,
      rating: 4.8,
      reviews: 1280,
      lastUpdated: '2024-01-08',
      size: '3.4 MB',
      compatibility: 'v3.5+',
      permissions: ['read_code', 'write_debug', 'access_api'],
      apiCalls: 15800,
      performance: 93,
      tags: ['developer', 'api', 'debugging', 'tools']
    },
    {
      id: 'plugin-009',
      name: 'Smart Notifications Manager',
      description: 'Intelligent notification system with custom rules, priorities, channels, and do-not-disturb scheduling.',
      version: '1.9.4',
      author: 'Notification Labs',
      category: 'communication',
      type: 'premium',
      status: 'active',
      installs: 16200,
      activeUsers: 14500,
      rating: 4.3,
      reviews: 980,
      lastUpdated: '2024-01-07',
      size: '1.9 MB',
      compatibility: 'v2.3+',
      permissions: ['read_notifications', 'write_alerts', 'manage_channels'],
      apiCalls: 6700,
      performance: 95,
      tags: ['notifications', 'alerts', 'messaging', 'smart']
    },
    {
      id: 'plugin-010',
      name: 'Performance Monitor Pro',
      description: 'Real-time performance monitoring with metrics tracking, alerts, and optimization recommendations.',
      version: '3.1.7',
      author: 'Performance Team',
      category: 'analytics',
      type: 'enterprise',
      status: 'active',
      installs: 14800,
      activeUsers: 13200,
      rating: 4.6,
      reviews: 840,
      lastUpdated: '2024-01-06',
      size: '2.6 MB',
      compatibility: 'v3.0+',
      permissions: ['read_metrics', 'write_logs', 'manage_alerts'],
      apiCalls: 21400,
      performance: 91,
      tags: ['performance', 'monitoring', 'metrics', 'optimization']
    },
    {
      id: 'plugin-011',
      name: 'Backup & Restore Manager',
      description: 'Automated backup solution with scheduled backups, incremental updates, and one-click restore functionality.',
      version: '2.6.3',
      author: 'Backup Solutions',
      category: 'security',
      type: 'premium',
      status: 'active',
      installs: 12400,
      activeUsers: 11100,
      rating: 4.7,
      reviews: 720,
      lastUpdated: '2024-01-05',
      size: '2.2 MB',
      compatibility: 'v2.0+',
      permissions: ['read_data', 'write_backup', 'manage_storage'],
      apiCalls: 9800,
      performance: 94,
      tags: ['backup', 'restore', 'security', 'data']
    },
    {
      id: 'plugin-012',
      name: 'AI Content Assistant',
      description: 'AI-powered writing assistant with grammar checking, tone adjustment, and content suggestions.',
      version: '1.4.2',
      author: 'AI Labs',
      category: 'productivity',
      type: 'beta',
      status: 'active',
      installs: 9800,
      activeUsers: 8600,
      rating: 4.5,
      reviews: 560,
      lastUpdated: '2024-01-04',
      size: '4.8 MB',
      compatibility: 'v3.8+',
      permissions: ['read_content', 'write_suggestions', 'access_ai'],
      apiCalls: 18200,
      performance: 88,
      tags: ['ai', 'writing', 'content', 'assistant']
    }
  ]

  const filteredPlugins = plugins.filter(plugin => {
    if (statusFilter !== 'all' && plugin.status !== statusFilter) return false
    if (categoryFilter !== 'all' && plugin.category !== categoryFilter) return false
    if (typeFilter !== 'all' && plugin.type !== typeFilter) return false
    return true
  })

  const stats = [
    { label: 'Total Plugins', value: '156', trend: '+12', trendLabel: 'this month' },
    { label: 'Active Plugins', value: '128', trend: '+8', trendLabel: 'vs last week' },
    { label: 'Total Installs', value: '324K', trend: '+28%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: '4.6/5', trend: '+0.2', trendLabel: 'improvement' }
  ]

  const quickActions = [
    { label: 'Browse Plugins', icon: '🔍', onClick: () => console.log('Browse Plugins') },
    { label: 'Install Plugin', icon: '⬇️', onClick: () => console.log('Install Plugin') },
    { label: 'My Plugins', icon: '📦', onClick: () => console.log('My Plugins') },
    { label: 'Plugin Settings', icon: '⚙️', onClick: () => console.log('Plugin Settings') },
    { label: 'Developer Docs', icon: '📚', onClick: () => console.log('Developer Docs') },
    { label: 'API Reference', icon: '⚡', onClick: () => console.log('API Reference') },
    { label: 'Create Plugin', icon: '✨', onClick: () => console.log('Create Plugin') },
    { label: 'Support', icon: '💬', onClick: () => console.log('Support') }
  ]

  const recentActivity = [
    { label: 'Plugin "Security Suite" updated to v4.2.1', time: '5 min ago', type: 'update' },
    { label: 'New plugin "AI Content Assistant" installed', time: '12 min ago', type: 'install' },
    { label: 'Plugin "Analytics Plus" reached 30K users', time: '25 min ago', type: 'milestone' },
    { label: '"Workflow Automation" permissions updated', time: '1 hour ago', type: 'security' },
    { label: 'Plugin "UI Customizer" received 5-star review', time: '2 hours ago', type: 'review' },
    { label: '3 plugins updated to latest compatibility', time: '3 hours ago', type: 'update' }
  ]

  const topPlugins = filteredPlugins
    .sort((a, b) => b.installs - a.installs)
    .slice(0, 5)
    .map((plugin, index) => ({
      rank: index + 1,
      label: plugin.name,
      value: plugin.installs.toLocaleString(),
      change: index === 0 ? '+34%' : index === 1 ? '+28%' : index === 2 ? '+22%' : index === 3 ? '+18%' : '+14%'
    }))

  const getStatusColor = (status: PluginStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      case 'updating': return 'bg-blue-100 text-blue-700'
      case 'error': return 'bg-red-100 text-red-700'
      case 'disabled': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: PluginCategory) => {
    switch (category) {
      case 'productivity': return 'bg-purple-100 text-purple-700'
      case 'security': return 'bg-red-100 text-red-700'
      case 'analytics': return 'bg-blue-100 text-blue-700'
      case 'integration': return 'bg-green-100 text-green-700'
      case 'communication': return 'bg-pink-100 text-pink-700'
      case 'automation': return 'bg-orange-100 text-orange-700'
      case 'ui-enhancement': return 'bg-indigo-100 text-indigo-700'
      case 'developer-tools': return 'bg-teal-100 text-teal-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: PluginType) => {
    switch (type) {
      case 'core': return 'bg-blue-100 text-blue-700'
      case 'premium': return 'bg-purple-100 text-purple-700'
      case 'community': return 'bg-green-100 text-green-700'
      case 'enterprise': return 'bg-orange-100 text-orange-700'
      case 'beta': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
            Plugins
          </h1>
          <p className="text-gray-600 mt-1">Manage and extend your platform with powerful plugins</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Install New Plugin
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
          <PillButton active={statusFilter === 'inactive'} onClick={() => setStatusFilter('inactive')}>Inactive</PillButton>
          <PillButton active={statusFilter === 'updating'} onClick={() => setStatusFilter('updating')}>Updating</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'security'} onClick={() => setCategoryFilter('security')}>Security</PillButton>
          <PillButton active={categoryFilter === 'productivity'} onClick={() => setCategoryFilter('productivity')}>Productivity</PillButton>
          <PillButton active={categoryFilter === 'analytics'} onClick={() => setCategoryFilter('analytics')}>Analytics</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All Types</PillButton>
          <PillButton active={typeFilter === 'premium'} onClick={() => setTypeFilter('premium')}>Premium</PillButton>
          <PillButton active={typeFilter === 'enterprise'} onClick={() => setTypeFilter('enterprise')}>Enterprise</PillButton>
          <PillButton active={typeFilter === 'community'} onClick={() => setTypeFilter('community')}>Community</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plugins List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Installed Plugins ({filteredPlugins.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredPlugins.map(plugin => (
                <div key={plugin.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{plugin.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">v{plugin.version} • {plugin.size} • By {plugin.author}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{plugin.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(plugin.status)}`}>
                      {plugin.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(plugin.category)}`}>
                      {plugin.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(plugin.type)}`}>
                      {plugin.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-gray-500">Installs</div>
                      <div className="font-semibold">{plugin.installs.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Active Users</div>
                      <div className="font-semibold">{plugin.activeUsers.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Performance</div>
                      <div className="font-semibold">{plugin.performance}%</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">API Calls</div>
                      <div className="font-semibold">{plugin.apiCalls.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Performance Score</span>
                      <span className="text-xs font-semibold">{plugin.performance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${plugin.performance}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{plugin.rating}</span>
                      <span className="text-gray-500">({plugin.reviews})</span>
                    </div>
                    <span className="text-gray-500">{plugin.compatibility}</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <button className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100">
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
              <MiniKPI label="Active Plugins" value="128" />
              <MiniKPI label="Inactive" value="18" />
              <MiniKPI label="Need Update" value="10" />
              <MiniKPI label="Avg Performance" value="93%" />
            </div>
          </div>

          {/* Top Plugins */}
          <RankingList title="Most Installed Plugins" items={topPlugins} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="Plugin Categories"
            items={[
              { label: 'Security', value: 24, color: 'from-red-400 to-red-600' },
              { label: 'Productivity', value: 22, color: 'from-purple-400 to-purple-600' },
              { label: 'Analytics', value: 18, color: 'from-blue-400 to-blue-600' },
              { label: 'Integration', value: 16, color: 'from-green-400 to-green-600' },
              { label: 'Automation', value: 12, color: 'from-orange-400 to-orange-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
