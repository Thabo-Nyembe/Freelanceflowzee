'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type APIKeyStatus = 'active' | 'revoked' | 'expired'

export interface APIKey {
  id: string
  name: string
  key: string
  keyPrefix: string
  status: APIKeyStatus
  scopes: string[]
  rateLimit: number
  rateLimitPeriod: 'second' | 'minute' | 'hour' | 'day'
  allowedIPs: string[]
  allowedDomains: string[]
  expiresAt?: string
  lastUsedAt?: string
  usageCount: number
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface APIKeyUsage {
  id: string
  keyId: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  ipAddress: string
  userAgent?: string
  timestamp: string
}

export interface APIScope {
  id: string
  name: string
  description: string
  endpoints: string[]
  category: string
}

export interface APIKeyStats {
  totalKeys: number
  activeKeys: number
  totalRequests: number
  requestsToday: number
  avgResponseTime: number
  errorRate: number
  topEndpoints: { endpoint: string; count: number }[]
  usageTrend: { date: string; requests: number }[]
  requestsByKey: { keyId: string; keyName: string; count: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAPIKeys: APIKey[] = [
  { id: 'key-1', name: 'Production API Key', key: 'sk_live_xxxxxxxxxxxxxxxxxxxx', keyPrefix: 'sk_live_', status: 'active', scopes: ['read:users', 'write:users', 'read:projects', 'write:projects'], rateLimit: 1000, rateLimitPeriod: 'minute', allowedIPs: [], allowedDomains: ['app.example.com'], lastUsedAt: '2024-03-20T10:30:00Z', usageCount: 125420, createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-01-15', updatedAt: '2024-03-15' },
  { id: 'key-2', name: 'Development API Key', key: 'sk_test_xxxxxxxxxxxxxxxxxxxx', keyPrefix: 'sk_test_', status: 'active', scopes: ['read:*', 'write:*'], rateLimit: 100, rateLimitPeriod: 'minute', allowedIPs: ['127.0.0.1', '192.168.1.0/24'], allowedDomains: ['localhost'], lastUsedAt: '2024-03-20T09:00:00Z', usageCount: 45200, createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-02-01', updatedAt: '2024-03-10' },
  { id: 'key-3', name: 'Mobile App Key', key: 'sk_live_yyyyyyyyyyyyyyyyyyyy', keyPrefix: 'sk_live_', status: 'active', scopes: ['read:users', 'read:projects', 'read:tasks'], rateLimit: 500, rateLimitPeriod: 'minute', allowedIPs: [], allowedDomains: [], expiresAt: '2024-12-31', lastUsedAt: '2024-03-20T08:45:00Z', usageCount: 89500, createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: 'key-4', name: 'Old Integration Key', key: 'sk_live_zzzzzzzzzzzzzzzzzzzz', keyPrefix: 'sk_live_', status: 'revoked', scopes: ['read:users'], rateLimit: 100, rateLimitPeriod: 'minute', allowedIPs: [], allowedDomains: [], usageCount: 12500, createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2023-06-15', updatedAt: '2024-02-28' }
]

const mockScopes: APIScope[] = [
  { id: 'scope-1', name: 'read:users', description: 'Read user data', endpoints: ['/api/users', '/api/users/:id'], category: 'Users' },
  { id: 'scope-2', name: 'write:users', description: 'Create and update users', endpoints: ['/api/users', '/api/users/:id'], category: 'Users' },
  { id: 'scope-3', name: 'read:projects', description: 'Read project data', endpoints: ['/api/projects', '/api/projects/:id'], category: 'Projects' },
  { id: 'scope-4', name: 'write:projects', description: 'Create and update projects', endpoints: ['/api/projects', '/api/projects/:id'], category: 'Projects' },
  { id: 'scope-5', name: 'read:tasks', description: 'Read task data', endpoints: ['/api/tasks', '/api/tasks/:id'], category: 'Tasks' },
  { id: 'scope-6', name: 'write:tasks', description: 'Create and update tasks', endpoints: ['/api/tasks', '/api/tasks/:id'], category: 'Tasks' },
  { id: 'scope-7', name: 'read:*', description: 'Read all resources', endpoints: ['/api/*'], category: 'Admin' },
  { id: 'scope-8', name: 'write:*', description: 'Write all resources', endpoints: ['/api/*'], category: 'Admin' }
]

const mockUsage: APIKeyUsage[] = [
  { id: 'usage-1', keyId: 'key-1', endpoint: '/api/users', method: 'GET', statusCode: 200, responseTime: 45, ipAddress: '192.168.1.100', timestamp: '2024-03-20T10:30:00Z' },
  { id: 'usage-2', keyId: 'key-1', endpoint: '/api/projects', method: 'POST', statusCode: 201, responseTime: 120, ipAddress: '192.168.1.100', timestamp: '2024-03-20T10:29:00Z' },
  { id: 'usage-3', keyId: 'key-2', endpoint: '/api/tasks', method: 'GET', statusCode: 200, responseTime: 35, ipAddress: '127.0.0.1', timestamp: '2024-03-20T09:00:00Z' }
]

const mockStats: APIKeyStats = {
  totalKeys: 12,
  activeKeys: 8,
  totalRequests: 2450000,
  requestsToday: 15420,
  avgResponseTime: 85,
  errorRate: 0.5,
  topEndpoints: [{ endpoint: '/api/users', count: 450000 }, { endpoint: '/api/projects', count: 380000 }, { endpoint: '/api/tasks', count: 320000 }],
  usageTrend: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], requests: 12000 + Math.floor(Math.random() * 5000) })),
  requestsByKey: [{ keyId: 'key-1', keyName: 'Production API Key', count: 125420 }, { keyId: 'key-3', keyName: 'Mobile App Key', count: 89500 }]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseAPIKeysOptions {
  
}

export function useAPIKeys(options: UseAPIKeysOptions = {}) {
  const {  } = options

  const [apiKeys, setAPIKeys] = useState<APIKey[]>([])
  const [scopes, setScopes] = useState<APIScope[]>([])
  const [usage, setUsage] = useState<APIKeyUsage[]>([])
  const [currentKey, setCurrentKey] = useState<APIKey | null>(null)
  const [stats, setStats] = useState<APIKeyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAPIKeys = useCallback(async () => {
    }, [])

  const updateAPIKey = useCallback(async (keyId: string, updates: Partial<APIKey>) => {
    setAPIKeys(prev => prev.map(k => k.id === keyId ? {
      ...k,
      ...updates,
      updatedAt: new Date().toISOString()
    } : k))
    return { success: true }
  }, [])

  const deleteAPIKey = useCallback(async (keyId: string) => {
    setAPIKeys(prev => prev.filter(k => k.id !== keyId))
    return { success: true }
  }, [])

  const revokeAPIKey = useCallback(async (keyId: string) => {
    return updateAPIKey(keyId, { status: 'revoked' })
  }, [updateAPIKey])

  const regenerateAPIKey = useCallback(async (keyId: string) => {
    const key = apiKeys.find(k => k.id === keyId)
    if (!key) return { success: false, error: 'Key not found' }

    const newKeyValue = `sk_${key.keyPrefix.includes('test') ? 'test' : 'live'}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

    setAPIKeys(prev => prev.map(k => k.id === keyId ? {
      ...k,
      key: newKeyValue,
      updatedAt: new Date().toISOString()
    } : k))

    return { success: true, newKey: newKeyValue }
  }, [apiKeys])

  const addScope = useCallback(async (keyId: string, scope: string) => {
    setAPIKeys(prev => prev.map(k => k.id === keyId && !k.scopes.includes(scope) ? {
      ...k,
      scopes: [...k.scopes, scope],
      updatedAt: new Date().toISOString()
    } : k))
    return { success: true }
  }, [])

  const removeScope = useCallback(async (keyId: string, scope: string) => {
    setAPIKeys(prev => prev.map(k => k.id === keyId ? {
      ...k,
      scopes: k.scopes.filter(s => s !== scope),
      updatedAt: new Date().toISOString()
    } : k))
    return { success: true }
  }, [])

  const addAllowedIP = useCallback(async (keyId: string, ip: string) => {
    setAPIKeys(prev => prev.map(k => k.id === keyId && !k.allowedIPs.includes(ip) ? {
      ...k,
      allowedIPs: [...k.allowedIPs, ip],
      updatedAt: new Date().toISOString()
    } : k))
    return { success: true }
  }, [])

  const removeAllowedIP = useCallback(async (keyId: string, ip: string) => {
    setAPIKeys(prev => prev.map(k => k.id === keyId ? {
      ...k,
      allowedIPs: k.allowedIPs.filter(i => i !== ip),
      updatedAt: new Date().toISOString()
    } : k))
    return { success: true }
  }, [])

  const addAllowedDomain = useCallback(async (keyId: string, domain: string) => {
    setAPIKeys(prev => prev.map(k => k.id === keyId && !k.allowedDomains.includes(domain) ? {
      ...k,
      allowedDomains: [...k.allowedDomains, domain],
      updatedAt: new Date().toISOString()
    } : k))
    return { success: true }
  }, [])

  const removeAllowedDomain = useCallback(async (keyId: string, domain: string) => {
    setAPIKeys(prev => prev.map(k => k.id === keyId ? {
      ...k,
      allowedDomains: k.allowedDomains.filter(d => d !== domain),
      updatedAt: new Date().toISOString()
    } : k))
    return { success: true }
  }, [])

  const updateRateLimit = useCallback(async (keyId: string, rateLimit: number, rateLimitPeriod: APIKey['rateLimitPeriod']) => {
    return updateAPIKey(keyId, { rateLimit, rateLimitPeriod })
  }, [updateAPIKey])

  const getUsageByKey = useCallback((keyId: string) => {
    return usage.filter(u => u.keyId === keyId)
  }, [usage])

  const maskKey = useCallback((key: string): string => {
    if (key.length <= 12) return key
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchAPIKeys()
  }, [fetchAPIKeys])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const activeKeys = useMemo(() => apiKeys.filter(k => k.status === 'active'), [apiKeys])
  const revokedKeys = useMemo(() => apiKeys.filter(k => k.status === 'revoked'), [apiKeys])
  const expiredKeys = useMemo(() => apiKeys.filter(k => k.status === 'expired' || (k.expiresAt && new Date(k.expiresAt) < new Date())), [apiKeys])
  const expiringKeys = useMemo(() => {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return apiKeys.filter(k => k.status === 'active' && k.expiresAt && new Date(k.expiresAt) <= thirtyDaysFromNow)
  }, [apiKeys])
  const scopesByCategory = useMemo(() => {
    const grouped: Record<string, APIScope[]> = {}
    scopes.forEach(s => {
      if (!grouped[s.category]) grouped[s.category] = []
      grouped[s.category].push(s)
    })
    return grouped
  }, [scopes])

  return {
    apiKeys, scopes, usage, currentKey, stats,
    activeKeys, revokedKeys, expiredKeys, expiringKeys, scopesByCategory,
    isLoading, error,
    refresh, createAPIKey, updateAPIKey, deleteAPIKey, revokeAPIKey, regenerateAPIKey,
    addScope, removeScope, addAllowedIP, removeAllowedIP, addAllowedDomain, removeAllowedDomain,
    updateRateLimit, getUsageByKey, maskKey, setCurrentKey
  }
}

export default useAPIKeys
