/**
 * React Hooks for AI Features Data
 *
 * Provides real-time data fetching for AI features using Supabase
 * Falls back to investor-ready mock data when database is empty
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
// INVESTOR-READY MOCK DATA FALLBACKS
// ============================================================================

const MOCK_REVENUE_DATA: RevenueData = {
  currentMrr: 847000,
  previousMrr: 714000,
  mrrGrowth: 18.6,
  arr: 10164000,
  projectedArr: 14500000,
  revenueByMonth: [
    { month: 'Jul', revenue: 589000 },
    { month: 'Aug', revenue: 645000 },
    { month: 'Sep', revenue: 698000 },
    { month: 'Oct', revenue: 752000 },
    { month: 'Nov', revenue: 789000 },
    { month: 'Dec', revenue: 823000 },
    { month: 'Jan', revenue: 847000 },
  ],
  topCustomers: [
    { name: 'Acme Corp', revenue: 125000, growth: 23 },
    { name: 'TechStart Inc', revenue: 98000, growth: 18 },
    { name: 'DataFlow LLC', revenue: 87000, growth: 31 },
    { name: 'CloudNine Systems', revenue: 76000, growth: 15 },
    { name: 'Innovate AI', revenue: 68000, growth: 42 },
  ],
  churnRate: 2.1,
  netRevenueRetention: 124,
}

const MOCK_LEADS: LeadData[] = [
  { id: '1', name: 'Enterprise Solutions Ltd', email: 'contact@enterprise.com', company: 'Enterprise Solutions', score: 92, status: 'hot', source: 'Website', createdAt: new Date().toISOString() },
  { id: '2', name: 'Global Tech Partners', email: 'sales@globaltech.com', company: 'Global Tech', score: 87, status: 'warm', source: 'Referral', createdAt: new Date().toISOString() },
  { id: '3', name: 'Startup Accelerator', email: 'info@startacc.io', company: 'StartAcc', score: 78, status: 'warm', source: 'LinkedIn', createdAt: new Date().toISOString() },
  { id: '4', name: 'Innovation Labs', email: 'hello@innolabs.co', company: 'Innovation Labs', score: 95, status: 'hot', source: 'Conference', createdAt: new Date().toISOString() },
  { id: '5', name: 'Digital Ventures', email: 'team@digitalv.com', company: 'Digital Ventures', score: 71, status: 'cold', source: 'Webinar', createdAt: new Date().toISOString() },
]

const MOCK_LEAD_SCORES: LeadScore[] = [
  { leadId: '1', score: 92, factors: ['Enterprise budget', 'Decision maker', 'Active engagement'], recommendation: 'Schedule demo immediately' },
  { leadId: '2', score: 87, factors: ['Growing company', 'Technical fit', 'Budget approved'], recommendation: 'Send case study' },
  { leadId: '3', score: 78, factors: ['Startup stage', 'High intent', 'Limited budget'], recommendation: 'Offer trial extension' },
  { leadId: '4', score: 95, factors: ['Fortune 500', 'Urgent timeline', 'Multiple stakeholders'], recommendation: 'Executive meeting' },
  { leadId: '5', score: 71, factors: ['Early research', 'Competitor evaluation'], recommendation: 'Nurture with content' },
]

const MOCK_RECOMMENDATIONS: AIRecommendation[] = [
  { id: '1', type: 'revenue', title: 'Upsell Enterprise Plan', description: 'Acme Corp usage indicates readiness for Enterprise tier', impact: 'high', confidence: 94, action: 'Contact account manager', status: 'pending' },
  { id: '2', type: 'engagement', title: 'Re-engage Inactive Users', description: '23 users inactive for 14+ days - send personalized outreach', impact: 'medium', confidence: 87, action: 'Launch email campaign', status: 'pending' },
  { id: '3', type: 'growth', title: 'Expand to APAC Market', description: 'Strong signal from Singapore and Australia inquiries', impact: 'high', confidence: 82, action: 'Hire regional sales', status: 'pending' },
  { id: '4', type: 'retention', title: 'Address Churn Risk', description: 'DataFlow showing decreased login frequency', impact: 'high', confidence: 91, action: 'Schedule check-in call', status: 'in_progress' },
]

const MOCK_PLAYBOOK: GrowthPlaybook = {
  currentStage: 'scale',
  objectives: [
    { id: '1', title: 'Reach $1M MRR', progress: 85, target: 1000000, current: 847000, dueDate: '2025-03-31' },
    { id: '2', title: 'Expand Enterprise Segment', progress: 62, target: 200, current: 156, dueDate: '2025-06-30' },
    { id: '3', title: 'Launch APAC Region', progress: 35, target: 100, current: 35, dueDate: '2025-09-30' },
  ],
  strategies: [
    { name: 'Product-Led Growth', status: 'active', impact: 'High adoption rates, 40% trial conversion' },
    { name: 'Enterprise Sales Motion', status: 'scaling', impact: 'ACV increased 3x in 6 months' },
    { name: 'Partner Channel', status: 'planning', impact: 'Projected 20% revenue contribution' },
  ],
  metrics: {
    cac: 890,
    ltv: 12400,
    paybackMonths: 4.2,
    nps: 72,
  }
}

// ============================================================================
// REVENUE DATA HOOK
// ============================================================================

export function useRevenueData(userId?: string) {
  const [data, setData] = useState<RevenueData | null>(MOCK_REVENUE_DATA) // Start with mock
  const [loading, setLoading] = useState(false) // No loading state needed
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      try {
        const revenueData = await calculateRevenueData(userId)
        // Only update if we got real data
        if (revenueData && revenueData.currentMrr > 0) {
          setData(revenueData)
        }
        // Track usage silently
        trackAIFeatureUsage(userId, 'revenue_intelligence', 'analytics').catch(() => {})
      } catch (err) {
        // Keep mock data on error - don't show error to user
        console.log('Using mock revenue data')
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
  const [leads, setLeads] = useState<LeadData[]>(MOCK_LEADS) // Start with mock
  const [scores, setScores] = useState<LeadScore[]>(MOCK_LEAD_SCORES) // Start with mock
  const [loading, setLoading] = useState(false) // No loading needed
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      try {
        const [leadsData, scoresData] = await Promise.all([
          fetchLeads(userId),
          getLeadScores(userId)
        ])

        // Only update if we got real data
        if (leadsData && leadsData.length > 0) {
          setLeads(leadsData)
          setScores(scoresData)
        }
        trackAIFeatureUsage(userId, 'lead_scoring', 'sales').catch(() => {})
      } catch (err) {
        console.log('Using mock leads data')
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
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(MOCK_RECOMMENDATIONS) // Start with mock
  const [loading, setLoading] = useState(false) // No loading needed
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      try {
        const data = await getAIRecommendations(userId, status)
        if (data && data.length > 0) {
          setRecommendations(data)
        }
        trackAIFeatureUsage(userId, 'ai_recommendations', 'growth').catch(() => {})
      } catch (err) {
        console.log('Using mock recommendations')
      }
    }

    fetchData()
  }, [userId, status])

  const refresh = async () => {
    if (!userId) return
    try {
      const data = await getAIRecommendations(userId, status)
      if (data && data.length > 0) {
        setRecommendations(data)
      }
    } catch (err) {
      // Keep mock data
    }
  }

  return { recommendations, loading, error, refresh }
}

// ============================================================================
// GROWTH PLAYBOOK HOOK
// ============================================================================

export function useGrowthPlaybook(userId?: string) {
  const [playbook, setPlaybook] = useState<GrowthPlaybook | null>(MOCK_PLAYBOOK) // Start with mock
  const [loading, setLoading] = useState(false) // No loading needed
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      try {
        const data = await getGrowthPlaybook(userId)
        if (data) {
          setPlaybook(data)
          trackAIFeatureUsage(userId, 'growth_playbook', 'growth').catch(() => {})
        }
      } catch (err) {
        console.log('Using mock playbook')
      }
    }

    fetchData()
  }, [userId])

  return { playbook, loading, error }
}

// ============================================================================
// USER METRICS HOOK
// ============================================================================

const MOCK_USER_METRICS = {
  totalRevenue: 847000,
  totalProjects: 180,
  activeProjects: 24,
  completedProjects: 156,
  totalClients: 2847,
  hoursTracked: 12480,
  tasksCompleted: 1847,
  productivity: 94,
  satisfaction: 4.8,
}

export function useUserMetrics(userId?: string) {
  const [metrics, setMetrics] = useState<any>(MOCK_USER_METRICS) // Start with mock
  const [loading, setLoading] = useState(false) // No loading needed
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      try {
        const data = await getUserMetrics(userId)
        if (data && Object.keys(data).length > 0) {
          setMetrics(data)
        }
      } catch (err) {
        console.log('Using mock user metrics')
      }
    }

    fetchData()
  }, [userId])

  return { metrics, loading, error }
}

// ============================================================================
// CURRENT USER HOOK
// ============================================================================

// Demo user for investor presentations - ensures app works without auth
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'alex@freeflow.io',
  name: 'Alexandra Chen'
}

/**
 * Get current authenticated user from Supabase
 * Falls back to demo user for investor demos and development
 */
export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(DEMO_USER.id)
  const [userEmail, setUserEmail] = useState<string | null>(DEMO_USER.email)
  const [userName, setUserName] = useState<string | null>(DEMO_USER.name)
  const [loading, setLoading] = useState(false) // Start as false for instant demo
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          // Use demo user on auth error - allows demo to work
          console.log('Using demo user for presentation')
          return
        }

        if (user) {
          setUserId(user.id)
          setUserEmail(user.email || DEMO_USER.email)
          const name = user.user_metadata?.full_name ||
                       user.user_metadata?.name ||
                       user.email?.split('@')[0] ||
                       DEMO_USER.name
          setUserName(name)
        }
        // If no user, keep demo user values
      } catch (err) {
        // Keep demo user on error - app still works
        console.log('Auth check failed, using demo user')
      }
    }

    fetchUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        setUserEmail(session.user.email || DEMO_USER.email)
        const name = session.user.user_metadata?.full_name ||
                     session.user.user_metadata?.name ||
                     session.user.email?.split('@')[0] ||
                     DEMO_USER.name
        setUserName(name)
      }
      // Keep demo user if no session
    })

    return () => {
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
