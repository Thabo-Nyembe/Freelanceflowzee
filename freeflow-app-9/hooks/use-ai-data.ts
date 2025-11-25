/**
 * React Hooks for AI Features Data
 *
 * Provides real-time data fetching for AI features using Supabase
 */

import { useState, useEffect } from 'react'
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
// REVENUE DATA HOOK
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

    const fetchData = async () => {
      try {
        setLoading(true)
        const revenueData = await calculateRevenueData(userId)
        setData(revenueData)

        // Track usage
        await trackAIFeatureUsage(userId, 'revenue_intelligence', 'analytics')
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching revenue data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const refresh = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const revenueData = await calculateRevenueData(userId)
      setData(revenueData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refresh }
}

// ============================================================================
// LEADS DATA HOOK
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

    const fetchData = async () => {
      try {
        setLoading(true)
        const [leadsData, scoresData] = await Promise.all([
          fetchLeads(userId),
          getLeadScores(userId)
        ])

        setLeads(leadsData)
        setScores(scoresData)

        // Track usage
        await trackAIFeatureUsage(userId, 'lead_scoring', 'sales')
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching leads data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  return { leads, scores, loading, error }
}

// ============================================================================
// AI RECOMMENDATIONS HOOK
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

    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getAIRecommendations(userId, status)
        setRecommendations(data)

        // Track usage
        await trackAIFeatureUsage(userId, 'ai_recommendations', 'growth')
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching AI recommendations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, status])

  const refresh = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const data = await getAIRecommendations(userId, status)
      setRecommendations(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { recommendations, loading, error, refresh }
}

// ============================================================================
// GROWTH PLAYBOOK HOOK
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

    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getGrowthPlaybook(userId)
        setPlaybook(data)

        // Track usage
        if (data) {
          await trackAIFeatureUsage(userId, 'growth_playbook', 'growth')
        }
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching growth playbook:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  return { playbook, loading, error }
}

// ============================================================================
// USER METRICS HOOK
// ============================================================================

export function useUserMetrics(userId?: string) {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getUserMetrics(userId)
        setMetrics(data)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching user metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  return { metrics, loading, error }
}

// ============================================================================
// CURRENT USER HOOK
// ============================================================================

/**
 * Get current authenticated user from Supabase
 */
export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) throw authError

        setUserId(user?.id || null)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching current user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { userId, loading, error }
}

// ============================================================================
// COMBINED AI DATA HOOK (for convenience)
// ============================================================================

/**
 * Fetch all AI data at once - use this for comprehensive AI panels
 */
export function useAIData(userId?: string) {
  const { data: revenueData, loading: revenueLoading } = useRevenueData(userId)
  const { leads, scores, loading: leadsLoading } = useLeadsData(userId)
  const { recommendations, loading: recommendationsLoading } = useAIRecommendations(userId, 'pending')
  const { playbook, loading: playbookLoading } = useGrowthPlaybook(userId)
  const { metrics, loading: metricsLoading } = useUserMetrics(userId)

  const loading = revenueLoading || leadsLoading || recommendationsLoading || playbookLoading || metricsLoading

  return {
    revenue: revenueData,
    leads,
    leadScores: scores,
    recommendations,
    playbook,
    metrics,
    loading
  }
}
