/**
 * Query Prefetching Utilities
 *
 * Provides prefetching capabilities for dashboard navigation
 * to improve perceived performance by loading data before navigation.
 *
 * Usage:
 * - Call prefetch functions on hover/focus of navigation links
 * - Use in layouts to prefetch common data
 * - Integrate with router events for route-based prefetching
 */

import { QueryClient } from '@tanstack/react-query'
import { queryKeys, STALE_TIMES, getQueryClient } from './query-client'

// Import API clients for prefetching
import { projectsClient } from './api-clients/projects-client'
import { clientsClient } from './api-clients/clients-client'
import { tasksClient } from './api-clients/tasks-client'
import { invoicesClient } from './api-clients/invoices-client'
import { messagesClient } from './api-clients/messages-client'
import { notificationsClient } from './api-clients/notifications-client'
import { analyticsClient } from './api-clients/analytics-client'
import { filesClient } from './api-clients/files-client'
import { calendarClient } from './api-clients/calendar-client'

// ============================================================================
// Prefetch Functions
// ============================================================================

/**
 * Prefetch projects list data
 */
export async function prefetchProjects(
  queryClient?: QueryClient,
  page = 1,
  pageSize = 10
): Promise<void> {
  const client = queryClient || getQueryClient()

  await client.prefetchQuery({
    queryKey: ['projects', page, pageSize, undefined],
    queryFn: async () => {
      const response = await projectsClient.getProjects(page, pageSize)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch projects')
      }
      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
  })
}

/**
 * Prefetch project stats
 */
export async function prefetchProjectStats(queryClient?: QueryClient): Promise<void> {
  const client = queryClient || getQueryClient()

  await client.prefetchQuery({
    queryKey: queryKeys.projects.stats(),
    queryFn: async () => {
      const response = await projectsClient.getProjectStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch project stats')
      }
      return response.data
    },
    staleTime: STALE_TIMES.ANALYTICS,
  })
}

/**
 * Prefetch clients list data
 */
export async function prefetchClients(
  queryClient?: QueryClient,
  page = 1,
  pageSize = 10
): Promise<void> {
  const client = queryClient || getQueryClient()

  await client.prefetchQuery({
    queryKey: ['clients', page, pageSize, undefined],
    queryFn: async () => {
      const response = await clientsClient.getClients(page, pageSize)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch clients')
      }
      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
  })
}

/**
 * Prefetch tasks list data
 */
export async function prefetchTasks(
  queryClient?: QueryClient,
  page = 1,
  pageSize = 10
): Promise<void> {
  const client = queryClient || getQueryClient()

  await client.prefetchQuery({
    queryKey: ['tasks', page, pageSize, undefined],
    queryFn: async () => {
      const response = await tasksClient.getTasks(page, pageSize)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch tasks')
      }
      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
  })
}

/**
 * Prefetch invoices list data
 */
export async function prefetchInvoices(
  queryClient?: QueryClient,
  page = 1,
  pageSize = 10
): Promise<void> {
  const client = queryClient || getQueryClient()

  await client.prefetchQuery({
    queryKey: ['invoices', page, pageSize, undefined],
    queryFn: async () => {
      const response = await invoicesClient.getInvoices(page, pageSize)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch invoices')
      }
      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
  })
}

/**
 * Prefetch notifications
 */
export async function prefetchNotifications(
  queryClient?: QueryClient,
  page = 1,
  pageSize = 20
): Promise<void> {
  const client = queryClient || getQueryClient()

  await client.prefetchQuery({
    queryKey: ['notifications', page, pageSize, undefined],
    queryFn: async () => {
      const response = await notificationsClient.getNotifications(page, pageSize)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch notifications')
      }
      return response.data
    },
    staleTime: STALE_TIMES.REALTIME,
  })
}

/**
 * Prefetch notification stats
 */
export async function prefetchNotificationStats(queryClient?: QueryClient): Promise<void> {
  const client = queryClient || getQueryClient()

  await client.prefetchQuery({
    queryKey: queryKeys.notifications.stats(),
    queryFn: async () => {
      const response = await notificationsClient.getStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch notification stats')
      }
      return response.data
    },
    staleTime: STALE_TIMES.SEMI_FRESH,
  })
}

/**
 * Prefetch conversations
 */
export async function prefetchConversations(
  queryClient?: QueryClient,
  page = 1,
  pageSize = 20
): Promise<void> {
  const client = queryClient || getQueryClient()

  await client.prefetchQuery({
    queryKey: ['conversations', page, pageSize, undefined],
    queryFn: async () => {
      const response = await messagesClient.getConversations(page, pageSize)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch conversations')
      }
      return response.data
    },
    staleTime: STALE_TIMES.REALTIME,
  })
}

/**
 * Prefetch dashboard metrics
 */
