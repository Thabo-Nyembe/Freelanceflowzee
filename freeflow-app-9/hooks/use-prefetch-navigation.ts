/**
 * Prefetch Navigation Hook
 *
 * React hook for prefetching data on navigation link hover/focus
 * Improves perceived performance by loading data before navigation
 *
 * Usage:
 * ```tsx
 * import { usePrefetchNavigation } from '@/hooks/use-prefetch-navigation'
 *
 * function NavLink({ href, children }) {
 *   const prefetchProps = usePrefetchNavigation(href)
 *   return <Link href={href} {...prefetchProps}>{children}</Link>
 * }
 * ```
 */

'use client'

import { useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { prefetchForRoute, prefetchDashboardData, prefetchCommonData } from '@/lib/query-prefetch'

export interface PrefetchNavigationOptions {
  /** Delay before prefetching starts (ms) */
  delay?: number
  /** Whether to prefetch on focus as well as hover */
  prefetchOnFocus?: boolean
}

/**
 * Hook for prefetching data when hovering over navigation links
 */
export function usePrefetchNavigation(
  route: string,
  options: PrefetchNavigationOptions = {}
) {
  const { delay = 100, prefetchOnFocus = true } = options
  const queryClient = useQueryClient()
  const prefetched = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const doPrefetch = useCallback(async () => {
    if (prefetched.current) return
    prefetched.current = true

    try {
      await prefetchForRoute(route, queryClient)
    } catch (error) {
      // Silently fail prefetching - it's just an optimization
      console.debug(`Prefetch failed for ${route}:`, error)
      prefetched.current = false // Allow retry
    }
  }, [route, queryClient])

  const handleMouseEnter = useCallback(() => {
    if (prefetched.current) return

    // Add small delay to avoid unnecessary prefetches on quick mouse movements
    timeoutRef.current = setTimeout(doPrefetch, delay)
  }, [doPrefetch, delay])

  const handleMouseLeave = useCallback(() => {
    // Cancel pending prefetch if user moves away quickly
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleFocus = useCallback(() => {
    if (prefetchOnFocus && !prefetched.current) {
      doPrefetch()
    }
  }, [doPrefetch, prefetchOnFocus])

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
  }
}

/**
 * Hook for prefetching dashboard data on initial load
 * Use this in the dashboard layout to prefetch common data in the background
 */
export function usePrefetchDashboard() {
  const queryClient = useQueryClient()
  const prefetched = useRef(false)

  const prefetch = useCallback(async () => {
    if (prefetched.current) return
    prefetched.current = true

    try {
      await prefetchDashboardData(queryClient)
    } catch (error) {
      console.debug('Dashboard prefetch failed:', error)
      prefetched.current = false
    }
  }, [queryClient])

  return { prefetch }
}

/**
 * Hook for prefetching common data in the background
 * Use this after initial page load to warm the cache
 */
export function usePrefetchCommon() {
  const queryClient = useQueryClient()
  const prefetched = useRef(false)

  const prefetch = useCallback(() => {
    if (prefetched.current) return
    prefetched.current = true

    // Use idle callback for non-critical prefetching
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(
        async () => {
          try {
            await prefetchCommonData(queryClient)
          } catch (error) {
            console.debug('Common data prefetch failed:', error)
            prefetched.current = false
          }
        },
        { timeout: 5000 }
      )
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(async () => {
        try {
          await prefetchCommonData(queryClient)
        } catch (error) {
          console.debug('Common data prefetch failed:', error)
          prefetched.current = false
        }
      }, 2000)
    }
  }, [queryClient])

  return { prefetch }
}

/**
 * Hook for manually triggering prefetch for multiple routes
 */
export function useBatchPrefetch() {
  const queryClient = useQueryClient()

  const prefetchRoutes = useCallback(
    async (routes: string[]) => {
      await Promise.allSettled(
        routes.map((route) => prefetchForRoute(route, queryClient))
      )
    },
    [queryClient]
  )

  return { prefetchRoutes }
}
