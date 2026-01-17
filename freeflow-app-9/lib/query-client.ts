/**
 * TanStack Query Client Configuration
 *
 * Implements optimal caching strategy with tiered stale times:
 * - Static data (categories, types): staleTime: Infinity
 * - User data (projects, tasks): staleTime: 5 minutes
 * - Real-time data (messages, notifications): staleTime: 0
 *
 * Features:
 * - Centralized QueryClient factory
 * - Query key constants for consistency
 * - Prefetching utilities
 * - Invalidation patterns
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// Stale Time Constants
// ============================================================================

export const STALE_TIMES = {
  /** Static data that rarely changes (categories, types, settings) */
  STATIC: Infinity,

  /** User data that changes occasionally (projects, clients, tasks) */
  USER_DATA: 5 * 60 * 1000, // 5 minutes

  /** Analytics and stats that should be relatively fresh */
  ANALYTICS: 2 * 60 * 1000, // 2 minutes

  /** Data that should be fresh but doesn't need instant updates */
  SEMI_FRESH: 1 * 60 * 1000, // 1 minute

  /** Real-time data that always needs to be fresh (messages, notifications) */
  REALTIME: 0,
} as const

export const CACHE_TIMES = {
  /** Long-lived cache for static data */
  STATIC: 24 * 60 * 60 * 1000, // 24 hours

  /** Standard cache time for user data */
  USER_DATA: 30 * 60 * 1000, // 30 minutes

  /** Shorter cache for frequently changing data */
  FREQUENT: 10 * 60 * 1000, // 10 minutes

  /** Minimal cache for real-time data */
  REALTIME: 5 * 60 * 1000, // 5 minutes (keep for back navigation)
} as const

// ============================================================================
// Query Keys
// ============================================================================

export const queryKeys = {
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (page: number, pageSize: number, filters?: unknown) =>
      [...queryKeys.projects.lists(), page, pageSize, filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    stats: () => [...queryKeys.projects.all, 'stats'] as const,
  },

  // Clients
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (page: number, pageSize: number, filters?: unknown) =>
      [...queryKeys.clients.lists(), page, pageSize, filters] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
    stats: () => [...queryKeys.clients.all, 'stats'] as const,
  },

  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (page: number, pageSize: number, filters?: unknown) =>
      [...queryKeys.tasks.lists(), page, pageSize, filters] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
    stats: () => [...queryKeys.tasks.all, 'stats'] as const,
  },

  // Invoices
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (page: number, pageSize: number, filters?: unknown) =>
      [...queryKeys.invoices.lists(), page, pageSize, filters] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
    stats: () => [...queryKeys.invoices.all, 'stats'] as const,
  },

  // Messages (Real-time)
  messages: {
    all: ['messages'] as const,
    conversations: () => [...queryKeys.messages.all, 'conversations'] as const,
    conversation: (id: string) => [...queryKeys.messages.conversations(), id] as const,
    list: (conversationId: string, page: number, pageSize: number) =>
      [...queryKeys.messages.all, 'list', conversationId, page, pageSize] as const,
    stats: () => [...queryKeys.messages.all, 'stats'] as const,
  },

  // Notifications (Real-time)
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (page: number, pageSize: number, filters?: unknown) =>
      [...queryKeys.notifications.lists(), page, pageSize, filters] as const,
    details: () => [...queryKeys.notifications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.notifications.details(), id] as const,
    stats: () => [...queryKeys.notifications.all, 'stats'] as const,
    preferences: () => [...queryKeys.notifications.all, 'preferences'] as const,
  },

  // Calendar
  calendar: {
    all: ['calendar'] as const,
    events: () => [...queryKeys.calendar.all, 'events'] as const,
    event: (id: string) => [...queryKeys.calendar.events(), id] as const,
    bookings: () => [...queryKeys.calendar.all, 'bookings'] as const,
    stats: () => [...queryKeys.calendar.all, 'stats'] as const,
  },

  // Files
  files: {
    all: ['files'] as const,
    lists: () => [...queryKeys.files.all, 'list'] as const,
    list: (page: number, pageSize: number, filters?: unknown) =>
      [...queryKeys.files.lists(), page, pageSize, filters] as const,
    details: () => [...queryKeys.files.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.files.details(), id] as const,
    folders: () => [...queryKeys.files.all, 'folders'] as const,
    stats: () => [...queryKeys.files.all, 'stats'] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: (startDate?: string, endDate?: string) =>
      [...queryKeys.analytics.all, 'dashboard', startDate, endDate] as const,
    revenue: (startDate?: string, endDate?: string) =>
      [...queryKeys.analytics.all, 'revenue', startDate, endDate] as const,
    engagement: () => [...queryKeys.analytics.all, 'engagement'] as const,
    performance: () => [...queryKeys.analytics.all, 'performance'] as const,
    insights: () => [...queryKeys.analytics.all, 'insights'] as const,
  },

  // Static Data (Categories, Types, etc.)
  static: {
    all: ['static'] as const,
    categories: () => [...queryKeys.static.all, 'categories'] as const,
    projectTypes: () => [...queryKeys.static.all, 'project-types'] as const,
    invoiceTemplates: () => [...queryKeys.static.all, 'invoice-templates'] as const,
    currencies: () => [...queryKeys.static.all, 'currencies'] as const,
    timezones: () => [...queryKeys.static.all, 'timezones'] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: (id: string) => [...queryKeys.user.all, 'profile', id] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
  },
} as const

