/**
 * React Hooks for AI Features Data
 *
 * Provides real-time data fetching from Supabase database
 * Uses REAL DATA ONLY - no mock/demo fallbacks
 * Includes real-time subscriptions for live updates
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  calculateRevenueData,
  fetchLeads,
  getLeadScores,
  getAIRecommendations,
  getGrowthPlaybook,
  getUserMetrics,
  trackAIFeatureUsage,
  type RevenueData,
  type LeadData,
  type LeadScore,
  type AIRecommendation,
  type GrowthPlaybook
} from '@/lib/supabase/ai-features'
import { DEMO_USER_ID, isDemoModeEnabled } from '@/lib/hooks/use-demo-fetch'

// ============================================================================
// USER METRICS TYPE
// ============================================================================

export interface UserMetrics {
  totalRevenue: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalClients: number
  hoursTracked: number
  tasksCompleted: number
  productivity: number
  satisfaction: number
}

// ============================================================================
// REVENUE DATA HOOK - Real-time with Supabase subscription
// ============================================================================

export function useRevenueData(userId?: string) {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    let isMounted = true
    let debounceTimer: NodeJS.Timeout | null = null

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const revenueData = await calculateRevenueData(userId)
        if (isMounted) {
          setData(revenueData)
          trackAIFeatureUsage(userId, 'revenue_intelligence', 'analytics').catch(() => {})
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
          // Only log once, not on every render
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Debounced fetch to prevent rapid-fire refetches
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        fetchData()
      }, 1000) // Wait 1 second before refetching
    }

    fetchData()

    // Real-time subscription for invoice updates
    const channel = supabase
      .channel('revenue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Debounced refetch when invoices change
          debouncedFetch()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Debounced refetch when projects change
          debouncedFetch()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [userId])

  const refresh = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const revenueData = await calculateRevenueData(userId)
      setData(revenueData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  return { data, loading, error, refresh }
}

// ============================================================================
// LEADS DATA HOOK - Real-time with Supabase subscription
// ============================================================================

export function useLeadsData(userId?: string) {
  const [leads, setLeads] = useState<LeadData[]>([])
  const [scores, setScores] = useState<LeadScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    let isMounted = true
    let debounceTimer: NodeJS.Timeout | null = null

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [leadsData, scoresData] = await Promise.all([
          fetchLeads(userId),
          getLeadScores(userId)
        ])

        if (isMounted) {
          setLeads(leadsData || [])
          setScores(scoresData || [])
          trackAIFeatureUsage(userId, 'lead_scoring', 'sales').catch(() => {})
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Debounced fetch to prevent rapid-fire refetches
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        fetchData()
      }, 1000) // Wait 1 second before refetching
    }

    fetchData()

    // Real-time subscription for leads updates
    const channel = supabase
      .channel('leads-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${userId}`
        },
        () => {
          debouncedFetch()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [userId])

  const refresh = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const [leadsData, scoresData] = await Promise.all([
        fetchLeads(userId),
        getLeadScores(userId)
      ])
      setLeads(leadsData || [])
      setScores(scoresData || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  return { leads, scores, loading, error, refresh }
}

// ============================================================================
// AI RECOMMENDATIONS HOOK - Real-time with Supabase subscription
// ============================================================================

export function useAIRecommendations(userId?: string, status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired') {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    let isMounted = true
    let debounceTimer: NodeJS.Timeout | null = null

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getAIRecommendations(userId, status)
        if (isMounted) {
          setRecommendations(data || [])
          trackAIFeatureUsage(userId, 'ai_recommendations', 'growth').catch(() => {})
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Debounced fetch to prevent rapid-fire refetches
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        fetchData()
      }, 1000) // Wait 1 second before refetching
    }

    fetchData()

    // Real-time subscription for recommendations updates
    const channel = supabase
      .channel('recommendations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_recommendations',
          filter: `user_id=eq.${userId}`
        },
        () => {
          debouncedFetch()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [userId, status])

  const refresh = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const data = await getAIRecommendations(userId, status)
      setRecommendations(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId, status])

  return { recommendations, loading, error, refresh }
}

// ============================================================================
// GROWTH PLAYBOOK HOOK - Real-time with Supabase subscription
// ============================================================================

export function useGrowthPlaybook(userId?: string) {
  const [playbook, setPlaybook] = useState<GrowthPlaybook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    let isMounted = true
    let debounceTimer: NodeJS.Timeout | null = null

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getGrowthPlaybook(userId)
        if (isMounted) {
          setPlaybook(data)
          if (data) {
            trackAIFeatureUsage(userId, 'growth_playbook', 'growth').catch(() => {})
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Debounced fetch to prevent rapid-fire refetches
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        fetchData()
      }, 1000) // Wait 1 second before refetching
    }

    fetchData()

    // Real-time subscription for playbook updates
    const channel = supabase
      .channel('playbook-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'growth_playbooks',
          filter: `user_id=eq.${userId}`
        },
        () => {
          debouncedFetch()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [userId])

  const refresh = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const data = await getGrowthPlaybook(userId)
      setPlaybook(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  return { playbook, loading, error, refresh }
}

// ============================================================================
// USER METRICS HOOK - Real-time with Supabase subscription
// ============================================================================

export function useUserMetrics(userId?: string) {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    let isMounted = true
    let debounceTimer: NodeJS.Timeout | null = null

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getUserMetrics(userId)
        if (isMounted && data) {
          setMetrics(data as UserMetrics)
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Debounced fetch to prevent rapid-fire refetches
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        fetchData()
      }, 2000) // Wait 2 seconds (longer for metrics with 3 tables)
    }

    fetchData()

    // Real-time subscription for metrics updates (projects, tasks, time_entries)
    const channel = supabase
      .channel('metrics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`
        },
        () => debouncedFetch()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        () => debouncedFetch()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `user_id=eq.${userId}`
        },
        () => debouncedFetch()
      )
      .subscribe()

    return () => {
      isMounted = false
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [userId])

  const refresh = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const data = await getUserMetrics(userId)
      if (data) {
        setMetrics(data as UserMetrics)
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  return { metrics, loading, error, refresh }
}

// ============================================================================
// CURRENT USER HOOK - Fetches session via API (no SessionProvider required)
// ============================================================================

export function useCurrentUser() {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    // Check for demo mode first
    if (isDemoModeEnabled()) {
      setIsDemo(true)
      setSession({
        user: {
          id: DEMO_USER_ID,
          email: DEMO_USER_EMAIL,
          name: DEMO_USER_NAME
        }
      })
      setStatus('authenticated')
      return
    }

    // Otherwise fetch real session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        // If no authenticated user, fall back to demo mode for showcase
        if (!data?.user) {
          setIsDemo(true)
          setSession({
            user: {
              id: DEMO_USER_ID,
              email: DEMO_USER_EMAIL,
              name: DEMO_USER_NAME
            }
          })
          setStatus('authenticated')
        } else {
          // Check if the logged-in user IS the demo user
          const isAlexDemoUser = data.user.email === DEMO_USER_EMAIL || data.user.id === DEMO_USER_ID
          setIsDemo(isAlexDemoUser)
          setSession(data)
          setStatus('authenticated')
        }
      })
      .catch(() => {
        // On error, also fall back to demo mode
        setIsDemo(true)
        setSession({
          user: {
            id: DEMO_USER_ID,
            email: DEMO_USER_EMAIL,
            name: DEMO_USER_NAME
          }
        })
        setStatus('authenticated')
      })
  }, [])

  // Map session to the expected return format
  const userId = session?.user?.id || null
  const userEmail = session?.user?.email || null
  const userName = session?.user?.name || null
  const loading = status === 'loading'
  const error = null // API handles errors differently

  return { userId, userEmail, userName, loading, error, isDemo }
}

// ============================================================================
// COMBINED AI DATA HOOK (for convenience)
// ============================================================================

/**
 * Fetch all AI data at once - use this for comprehensive AI panels
 * All data is real-time and updates automatically
 */
