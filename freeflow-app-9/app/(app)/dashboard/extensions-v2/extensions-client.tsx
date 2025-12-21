'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import { useExtensions, Extension, ExtensionStats } from '@/lib/hooks/use-extensions'
import { createExtension, updateExtension, deleteExtension, enableExtension, disableExtension } from '@/app/actions/extensions'

type ExtensionStatus = 'enabled' | 'disabled' | 'installing' | 'updating' | 'error'
type ExtensionCategory = 'browser' | 'desktop' | 'mobile' | 'api' | 'workflow' | 'integration' | 'utility' | 'enhancement'
type ExtensionType = 'official' | 'verified' | 'third-party' | 'experimental' | 'legacy'

interface ExtensionsClientProps {
  initialExtensions: Extension[]
  initialStats: ExtensionStats
}

export default function ExtensionsClient({ initialExtensions, initialStats }: ExtensionsClientProps) {
  const { extensions, stats } = useExtensions(initialExtensions, initialStats)
  const [statusFilter, setStatusFilter] = useState<ExtensionStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ExtensionCategory | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ExtensionType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingExtension, setEditingExtension] = useState<Extension | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    developer: '',
    category: 'utility' as ExtensionCategory,
    extension_type: 'third-party' as ExtensionType,
    status: 'disabled' as ExtensionStatus,
    platform: '',
    permissions: [] as string[],
    features: [] as string[],
    tags: [] as string[]
  })

  const filteredExtensions = extensions.filter(extension => {
    if (statusFilter !== 'all' && extension.status !== statusFilter) return false
    if (categoryFilter !== 'all' && extension.category !== categoryFilter) return false
    if (typeFilter !== 'all' && extension.extension_type !== typeFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Extensions', value: stats.total.toString(), trend: '+16', trendLabel: 'this month' },
    { label: 'Enabled Extensions', value: stats.enabled.toString(), trend: '+12', trendLabel: 'vs last week' },
    { label: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), trend: '+34%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: `${stats.avgRating.toFixed(1)}/5`, trend: '+0.3', trendLabel: 'improvement' }
  ]

  const handleCreateExtension = async () => {
    try {
      await createExtension(formData)
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create extension:', error)
    }
  }

  const handleUpdateExtension = async () => {
    if (!editingExtension) return
    try {
      await updateExtension(editingExtension.id, formData)
      setEditingExtension(null)
      resetForm()
    } catch (error) {
      console.error('Failed to update extension:', error)
    }
  }

  const handleDeleteExtension = async (id: string) => {
    if (confirm('Are you sure you want to delete this extension?')) {
      try {
        await deleteExtension(id)
      } catch (error) {
        console.error('Failed to delete extension:', error)
      }
    }
  }

  const handleToggleStatus = async (ext: Extension) => {
    try {
      if (ext.status === 'enabled') {
        await disableExtension(ext.id)
      } else {
        await enableExtension(ext.id)
      }
    } catch (error) {
      console.error('Failed to toggle extension status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      version: '1.0.0',
      developer: '',
      category: 'utility',
      extension_type: 'third-party',
      status: 'disabled',
      platform: '',
      permissions: [],
      features: [],
      tags: []
    })
  }

  const openEditModal = (extension: Extension) => {
    setEditingExtension(extension)
    setFormData({
      name: extension.name,
      description: extension.description || '',
      version: extension.version,
      developer: extension.developer || '',
      category: extension.category,
      extension_type: extension.extension_type,
      status: extension.status,
      platform: extension.platform || '',
      permissions: extension.permissions || [],
      features: extension.features || [],
      tags: extension.tags || []
    })
  }

  const quickActions = [
    { label: 'Browse Extensions', icon: '🔍', onClick: () => console.log('Browse Extensions') },
    { label: 'Install Extension', icon: '⬇️', onClick: () => setShowCreateModal(true) },
    { label: 'My Extensions', icon: '📦', onClick: () => console.log('My Extensions') },
    { label: 'Extension Settings', icon: '⚙️', onClick: () => console.log('Extension Settings') },
    { label: 'Developer Center', icon: '💻', onClick: () => console.log('Developer Center') },
    { label: 'Documentation', icon: '📚', onClick: () => console.log('Documentation') },
    { label: 'Build Extension', icon: '🛠️', onClick: () => console.log('Build Extension') },
    { label: 'Support', icon: '💬', onClick: () => console.log('Support') }
  ]

  const recentActivity = [
    { label: 'Extension updated to latest version', time: '8 min ago', type: 'update' },
    { label: 'New extension installed', time: '15 min ago', type: 'install' },
    { label: 'Extension reached 50K users', time: '32 min ago', type: 'milestone' },
    { label: 'Compatibility updated', time: '1 hour ago', type: 'compatibility' },
    { label: 'Extension received 5-star review', time: '2 hours ago', type: 'review' }
  ]

  const topExtensions = filteredExtensions
    .sort((a, b) => (b.users_count || 0) - (a.users_count || 0))
    .slice(0, 5)
    .map((extension, index) => ({
      rank: index + 1,
      label: extension.name,
      value: (extension.users_count || 0).toLocaleString(),
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow"
        >
          Add Extension
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

            {filteredExtensions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No extensions found</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Your First Extension
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredExtensions.map(extension => (
                  <div key={extension.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{extension.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">v{extension.version} • {extension.size || 'N/A'} • {extension.developer}</p>
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(extension.extension_type)}`}>
                        {extension.extension_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-xs">
                        <div className="text-gray-500">Users</div>
                        <div className="font-semibold">{(extension.users_count || 0).toLocaleString()}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Downloads</div>
                        <div className="font-semibold">{(extension.downloads_count || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1">Platform</div>
                      <div className="text-xs font-medium">{extension.platform || 'All platforms'}</div>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{extension.rating || 0}</span>
                        <span className="text-gray-500">({extension.total_reviews || 0})</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={() => openEditModal(extension)}
                        className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100"
                      >
                        Configure
                      </button>
                      <button
                        onClick={() => handleToggleStatus(extension)}
                        className={`flex-1 px-3 py-1.5 rounded text-xs font-medium ${
                          extension.status === 'enabled'
                            ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {extension.status === 'enabled' ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteExtension(extension.id)}
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
              <MiniKPI label="Enabled Extensions" value={stats.enabled.toString()} />
              <MiniKPI label="Disabled" value={stats.disabled.toString()} />
              <MiniKPI label="Official" value={stats.official.toString()} />
              <MiniKPI label="Total Downloads" value={stats.totalDownloads.toLocaleString()} />
            </div>
          </div>

          <RankingList title="Most Popular Extensions" items={topExtensions} />
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

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

      {/* Create/Edit Modal */}
      {(showCreateModal || editingExtension) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingExtension ? 'Edit Extension' : 'Add Extension'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Extension name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Extension description"
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
                  <label className="block text-sm font-medium mb-1">Developer</label>
                  <input
                    type="text"
                    value={formData.developer}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Developer name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExtensionCategory })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="browser">Browser</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="api">API</option>
                    <option value="workflow">Workflow</option>
                    <option value="integration">Integration</option>
                    <option value="utility">Utility</option>
                    <option value="enhancement">Enhancement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.extension_type}
                    onChange={(e) => setFormData({ ...formData, extension_type: e.target.value as ExtensionType })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="official">Official</option>
                    <option value="verified">Verified</option>
                    <option value="third-party">Third-Party</option>
                    <option value="experimental">Experimental</option>
                    <option value="legacy">Legacy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Chrome, Firefox, All platforms"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingExtension(null)
                  resetForm()
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingExtension ? handleUpdateExtension : handleCreateExtension}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingExtension ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