// ============================================================================
// Query Client Factory
// ============================================================================

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show error toast for user-initiated queries (not background refetches)
        if (query.state.data !== undefined) {
          toast.error(`Something went wrong: ${(error as Error).message}`)
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(`Operation failed: ${(error as Error).message}`)
      },
    }),
    defaultOptions: {
      queries: {
        // Default stale time for most queries (user data)
        staleTime: STALE_TIMES.USER_DATA,

        // Keep unused data in cache for 10 minutes
        gcTime: CACHE_TIMES.FREQUENT,

        // Don't refetch on window focus by default (can be overridden per query)
        refetchOnWindowFocus: false,

        // Only retry once on failure
        retry: 1,

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Don't refetch on mount if data is fresh
        refetchOnMount: false,

        // Keep previous data while refetching
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  })
}

// ============================================================================
// Query Options Presets
// ============================================================================

/**
 * Query options for static data that rarely changes
 */
export const staticQueryOptions = {
  staleTime: STALE_TIMES.STATIC,
  gcTime: CACHE_TIMES.STATIC,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const

/**
 * Query options for user data that changes occasionally
 */
export const userDataQueryOptions = {
  staleTime: STALE_TIMES.USER_DATA,
  gcTime: CACHE_TIMES.USER_DATA,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
} as const

/**
 * Query options for real-time data that needs to be fresh
 */
export const realtimeQueryOptions = {
  staleTime: STALE_TIMES.REALTIME,
  gcTime: CACHE_TIMES.REALTIME,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const

/**
 * Query options for analytics data
 */
export const analyticsQueryOptions = {
  staleTime: STALE_TIMES.ANALYTICS,
  gcTime: CACHE_TIMES.FREQUENT,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
} as const

// ============================================================================
// Invalidation Patterns
// ============================================================================

export const invalidationPatterns = {
  /**
   * Invalidate all project-related queries
   */
  projects: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard() })
  },

  /**
   * Invalidate all client-related queries
   */
  clients: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard() })
  },

  /**
   * Invalidate all task-related queries
   */
  tasks: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard() })
  },

  /**
   * Invalidate all invoice-related queries
   */
  invoices: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.revenue() })
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.stats() })
  },

  /**
   * Invalidate all messaging queries
   */
  messages: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.stats() })
  },

  /**
   * Invalidate all notification queries
   */
  notifications: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
  },

  /**
   * Invalidate all calendar queries
   */
  calendar: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all })
  },

  /**
   * Invalidate all file queries
   */
  files: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.files.all })
  },

  /**
   * Invalidate all analytics queries
   */
  analytics: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
  },

  /**
   * Invalidate everything (use sparingly)
   */
  all: (queryClient: QueryClient) => {
    queryClient.invalidateQueries()
  },
} as const

// ============================================================================
// Singleton Instance (for SSR/SSG)
// ============================================================================

let browserQueryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
  // Server: always create a new QueryClient
  if (typeof window === 'undefined') {
    return createQueryClient()
  }

  // Browser: use singleton pattern
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient()
  }
  return browserQueryClient
}
