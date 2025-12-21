'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import { usePlugins, Plugin, PluginStats } from '@/lib/hooks/use-plugins'
import { createPlugin, updatePlugin, deletePlugin, activatePlugin, deactivatePlugin } from '@/app/actions/plugins'

type PluginStatus = 'active' | 'inactive' | 'updating' | 'error' | 'disabled'
type PluginCategory = 'productivity' | 'security' | 'analytics' | 'integration' | 'communication' | 'automation' | 'ui-enhancement' | 'developer-tools'
type PluginType = 'core' | 'premium' | 'community' | 'enterprise' | 'beta'

interface PluginsClientProps {
  initialPlugins: Plugin[]
  initialStats: PluginStats
}

export default function PluginsClient({ initialPlugins, initialStats }: PluginsClientProps) {
  const { plugins, stats } = usePlugins(initialPlugins, initialStats)
  const [statusFilter, setStatusFilter] = useState<PluginStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<PluginCategory | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<PluginType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    author: '',
    category: 'productivity' as PluginCategory,
    plugin_type: 'community' as PluginType,
    status: 'inactive' as PluginStatus,
    compatibility: '',
    permissions: [] as string[],
    tags: [] as string[]
  })

  const filteredPlugins = plugins.filter(plugin => {
    if (statusFilter !== 'all' && plugin.status !== statusFilter) return false
    if (categoryFilter !== 'all' && plugin.category !== categoryFilter) return false
    if (typeFilter !== 'all' && plugin.plugin_type !== typeFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Plugins', value: stats.total.toString(), trend: '+12', trendLabel: 'this month' },
    { label: 'Active Plugins', value: stats.active.toString(), trend: '+8', trendLabel: 'vs last week' },
    { label: 'Total Installs', value: stats.totalInstalls.toLocaleString(), trend: '+28%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: `${stats.avgRating.toFixed(1)}/5`, trend: '+0.2', trendLabel: 'improvement' }
  ]

  const handleCreatePlugin = async () => {
    try {
      await createPlugin(formData)
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create plugin:', error)
    }
  }

  const handleUpdatePlugin = async () => {
    if (!editingPlugin) return
    try {
      await updatePlugin(editingPlugin.id, formData)
      setEditingPlugin(null)
      resetForm()
    } catch (error) {
      console.error('Failed to update plugin:', error)
    }
  }

  const handleDeletePlugin = async (id: string) => {
    if (confirm('Are you sure you want to delete this plugin?')) {
      try {
        await deletePlugin(id)
      } catch (error) {
        console.error('Failed to delete plugin:', error)
      }
    }
  }

  const handleToggleStatus = async (plugin: Plugin) => {
    try {
      if (plugin.status === 'active') {
        await deactivatePlugin(plugin.id)
      } else {
        await activatePlugin(plugin.id)
      }
    } catch (error) {
      console.error('Failed to toggle plugin status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      version: '1.0.0',
      author: '',
      category: 'productivity',
      plugin_type: 'community',
      status: 'inactive',
      compatibility: '',
      permissions: [],
      tags: []
    })
  }

  const openEditModal = (plugin: Plugin) => {
    setEditingPlugin(plugin)
    setFormData({
      name: plugin.name,
      description: plugin.description || '',
      version: plugin.version,
      author: plugin.author || '',
      category: plugin.category,
      plugin_type: plugin.plugin_type,
      status: plugin.status,
      compatibility: plugin.compatibility || '',
      permissions: plugin.permissions || [],
      tags: plugin.tags || []
    })
  }

  const quickActions = [
    { label: 'Browse Plugins', icon: '🔍', onClick: () => console.log('Browse Plugins') },
    { label: 'Install Plugin', icon: '⬇️', onClick: () => setShowCreateModal(true) },
    { label: 'My Plugins', icon: '📦', onClick: () => console.log('My Plugins') },
    { label: 'Plugin Settings', icon: '⚙️', onClick: () => console.log('Plugin Settings') },
    { label: 'Developer Docs', icon: '📚', onClick: () => console.log('Developer Docs') },
    { label: 'API Reference', icon: '⚡', onClick: () => console.log('API Reference') },
    { label: 'Create Plugin', icon: '✨', onClick: () => setShowCreateModal(true) },
    { label: 'Support', icon: '💬', onClick: () => console.log('Support') }
  ]

  const recentActivity = [
    { label: 'Plugin updated to latest version', time: '5 min ago', type: 'update' },
    { label: 'New plugin installed', time: '12 min ago', type: 'install' },
    { label: 'Plugin reached 30K users', time: '25 min ago', type: 'milestone' },
    { label: 'Permissions updated', time: '1 hour ago', type: 'security' },
    { label: 'Plugin received 5-star review', time: '2 hours ago', type: 'review' }
  ]

  const topPlugins = filteredPlugins
    .sort((a, b) => (b.installs_count || 0) - (a.installs_count || 0))
    .slice(0, 5)
    .map((plugin, index) => ({
      rank: index + 1,
      label: plugin.name,
      value: (plugin.installs_count || 0).toLocaleString(),
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
        >
          Install New Plugin
        </button>
      </div>

      {/* Stats Grid */}
      <StatGrid stats={statsDisplay} />

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

            {filteredPlugins.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No plugins found</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Install Your First Plugin
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredPlugins.map(plugin => (
                  <div key={plugin.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{plugin.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">v{plugin.version} • {plugin.size || 'N/A'} • By {plugin.author}</p>
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(plugin.plugin_type)}`}>
                        {plugin.plugin_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-xs">
                        <div className="text-gray-500">Installs</div>
                        <div className="font-semibold">{(plugin.installs_count || 0).toLocaleString()}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Active Users</div>
                        <div className="font-semibold">{(plugin.active_users_count || 0).toLocaleString()}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Performance</div>
                        <div className="font-semibold">{plugin.performance_score || 0}%</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">API Calls</div>
                        <div className="font-semibold">{(plugin.api_calls_count || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Performance Score</span>
                        <span className="text-xs font-semibold">{plugin.performance_score || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${plugin.performance_score || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{plugin.rating || 0}</span>
                        <span className="text-gray-500">({plugin.reviews_count || 0})</span>
                      </div>
                      <span className="text-gray-500">{plugin.compatibility || 'All versions'}</span>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={() => openEditModal(plugin)}
                        className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100"
                      >
                        Configure
                      </button>
                      <button
                        onClick={() => handleToggleStatus(plugin)}
                        className={`flex-1 px-3 py-1.5 rounded text-xs font-medium ${
                          plugin.status === 'active'
                            ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {plugin.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeletePlugin(plugin.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <MiniKPI label="Active Plugins" value={stats.active.toString()} />
              <MiniKPI label="Inactive" value={stats.inactive.toString()} />
              <MiniKPI label="Core Plugins" value={stats.core.toString()} />
              <MiniKPI label="Avg Performance" value={`${stats.avgPerformanceScore.toFixed(0)}%`} />
            </div>
          </div>

          <RankingList title="Most Installed Plugins" items={topPlugins} />
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

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

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPlugin) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingPlugin ? 'Edit Plugin' : 'Add Plugin'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Plugin name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Plugin description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as PluginCategory })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="productivity">Productivity</option>
                    <option value="security">Security</option>
                    <option value="analytics">Analytics</option>
                    <option value="integration">Integration</option>
                    <option value="communication">Communication</option>
                    <option value="automation">Automation</option>
                    <option value="ui-enhancement">UI Enhancement</option>
                    <option value="developer-tools">Developer Tools</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.plugin_type}
                    onChange={(e) => setFormData({ ...formData, plugin_type: e.target.value as PluginType })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="core">Core</option>
                    <option value="premium">Premium</option>
                    <option value="community">Community</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="beta">Beta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Compatibility</label>
                <input
                  type="text"
                  value={formData.compatibility}
                  onChange={(e) => setFormData({ ...formData, compatibility: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., v3.0+"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingPlugin(null)
                  resetForm()
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingPlugin ? handleUpdatePlugin : handleCreatePlugin}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingPlugin ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