export async function prefetchDashboardMetrics(queryClient?: QueryClient): Promise<void> {
  const client = queryClient || getQueryClient()

  await client.prefetchQuery({
    queryKey: queryKeys.analytics.dashboard(),
    queryFn: async () => {
      const response = await analyticsClient.getDashboardMetrics()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch dashboard metrics')
      }
      return response.data
    },
    staleTime: STALE_TIMES.ANALYTICS,
  })
}

/**
 * Prefetch files list
 */
export async function prefetchFiles(
  queryClient?: QueryClient,
  page = 1,
  pageSize = 20
): Promise<void> {
  const client = queryClient || getQueryClient()

  await client.prefetchQuery({
    queryKey: ['files', page, pageSize, undefined],
    queryFn: async () => {
      const response = await filesClient.getFiles(page, pageSize)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch files')
      }
      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
  })
}

/**
 * Prefetch calendar events for the current month
 */
export async function prefetchCalendarEvents(queryClient?: QueryClient): Promise<void> {
  const client = queryClient || getQueryClient()

  // Get current month's date range
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  await client.prefetchQuery({
    queryKey: queryKeys.calendar.events(),
    queryFn: async () => {
      const response = await calendarClient.getEvents(startDate, endDate)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch calendar events')
      }
      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
  })
}

// ============================================================================
// Route-Based Prefetching
// ============================================================================

/**
 * Map of routes to their prefetch functions
 */
const routePrefetchMap: Record<string, (queryClient?: QueryClient) => Promise<void>> = {
  '/dashboard': prefetchDashboardData,
  '/dashboard/projects': prefetchProjects,
  '/dashboard/projects-hub': prefetchProjects,
  '/dashboard/clients': prefetchClients,
  '/dashboard/tasks': prefetchTasks,
  '/dashboard/invoices': prefetchInvoices,
  '/dashboard/invoicing': prefetchInvoices,
  '/dashboard/messages': prefetchConversations,
  '/dashboard/messaging': prefetchConversations,
  '/dashboard/notifications': prefetchNotifications,
  '/dashboard/files': prefetchFiles,
  '/dashboard/files-hub': prefetchFiles,
  '/dashboard/calendar': prefetchCalendarEvents,
  '/v1/dashboard': prefetchDashboardData,
  '/v1/dashboard/projects-hub': prefetchProjects,
  '/v2/dashboard': prefetchDashboardData,
}

/**
 * Prefetch data for dashboard homepage
 * Loads essential data that will be needed immediately
 */
export async function prefetchDashboardData(queryClient?: QueryClient): Promise<void> {
  const client = queryClient || getQueryClient()

  // Prefetch in parallel for better performance
  await Promise.allSettled([
    prefetchDashboardMetrics(client),
    prefetchProjectStats(client),
    prefetchNotificationStats(client),
    prefetchProjects(client, 1, 5), // Just first 5 for dashboard summary
    prefetchTasks(client, 1, 5), // Just first 5 for dashboard summary
  ])
}

/**
 * Prefetch data based on route
 */
export async function prefetchForRoute(
  route: string,
  queryClient?: QueryClient
): Promise<void> {
  const prefetchFn = routePrefetchMap[route]
  if (prefetchFn) {
    await prefetchFn(queryClient)
  }
}

// ============================================================================
// Hover Prefetching Hook Utility
// ============================================================================

/**
 * Creates hover handlers for prefetching
 * Use with navigation links to prefetch on hover
 *
 * @example
 * ```tsx
 * const prefetchHandlers = createPrefetchHandlers('/dashboard/projects')
 * <Link href="/dashboard/projects" {...prefetchHandlers}>Projects</Link>
 * ```
 */
export function createPrefetchHandlers(route: string, queryClient?: QueryClient) {
  let prefetched = false

  return {
    onMouseEnter: () => {
      if (!prefetched) {
        prefetched = true
        prefetchForRoute(route, queryClient)
      }
    },
    onFocus: () => {
      if (!prefetched) {
        prefetched = true
        prefetchForRoute(route, queryClient)
      }
    },
  }
}

// ============================================================================
// Background Prefetching
// ============================================================================

/**
 * Prefetch common data in the background after initial page load
 * Call this after the main dashboard renders
 */
export async function prefetchCommonData(queryClient?: QueryClient): Promise<void> {
  const client = queryClient || getQueryClient()

  // Use requestIdleCallback for non-critical prefetching
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(
      async () => {
        await Promise.allSettled([
          prefetchProjects(client),
          prefetchClients(client),
          prefetchTasks(client),
        ])
      },
      { timeout: 5000 }
    )
  }
}

// ============================================================================
// Type Definitions
// ============================================================================

declare global {
  interface Window {
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number
  }
}

export type PrefetchFunction = (queryClient?: QueryClient) => Promise<void>
