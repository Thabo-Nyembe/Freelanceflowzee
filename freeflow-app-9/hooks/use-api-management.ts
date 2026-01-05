'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface ApiEndpoint {
  id: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  name: string
  description: string
  category: string
  version: string
  status: 'active' | 'deprecated' | 'beta' | 'disabled'
  authRequired: boolean
  rateLimit: number
  avgResponseTime: number
  requestsToday: number
  errorRate: number
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  permissions: string[]
  scopes: string[]
  rateLimit: number
  status: 'active' | 'inactive' | 'revoked'
  lastUsedAt?: string
  createdAt: string
  expiresAt?: string
  usageCount: number
  createdBy: string
}

export interface ApiUsageStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgResponseTime: number
  requestsByHour: { hour: string; count: number }[]
  requestsByEndpoint: { endpoint: string; count: number }[]
  requestsByMethod: Record<string, number>
  errorsByType: { type: string; count: number }[]
}

export interface ApiVersion {
  version: string
  status: 'current' | 'deprecated' | 'sunset'
  releaseDate: string
  sunsetDate?: string
  endpoints: number
  changes: string[]
}

export interface RateLimitConfig {
  id: string
  name: string
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  burstLimit: number
  appliesTo: 'all' | 'anonymous' | 'authenticated' | 'custom'
  customRules?: string[]
}

export interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive' | 'failing'
  secret?: string
  createdAt: string
  lastTriggeredAt?: string
  successRate: number
  failureCount: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockEndpoints: ApiEndpoint[] = [
  { id: 'ep-1', path: '/api/v1/projects', method: 'GET', name: 'List Projects', description: 'Get all projects for the authenticated user', category: 'Projects', version: 'v1', status: 'active', authRequired: true, rateLimit: 100, avgResponseTime: 145, requestsToday: 12450, errorRate: 0.2 },
  { id: 'ep-2', path: '/api/v1/projects', method: 'POST', name: 'Create Project', description: 'Create a new project', category: 'Projects', version: 'v1', status: 'active', authRequired: true, rateLimit: 50, avgResponseTime: 320, requestsToday: 1240, errorRate: 0.5 },
  { id: 'ep-3', path: '/api/v1/invoices', method: 'GET', name: 'List Invoices', description: 'Get all invoices', category: 'Billing', version: 'v1', status: 'active', authRequired: true, rateLimit: 100, avgResponseTime: 180, requestsToday: 8920, errorRate: 0.1 },
  { id: 'ep-4', path: '/api/v1/users', method: 'GET', name: 'List Users', description: 'Get all users (admin only)', category: 'Users', version: 'v1', status: 'active', authRequired: true, rateLimit: 30, avgResponseTime: 250, requestsToday: 2100, errorRate: 0.3 },
  { id: 'ep-5', path: '/api/v1/auth/login', method: 'POST', name: 'Login', description: 'Authenticate user', category: 'Auth', version: 'v1', status: 'active', authRequired: false, rateLimit: 10, avgResponseTime: 420, requestsToday: 15600, errorRate: 2.1 },
  { id: 'ep-6', path: '/api/v0/projects', method: 'GET', name: 'List Projects (Legacy)', description: 'Legacy endpoint - use v1', category: 'Projects', version: 'v0', status: 'deprecated', authRequired: true, rateLimit: 50, avgResponseTime: 280, requestsToday: 450, errorRate: 0.8 }
]

const mockApiKeys: ApiKey[] = [
  { id: 'key-1', name: 'Production API Key', prefix: 'kazi_prod_', permissions: ['read', 'write'], scopes: ['projects', 'invoices', 'tasks'], rateLimit: 1000, status: 'active', lastUsedAt: new Date(Date.now() - 300000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 90).toISOString(), usageCount: 125000, createdBy: 'admin' },
  { id: 'key-2', name: 'Development Key', prefix: 'kazi_dev_', permissions: ['read'], scopes: ['projects', 'tasks'], rateLimit: 100, status: 'active', lastUsedAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), usageCount: 8500, createdBy: 'developer' },
  { id: 'key-3', name: 'Integration Key', prefix: 'kazi_int_', permissions: ['read', 'write'], scopes: ['webhooks', 'integrations'], rateLimit: 500, status: 'active', createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), usageCount: 45000, createdBy: 'admin' },
  { id: 'key-4', name: 'Old Test Key', prefix: 'kazi_test_', permissions: ['read'], scopes: ['projects'], rateLimit: 50, status: 'revoked', createdAt: new Date(Date.now() - 86400000 * 180).toISOString(), usageCount: 1200, createdBy: 'developer' }
]

