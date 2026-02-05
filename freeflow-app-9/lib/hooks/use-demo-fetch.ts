'use client'

import { useCallback, useMemo } from 'react'

/**
 * Check if demo mode is currently enabled
 */
export function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false

  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true

  // Check cookie
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }

  return false
}

/**
 * Demo user constants
 */
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
export const DEMO_USER_EMAIL = 'demo@kazi.app'
export const DEMO_USER_NAME = 'Demo User'

/**
 * Hook that provides demo-aware fetch functionality
 */
export function useDemoFetch() {
  const isDemo = useMemo(() => isDemoModeEnabled(), [])

  const demoFetch = useCallback(async (url: string, options?: RequestInit): Promise<Response> => {
    if (isDemo) {
      // Add demo=true to URL
      const separator = url.includes('?') ? '&' : '?'
      url = `${url}${separator}demo=true`

      // Add demo header
      options = {
        ...options,
        headers: {
          ...options?.headers,
          'X-Demo-Mode': 'true'
        }
      }
    }

    return fetch(url, options)
  }, [isDemo])

  return {
    isDemo,
    demoFetch,
    demoUserId: isDemo ? DEMO_USER_ID : null
  }
}

/**
 * Hook that returns the effective user ID (demo user if in demo mode)
 */
export function useDemoUserId(): string | null {
  const isDemo = isDemoModeEnabled()
  return isDemo ? DEMO_USER_ID : null
}