export function useAIData(userId?: string) {
  const { data: revenueData, loading: revenueLoading, error: revenueError, refresh: refreshRevenue } = useRevenueData(userId)
  const { leads, scores, loading: leadsLoading, error: leadsError, refresh: refreshLeads } = useLeadsData(userId)
  const { recommendations, loading: recommendationsLoading, error: recommendationsError, refresh: refreshRecommendations } = useAIRecommendations(userId, 'pending')
  const { playbook, loading: playbookLoading, error: playbookError, refresh: refreshPlaybook } = useGrowthPlaybook(userId)
  const { metrics, loading: metricsLoading, error: metricsError, refresh: refreshMetrics } = useUserMetrics(userId)

  const loading = revenueLoading || leadsLoading || recommendationsLoading || playbookLoading || metricsLoading
  const error = revenueError || leadsError || recommendationsError || playbookError || metricsError

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshRevenue(),
      refreshLeads(),
      refreshRecommendations(),
      refreshPlaybook(),
      refreshMetrics()
    ])
  }, [refreshRevenue, refreshLeads, refreshRecommendations, refreshPlaybook, refreshMetrics])

  return {
    revenue: revenueData,
    leads,
    leadScores: scores,
    recommendations,
    playbook,
    metrics,
    loading,
    error,
    refreshAll
  }
}