const mockUsageStats: ApiUsageStats = {
  totalRequests: 1250000,
  successfulRequests: 1237500,
  failedRequests: 12500,
  avgResponseTime: 185,
  requestsByHour: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    count: 40000 + Math.floor(Math.random() * 20000)
  })),
  requestsByEndpoint: [
    { endpoint: '/api/v1/projects', count: 450000 },
    { endpoint: '/api/v1/auth/login', count: 320000 },
    { endpoint: '/api/v1/invoices', count: 180000 },
    { endpoint: '/api/v1/tasks', count: 150000 },
    { endpoint: '/api/v1/users', count: 100000 }
  ],
  requestsByMethod: { GET: 850000, POST: 250000, PUT: 100000, DELETE: 50000 },
  errorsByType: [
    { type: '401 Unauthorized', count: 5000 },
    { type: '404 Not Found', count: 3500 },
    { type: '429 Rate Limited', count: 2000 },
    { type: '500 Server Error', count: 1500 },
    { type: '400 Bad Request', count: 500 }
  ]
}

const mockVersions: ApiVersion[] = [
  { version: 'v1', status: 'current', releaseDate: '2024-01-01', endpoints: 45, changes: ['Initial stable release', 'Full authentication support', 'Rate limiting'] },
  { version: 'v0', status: 'deprecated', releaseDate: '2023-06-01', sunsetDate: '2025-06-01', endpoints: 32, changes: ['Beta release', 'Limited endpoints'] }
]

const mockRateLimits: RateLimitConfig[] = [
  { id: 'rl-1', name: 'Default', requestsPerMinute: 60, requestsPerHour: 1000, requestsPerDay: 10000, burstLimit: 100, appliesTo: 'all' },
  { id: 'rl-2', name: 'Anonymous', requestsPerMinute: 10, requestsPerHour: 100, requestsPerDay: 500, burstLimit: 20, appliesTo: 'anonymous' },
  { id: 'rl-3', name: 'Premium', requestsPerMinute: 200, requestsPerHour: 5000, requestsPerDay: 50000, burstLimit: 500, appliesTo: 'custom', customRules: ['plan=premium', 'plan=enterprise'] }
]

