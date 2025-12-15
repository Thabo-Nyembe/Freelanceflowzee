'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// =====================================================
// TYPES
// =====================================================

export interface SecuritySettings {
  id: string
  user_id: string
  security_score: number
  two_factor_enabled: boolean
  two_factor_method: 'app' | 'sms' | 'email' | null
  two_factor_verified_at: string | null
  biometric_enabled: boolean
  biometric_type: 'fingerprint' | 'face_id' | null
  session_timeout_minutes: number
  max_active_sessions: number
  require_2fa_for_sensitive: boolean
  ip_whitelist_enabled: boolean
  ip_whitelist: string[]
  ip_blacklist: string[]
  password_min_length: number
  password_require_uppercase: boolean
  password_require_numbers: boolean
  password_require_special: boolean
  password_expiry_days: number
  password_last_changed_at: string | null
  max_login_attempts: number
  lockout_duration_minutes: number
  created_at: string
  updated_at: string
}

export interface SecurityEvent {
  id: string
  user_id: string | null
  event_type: 'failed_login' | 'new_device' | 'suspicious_activity' | 'password_change' | '2fa_enabled' | 'session_terminated'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  description: string | null
  ip_address: string | null
  user_agent: string | null
  device_info: Record<string, any>
  location: string | null
  is_blocked: boolean
  is_resolved: boolean
  resolved_by: string | null
  resolved_at: string | null
  resolution_notes: string | null
  related_session_id: string | null
  created_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string | null
  device_name: string | null
  device_type: 'desktop' | 'mobile' | 'tablet' | null
  browser: string | null
  os: string | null
  ip_address: string | null
  location: string | null
  country_code: string | null
  is_current: boolean
  is_active: boolean
  last_active_at: string
  expires_at: string | null
  created_at: string
}

export interface SecurityStats {
  securityScore: number
  totalEvents: number
  unresolvedEvents: number
  activeSessions: number
  blockedAttempts: number
  twoFactorEnabled: boolean
  criticalEvents: number
}

// =====================================================
// SECURITY SETTINGS HOOK
// =====================================================

