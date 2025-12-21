/**
 * React Hooks for OAuth Provider Management
 *
 * Supabase 2025 Feature: OAuth 2.0 Provider Capability
 * "Sign in with KAZI" - Allow third-party apps to authenticate with your platform
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TYPES
// ============================================

export interface OAuthApplication {
  id: string
  user_id: string
  client_id: string
  client_secret_hash: string
  name: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  privacy_policy_url: string | null
  terms_of_service_url: string | null
  redirect_uris: string[]
  allowed_scopes: string[]
  grant_types: string[]
  token_endpoint_auth_method: string
  is_confidential: boolean
  is_first_party: boolean
  is_active: boolean
  is_verified: boolean
  rate_limit_per_minute: number
  rate_limit_per_day: number
  access_token_ttl_seconds: number
  refresh_token_ttl_seconds: number
  created_at: string
  updated_at: string
}

export interface OAuthScope {
  id: string
  scope_name: string
  display_name: string
  description: string | null
  category: string
  is_sensitive: boolean
  requires_consent: boolean
  is_default: boolean
  is_active: boolean
  created_at: string
}

export interface OAuthAccessToken {
  id: string
  application_id: string
  user_id: string
  token_hash: string
  scopes: string[]
  expires_at: string
  is_revoked: boolean
  created_at: string
}

export interface UserOAuthConsent {
  id: string
  user_id: string
  application_id: string
  granted_scopes: string[]
  granted_at: string
  expires_at: string | null
  is_revoked: boolean
}

// ============================================
// OAUTH APPLICATIONS HOOK
// ============================================

export interface UseOAuthApplicationsReturn {
  applications: OAuthApplication[]
  isLoading: boolean
  error: string | null
  create: (data: CreateOAuthAppInput) => Promise<OAuthApplication | null>
  update: (id: string, data: Partial<OAuthApplication>) => Promise<void>
  remove: (id: string) => Promise<void>
  regenerateSecret: (id: string) => Promise<string | null>
  getById: (id: string) => Promise<OAuthApplication | null>
  refresh: () => Promise<void>
}

export interface CreateOAuthAppInput {
  name: string
  description?: string
  logo_url?: string
  website_url?: string
  privacy_policy_url?: string
  terms_of_service_url?: string
  redirect_uris: string[]
  allowed_scopes?: string[]
  is_confidential?: boolean
}

export function useOAuthApplications(userId?: string): UseOAuthApplicationsReturn {
  const [applications, setApplications] = useState<OAuthApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchApplications = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('oauth_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (err) throw err
      setApplications(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchApplications()

    // Set up realtime subscription
    if (userId) {
      const channel = supabase
        .channel('oauth_applications_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'oauth_applications', filter: `user_id=eq.${userId}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setApplications(prev => [payload.new as OAuthApplication, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setApplications(prev => prev.map(item =>
                item.id === payload.new.id ? payload.new as OAuthApplication : item
              ))
            } else if (payload.eventType === 'DELETE') {
              setApplications(prev => prev.filter(item => item.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchApplications, userId, supabase])

  const create = useCallback(async (data: CreateOAuthAppInput) => {
    try {
      // Generate client credentials
      const clientId = `kazi_${crypto.randomUUID().replace(/-/g, '')}`
      const clientSecret = crypto.randomUUID() + crypto.randomUUID()

      const { data: result, error: err } = await supabase
        .from('oauth_applications')
        .insert({
          user_id: userId,
          client_id: clientId,
          client_secret_hash: clientSecret, // In production, hash this
          name: data.name,
          description: data.description,
          logo_url: data.logo_url,
          website_url: data.website_url,
          privacy_policy_url: data.privacy_policy_url,
          terms_of_service_url: data.terms_of_service_url,
          redirect_uris: data.redirect_uris,
          allowed_scopes: data.allowed_scopes || ['profile:read'],
          is_confidential: data.is_confidential ?? true,
          is_active: true,
        })
        .select()
        .single()

      if (err) throw err
      setApplications(prev => [result, ...prev])
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application')
      return null
    }
  }, [userId, supabase])

  const update = useCallback(async (id: string, data: Partial<OAuthApplication>) => {
    try {
      const { error: err } = await supabase
        .from('oauth_applications')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)

      if (err) throw err
      setApplications(prev => prev.map(app => app.id === id ? { ...app, ...data } : app))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application')
    }
  }, [userId, supabase])

  const remove = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('oauth_applications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (err) throw err
      setApplications(prev => prev.filter(app => app.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application')
    }
  }, [userId, supabase])

  const regenerateSecret = useCallback(async (id: string) => {
    try {
      const newSecret = crypto.randomUUID() + crypto.randomUUID()

      const { error: err } = await supabase
        .from('oauth_applications')
        .update({
          client_secret_hash: newSecret,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)

      if (err) throw err
      return newSecret
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate secret')
      return null
    }
  }, [userId, supabase])

  const getById = useCallback(async (id: string) => {
    try {
      const { data, error: err } = await supabase
        .from('oauth_applications')
        .select('*')
        .eq('id', id)
        .single()

      if (err) throw err
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get application')
      return null
    }
  }, [supabase])

  return {
    applications,
    isLoading,
    error,
    create,
    update,
    remove,
    regenerateSecret,
    getById,
    refresh: fetchApplications,
  }
}

// ============================================
// OAUTH SCOPES HOOK
// ============================================

export interface UseOAuthScopesReturn {
  scopes: OAuthScope[]
  isLoading: boolean
  error: string | null
  getByCategory: (category: string) => OAuthScope[]
  getSensitive: () => OAuthScope[]
  refresh: () => Promise<void>
}

export function useOAuthScopes(): UseOAuthScopesReturn {
  const [scopes, setScopes] = useState<OAuthScope[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchScopes = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('oauth_scopes')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('scope_name', { ascending: true })

      if (err) throw err
      setScopes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scopes')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchScopes()
  }, [fetchScopes])

  const getByCategory = useCallback((category: string) => {
    return scopes.filter(s => s.category === category)
  }, [scopes])

  const getSensitive = useCallback(() => {
    return scopes.filter(s => s.is_sensitive)
  }, [scopes])

  return {
    scopes,
    isLoading,
    error,
    getByCategory,
    getSensitive,
    refresh: fetchScopes,
  }
}

// ============================================
// USER OAUTH CONSENTS HOOK
// ============================================

export interface UseOAuthConsentsReturn {
  consents: UserOAuthConsent[]
  isLoading: boolean
  error: string | null
  grant: (applicationId: string, scopes: string[]) => Promise<UserOAuthConsent | null>
  revoke: (applicationId: string) => Promise<void>
  revokeAll: () => Promise<void>
  hasConsent: (applicationId: string) => boolean
  getConsentedScopes: (applicationId: string) => string[]
  refresh: () => Promise<void>
}

export function useOAuthConsents(userId?: string): UseOAuthConsentsReturn {
  const [consents, setConsents] = useState<UserOAuthConsent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchConsents = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('user_oauth_consents')
        .select('*')
        .eq('user_id', userId)
        .eq('is_revoked', false)
        .order('granted_at', { ascending: false })

      if (err) throw err
      setConsents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consents')
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchConsents()
  }, [fetchConsents])

  const grant = useCallback(async (applicationId: string, scopes: string[]) => {
    try {
      const { data: result, error: err } = await supabase
        .from('user_oauth_consents')
        .upsert({
          user_id: userId,
          application_id: applicationId,
          granted_scopes: scopes,
          granted_at: new Date().toISOString(),
          is_revoked: false,
        })
        .select()
        .single()

      if (err) throw err
      setConsents(prev => {
        const existing = prev.findIndex(c => c.application_id === applicationId)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = result
          return updated
        }
        return [result, ...prev]
      })
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant consent')
      return null
    }
  }, [userId, supabase])

  const revoke = useCallback(async (applicationId: string) => {
    try {
      const { error: err } = await supabase
        .from('user_oauth_consents')
        .update({ is_revoked: true })
        .eq('user_id', userId)
        .eq('application_id', applicationId)

      if (err) throw err
      setConsents(prev => prev.filter(c => c.application_id !== applicationId))

      // Also revoke all access tokens
      await supabase
        .from('oauth_access_tokens')
        .update({ is_revoked: true })
        .eq('user_id', userId)
        .eq('application_id', applicationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke consent')
    }
  }, [userId, supabase])

  const revokeAll = useCallback(async () => {
    try {
      const { error: err } = await supabase
        .from('user_oauth_consents')
        .update({ is_revoked: true })
        .eq('user_id', userId)

      if (err) throw err
      setConsents([])

      // Also revoke all access tokens
      await supabase
        .from('oauth_access_tokens')
        .update({ is_revoked: true })
        .eq('user_id', userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke consents')
    }
  }, [userId, supabase])

  const hasConsent = useCallback((applicationId: string) => {
    return consents.some(c => c.application_id === applicationId && !c.is_revoked)
  }, [consents])

  const getConsentedScopes = useCallback((applicationId: string) => {
    const consent = consents.find(c => c.application_id === applicationId)
    return consent?.granted_scopes || []
  }, [consents])

  return {
    consents,
    isLoading,
    error,
    grant,
    revoke,
    revokeAll,
    hasConsent,
    getConsentedScopes,
    refresh: fetchConsents,
  }
}

// ============================================
// OAUTH ACCESS TOKENS HOOK (for users to view their tokens)
// ============================================

export interface UseOAuthTokensReturn {
  tokens: OAuthAccessToken[]
  isLoading: boolean
  error: string | null
  revoke: (tokenId: string) => Promise<void>
  revokeByApp: (applicationId: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useOAuthTokens(userId?: string): UseOAuthTokensReturn {
  const [tokens, setTokens] = useState<OAuthAccessToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchTokens = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('oauth_access_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('is_revoked', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (err) throw err
      setTokens(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tokens')
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  const revoke = useCallback(async (tokenId: string) => {
    try {
      const { error: err } = await supabase
        .from('oauth_access_tokens')
        .update({ is_revoked: true })
        .eq('id', tokenId)
        .eq('user_id', userId)

      if (err) throw err
      setTokens(prev => prev.filter(t => t.id !== tokenId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke token')
    }
  }, [userId, supabase])

  const revokeByApp = useCallback(async (applicationId: string) => {
    try {
      const { error: err } = await supabase
        .from('oauth_access_tokens')
        .update({ is_revoked: true })
        .eq('user_id', userId)
        .eq('application_id', applicationId)

      if (err) throw err
      setTokens(prev => prev.filter(t => t.application_id !== applicationId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke tokens')
    }
  }, [userId, supabase])

  return {
    tokens,
    isLoading,
    error,
    revoke,
    revokeByApp,
    refresh: fetchTokens,
  }
}

// ============================================
// COMBINED OAUTH HOOK
// ============================================

export function useOAuth(userId?: string) {
  const applications = useOAuthApplications(userId)
  const scopes = useOAuthScopes()
  const consents = useOAuthConsents(userId)
  const tokens = useOAuthTokens(userId)

  return {
    applications,
    scopes,
    consents,
    tokens,
    isLoading: applications.isLoading || scopes.isLoading || consents.isLoading || tokens.isLoading,
  }
}