const mockWebhooks: Webhook[] = [
  { id: 'wh-1', name: 'Project Updates', url: 'https://hooks.example.com/projects', events: ['project.created', 'project.updated', 'project.deleted'], status: 'active', createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), lastTriggeredAt: new Date(Date.now() - 3600000).toISOString(), successRate: 99.5, failureCount: 3 },
  { id: 'wh-2', name: 'Invoice Events', url: 'https://billing.example.com/webhook', events: ['invoice.created', 'invoice.paid', 'invoice.overdue'], status: 'active', createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastTriggeredAt: new Date(Date.now() - 7200000).toISOString(), successRate: 98.2, failureCount: 12 },
  { id: 'wh-3', name: 'Slack Notifications', url: 'https://hooks.slack.com/services/xxx', events: ['*'], status: 'failing', createdAt: new Date(Date.now() - 86400000 * 90).toISOString(), lastTriggeredAt: new Date(Date.now() - 86400000).toISOString(), successRate: 45.0, failureCount: 156 }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseApiManagementOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useApiManagement(options: UseApiManagementOptions = {}) {
  const {
    
    autoRefresh = false,
    refreshInterval = 60000
  } = options

  // State
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageStats, setUsageStats] = useState<ApiUsageStats | null>(null)
  const [versions, setVersions] = useState<ApiVersion[]>([])
  const [rateLimits, setRateLimits] = useState<RateLimitConfig[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [endpointFilter, setEndpointFilter] = useState<{
    category?: string
    status?: string
    version?: string
    search?: string
  }>({})

  // Fetch endpoints
  const fetchEndpoints = useCallback(async (filters?: typeof endpointFilter) => {
    try {
      const params = new URLSearchParams()
      if (filters?.category) params.set('category', filters.category)
      if (filters?.status) params.set('status', filters.status)
      if (filters?.version) params.set('version', filters.version)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/admin/api/endpoints?${params}`)
      const result = await response.json()

      if (result.success && result.endpoints) {
        setEndpoints(result.endpoints)
        return result.endpoints
      }
      setEndpoints(mockEndpoints)
      return []
    } catch (err) {
      console.error('Error fetching endpoints:', err)
      setEndpoints(mockEndpoints)
      return []
    }
  }, [])

  // Fetch API keys
  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await fetch('/api/settings?category=api-keys')
      const result = await response.json()

      if (result.success && result.apiKeys) {
        setApiKeys(result.apiKeys)
        return result.apiKeys
      }
      setApiKeys([])
      return []
    } catch (err) {
      console.error('Error fetching API keys:', err)
      setApiKeys([])
      return []
    }
  }, [])

  // Fetch usage stats
  const fetchUsageStats = useCallback(async (period: 'day' | 'week' | 'month' = 'day') => {
    try {
      const response = await fetch(`/api/admin/api/usage?period=${period}`)
      const result = await response.json()

      if (result.success && result.stats) {
        setUsageStats(result.stats)
        return result.stats
      }
      setUsageStats(mockUsageStats)
      return []
    } catch (err) {
      console.error('Error fetching usage stats:', err)
      setUsageStats(mockUsageStats)
      return []
    }
  }, [])

  // Fetch versions
  const fetchVersions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/api/versions')
      const result = await response.json()

      if (result.success && result.versions) {
        setVersions(result.versions)
        return result.versions
      }
      setVersions(mockVersions)
      return []
    } catch (err) {
      console.error('Error fetching versions:', err)
      setVersions(mockVersions)
      return []
    }
  }, [])

  // Fetch rate limits
  const fetchRateLimits = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/api/rate-limits')
      const result = await response.json()

      if (result.success && result.rateLimits) {
        setRateLimits(result.rateLimits)
        return result.rateLimits
      }
      setRateLimits(mockRateLimits)
      return []
    } catch (err) {
      console.error('Error fetching rate limits:', err)
      setRateLimits(mockRateLimits)
      return []
    }
  }, [])

  // Fetch webhooks
  const fetchWebhooks = useCallback(async () => {
    try {
      const response = await fetch('/api/webhooks')
      const result = await response.json()

      if (result.success && result.webhooks) {
        setWebhooks(result.webhooks)
        return result.webhooks
      }
      setWebhooks([])
      return []
    } catch (err) {
      console.error('Error fetching webhooks:', err)
      setWebhooks([])
      return []
    }
  }, [])

  // API Key actions
  const createApiKey = useCallback(async (data: {
    name: string
    permissions: string[]
    scopes: string[]
    rateLimit?: number
    expiresAt?: string
  }) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-api-key', ...data })
      })

      const result = await response.json()
      if (result.success) {
        await fetchApiKeys()
        return { success: true, apiKey: result.apiKey }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error creating API key:', err)
      return { success: false, error: 'Failed to create API key' }
    }
  }, [fetchApiKeys])

  const revokeApiKey = useCallback(async (keyId: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke-api-key', keyId })
      })

      const result = await response.json()
      if (result.success) {
        setApiKeys(prev => prev.map(k =>
          k.id === keyId ? { ...k, status: 'revoked' as const } : k
        ))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error revoking API key:', err)
      return { success: false, error: 'Failed to revoke API key' }
    }
  }, [])

  const regenerateApiKey = useCallback(async (keyId: string) => {
    try {
      const response = await fetch(`/api/admin/api/keys/${keyId}/regenerate`, {
        method: 'POST'
      })

      const result = await response.json()
      if (result.success) {
        await fetchApiKeys()
        return { success: true, newKey: result.apiKey }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error regenerating API key:', err)
      return { success: false, error: 'Failed to regenerate API key' }
    }
  }, [fetchApiKeys])

  // Endpoint actions
  const updateEndpointStatus = useCallback(async (endpointId: string, status: ApiEndpoint['status']) => {
    try {
      const response = await fetch(`/api/admin/api/endpoints/${endpointId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const result = await response.json()
      if (result.success) {
        setEndpoints(prev => prev.map(e =>
          e.id === endpointId ? { ...e, status } : e
        ))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error updating endpoint:', err)
      // Optimistically update
      setEndpoints(prev => prev.map(e =>
        e.id === endpointId ? { ...e, status } : e
      ))
      return { success: true }
    }
  }, [])

  // Rate limit actions
  const updateRateLimit = useCallback(async (limitId: string, updates: Partial<RateLimitConfig>) => {
    try {
      const response = await fetch(`/api/admin/api/rate-limits/${limitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const result = await response.json()
      if (result.success) {
        setRateLimits(prev => prev.map(rl =>
          rl.id === limitId ? { ...rl, ...updates } : rl
        ))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error updating rate limit:', err)
      return { success: false, error: 'Failed to update rate limit' }
    }
  }, [])

  // Webhook actions
  const createWebhook = useCallback(async (data: {
    name: string
    url: string
    events: string[]
  }) => {
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      if (result.success) {
        await fetchWebhooks()
        return { success: true, webhook: result.webhook }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error creating webhook:', err)
      return { success: false, error: 'Failed to create webhook' }
    }
  }, [fetchWebhooks])

  const deleteWebhook = useCallback(async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        setWebhooks(prev => prev.filter(w => w.id !== webhookId))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error deleting webhook:', err)
      return { success: false, error: 'Failed to delete webhook' }
    }
  }, [])

  const testWebhook = useCallback(async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST'
      })

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error testing webhook:', err)
      return { success: false, error: 'Failed to test webhook' }
    }
  }, [])

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([
      fetchEndpoints(endpointFilter),
      fetchApiKeys(),
      fetchUsageStats(),
      fetchVersions(),
      fetchRateLimits(),
      fetchWebhooks()
    ])
    setIsLoading(false)
  }, [fetchEndpoints, fetchApiKeys, fetchUsageStats, fetchVersions, fetchRateLimits, fetchWebhooks, endpointFilter])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchUsageStats()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchUsageStats])

  // Computed values
  const activeApiKeys = useMemo(() =>
    apiKeys.filter(k => k.status === 'active'),
  [apiKeys])

  const activeEndpoints = useMemo(() =>
    endpoints.filter(e => e.status === 'active'),
  [endpoints])

  const deprecatedEndpoints = useMemo(() =>
    endpoints.filter(e => e.status === 'deprecated'),
  [endpoints])

  const endpointsByCategory = useMemo(() => {
    const grouped: Record<string, ApiEndpoint[]> = {}
    endpoints.forEach(e => {
      if (!grouped[e.category]) grouped[e.category] = []
      grouped[e.category].push(e)
    })
    return grouped
  }, [endpoints])

  const failingWebhooks = useMemo(() =>
    webhooks.filter(w => w.status === 'failing'),
  [webhooks])

  const currentVersion = useMemo(() =>
    versions.find(v => v.status === 'current'),
  [versions])

  const successRate = useMemo(() => {
    if (!usageStats) return 0
    return ((usageStats.successfulRequests / usageStats.totalRequests) * 100).toFixed(2)
  }, [usageStats])

  return {
    // Data
    endpoints,
    apiKeys,
    usageStats,
    versions,
    rateLimits,
    webhooks,
    activeApiKeys,
    activeEndpoints,
    deprecatedEndpoints,
    endpointsByCategory,
    failingWebhooks,
    currentVersion,

    // State
    isLoading,
    error,
    endpointFilter,
    successRate,

    // Fetch methods
    refresh,
    fetchEndpoints,
    fetchApiKeys,
    fetchUsageStats,
    fetchVersions,
    fetchRateLimits,
    fetchWebhooks,

    // API Key actions
    createApiKey,
    revokeApiKey,
    regenerateApiKey,

    // Endpoint actions
    setEndpointFilter,
    updateEndpointStatus,

    // Rate limit actions
    updateRateLimit,

    // Webhook actions
    createWebhook,
    deleteWebhook,
    testWebhook,
  }
}

export default useApiManagement
