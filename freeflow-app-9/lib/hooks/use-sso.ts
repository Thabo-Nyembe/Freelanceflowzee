/**
 * SSO React Hook
 *
 * Provides SSO functionality for React components:
 * - Initiate SAML/OIDC login
 * - Manage identity providers
 * - Handle SSO sessions
 *
 * @module lib/hooks/use-sso
 */

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

// Types
export interface IdentityProvider {
  id: string
  name: string
  type: 'saml' | 'oidc'
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface SSOSession {
  id: string
  idpId: string
  idpName: string
  attributes: Record<string, unknown>
  expiresAt: string
  createdAt: string
}

export interface UseSSOOptions {
  organizationId?: string
  onLoginSuccess?: (user: { id: string; email: string; name: string }) => void
  onLoginError?: (error: string) => void
  onLogoutSuccess?: () => void
}

export interface UseSSOReturn {
  // State
  identityProviders: IdentityProvider[]
  activeSessions: SSOSession[]
  isLoading: boolean
  error: string | null

  // Actions
  initiateLogin: (idpId: string, relayState?: string) => Promise<void>
  initiateLogout: () => Promise<void>
  fetchIdentityProviders: () => Promise<void>
  fetchActiveSessions: () => Promise<void>
  getSSOConnectionForEmail: (email: string) => Promise<{
    idpId: string | null
    enforceSSO: boolean
  }>
  getSPMetadata: (format?: 'xml' | 'json') => Promise<string>
}

/**
 * SSO Hook
 */
export function useSSO(options: UseSSOOptions = {}): UseSSOReturn {
  const { organizationId, onLoginSuccess, onLoginError, onLogoutSuccess } = options

  const [identityProviders, setIdentityProviders] = useState<IdentityProvider[]>([])
  const [activeSessions, setActiveSessions] = useState<SSOSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch identity providers for the organization
   */
  const fetchIdentityProviders = useCallback(async () => {
    if (!organizationId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/auth/sso/providers?orgId=${organizationId}`)
      const data = await response.json()

      if (data.success) {
        setIdentityProviders(data.providers.map((p: Record<string, unknown>) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          status: p.status,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        })))
      } else {
        throw new Error(data.error || 'Failed to fetch identity providers')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch identity providers'
      setError(message)
      console.error('Fetch IdPs error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  /**
   * Fetch active SSO sessions
   */
  const fetchActiveSessions = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/sso/sessions')
      const data = await response.json()

      if (data.success) {
        setActiveSessions(data.sessions.map((s: Record<string, unknown>) => ({
          id: s.id,
          idpId: s.idp_id,
          idpName: (s.identity_providers as Record<string, unknown>)?.name || 'Unknown',
          attributes: s.attributes,
          expiresAt: s.expires_at,
          createdAt: s.created_at
        })))
      }
    } catch (err) {
      console.error('Fetch sessions error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Initiate SSO login
   */
  const initiateLogin = useCallback(async (idpId: string, relayState?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get IdP type
      const idp = identityProviders.find(p => p.id === idpId)

      if (!idp) {
        // Fetch IdP info
        const infoResponse = await fetch(`/api/auth/sso/providers/${idpId}`)
        const infoData = await infoResponse.json()

        if (!infoData.success) {
          throw new Error('Identity provider not found')
        }

        await processLogin(infoData.provider.type, idpId, relayState)
      } else {
        await processLogin(idp.type, idpId, relayState)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SSO login failed'
      setError(message)
      onLoginError?.(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [identityProviders, onLoginError])

  /**
   * Process login based on IdP type
   */
  const processLogin = async (type: 'saml' | 'oidc', idpId: string, relayState?: string) => {
    if (type === 'saml') {
      // SAML login
      const response = await fetch('/api/auth/sso/saml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idpId, relayState })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate SAML login')
      }

      // Redirect to IdP
      window.location.href = data.url
    } else {
      // OIDC login
      const response = await fetch('/api/auth/sso/oidc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idpId,
          redirectUri: `${window.location.origin}/api/auth/sso/callback/oidc`,
          state: relayState
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate OIDC login')
      }

      // Store code verifier for PKCE
      if (data.codeVerifier) {
        sessionStorage.setItem('sso_code_verifier', data.codeVerifier)
      }

      // Redirect to IdP
      window.location.href = data.url
    }
  }

  /**
   * Initiate SSO logout
   */
  const initiateLogout = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/sso/logout', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        if (data.logoutUrl) {
          // SAML SLO - redirect to IdP
          window.location.href = data.logoutUrl
        } else {
          // Local logout only
          setActiveSessions([])
          onLogoutSuccess?.()
          toast.success('Logged out successfully')
        }
      } else {
        throw new Error(data.error || 'Logout failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      toast.error(message)
      console.error('SSO logout error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [onLogoutSuccess])

  /**
   * Get SSO connection for an email address
   */
  const getSSOConnectionForEmail = useCallback(async (email: string): Promise<{
    idpId: string | null
    enforceSSO: boolean
  }> => {
    try {
      const domain = email.split('@')[1]

      if (!domain) {
        return { idpId: null, enforceSSO: false }
      }

      const response = await fetch(`/api/auth/sso/lookup?domain=${encodeURIComponent(domain)}`)
      const data = await response.json()

      if (data.success && data.connection) {
        return {
          idpId: data.connection.idp_id,
          enforceSSO: data.connection.enforce_sso
        }
      }

      return { idpId: null, enforceSSO: false }
    } catch (err) {
      console.error('SSO lookup error:', err)
      return { idpId: null, enforceSSO: false }
    }
  }, [])

  /**
   * Get SP metadata
   */
  const getSPMetadata = useCallback(async (format: 'xml' | 'json' = 'xml'): Promise<string> => {
    const url = organizationId
      ? `/api/auth/sso/saml?org=${organizationId}`
      : '/api/auth/sso/saml'

    const response = await fetch(url)

    if (format === 'xml') {
      return response.text()
    }

    const xml = await response.text()
    // Simple XML to JSON conversion for display
    return JSON.stringify({ metadata: xml }, null, 2)
  }, [organizationId])

  // Fetch data on mount
  useEffect(() => {
    if (organizationId) {
      fetchIdentityProviders()
    }
    fetchActiveSessions()
  }, [organizationId, fetchIdentityProviders, fetchActiveSessions])

  // Handle SSO callback
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const ssoSuccess = params.get('sso_success')
      const ssoError = params.get('sso_error')

      if (ssoSuccess === 'true') {
        const userId = params.get('user_id')
        const userEmail = params.get('email')
        const userName = params.get('name')

        if (userId && userEmail) {
          onLoginSuccess?.({
            id: userId,
            email: userEmail,
            name: userName || userEmail
          })
          toast.success('Signed in via SSO')

          // Clean up URL
          const url = new URL(window.location.href)
          url.searchParams.delete('sso_success')
          url.searchParams.delete('user_id')
          url.searchParams.delete('email')
          url.searchParams.delete('name')
          window.history.replaceState({}, '', url.toString())
        }
      } else if (ssoError) {
        onLoginError?.(decodeURIComponent(ssoError))
        toast.error(decodeURIComponent(ssoError))

        // Clean up URL
        const url = new URL(window.location.href)
        url.searchParams.delete('sso_error')
        window.history.replaceState({}, '', url.toString())
      }
    }

    handleCallback()
  }, [onLoginSuccess, onLoginError])

  return {
    identityProviders,
    activeSessions,
    isLoading,
    error,
    initiateLogin,
    initiateLogout,
    fetchIdentityProviders,
    fetchActiveSessions,
    getSSOConnectionForEmail,
    getSPMetadata
  }
}

/**
 * Hook for SSO email domain detection
 * Automatically checks if SSO is required for an email
 */
export function useSSODomainCheck(email: string) {
  const [ssoRequired, setSSORequired] = useState(false)
  const [idpId, setIdpId] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const checkDomain = async () => {
      if (!email || !email.includes('@')) {
        setSSORequired(false)
        setIdpId(null)
        return
      }

      setIsChecking(true)

      try {
        const domain = email.split('@')[1]
        const response = await fetch(`/api/auth/sso/lookup?domain=${encodeURIComponent(domain)}`)
        const data = await response.json()

        if (data.success && data.connection) {
          setSSORequired(data.connection.enforce_sso)
          setIdpId(data.connection.idp_id)
        } else {
          setSSORequired(false)
          setIdpId(null)
        }
      } catch (err) {
        console.error('SSO domain check error:', err)
        setSSORequired(false)
        setIdpId(null)
      } finally {
        setIsChecking(false)
      }
    }

    // Debounce the check
    const timeout = setTimeout(checkDomain, 300)
    return () => clearTimeout(timeout)
  }, [email])

  return { ssoRequired, idpId, isChecking }
}

export default useSSO
