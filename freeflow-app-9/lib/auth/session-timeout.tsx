/**
 * Session Timeout Manager
 * Implements auto-logout after period of inactivity
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Default timeout: 30 minutes (in milliseconds)
const DEFAULT_TIMEOUT = 30 * 60 * 1000

// Warning before logout: 2 minutes
const WARNING_TIME = 2 * 60 * 1000

export interface SessionTimeoutConfig {
  timeout?: number // Timeout in milliseconds
  warningTime?: number // Time before timeout to show warning
  onWarning?: () => void // Callback when warning is triggered
  onTimeout?: () => void // Callback when timeout occurs
  enabled?: boolean // Enable/disable timeout
}

/**
 * Hook to manage session timeout with auto-logout
 */
export function useSessionTimeout(config: SessionTimeoutConfig = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    warningTime = WARNING_TIME,
    onWarning,
    onTimeout,
    enabled = true,
  } = config

  const router = useRouter()
  const supabase = createClient()

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear Supabase session
      await supabase.auth.signOut()

      // Clear localStorage
      localStorage.removeItem('kazi-auth')
      localStorage.removeItem('kazi-user')

      // Show toast
      toast.info('Session expired', {
        description: 'You have been logged out due to inactivity',
        duration: 5000,
      })

      // Redirect to login
      router.push('/login?reason=timeout')

      // Call custom callback
      onTimeout?.()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [router, supabase, onTimeout])

  // Show warning
  const showWarning = useCallback(() => {
    toast.warning('Session expiring soon', {
      description: `Your session will expire in ${Math.floor(warningTime / 1000 / 60)} minutes due to inactivity. Move your mouse or press a key to stay logged in.`,
      duration: warningTime,
      action: {
        label: 'Stay logged in',
        onClick: () => {
          // Reset timers when user clicks
          resetTimers()
        },
      },
    })

    onWarning?.()
  }, [warningTime, onWarning])

  // Reset timers
  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current)
    }

    // Update last activity time
    lastActivityRef.current = Date.now()

    // Set warning timer
    warningRef.current = setTimeout(() => {
      showWarning()
    }, timeout - warningTime)

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      logout()
    }, timeout)
  }, [timeout, warningTime, showWarning, logout])

  // Activity handler
  const handleActivity = useCallback(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current

    // Only reset if enough time has passed (throttle)
    if (timeSinceLastActivity > 1000) {
      resetTimers()
    }
  }, [resetTimers])

  useEffect(() => {
    if (!enabled) return

    // Initial setup
    resetTimers()

    // Activity events to monitor
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current)
      }
    }
  }, [enabled, handleActivity, resetTimers])

  return {
    resetTimers,
    logout,
    lastActivity: lastActivityRef.current,
  }
}

/**
 * Session timeout component (add to layout)
 */
export function SessionTimeoutProvider({
  children,
  config = {},
}: {
  children: React.ReactNode
  config?: SessionTimeoutConfig
}) {
  useSessionTimeout(config)

  return <>{children}</>
}

/**
 * Get session timeout settings from localStorage
 */
export function getSessionTimeoutSettings(): SessionTimeoutConfig {
  if (typeof window === 'undefined') {
    return { enabled: true }
  }

  try {
    const settings = localStorage.getItem('kazi-session-timeout')
    if (settings) {
      return JSON.parse(settings)
    }
  } catch (error) {
    console.error('Failed to get session timeout settings:', error)
  }

  return { enabled: true }
}

/**
 * Save session timeout settings to localStorage
 */
export function saveSessionTimeoutSettings(config: SessionTimeoutConfig) {
  try {
    localStorage.setItem('kazi-session-timeout', JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save session timeout settings:', error)
  }
}

/**
 * Calculate time until session expires
 */
export function getTimeUntilExpiry(
  lastActivity: number,
  timeout: number = DEFAULT_TIMEOUT
): number {
  const now = Date.now()
  const elapsed = now - lastActivity
  const remaining = timeout - elapsed

  return Math.max(0, remaining)
}

/**
 * Format remaining time as human-readable string
 */
export function formatTimeRemaining(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 1000 / 60)
  const seconds = Math.floor((milliseconds / 1000) % 60)

  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  return `${seconds} second${seconds !== 1 ? 's' : ''}`
}
