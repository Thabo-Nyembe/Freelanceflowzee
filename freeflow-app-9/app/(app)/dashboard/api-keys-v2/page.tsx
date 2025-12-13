"use client"

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
  CheckCircle, XCircle, Clock, Lock
} from 'lucide-react'

type KeyStatus = 'active' | 'inactive' | 'expired' | 'revoked'
type KeyType = 'api' | 'webhook' | 'oauth' | 'jwt' | 'service'
type KeyPermission = 'read' | 'write' | 'admin' | 'full-access' | 'limited'

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  type: KeyType
  status: KeyStatus
  permission: KeyPermission
  createdBy: string
  createdDate: string
  expiryDate?: string
  lastUsed?: string
  totalRequests: number
  requestsToday: number
  rateLimitPerHour: number
  ipWhitelist?: string[]
  scopes: string[]
  environment: 'production' | 'staging' | 'development'
  tags: string[]
}

const apiKeys: ApiKey[] = [
  {
    id: 'KEY-2847',
    name: 'Production API - Main Application',
    keyPreview: 'kazi_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxx...abcd',
    type: 'api',
    status: 'active',
    permission: 'full-access',
    createdBy: 'Engineering Team',
    createdDate: '2024-01-01T10:00:00',
    expiryDate: '2025-01-01T10:00:00',
    lastUsed: '2024-01-12T14:23:00',
    totalRequests: 2847956,
    requestsToday: 12456,
    rateLimitPerHour: 10000,
    ipWhitelist: ['203.0.113.0/24', '198.51.100.0/24'],
    scopes: ['users:read', 'users:write', 'payments:read', 'payments:write', 'analytics:read'],
    environment: 'production',
    tags: ['Production', 'Critical', 'Main App']
  },
  {
    id: 'KEY-2846',
    name: 'Webhook Handler - Payment Events',
    keyPreview: 'whk_prod_5678...efgh',
    type: 'webhook',
    status: 'active',
    permission: 'write',
    createdBy: 'Payment Team',
    createdDate: '2023-12-15T09:00:00',
    lastUsed: '2024-01-12T14:15:00',
    totalRequests: 456789,
    requestsToday: 892,
    rateLimitPerHour: 5000,
    scopes: ['webhooks:write', 'payments:read'],
    environment: 'production',
    tags: ['Webhooks', 'Payments', 'Production']
  },
  {
    id: 'KEY-2845',
    name: 'OAuth Client - Mobile App',
    keyPreview: 'oauth_1234...wxyz',
    type: 'oauth',
    status: 'active',
    permission: 'limited',
    createdBy: 'Mobile Team',
    createdDate: '2024-01-05T11:00:00',
    expiryDate: '2024-07-05T11:00:00',
    lastUsed: '2024-01-12T13:45:00',
    totalRequests: 124567,
    requestsToday: 5678,
    rateLimitPerHour: 3000,
    scopes: ['profile:read', 'settings:write', 'data:read'],
    environment: 'production',
    tags: ['OAuth', 'Mobile', 'Limited Access']
  },
  {
    id: 'KEY-2844',
    name: 'Service Account - Analytics Pipeline',
    keyPreview: 'svc_prod_9012...ijkl',
    type: 'service',
    status: 'active',
    permission: 'read',
    createdBy: 'Data Team',
    createdDate: '2023-11-20T10:00:00',
    lastUsed: '2024-01-12T14:00:00',
    totalRequests: 1847234,
    requestsToday: 8934,
    rateLimitPerHour: 15000,
    ipWhitelist: ['192.0.2.0/24'],
    scopes: ['analytics:read', 'reports:read', 'metrics:read'],
    environment: 'production',
    tags: ['Service Account', 'Analytics', 'Read-Only']
  },
  {
    id: 'KEY-2843',
    name: 'JWT Token - Internal Services',
    keyPreview: 'jwt_3456...mnop',
    type: 'jwt',
    status: 'active',
    permission: 'admin',
    createdBy: 'Platform Team',
    createdDate: '2024-01-08T09:00:00',
    expiryDate: '2024-04-08T09:00:00',
    lastUsed: '2024-01-12T13:30:00',
    totalRequests: 67890,
    requestsToday: 234,
    rateLimitPerHour: 8000,
    scopes: ['admin:read', 'admin:write', 'system:manage'],
    environment: 'production',
    tags: ['JWT', 'Internal', 'Admin']
  },
  {
    id: 'KEY-2842',
    name: 'Staging API - Testing Environment',
    keyPreview: 'kazi_dev_xxxxxxxxxxxxxxxxxxxxxxxxxxxx...qrst',
    type: 'api',
    status: 'active',
    permission: 'full-access',
    createdBy: 'QA Team',
    createdDate: '2023-12-01T10:00:00',
    lastUsed: '2024-01-11T16:20:00',
    totalRequests: 89456,
    requestsToday: 1247,
    rateLimitPerHour: 5000,
    scopes: ['*'],
    environment: 'staging',
    tags: ['Staging', 'Testing', 'QA']
  },
  {
    id: 'KEY-2841',
    name: 'Legacy API - Old Integration',
    keyPreview: 'kazi_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxx...uvwx',
    type: 'api',
    status: 'inactive',
    permission: 'read',
    createdBy: 'Integration Team',
    createdDate: '2023-06-15T10:00:00',
    lastUsed: '2023-11-20T09:00:00',
    totalRequests: 3456789,
    requestsToday: 0,
    rateLimitPerHour: 1000,
    scopes: ['data:read'],
    environment: 'production',
    tags: ['Legacy', 'Deprecated', 'Inactive']
  },
  {
    id: 'KEY-2840',
    name: 'Expired Test Key',
    keyPreview: 'kazi_dev_xxxxxxxxxxxxxxxxxxxxxxxxxxxx...yzab',
    type: 'api',
    status: 'expired',
    permission: 'write',
    createdBy: 'Development Team',
    createdDate: '2023-10-01T10:00:00',
    expiryDate: '2023-12-31T23:59:59',
    lastUsed: '2023-12-30T15:00:00',
    totalRequests: 12345,
    requestsToday: 0,
    rateLimitPerHour: 2000,
    scopes: ['test:write'],
    environment: 'development',
    tags: ['Expired', 'Development', 'Test']
  }
]

