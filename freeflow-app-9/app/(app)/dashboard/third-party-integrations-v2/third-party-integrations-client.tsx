'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import { useThirdPartyIntegrations, ThirdPartyIntegration, ThirdPartyIntegrationStats } from '@/lib/hooks/use-third-party-integrations'
import { createThirdPartyIntegration, updateThirdPartyIntegration, deleteThirdPartyIntegration, activateIntegration, deactivateIntegration, syncIntegration } from '@/app/actions/third-party-integrations'

type IntegrationStatus = 'active' | 'pending' | 'inactive' | 'error' | 'testing'
type IntegrationCategory = 'saas' | 'database' | 'cloud' | 'messaging' | 'ecommerce' | 'collaboration' | 'monitoring' | 'deployment'
type AuthMethod = 'api-key' | 'oauth2' | 'basic-auth' | 'jwt' | 'custom'

interface ThirdPartyIntegrationsClientProps {
  initialIntegrations: ThirdPartyIntegration[]
  initialStats: ThirdPartyIntegrationStats
}

export default function ThirdPartyIntegrationsClient({ initialIntegrations, initialStats }: ThirdPartyIntegrationsClientProps) {
  const { integrations, stats } = useThirdPartyIntegrations(initialIntegrations, initialStats)
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all')
  const [authFilter, setAuthFilter] = useState<AuthMethod | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: '',
    logo: '',
    category: 'cloud' as IntegrationCategory,
    auth_method: 'api-key' as AuthMethod,
    version: '1.0.0',
    rate_limit: '',
    documentation_url: ''
  })

  const filteredIntegrations = integrations.filter(integration => {
    if (statusFilter !== 'all' && integration.status !== statusFilter) return false
    if (categoryFilter !== 'all' && integration.category !== categoryFilter) return false
    if (authFilter !== 'all' && integration.auth_method !== authFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Integrations', value: stats.total.toString(), trend: '+18', trendLabel: 'this month' },
    { label: 'Active Connections', value: stats.active.toString(), trend: '+7', trendLabel: 'vs last week' },
    { label: 'API Calls Today', value: stats.totalApiCalls.toLocaleString(), trend: '+34%', trendLabel: 'vs yesterday' },
    { label: 'Avg Uptime', value: `${stats.avgUptime.toFixed(1)}%`, trend: '+0.05%', trendLabel: 'improvement' }
  ]

  const handleCreate = async () => {
    try {
      await createThirdPartyIntegration(formData)
      setShowCreateModal(false)
      setFormData({ name: '', description: '', provider: '', logo: '', category: 'cloud', auth_method: 'api-key', version: '1.0.0', rate_limit: '', documentation_url: '' })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this integration?')) {
      await deleteThirdPartyIntegration(id)
    }
  }

  const handleActivate = async (id: string) => {
    await activateIntegration(id)
  }

  const handleDeactivate = async (id: string) => {
    await deactivateIntegration(id)
  }

  const handleSync = async (id: string) => {
    await syncIntegration(id)
  }

  const quickActions = [
    { label: 'Browse All', icon: '🔌', onClick: () => console.log('Browse All') },
    { label: 'Active', icon: '✅', onClick: () => setStatusFilter('active') },
    { label: 'API Logs', icon: '📋', onClick: () => console.log('API Logs') },
    { label: 'Monitor Health', icon: '💚', onClick: () => console.log('Monitor') },
    { label: 'API Keys', icon: '🔑', onClick: () => console.log('API Keys') },
    { label: 'Documentation', icon: '📚', onClick: () => console.log('Docs') },
    { label: 'Add Custom', icon: '➕', onClick: () => setShowCreateModal(true) },
    { label: 'Settings', icon: '⚙️', onClick: () => console.log('Settings') }
  ]

  const recentActivity = [
    { label: 'Integration sync completed', time: '2 min ago', type: 'sync' },
    { label: 'New integration added', time: '15 min ago', type: 'create' },
    { label: 'API calls threshold reached', time: '32 min ago', type: 'alert' },
    { label: 'Status changed to active', time: '1 hour ago', type: 'status' }
  ]

  const topIntegrations = filteredIntegrations
    .sort((a, b) => (b.api_calls_count || 0) - (a.api_calls_count || 0))
    .slice(0, 5)
    .map((integration, index) => ({
      rank: index + 1,
      label: integration.name,
      value: (integration.api_calls_count || 0).toLocaleString(),
      change: `+${30 - index * 5}%`
    }))

  const getStatusColor = (status: IntegrationStatus) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      inactive: 'bg-gray-100 text-gray-700',
      error: 'bg-red-100 text-red-700',
      testing: 'bg-blue-100 text-blue-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getCategoryColor = (category: IntegrationCategory) => {
    const colors: Record<string, string> = {
      cloud: 'bg-purple-100 text-purple-700',
      database: 'bg-green-100 text-green-700',
      messaging: 'bg-pink-100 text-pink-700',
      ecommerce: 'bg-orange-100 text-orange-700',
      collaboration: 'bg-teal-100 text-teal-700',
      monitoring: 'bg-indigo-100 text-indigo-700',
      deployment: 'bg-red-100 text-red-700',
      saas: 'bg-blue-100 text-blue-700'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            Third-Party Integrations
          </h1>
          <p className="text-gray-600 mt-1">Connect and manage external services and APIs</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Add Integration
        </button>
      </div>

      <StatGrid stats={statsDisplay} />
      <BentoQuickAction actions={quickActions} />

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Integrations ({filteredIntegrations.length})</h2>
              <div className="flex gap-2">
                <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}>Grid</button>
                <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}>List</button>
              </div>
            </div>

            {filteredIntegrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No integrations found</p>
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Add Your First Integration</button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredIntegrations.map(integration => (
                  <div key={integration.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {integration.logo || integration.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{integration.name}</h3>
                        <p className="text-xs text-gray-500">{integration.provider} • v{integration.version}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{integration.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(integration.status)}`}>{integration.status}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(integration.category)}`}>{integration.category}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                      <div><span className="text-gray-500">API Calls</span><div className="font-semibold">{(integration.api_calls_count || 0).toLocaleString()}</div></div>
                      <div><span className="text-gray-500">Response</span><div className="font-semibold">{integration.response_time_ms}ms</div></div>
                      <div><span className="text-gray-500">Uptime</span><div className="font-semibold text-green-600">{integration.uptime_percent}%</div></div>
                      <div><span className="text-gray-500">Endpoints</span><div className="font-semibold">{integration.endpoints_count}</div></div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <button onClick={() => handleSync(integration.id)} className="flex-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-100">Sync</button>
                      {integration.status === 'active' ? (
                        <button onClick={() => handleDeactivate(integration.id)} className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100 dark:bg-slate-700">Deactivate</button>
                      ) : (
                        <button onClick={() => handleActivate(integration.id)} className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100">Activate</button>
                      )}
                      <button onClick={() => handleDelete(integration.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <MiniKPI label="Active" value={stats.active.toString()} />
              <MiniKPI label="Pending" value={stats.pending.toString()} />
              <MiniKPI label="API Calls/min" value="2.4K" />
              <MiniKPI label="Avg Uptime" value={`${stats.avgUptime.toFixed(1)}%`} />
            </div>
          </div>
          <RankingList title="Most Used Integrations" items={topIntegrations} />
          <ActivityFeed title="Recent Activity" activities={recentActivity} />
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add Integration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Provider</label>
                  <input type="text" value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as IntegrationCategory })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="cloud">Cloud</option>
                    <option value="database">Database</option>
                    <option value="messaging">Messaging</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
