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
          console.error('Failed to fetch revenue data:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
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
          // Refetch when invoices change
          fetchData()
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
          // Refetch when projects change
          fetchData()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
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
          console.error('Failed to fetch leads data:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
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
          fetchData()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
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
          console.error('Failed to fetch AI recommendations:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
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
          fetchData()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
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
          console.error('Failed to fetch growth playbook:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
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
          fetchData()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
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
          console.error('Failed to fetch user metrics:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
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
        () => fetchData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `user_id=eq.${userId}`
        },
        () => fetchData()
      )
      .subscribe()

    return () => {
      isMounted = false
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
// CURRENT USER HOOK - Real authenticated user only
// ============================================================================

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const fetchUser = async () => {
      try {
        setLoading(true)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          if (isMounted) {
            setError(authError)
            console.error('Auth error:', authError)
          }
          return
        }

        if (user && isMounted) {
          setUserId(user.id)
          setUserEmail(user.email || null)
          const name = user.user_metadata?.full_name ||
                       user.user_metadata?.name ||
                       user.email?.split('@')[0] ||
                       null
          setUserName(name)
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
          console.error('Failed to fetch user:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    // Subscribe to auth changes in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        setUserEmail(session.user.email || null)
        const name = session.user.user_metadata?.full_name ||
                     session.user.user_metadata?.name ||
                     session.user.email?.split('@')[0] ||
                     null
        setUserName(name)
        setError(null)
      } else {
        setUserId(null)
        setUserEmail(null)
        setUserName(null)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { userId, userEmail, userName, loading, error }
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