const stats = [
  {
    label: 'Total API Keys',
    value: '247',
    change: 8.5,
    trend: 'up' as const,
    icon: Key
  },
  {
    label: 'Active Keys',
    value: '189',
    change: 12.3,
    trend: 'up' as const,
    icon: CheckCircle
  },
  {
    label: 'Total Requests Today',
    value: '124.5K',
    change: 18.7,
    trend: 'up' as const,
    icon: TrendingUp
  },
  {
    label: 'Keys Expiring Soon',
    value: '8',
    change: -25.0,
    trend: 'down' as const,
    icon: AlertCircle
  }
]

const quickActions = [
  { label: 'Generate Key', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Copy Key', icon: Copy, gradient: 'from-green-500 to-emerald-600' },
  { label: 'View Details', icon: Eye, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Export Keys', icon: Download, gradient: 'from-orange-500 to-red-600' },
  { label: 'Regenerate', icon: RefreshCw, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Security Settings', icon: Shield, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Manage Scopes', icon: Settings, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Revoke Key', icon: XCircle, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'Key generated', details: 'New production API key created by Engineering', time: '2 hours ago' },
  { action: 'High usage', details: 'Main application key hit 12K requests today', time: '4 hours ago' },
  { action: 'Key expired', details: 'Test key automatically revoked', time: '2 days ago' },
  { action: 'Scope modified', details: 'OAuth client scopes updated', time: '3 days ago' },
  { action: 'Key rotated', details: 'Service account key refreshed', time: '1 week ago' }
]

const topKeys = [
  { name: 'Production API - Main App', metric: '2.8M requests' },
  { name: 'Service Account - Analytics', metric: '1.8M requests' },
  { name: 'Webhook Handler - Payments', metric: '456K requests' },
  { name: 'OAuth Client - Mobile', metric: '124K requests' },
  { name: 'Staging API - Testing', metric: '89K requests' }
]

export default function ApiKeysV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'production' | 'expiring'>('all')

  const filteredKeys = apiKeys.filter(key => {
    if (viewMode === 'all') return true
    if (viewMode === 'active') return key.status === 'active'
    if (viewMode === 'production') return key.environment === 'production'
    if (viewMode === 'expiring') {
      if (!key.expiryDate) return false
      const daysUntilExpiry = (new Date(key.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }
    return true
  })

  const getStatusColor = (status: KeyStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'expired': return 'bg-red-100 text-red-700 border-red-200'
      case 'revoked': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: KeyStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />
      case 'inactive': return <Clock className="w-3 h-3" />
      case 'expired': return <XCircle className="w-3 h-3" />
      case 'revoked': return <Lock className="w-3 h-3" />
      default: return <Key className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: KeyType) => {
    switch (type) {
      case 'api': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'webhook': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'oauth': return 'bg-green-50 text-green-600 border-green-100'
      case 'jwt': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'service': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getPermissionColor = (permission: KeyPermission) => {
    switch (permission) {
      case 'read': return 'bg-green-50 text-green-600 border-green-100'
      case 'write': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'admin': return 'bg-red-50 text-red-600 border-red-100'
      case 'full-access': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'limited': return 'bg-gray-50 text-gray-600 border-gray-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getTypeGradient = (type: KeyType) => {
    switch (type) {
      case 'api': return 'from-blue-500 to-cyan-600'
      case 'webhook': return 'from-purple-500 to-pink-600'
      case 'oauth': return 'from-green-500 to-emerald-600'
      case 'jwt': return 'from-orange-500 to-red-600'
      case 'service': return 'from-indigo-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const calculateUsage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100)
  }

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
          <button className="px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate API Key
          </button>
        </div>

        {/* Stats */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
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

            {filteredKeys.map((key) => (
              <div
                key={key.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(key.status)} flex items-center gap-1`}>
                        {getStatusIcon(key.status)}
                        {key.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(key.type)}`}>
                        {key.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPermissionColor(key.permission)}`}>
                        {key.permission}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        key.environment === 'production' ? 'bg-red-50 text-red-600 border-red-100' :
                        key.environment === 'staging' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {key.environment}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {key.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded font-mono">
                        {key.keyPreview}
                      </code>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {key.id} • Created by {key.createdBy} • {formatDate(key.createdDate)}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getTypeGradient(key.type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Requests</p>
                    <p className="text-sm font-semibold text-gray-900">{formatNumber(key.totalRequests)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Today</p>
                    <p className="text-sm font-semibold text-gray-900">{formatNumber(key.requestsToday)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rate Limit</p>
                    <p className="text-sm font-semibold text-gray-900">{formatNumber(key.rateLimitPerHour)}/hr</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Used</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Usage Progress */}
                {key.status === 'active' && key.requestsToday > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Today's Usage</span>
                      <span>{key.requestsToday.toLocaleString()} / {key.rateLimitPerHour.toLocaleString()} ({calculateUsage(key.requestsToday, key.rateLimitPerHour)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(key.type)} rounded-full transition-all`}
                        style={{ width: `${Math.min(calculateUsage(key.requestsToday, key.rateLimitPerHour), 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Expiry Warning */}
                {key.expiryDate && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span>Expires on {formatDate(key.expiryDate)}</span>
                    </div>
                  </div>
                )}

                {/* Scopes */}
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

                {/* IP Whitelist */}
                {key.ipWhitelist && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">IP Whitelist</p>
                    <div className="flex flex-wrap gap-2">
                      {key.ipWhitelist.map((ip, index) => (
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
                <div className="flex flex-wrap gap-2">
                  {key.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Key Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Key Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'api', count: 127, percentage: 51 },
                  { type: 'service', count: 52, percentage: 21 },
                  { type: 'webhook', count: 38, percentage: 15 },
                  { type: 'oauth', count: 22, percentage: 9 },
                  { type: 'jwt', count: 8, percentage: 4 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 uppercase text-xs">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(item.type as KeyType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Keys by Usage */}
            <RankingList
              title="Most Used Keys"
              items={topKeys}
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
              value="503.2K"
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
    </div>
  )
}