export function useSecuritySettings(initialSettings?: SecuritySettings) {
  const [settings, setSettings] = useState<SecuritySettings | null>(initialSettings || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('security_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      if (data) {
        setSettings(data)
      } else {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('security_settings')
          .insert({ user_id: user.id })
          .select()
          .single()

        if (createError) throw createError
        setSettings(newSettings)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security settings')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<SecuritySettings>) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: updateError } = await supabase
        .from('security_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setSettings(data)
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update security settings'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Enable 2FA
  const enable2FA = useCallback(async (method: SecuritySettings['two_factor_method']) => {
    return updateSettings({
      two_factor_enabled: true,
      two_factor_method: method,
      two_factor_verified_at: new Date().toISOString()
    })
  }, [updateSettings])

  // Disable 2FA
  const disable2FA = useCallback(async () => {
    return updateSettings({
      two_factor_enabled: false,
      two_factor_method: null,
      two_factor_verified_at: null
    })
  }, [updateSettings])

  // Enable biometric
  const enableBiometric = useCallback(async (type: SecuritySettings['biometric_type']) => {
    return updateSettings({
      biometric_enabled: true,
      biometric_type: type
    })
  }, [updateSettings])

  // Disable biometric
  const disableBiometric = useCallback(async () => {
    return updateSettings({
      biometric_enabled: false,
      biometric_type: null
    })
  }, [updateSettings])

  // Update IP whitelist
  const updateIPWhitelist = useCallback(async (ips: string[], enabled: boolean) => {
    return updateSettings({
      ip_whitelist: ips,
      ip_whitelist_enabled: enabled
    })
  }, [updateSettings])

  // Add IP to blacklist
  const addToBlacklist = useCallback(async (ip: string) => {
    if (!settings) return { success: false, error: 'Settings not loaded' }

    const newBlacklist = [...settings.ip_blacklist, ip]
    return updateSettings({ ip_blacklist: newBlacklist })
  }, [settings, updateSettings])

  // Remove IP from blacklist
  const removeFromBlacklist = useCallback(async (ip: string) => {
    if (!settings) return { success: false, error: 'Settings not loaded' }

    const newBlacklist = settings.ip_blacklist.filter(i => i !== ip)
    return updateSettings({ ip_blacklist: newBlacklist })
  }, [settings, updateSettings])

  // Update password policy
  const updatePasswordPolicy = useCallback(async (policy: {
    minLength?: number
    requireUppercase?: boolean
    requireNumbers?: boolean
    requireSpecial?: boolean
    expiryDays?: number
  }) => {
    return updateSettings({
      password_min_length: policy.minLength,
      password_require_uppercase: policy.requireUppercase,
      password_require_numbers: policy.requireNumbers,
      password_require_special: policy.requireSpecial,
      password_expiry_days: policy.expiryDays
    })
  }, [updateSettings])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('security-settings-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'security_settings' },
        (payload) => {
          if (settings && payload.new.id === settings.id) {
            setSettings(payload.new as SecuritySettings)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, settings])

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    enable2FA,
    disable2FA,
    enableBiometric,
    disableBiometric,
    updateIPWhitelist,
    addToBlacklist,
    removeFromBlacklist,
    updatePasswordPolicy
  }
}

// =====================================================
// SECURITY EVENTS HOOK
// =====================================================

export function useSecurityEvents(initialEvents: SecurityEvent[] = [], initialStats?: SecurityStats) {
  const [events, setEvents] = useState<SecurityEvent[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<SecurityStats>(initialStats || {
    securityScore: 0,
    totalEvents: 0,
    unresolvedEvents: 0,
    activeSessions: 0,
    blockedAttempts: 0,
    twoFactorEnabled: false,
    criticalEvents: 0
  })

  const supabase = createClientComponentClient()

  // Calculate stats
  const calculateStats = useCallback((eventsList: SecurityEvent[]): Partial<SecurityStats> => {
    return {
      totalEvents: eventsList.length,
      unresolvedEvents: eventsList.filter(e => !e.is_resolved).length,
      blockedAttempts: eventsList.filter(e => e.is_blocked).length,
      criticalEvents: eventsList.filter(e => e.severity === 'critical').length
    }
  }, [])

  // Fetch events
  const fetchEvents = useCallback(async (limit = 100) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError

      const eventsList = data || []
      setEvents(eventsList)
      setStats(prev => ({ ...prev, ...calculateStats(eventsList) }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security events')
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Resolve event
  const resolveEvent = useCallback(async (id: string, notes?: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: updateError } = await supabase
        .from('security_events')
        .update({
          is_resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setEvents(prev => {
        const updated = prev.map(e => e.id === id ? data : e)
        setStats(s => ({ ...s, ...calculateStats(updated) }))
        return updated
      })

      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve event'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Block IP from event
  const blockIPFromEvent = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const event = events.find(e => e.id === id)
      if (!event?.ip_address) throw new Error('No IP address to block')

      const { data, error: updateError } = await supabase
        .from('security_events')
        .update({ is_blocked: true })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setEvents(prev => {
        const updated = prev.map(e => e.id === id ? data : e)
        setStats(s => ({ ...s, ...calculateStats(updated) }))
        return updated
      })

      return { success: true, data, ip: event.ip_address }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to block IP'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, events, calculateStats])

  // Get events by severity
  const getEventsBySeverity = useCallback((severity: SecurityEvent['severity']) => {
    return events.filter(e => e.severity === severity)
  }, [events])

  // Get unresolved events
  const getUnresolvedEvents = useCallback(() => {
    return events.filter(e => !e.is_resolved)
  }, [events])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('security-events-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'security_events' },
        (payload) => {
          setEvents(prev => {
            const updated = [payload.new as SecurityEvent, ...prev]
            setStats(s => ({ ...s, ...calculateStats(updated) }))
            return updated
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, calculateStats])

  return {
    events,
    loading,
    error,
    stats,
    fetchEvents,
    resolveEvent,
    blockIPFromEvent,
    getEventsBySeverity,
    getUnresolvedEvents
  }
}

// =====================================================
// USER SESSIONS HOOK
// =====================================================

export function useUserSessions(initialSessions: UserSession[] = []) {
  const [sessions, setSessions] = useState<UserSession[]>(initialSessions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_active_at', { ascending: false })

      if (fetchError) throw fetchError

      setSessions(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Terminate session
  const terminateSession = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setSessions(prev => prev.filter(s => s.id !== id))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to terminate session'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Terminate all sessions except current
  const terminateAllOtherSessions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: deleteError } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('is_current', false)

      if (deleteError) throw deleteError

      setSessions(prev => prev.filter(s => s.is_current))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to terminate sessions'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Get current session
  const getCurrentSession = useCallback(() => {
    return sessions.find(s => s.is_current)
  }, [sessions])

  // Get active sessions count
  const getActiveCount = useCallback(() => {
    return sessions.filter(s => s.is_active).length
  }, [sessions])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('user-sessions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_sessions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSessions(prev => [payload.new as UserSession, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setSessions(prev => prev.map(s => s.id === payload.new.id ? payload.new as UserSession : s))
          } else if (payload.eventType === 'DELETE') {
            setSessions(prev => prev.filter(s => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    terminateSession,
    terminateAllOtherSessions,
    getCurrentSession,
    getActiveCount
  }
}

// =====================================================
// COMBINED SECURITY HOOK
// =====================================================

export function useSecurity(initialSettings?: SecuritySettings, initialEvents: SecurityEvent[] = [], initialSessions: UserSession[] = []) {
  const settingsHook = useSecuritySettings(initialSettings)
  const eventsHook = useSecurityEvents(initialEvents)
  const sessionsHook = useUserSessions(initialSessions)

  const loading = settingsHook.loading || eventsHook.loading || sessionsHook.loading
  const error = settingsHook.error || eventsHook.error || sessionsHook.error

  const stats: SecurityStats = {
    securityScore: settingsHook.settings?.security_score || 0,
    totalEvents: eventsHook.stats.totalEvents,
    unresolvedEvents: eventsHook.stats.unresolvedEvents,
    activeSessions: sessionsHook.getActiveCount(),
    blockedAttempts: eventsHook.stats.blockedAttempts,
    twoFactorEnabled: settingsHook.settings?.two_factor_enabled || false,
    criticalEvents: eventsHook.stats.criticalEvents
  }

  return {
    // Settings
    settings: settingsHook.settings,
    updateSettings: settingsHook.updateSettings,
    enable2FA: settingsHook.enable2FA,
    disable2FA: settingsHook.disable2FA,
    enableBiometric: settingsHook.enableBiometric,
    disableBiometric: settingsHook.disableBiometric,
    updateIPWhitelist: settingsHook.updateIPWhitelist,
    addToBlacklist: settingsHook.addToBlacklist,
    removeFromBlacklist: settingsHook.removeFromBlacklist,
    updatePasswordPolicy: settingsHook.updatePasswordPolicy,
    fetchSettings: settingsHook.fetchSettings,

    // Events
    events: eventsHook.events,
    resolveEvent: eventsHook.resolveEvent,
    blockIPFromEvent: eventsHook.blockIPFromEvent,
    getEventsBySeverity: eventsHook.getEventsBySeverity,
    getUnresolvedEvents: eventsHook.getUnresolvedEvents,
    fetchEvents: eventsHook.fetchEvents,

    // Sessions
    sessions: sessionsHook.sessions,
    terminateSession: sessionsHook.terminateSession,
    terminateAllOtherSessions: sessionsHook.terminateAllOtherSessions,
    getCurrentSession: sessionsHook.getCurrentSession,
    fetchSessions: sessionsHook.fetchSessions,

    // Combined
    loading,
    error,
    stats
  }
}
