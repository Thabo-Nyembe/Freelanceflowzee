/**
 * React Hook for Security Settings
 *
 * Uses Supabase 2025 Security Email Templates
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getSecurityPreferences,
  updateSecurityPreferences,
  getKnownDevices,
  updateDeviceTrust,
  removeKnownDevice,
  getSecurityEvents,
  acknowledgeSecurityEvent,
  type SecurityPreferences,
  type KnownDevice,
  type SecurityEvent,
  type SecurityEventType,
} from '@/lib/supabase/security-emails'

// ============================================
// SECURITY PREFERENCES HOOK
// ============================================

export interface UseSecurityPreferencesReturn {
  preferences: SecurityPreferences | null
  isLoading: boolean
  error: string | null
  updatePreference: <K extends keyof SecurityPreferences>(
    key: K,
    value: SecurityPreferences[K]
  ) => Promise<void>
  updatePreferences: (prefs: Partial<SecurityPreferences>) => Promise<void>
  refresh: () => Promise<void>
}

export function useSecurityPreferences(userId?: string): UseSecurityPreferencesReturn {
  const [preferences, setPreferences] = useState<SecurityPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPreferences = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getSecurityPreferences(userId)
      setPreferences(
        data || {
          notifyPasswordChange: true,
          notifyEmailChange: true,
          notifyPhoneChange: true,
          notifyMfaChange: true,
          notifyNewDevice: true,
          notifySuspiciousActivity: true,
          notifyIdentityChanges: true,
          requireMfaForSensitive: false,
          sessionTimeoutMinutes: 60,
          maxSessions: 5,
        }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const updatePreference = useCallback(
    async <K extends keyof SecurityPreferences>(
      key: K,
      value: SecurityPreferences[K]
    ) => {
      if (!userId) return

      // Optimistic update
      setPreferences(prev => (prev ? { ...prev, [key]: value } : null))

      try {
        await updateSecurityPreferences(userId, { [key]: value })
      } catch (err) {
        // Revert on error
        await fetchPreferences()
        throw err
      }
    },
    [userId, fetchPreferences]
  )

  const updatePrefs = useCallback(
    async (prefs: Partial<SecurityPreferences>) => {
      if (!userId) return

      // Optimistic update
      setPreferences(prev => (prev ? { ...prev, ...prefs } : null))

      try {
        await updateSecurityPreferences(userId, prefs)
      } catch (err) {
        // Revert on error
        await fetchPreferences()
        throw err
      }
    },
    [userId, fetchPreferences]
  )

  return {
    preferences,
    isLoading,
    error,
    updatePreference,
    updatePreferences: updatePrefs,
    refresh: fetchPreferences,
  }
}

// ============================================
// KNOWN DEVICES HOOK
// ============================================

export interface UseKnownDevicesReturn {
  devices: KnownDevice[]
  isLoading: boolean
  error: string | null
  trustDevice: (deviceId: string) => Promise<void>
  blockDevice: (deviceId: string) => Promise<void>
  removeDevice: (deviceId: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useKnownDevices(userId?: string): UseKnownDevicesReturn {
  const [devices, setDevices] = useState<KnownDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getKnownDevices(userId)
      setDevices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const trustDevice = useCallback(
    async (deviceId: string) => {
      // Optimistic update
      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId ? { ...d, isTrusted: true, trustLevel: 'trusted' as const } : d
        )
      )

      try {
        await updateDeviceTrust(deviceId, 'trusted')
      } catch (err) {
        await fetchDevices()
        throw err
      }
    },
    [fetchDevices]
  )

  const blockDevice = useCallback(
    async (deviceId: string) => {
      // Optimistic update
      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId ? { ...d, isTrusted: false, trustLevel: 'blocked' as const } : d
        )
      )

      try {
        await updateDeviceTrust(deviceId, 'blocked')
      } catch (err) {
        await fetchDevices()
        throw err
      }
    },
    [fetchDevices]
  )

  const removeDeviceHandler = useCallback(
    async (deviceId: string) => {
      // Optimistic update
      setDevices(prev => prev.filter(d => d.id !== deviceId))

      try {
        await removeKnownDevice(deviceId)
      } catch (err) {
        await fetchDevices()
        throw err
      }
    },
    [fetchDevices]
  )

  return {
    devices,
    isLoading,
    error,
    trustDevice,
    blockDevice,
    removeDevice: removeDeviceHandler,
    refresh: fetchDevices,
  }
}

// ============================================
// SECURITY EVENTS HOOK
// ============================================

export interface UseSecurityEventsReturn {
  events: SecurityEvent[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  acknowledge: (eventId: string) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export function useSecurityEvents(
  userId?: string,
  options: {
    limit?: number
    eventTypes?: SecurityEventType[]
  } = {}
): UseSecurityEventsReturn {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const { limit = 20, eventTypes } = options

  const fetchEvents = useCallback(
    async (reset = false) => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      const currentOffset = reset ? 0 : offset

      try {
        const data = await getSecurityEvents(userId, {
          limit,
          offset: currentOffset,
          eventTypes,
        })

        if (reset) {
          setEvents(data)
          setOffset(limit)
        } else {
          setEvents(prev => [...prev, ...data])
          setOffset(currentOffset + limit)
        }

        setHasMore(data.length === limit)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events')
      } finally {
        setIsLoading(false)
      }
    },
    [userId, limit, eventTypes, offset]
  )

  useEffect(() => {
    fetchEvents(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, eventTypes?.join(',')])

  const acknowledge = useCallback(
    async (eventId: string) => {
      // Optimistic update
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? { ...e, status: 'acknowledged' as const, acknowledgedAt: new Date().toISOString() }
            : e
        )
      )

      try {
        await acknowledgeSecurityEvent(eventId)
      } catch (err) {
        await fetchEvents(true)
        throw err
      }
    },
    [fetchEvents]
  )

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await fetchEvents(false)
  }, [hasMore, isLoading, fetchEvents])

  const refresh = useCallback(async () => {
    setOffset(0)
    await fetchEvents(true)
  }, [fetchEvents])

  return {
    events,
    isLoading,
    error,
    hasMore,
    acknowledge,
    loadMore,
    refresh,
  }
}

// ============================================
// COMBINED SECURITY HOOK
// ============================================

export function useSecuritySettings(userId?: string) {
  const preferences = useSecurityPreferences(userId)
  const devices = useKnownDevices(userId)
  const events = useSecurityEvents(userId)

  return {
    preferences,
    devices,
    events,
    isLoading: preferences.isLoading || devices.isLoading || events.isLoading,
  }
}
