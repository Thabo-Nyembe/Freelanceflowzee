'use client'

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'
import { useMarketplaceIntegrations, MarketplaceIntegration, MarketplaceStats } from '@/lib/hooks/use-marketplace-integrations'
import { createMarketplaceIntegration, deleteMarketplaceIntegration, connectIntegration, disconnectIntegration } from '@/app/actions/marketplace-integrations'

type IntegrationStatus = 'connected' | 'available' | 'disconnected' | 'configuring' | 'error'
type IntegrationCategory = 'crm' | 'marketing' | 'productivity' | 'communication' | 'analytics' | 'payment' | 'storage' | 'social'
type IntegrationType = 'native' | 'api' | 'webhook' | 'oauth' | 'zapier'

interface IntegrationsMarketplaceClientProps {
  initialIntegrations: MarketplaceIntegration[]
  initialStats: MarketplaceStats
}

export default function IntegrationsMarketplaceClient({ initialIntegrations, initialStats }: IntegrationsMarketplaceClientProps) {
  const { integrations, stats } = useMarketplaceIntegrations(initialIntegrations, initialStats)
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<IntegrationType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '', description: '', provider: '', logo: '',
    category: 'productivity' as IntegrationCategory,
    integration_type: 'api' as IntegrationType,
    pricing: 'Free', sync_frequency: 'Real-time', setup_time: '5 minutes'
  })

  const filteredIntegrations = integrations.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false
    if (typeFilter !== 'all' && i.integration_type !== typeFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Integrations', value: stats.total.toString(), trend: '+28', trendLabel: 'this month' },
    { label: 'Connected', value: stats.connected.toString(), trend: '+5', trendLabel: 'vs last week' },
    { label: 'Total Users', value: `${(stats.totalUsers / 1000).toFixed(0)}K`, trend: '+42%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: `${stats.avgRating.toFixed(1)}/5`, trend: '+0.3', trendLabel: 'improvement' }
  ]

  const handleCreate = async () => {
    try {
      await createMarketplaceIntegration(formData)
      setShowCreateModal(false)
      setFormData({ name: '', description: '', provider: '', logo: '', category: 'productivity', integration_type: 'api', pricing: 'Free', sync_frequency: 'Real-time', setup_time: '5 minutes' })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleConnect = async (id: string) => { await connectIntegration(id) }
  const handleDisconnect = async (id: string) => { await disconnectIntegration(id) }
  const handleDelete = async (id: string) => { if (confirm('Delete?')) await deleteMarketplaceIntegration(id) }

  const quickActions = [
    { label: 'Browse All', icon: '🔍', onClick: () => console.log('Browse') },
    { label: 'My Integrations', icon: '🔗', onClick: () => setStatusFilter('connected') },
    { label: 'Popular', icon: '⭐', onClick: () => console.log('Popular') },
    { label: 'Featured', icon: '✨', onClick: () => console.log('Featured') },
    { label: 'Categories', icon: '📂', onClick: () => console.log('Categories') },
    { label: 'API Docs', icon: '📚', onClick: () => console.log('Docs') },
    { label: 'Build Custom', icon: '🛠️', onClick: () => setShowCreateModal(true) },
    { label: 'Support', icon: '💬', onClick: () => console.log('Support') }
  ]

  const recentActivity = [
    { label: 'Integration connected', time: '4 min ago', type: 'connect' },
    { label: 'Sync completed', time: '23 min ago', type: 'sync' },
    { label: 'Integration updated', time: '1 hour ago', type: 'update' },
    { label: 'New integration available', time: '3 hours ago', type: 'new' }
  ]

  const topIntegrations = filteredIntegrations.sort((a, b) => (b.users_count || 0) - (a.users_count || 0)).slice(0, 5).map((i, idx) => ({
    rank: idx + 1, label: i.name, value: (i.users_count || 0).toLocaleString(), change: `+${45 - idx * 5}%`
  }))

  const getStatusColor = (s: IntegrationStatus) => ({ connected: 'bg-green-100 text-green-700', available: 'bg-blue-100 text-blue-700', disconnected: 'bg-gray-100 text-gray-700', configuring: 'bg-yellow-100 text-yellow-700', error: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700')
  const getCategoryColor = (c: IntegrationCategory) => ({ crm: 'bg-blue-100 text-blue-700', marketing: 'bg-purple-100 text-purple-700', productivity: 'bg-green-100 text-green-700', communication: 'bg-pink-100 text-pink-700', analytics: 'bg-orange-100 text-orange-700', payment: 'bg-teal-100 text-teal-700', storage: 'bg-indigo-100 text-indigo-700', social: 'bg-red-100 text-red-700' }[c] || 'bg-gray-100 text-gray-700')

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">Integrations Marketplace</h1>
          <p className="text-gray-600 mt-1">Connect your favorite tools and services</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white rounded-lg">Add Integration</button>
      </div>

      <StatGrid stats={statsDisplay} />
      <BentoQuickAction actions={quickActions} />

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <PillButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</PillButton>
          <PillButton active={statusFilter === 'connected'} onClick={() => setStatusFilter('connected')}>Connected</PillButton>
          <PillButton active={statusFilter === 'available'} onClick={() => setStatusFilter('available')}>Available</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'crm'} onClick={() => setCategoryFilter('crm')}>CRM</PillButton>
          <PillButton active={categoryFilter === 'marketing'} onClick={() => setCategoryFilter('marketing')}>Marketing</PillButton>
          <PillButton active={categoryFilter === 'communication'} onClick={() => setCategoryFilter('communication')}>Communication</PillButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Integrations ({filteredIntegrations.length})</h2>
              <div className="flex gap-2">
                <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100'}`}>Grid</button>
                <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100'}`}>List</button>
              </div>
            </div>

            {filteredIntegrations.length === 0 ? (
              <div className="text-center py-12"><p className="text-gray-500 mb-4">No integrations</p><button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg">Add Integration</button></div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredIntegrations.map(i => (
                  <div key={i.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">{i.logo || i.name.slice(0, 2).toUpperCase()}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{i.name}</h3>
                        <p className="text-xs text-gray-500">{i.provider} • v{i.version}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{i.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(i.status)}`}>{i.status}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(i.category)}`}>{i.category}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                      <div><span className="text-gray-500">Users</span><div className="font-semibold">{(i.users_count || 0).toLocaleString()}</div></div>
                      <div><span className="text-gray-500">Sync</span><div className="font-semibold">{i.sync_frequency}</div></div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-1"><span className="text-yellow-500">★</span><span className="font-semibold">{i.rating || 0}</span></div>
                      <span className="text-teal-600 font-medium">{i.pricing}</span>
                    </div>
                    <div className="flex gap-2 pt-3 border-t">
                      {i.status === 'connected' ? (
                        <><button onClick={() => handleDisconnect(i.id)} className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">Disconnect</button></>
                      ) : (
                        <><button onClick={() => handleConnect(i.id)} className="flex-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded text-xs font-medium">Connect</button></>
                      )}
                      <button onClick={() => handleDelete(i.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium">Delete</button>
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
              <MiniKPI label="Connected" value={stats.connected.toString()} />
              <MiniKPI label="Available" value={stats.available.toString()} />
              <MiniKPI label="Total Users" value={`${(stats.totalUsers / 1000).toFixed(0)}K`} />
            </div>
          </div>
          <RankingList title="Popular Integrations" items={topIntegrations} />
          <ActivityFeed title="Recent Activity" activities={recentActivity} />
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add Integration</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Provider</label><input type="text" value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as IntegrationCategory })} className="w-full px-3 py-2 border rounded-lg"><option value="crm">CRM</option><option value="marketing">Marketing</option><option value="productivity">Productivity</option><option value="communication">Communication</option><option value="analytics">Analytics</option><option value="payment">Payment</option></select></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreate} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg">Create</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
