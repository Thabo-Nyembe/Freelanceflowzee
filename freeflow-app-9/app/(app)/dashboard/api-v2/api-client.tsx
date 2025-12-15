'use client'

import { useState, useEffect } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  RankingList,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Code,
  Key,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Globe,
  Users,
  Settings,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2
} from 'lucide-react'
import { useApiEndpoints, ApiEndpoint, getMethodColor, getStatusColor, formatRequests, formatLatency } from '@/lib/hooks/use-api-endpoints'

interface ApiClientProps {
  initialEndpoints: ApiEndpoint[]
  initialStats: {
    total: number
    active: number
    totalRequests: number
    requestsToday: number
    avgLatency: number
    avgSuccessRate: number
  }
}

export default function ApiClient({ initialEndpoints, initialStats }: ApiClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'hour' | 'day' | 'week'>('day')
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({})

  const {
    endpoints,
    stats,
    isLoading,
    error,
    fetchEndpoints,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint
  } = useApiEndpoints(initialEndpoints)

  useEffect(() => {
    fetchEndpoints()
  }, [fetchEndpoints])

  const displayStats = [
    { label: 'Total Requests', value: formatRequests(stats.totalRequests || initialStats.totalRequests), change: 42.3, icon: <Zap className="w-5 h-5" /> },
    { label: 'Avg Response Time', value: formatLatency(stats.avgLatency || initialStats.avgLatency), change: -18.5, icon: <Clock className="w-5 h-5" /> },
    { label: 'Success Rate', value: `${(stats.avgSuccessRate || initialStats.avgSuccessRate).toFixed(1)}%`, change: 2.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Active Endpoints', value: String(stats.active || initialStats.active), change: 15.7, icon: <Key className="w-5 h-5" /> }
  ]

  // Mock API keys for display (in production, these would come from a separate API)
  const apiKeys = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'kazi_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      environment: 'production',
      status: 'active',
      requests: 847000,
      lastUsed: '2 minutes ago',
      created: '2024-01-15',
      rateLimit: 10000,
      permissions: ['read', 'write', 'delete']
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'kazi_dev_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      environment: 'development',
      status: 'active',
      requests: 124000,
      lastUsed: '5 minutes ago',
      created: '2024-02-01',
      rateLimit: 1000,
      permissions: ['read', 'write']
    }
  ]

  const rateLimits = [
    { tier: 'Free', limit: 1000, used: 847, percentage: 84.7, color: 'from-gray-500 to-slate-500' },
    { tier: 'Starter', limit: 10000, used: 6420, percentage: 64.2, color: 'from-blue-500 to-cyan-500' },
    { tier: 'Professional', limit: 50000, used: 18900, percentage: 37.8, color: 'from-purple-500 to-pink-500' },
    { tier: 'Enterprise', limit: 0, used: 847000, percentage: 0, color: 'from-green-500 to-emerald-500' }
  ]

  const topEndpoints = endpoints.slice(0, 5).map((endpoint, index) => ({
    rank: index + 1,
    name: endpoint.path,
    avatar: endpoint.method === 'GET' ? '📥' : endpoint.method === 'POST' ? '📤' : '🔄',
    value: formatRequests(endpoint.total_requests),
    change: 42.3 - (index * 8)
  }))

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'API key created', description: 'Production API Key for Mobile App', time: '10 minutes ago', status: 'success' as const },
    { icon: <AlertCircle className="w-5 h-5" />, title: 'Rate limit warning', description: 'Starter tier approaching 80%', time: '2 hours ago', status: 'warning' as const },
    { icon: <Shield className="w-5 h-5" />, title: 'Key restricted', description: 'Legacy Integration permissions updated', time: '1 day ago', status: 'info' as const },
    { icon: <Zap className="w-5 h-5" />, title: 'High traffic spike', description: '2.4M requests in last hour', time: '2 days ago', status: 'success' as const }
  ]

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'development': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'staging': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getKeyStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'restricted': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'revoked': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const maskApiKey = (key: string) => {
    const prefix = key.substring(0, 12)
    const suffix = key.substring(key.length - 4)
    return `${prefix}${'•'.repeat(24)}${suffix}`
  }

  const maxRequests = Math.max(...endpoints.map(e => e.total_requests), 1)

  const handleCreateEndpoint = async () => {
    try {
      await createEndpoint({
        name: 'New Endpoint',
        method: 'GET',
        path: '/api/v1/new',
        description: 'New API endpoint'
      })
    } catch (err) {
      console.error('Failed to create endpoint:', err)
    }
  }

  const handleDeleteEndpoint = async (endpointId: string) => {
    if (confirm('Are you sure you want to delete this endpoint?')) {
      try {
        await deleteEndpoint(endpointId)
      } catch (err) {
        console.error('Failed to delete endpoint:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50/30 to-cyan-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Code className="w-10 h-10 text-indigo-600" />
              API Management
            </h1>
            <p className="text-muted-foreground">Monitor API usage, keys, and performance</p>
          </div>
          <GradientButton from="indigo" to="blue" onClick={handleCreateEndpoint}>
            <Plus className="w-5 h-5 mr-2" />
            Create Endpoint
          </GradientButton>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Key />} title="API Keys" description="Manage keys" onClick={() => console.log('Keys')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Usage stats" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Shield />} title="Security" description="Permissions" onClick={() => console.log('Security')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'hour' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('hour')}>
            Last Hour
          </PillButton>
          <PillButton variant={selectedPeriod === 'day' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('day')}>
            Last 24 Hours
          </PillButton>
          <PillButton variant={selectedPeriod === 'week' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('week')}>
            Last 7 Days
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">API Keys</h3>
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 rounded-xl border border-border bg-background">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{apiKey.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md ${getEnvironmentColor(apiKey.environment)}`}>
                              {apiKey.environment}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-md ${getKeyStatusColor(apiKey.status)}`}>
                              {apiKey.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                              {showApiKey[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                            </code>
                            <button
                              onClick={() => setShowApiKey({ ...showApiKey, [apiKey.id]: !showApiKey[apiKey.id] })}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {showApiKey[apiKey.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(apiKey.key)}
                              className="p-1 hover:bg-muted rounded"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Requests</p>
                          <p className="font-semibold">{(apiKey.requests / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rate Limit</p>
                          <p className="font-semibold">{apiKey.rateLimit === 0 ? 'Unlimited' : `${apiKey.rateLimit}/hr`}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Used</p>
                          <p className="font-semibold">{apiKey.lastUsed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-semibold">{apiKey.created}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <div className="flex flex-wrap gap-1">
                          {apiKey.permissions.map((permission) => (
                            <span key={permission} className="text-xs px-2 py-1 rounded-md bg-muted">
                              {permission}
                            </span>
                          ))}
                        </div>
                        <div className="ml-auto flex gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', apiKey.id)}>
                            Edit
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Revoke', apiKey.id)}>
                            Revoke
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Endpoint Analytics</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {endpoints.map((endpoint) => {
                    const requestPercent = (endpoint.total_requests / maxRequests) * 100

                    return (
                      <div key={endpoint.id} className="p-4 rounded-lg border border-border bg-background">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-md font-mono font-semibold ${getMethodColor(endpoint.method)}`}>
                                {endpoint.method}
                              </span>
                              <code className="text-sm font-mono">{endpoint.path}</code>
                              <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(endpoint.status)}`}>
                                {endpoint.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{formatRequests(endpoint.total_requests)} requests</span>
                              <button
                                onClick={() => handleDeleteEndpoint(endpoint.id)}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground">Avg Latency</p>
                              <p className="font-semibold">{formatLatency(endpoint.avg_latency_ms)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">P95 Latency</p>
                              <p className="font-semibold">{formatLatency(endpoint.p95_latency_ms)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Error Rate</p>
                              <p className={`font-semibold ${endpoint.error_rate > 1 ? 'text-red-600' : 'text-green-600'}`}>
                                {endpoint.error_rate.toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-600 to-blue-600"
                              style={{ width: `${requestPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Rate Limits by Tier</h3>
              <div className="space-y-4">
                {rateLimits.map((tier) => (
                  <div key={tier.tier} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${tier.color} flex items-center justify-center text-white font-semibold`}>
                          {tier.tier.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{tier.tier}</p>
                          <p className="text-xs text-muted-foreground">
                            {tier.limit === 0 ? 'Unlimited requests' : `${tier.limit.toLocaleString()} requests/hour`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{tier.used.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {tier.limit === 0 ? 'used' : `${tier.percentage.toFixed(0)}% used`}
                        </p>
                      </div>
                    </div>
                    {tier.limit > 0 && (
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${tier.color} transition-all duration-300`}
                          style={{ width: `${tier.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="Top Endpoints" items={topEndpoints} />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">API Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Uptime" value="99.98%" change={0.02} />
                <MiniKPI label="Avg Throughput" value="2.4K/s" change={42.3} />
                <MiniKPI label="Total Errors" value="847" change={-28.5} />
                <MiniKPI label="Cache Hit Rate" value="87%" change={15.3} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Docs')}>
                  <Code className="w-4 h-4 mr-2" />
                  View Documentation
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Logs')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Request Logs
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Webhooks')}>
                  <Zap className="w-4 h-4 mr-2" />
                  Configure Webhooks
                </ModernButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
