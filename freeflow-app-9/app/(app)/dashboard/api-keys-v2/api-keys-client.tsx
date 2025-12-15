'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  Key, Shield, TrendingUp, AlertCircle, Plus,
  Copy, Eye, Download, RefreshCw, Settings,
  CheckCircle, XCircle, Clock, Lock, Trash2, EyeOff
} from 'lucide-react'
import {
  useApiKeys,
  ApiKey,
  getKeyStatusColor,
  getKeyTypeColor,
  getPermissionColor,
  getEnvironmentColor,
  formatRequests,
  formatKeyDate,
  calculateUsagePercentage
} from '@/lib/hooks/use-api-keys'
import {
  createApiKey,
  updateApiKey,
  revokeApiKey,
  activateApiKey,
  deactivateApiKey,
  regenerateApiKey,
  deleteApiKey
} from '@/app/actions/api-keys'
import { toast } from 'sonner'

interface ApiKeysClientProps {
  initialKeys: ApiKey[]
}

type ViewMode = 'all' | 'active' | 'production' | 'expiring'

export default function ApiKeysClient({ initialKeys }: ApiKeysClientProps) {
  const { keys, stats, isLoading, error } = useApiKeys(initialKeys)
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    description: '',
    key_type: 'api' as ApiKey['key_type'],
    permission: 'read' as ApiKey['permission'],
    environment: 'production' as ApiKey['environment'],
    rate_limit_per_hour: 1000
  })

  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const filteredKeys = keys.filter(key => {
    if (viewMode === 'all') return true
    if (viewMode === 'active') return key.status === 'active'
    if (viewMode === 'production') return key.environment === 'production'
    if (viewMode === 'expiring') {
      if (!key.expires_at) return false
      const expiryDate = new Date(key.expires_at)
      return expiryDate > now && expiryDate < thirtyDaysFromNow
    }
    return true
  })

  const handleCreateKey = async () => {
    if (!newKeyData.name.trim()) {
      toast.error('Please enter a key name')
      return
    }

    const result = await createApiKey(newKeyData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('API key created')
      setNewKeyValue(result.data?.key_value || null)
      setNewKeyData({
        name: '',
        description: '',
        key_type: 'api',
        permission: 'read',
        environment: 'production',
        rate_limit_per_hour: 1000
      })
    }
  }

  const handleCopyKey = (keyPrefix: string) => {
    navigator.clipboard.writeText(keyPrefix)
    toast.success('Key prefix copied to clipboard')
  }

  const handleCopyFullKey = () => {
    if (newKeyValue) {
      navigator.clipboard.writeText(newKeyValue)
      toast.success('Full API key copied to clipboard')
    }
  }

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this key? This action cannot be undone.')) return

    const result = await revokeApiKey(keyId, 'Manual revocation')
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('API key revoked')
    }
  }

  const handleActivate = async (keyId: string) => {
    const result = await activateApiKey(keyId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('API key activated')
    }
  }

  const handleDeactivate = async (keyId: string) => {
    const result = await deactivateApiKey(keyId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('API key deactivated')
    }
  }

  const handleRegenerate = async (keyId: string) => {
    if (!confirm('Regenerate this key? The old key will stop working immediately.')) return

    const result = await regenerateApiKey(keyId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setNewKeyValue(result.data?.key_value || null)
      toast.success('API key regenerated')
    }
  }

  const handleDelete = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this key?')) return

    const result = await deleteApiKey(keyId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('API key deleted')
    }
  }

  const getStatusIcon = (status: ApiKey['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />
      case 'inactive': return <Clock className="w-3 h-3" />
      case 'expired': return <XCircle className="w-3 h-3" />
      case 'revoked': return <Lock className="w-3 h-3" />
      default: return <Key className="w-3 h-3" />
    }
  }

  const getTypeGradient = (type: ApiKey['key_type']) => {
    switch (type) {
      case 'api': return 'from-blue-500 to-cyan-600'
      case 'webhook': return 'from-purple-500 to-pink-600'
      case 'oauth': return 'from-green-500 to-emerald-600'
      case 'jwt': return 'from-orange-500 to-red-600'
      case 'service': return 'from-indigo-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const topKeys = keys
    .sort((a, b) => b.total_requests - a.total_requests)
    .slice(0, 5)
    .map(key => ({
      name: key.name,
      metric: `${formatRequests(key.total_requests)} requests`
    }))

  const recentActivity = keys.slice(0, 5).map(key => ({
    action: key.last_used_at ? 'Key used' : 'Key created',
    details: key.name,
    time: key.last_used_at ? formatKeyDate(key.last_used_at) : formatKeyDate(key.created_at)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
              API Keys
            </h1>
            <p className="text-gray-600 mt-2">Manage API keys and access tokens</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Generate API Key
          </button>
        </div>

        {/* Stats */}
        <StatGrid stats={[
          {
            label: 'Total API Keys',
            value: stats.total.toString(),
            change: 8.5,
            trend: 'up' as const,
            icon: Key
          },
          {
            label: 'Active Keys',
            value: stats.active.toString(),
            change: 12.3,
            trend: 'up' as const,
            icon: CheckCircle
          },
          {
            label: 'Total Requests Today',
            value: formatRequests(stats.requestsToday),
            change: 18.7,
            trend: 'up' as const,
            icon: TrendingUp
          },
          {
            label: 'Keys Expiring Soon',
            value: stats.expiringSoon.toString(),
            change: -25.0,
            trend: 'down' as const,
            icon: AlertCircle
          }
        ]} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction actions={[
            { label: 'Generate Key', icon: Plus, gradient: 'from-blue-500 to-cyan-600', onClick: () => setShowCreateModal(true) },
            { label: 'Copy Key', icon: Copy, gradient: 'from-green-500 to-emerald-600' },
            { label: 'View Details', icon: Eye, gradient: 'from-purple-500 to-indigo-600' },
            { label: 'Export Keys', icon: Download, gradient: 'from-orange-500 to-red-600' },
            { label: 'Regenerate', icon: RefreshCw, gradient: 'from-cyan-500 to-blue-600' },
            { label: 'Security Settings', icon: Shield, gradient: 'from-pink-500 to-rose-600' },
            { label: 'Manage Scopes', icon: Settings, gradient: 'from-indigo-500 to-purple-600' },
            { label: 'Revoke Key', icon: XCircle, gradient: 'from-red-500 to-pink-600' }
          ]} />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          <PillButton
            label="All Keys"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Active"
            isActive={viewMode === 'active'}
            onClick={() => setViewMode('active')}
          />
          <PillButton
            label="Production"
            isActive={viewMode === 'production'}
            onClick={() => setViewMode('production')}
          />
          <PillButton
            label="Expiring Soon"
            isActive={viewMode === 'expiring'}
            onClick={() => setViewMode('expiring')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* API Keys List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All API Keys'}
              {viewMode === 'active' && 'Active API Keys'}
              {viewMode === 'production' && 'Production Keys'}
              {viewMode === 'expiring' && 'Keys Expiring Soon'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredKeys.length} total)
              </span>
            </h2>

            {filteredKeys.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Key className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No API keys found</h3>
                <p className="text-gray-500 mb-4">
                  {viewMode !== 'all' ? 'Try adjusting your filters' : 'Create your first API key to get started'}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-lg text-sm"
                >
                  Generate API Key
                </button>
              </div>
            ) : (
              filteredKeys.map((key) => (
                <div
                  key={key.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getKeyStatusColor(key.status)} flex items-center gap-1`}>
                          {getStatusIcon(key.status)}
                          {key.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getKeyTypeColor(key.key_type)}`}>
                          {key.key_type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPermissionColor(key.permission)}`}>
                          {key.permission}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEnvironmentColor(key.environment)}`}>
                          {key.environment}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {key.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded font-mono">
                          {key.key_prefix}
                        </code>
                        <button
                          onClick={() => handleCopyKey(key.key_prefix)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {key.key_code} • Created by {key.created_by || 'Unknown'} • {formatKeyDate(key.created_at)}
                      </p>
                    </div>
                    <button className={`px-4 py-2 bg-gradient-to-r ${getTypeGradient(key.key_type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Requests</p>
                      <p className="text-sm font-semibold text-gray-900">{formatRequests(key.total_requests)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Today</p>
                      <p className="text-sm font-semibold text-gray-900">{formatRequests(key.requests_today)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Rate Limit</p>
                      <p className="text-sm font-semibold text-gray-900">{formatRequests(key.rate_limit_per_hour)}/hr</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Used</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {key.last_used_at ? formatKeyDate(key.last_used_at) : 'Never'}
                      </p>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  {key.status === 'active' && key.requests_today > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Today's Usage</span>
                        <span>{key.requests_today.toLocaleString()} / {key.rate_limit_per_hour.toLocaleString()} ({calculateUsagePercentage(key.requests_today, key.rate_limit_per_hour)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getTypeGradient(key.key_type)} rounded-full transition-all`}
                          style={{ width: `${Math.min(calculateUsagePercentage(key.requests_today, key.rate_limit_per_hour), 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expiry Warning */}
                  {key.expires_at && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span>Expires on {formatKeyDate(key.expires_at)}</span>
                      </div>
                    </div>
                  )}

                  {/* Scopes */}
                  {key.scopes && key.scopes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Scopes ({key.scopes.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {key.scopes.slice(0, 5).map((scope, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
                          >
                            {scope}
                          </span>
                        ))}
                        {key.scopes.length > 5 && (
                          <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-100">
                            +{key.scopes.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* IP Whitelist */}
                  {key.ip_whitelist && key.ip_whitelist.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">IP Whitelist</p>
                      <div className="flex flex-wrap gap-2">
                        {key.ip_whitelist.map((ip, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-50 text-green-700 rounded font-mono text-xs border border-green-100"
                          >
                            {ip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {key.tags && key.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {key.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100 flex-wrap">
                    {key.status === 'active' && (
                      <button
                        onClick={() => handleDeactivate(key.id)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-1"
                      >
                        <EyeOff className="w-4 h-4" />
                        Deactivate
                      </button>
                    )}
                    {key.status === 'inactive' && (
                      <button
                        onClick={() => handleActivate(key.id)}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-all flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleRegenerate(key.id)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </button>
                    {key.status !== 'revoked' && (
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-all flex items-center gap-1"
                      >
                        <Lock className="w-4 h-4" />
                        Revoke
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Key Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Key Types</h3>
              <div className="space-y-3">
                {(['api', 'service', 'webhook', 'oauth', 'jwt'] as const).map((type) => {
                  const count = keys.filter(k => k.key_type === type).length
                  const percentage = keys.length > 0 ? Math.round((count / keys.length) * 100) : 0
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 uppercase text-xs">{type}</span>
                        <span className="text-gray-900 font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getTypeGradient(type)} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top Keys by Usage */}
            <RankingList
              title="Most Used Keys"
              items={topKeys.length > 0 ? topKeys : [{ name: 'No data', metric: '0 requests' }]}
              gradient="from-slate-500 to-gray-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Avg Requests/Key"
              value={keys.length > 0 ? formatRequests(Math.round(stats.totalRequests / keys.length)) : '0'}
              change={12.4}
              trend="up"
            />

            <ProgressCard
              title="Security Score"
              current={94}
              target={100}
              label="score"
              gradient="from-slate-500 to-gray-600"
            />

          </div>
        </div>

      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Generate New API Key</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                  placeholder="e.g., Production API Key"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newKeyData.description}
                  onChange={(e) => setNewKeyData({ ...newKeyData, description: e.target.value })}
                  placeholder="What is this key for?"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newKeyData.key_type}
                    onChange={(e) => setNewKeyData({ ...newKeyData, key_type: e.target.value as ApiKey['key_type'] })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="api">API</option>
                    <option value="webhook">Webhook</option>
                    <option value="oauth">OAuth</option>
                    <option value="jwt">JWT</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permission</label>
                  <select
                    value={newKeyData.permission}
                    onChange={(e) => setNewKeyData({ ...newKeyData, permission: e.target.value as ApiKey['permission'] })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="read">Read</option>
                    <option value="write">Write</option>
                    <option value="admin">Admin</option>
                    <option value="full-access">Full Access</option>
                    <option value="limited">Limited</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <select
                    value={newKeyData.environment}
                    onChange={(e) => setNewKeyData({ ...newKeyData, environment: e.target.value as ApiKey['environment'] })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit/Hour</label>
                  <input
                    type="number"
                    value={newKeyData.rate_limit_per_hour}
                    onChange={(e) => setNewKeyData({ ...newKeyData, rate_limit_per_hour: parseInt(e.target.value) || 1000 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                className="px-4 py-2 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Key Display Modal */}
      {newKeyValue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-green-700">API Key Generated!</h3>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Copy your API key now. You won't be able to see it again!
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <code className="text-sm break-all">{newKeyValue}</code>
              </div>
              <button
                onClick={handleCopyFullKey}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Copy API Key
              </button>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setNewKeyValue(null)
                  setShowCreateModal(false)
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
