'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export interface ApiKey {
  id: string
  user_id: string
  key_code: string
  name: string
  description: string | null
  key_hash: string
  key_prefix: string
  key_type: 'api' | 'webhook' | 'oauth' | 'jwt' | 'service'
  permission: 'read' | 'write' | 'admin' | 'full-access' | 'limited'
  scopes: string[]
  status: 'active' | 'inactive' | 'expired' | 'revoked'
  environment: 'production' | 'staging' | 'development'
  ip_whitelist: string[]
  allowed_origins: string[]
  rate_limit_per_hour: number
  rate_limit_per_day: number
  total_requests: number
  requests_today: number
  requests_this_month: number
  last_used_at: string | null
  last_ip_address: string | null
  created_by: string | null
  team: string | null
  expires_at: string | null
  revoked_at: string | null
  revoked_by: string | null
  revoke_reason: string | null
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseApiKeysOptions {
  status?: ApiKey['status']
  keyType?: ApiKey['key_type']
  environment?: ApiKey['environment']
}

interface ApiKeyStats {
  total: number
  active: number
  inactive: number
  expired: number
  revoked: number
  totalRequests: number
  requestsToday: number
  requestsThisMonth: number
  expiringSoon: number
}

export function useApiKeys(initialKeys: ApiKey[] = [], options: UseApiKeysOptions = {}) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const stats: ApiKeyStats = {
    total: keys.length,
    active: keys.filter(k => k.status === 'active').length,
    inactive: keys.filter(k => k.status === 'inactive').length,
    expired: keys.filter(k => k.status === 'expired').length,
    revoked: keys.filter(k => k.status === 'revoked').length,
    totalRequests: keys.reduce((sum, k) => sum + k.total_requests, 0),
    requestsToday: keys.reduce((sum, k) => sum + k.requests_today, 0),
    requestsThisMonth: keys.reduce((sum, k) => sum + k.requests_this_month, 0),
    expiringSoon: keys.filter(k => {
      if (!k.expires_at) return false
      const expiryDate = new Date(k.expires_at)
      return expiryDate > now && expiryDate < thirtyDaysFromNow
    }).length
  }

  const fetchKeys = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('api_keys')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (options.status) {
        query = query.eq('status', options.status)
      }
      if (options.keyType) {
        query = query.eq('key_type', options.keyType)
      }
      if (options.environment) {
        query = query.eq('environment', options.environment)
      }

      const { data, error: fetchError } = await query.limit(100)

      if (fetchError) throw fetchError
      setKeys(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.status, options.keyType, options.environment])

  useEffect(() => {
    const channel = supabase
      .channel('api_keys_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'api_keys' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setKeys(prev => [payload.new as ApiKey, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setKeys(prev => prev.map(k =>
              k.id === payload.new.id ? payload.new as ApiKey : k
            ))
          } else if (payload.eventType === 'DELETE') {
            setKeys(prev => prev.filter(k => k.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const createKey = useCallback(async (keyData: {
    name: string
    description?: string
    key_type?: ApiKey['key_type']
    permission?: ApiKey['permission']
    scopes?: string[]
    environment?: ApiKey['environment']
    ip_whitelist?: string[]
    rate_limit_per_hour?: number
    expires_at?: string
    tags?: string[]
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Generate a random key (in production, use a secure random generator)
    const keyValue = `sk_${keyData.environment || 'prod'}_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`
    const keyPrefix = keyValue.slice(0, 12) + '...'
    const keyHash = btoa(keyValue) // In production, use proper hashing

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: keyData.name,
        description: keyData.description,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        key_type: keyData.key_type || 'api',
        permission: keyData.permission || 'read',
        scopes: keyData.scopes || [],
        environment: keyData.environment || 'production',
        ip_whitelist: keyData.ip_whitelist || [],
        rate_limit_per_hour: keyData.rate_limit_per_hour || 1000,
        expires_at: keyData.expires_at,
        tags: keyData.tags || [],
        created_by: user.email,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    setKeys(prev => [data, ...prev])
    return { ...data, key_value: keyValue } // Return full key only on creation
  }, [supabase])

  const updateKey = useCallback(async (
    keyId: string,
    updates: Partial<Pick<ApiKey, 'name' | 'description' | 'permission' | 'scopes' | 'ip_whitelist' | 'rate_limit_per_hour' | 'tags'>>
  ) => {
    const { error } = await supabase
      .from('api_keys')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', keyId)

    if (error) throw error
    setKeys(prev => prev.map(k =>
      k.id === keyId ? { ...k, ...updates } : k
    ))
  }, [supabase])

  const revokeKey = useCallback(async (keyId: string, reason?: string) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('api_keys')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: user?.email,
        revoke_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)

    if (error) throw error
    setKeys(prev => prev.map(k =>
      k.id === keyId
        ? {
            ...k,
            status: 'revoked' as const,
            revoked_at: new Date().toISOString(),
            revoked_by: user?.email || null,
            revoke_reason: reason || null
          }
        : k
    ))
  }, [supabase])

  const activateKey = useCallback(async (keyId: string) => {
    const { error } = await supabase
      .from('api_keys')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)

    if (error) throw error
    setKeys(prev => prev.map(k =>
      k.id === keyId ? { ...k, status: 'active' as const } : k
    ))
  }, [supabase])

  const deactivateKey = useCallback(async (keyId: string) => {
    const { error } = await supabase
      .from('api_keys')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)

    if (error) throw error
    setKeys(prev => prev.map(k =>
      k.id === keyId ? { ...k, status: 'inactive' as const } : k
    ))
  }, [supabase])

  const deleteKey = useCallback(async (keyId: string) => {
    const { error } = await supabase
      .from('api_keys')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', keyId)

    if (error) throw error
    setKeys(prev => prev.filter(k => k.id !== keyId))
  }, [supabase])

  return {
    keys,
    stats,
    isLoading,
    error,
    fetchKeys,
    createKey,
    updateKey,
    revokeKey,
    activateKey,
    deactivateKey,
    deleteKey
  }
}

export function getKeyStatusColor(status: ApiKey['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400'
    case 'inactive':
      return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400'
    case 'expired':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400'
    case 'revoked':
      return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function getKeyTypeColor(type: ApiKey['key_type']): string {
  switch (type) {
    case 'api':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'webhook':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'oauth':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'jwt':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'service':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function getPermissionColor(permission: ApiKey['permission']): string {
  switch (permission) {
    case 'read':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'write':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'admin':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'full-access':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'limited':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function getEnvironmentColor(environment: ApiKey['environment']): string {
  switch (environment) {
    case 'production':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'staging':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'development':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function formatRequests(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export function formatKeyDate(dateString: string | null): string {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function calculateUsagePercentage(used: number, limit: number): number {
  if (limit === 0) return 0
  return Math.min(Math.round((used / limit) * 100), 100)
}
