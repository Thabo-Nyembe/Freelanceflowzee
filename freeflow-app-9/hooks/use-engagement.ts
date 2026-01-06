/**
 * Engagement & Personalization Hooks
 *
 * React hooks for personalized user experience and engagement tracking
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  EngagementAlgorithm,
  createEngagementAlgorithm,
  UserBehaviorProfile,
  Recommendation,
  EngagementInsight
} from '@/lib/engagement-algorithm'

// ============================================================================
// ENGAGEMENT HOOK - Main hook for personalization
// ============================================================================

export function useEngagement() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => {})
  }, [])

  const userId = session?.user?.id

  const [algorithm, setAlgorithm] = useState<EngagementAlgorithm | null>(null)
  const [profile, setProfile] = useState<UserBehaviorProfile | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [insights, setInsights] = useState<EngagementInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initialize algorithm when user ID is available
  useEffect(() => {
    if (userId) {
      const algo = createEngagementAlgorithm(userId)
      setAlgorithm(algo)
    }
  }, [userId])

  // Fetch engagement data
  useEffect(() => {
    if (!algorithm) return

    const fetchEngagementData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [behaviorProfile, recs, engagementInsights] = await Promise.all([
          algorithm.analyzeBehavior(),
          algorithm.getRecommendations(5),
          algorithm.getInsights()
        ])

        setProfile(behaviorProfile)
        setRecommendations(recs)
        setInsights(engagementInsights)

        // Check for new milestones
        await algorithm.checkMilestones()
      } catch (err) {
        setError(err as Error)
        // Silently handle - engagement data is optional
      } finally {
        setLoading(false)
      }
    }

    fetchEngagementData()
  }, [algorithm])

  // Refresh engagement data
  const refresh = useCallback(async () => {
    if (!algorithm) return

    try {
      setLoading(true)
      const [behaviorProfile, recs, engagementInsights] = await Promise.all([
        algorithm.analyzeBehavior(),
        algorithm.getRecommendations(5),
        algorithm.getInsights()
      ])

      setProfile(behaviorProfile)
      setRecommendations(recs)
      setInsights(engagementInsights)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [algorithm])

  // Dismiss a recommendation
  const dismissRecommendation = useCallback(async (recommendationId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
  }, [])

  // Get personalized greeting based on time and user tier
  const getPersonalizedGreeting = useCallback(() => {
    const hour = new Date().getHours()
    const userName = session?.user?.name?.split(' ')[0] || 'there'

    let timeGreeting = 'Hello'
    if (hour < 12) timeGreeting = 'Good morning'
    else if (hour < 17) timeGreeting = 'Good afternoon'
    else timeGreeting = 'Good evening'

    if (!profile) return `${timeGreeting}, ${userName}!`

    const tierMessages: Record<string, string> = {
      'new': `Welcome back, ${userName}! Let's get started.`,
      'casual': `${timeGreeting}, ${userName}! Ready to be productive?`,
      'active': `${timeGreeting}, ${userName}! You're doing great!`,
      'power': `${timeGreeting}, ${userName}! Power user in action!`,
      'champion': `${timeGreeting}, ${userName}! KAZI Champion!`
    }

    return tierMessages[profile.tier] || `${timeGreeting}, ${userName}!`
  }, [profile, session])

  return {
    profile,
    recommendations,
    insights,
    loading,
    error,
    refresh,
    dismissRecommendation,
    getPersonalizedGreeting,
    isNewUser: profile?.tier === 'new',
    isPowerUser: profile?.tier === 'power' || profile?.tier === 'champion',
    engagementScore: profile?.engagementScore || 0,
    churnRisk: profile?.churnRisk || 'low'
  }
}

// ============================================================================
// ACTIVITY TRACKING HOOK - Automatic activity logging
// ============================================================================

export function useActivityTracking() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => {})
  }, [])

  const userId = session?.user?.id
  const pathname = usePathname()

  const algorithmRef = useRef<EngagementAlgorithm | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const pageViewStartRef = useRef<number>(Date.now())
  const pagesViewedRef = useRef<number>(0)
  const actionsCountRef = useRef<number>(0)
  const featuresUsedRef = useRef<Set<string>>(new Set())

  // Initialize algorithm
  useEffect(() => {
    if (userId && !algorithmRef.current) {
      algorithmRef.current = createEngagementAlgorithm(userId)
    }
  }, [userId])

  // Start session on mount
  useEffect(() => {
    if (!algorithmRef.current || sessionIdRef.current) return

    const startSession = async () => {
      try {
        const deviceType = getDeviceType()
        const browser = getBrowser()
        const os = getOS()

        sessionIdRef.current = await algorithmRef.current!.startSession({
          deviceType,
          browser,
          os,
          screenSize: `${window.innerWidth}x${window.innerHeight}`
        })
      } catch (err) {
        // Silently handle - session tracking is optional
      }
    }

    startSession()

    // End session on page unload
    const handleUnload = async () => {
      if (algorithmRef.current && sessionIdRef.current) {
        await algorithmRef.current.endSession(
          sessionIdRef.current,
          pagesViewedRef.current,
          actionsCountRef.current,
          Array.from(featuresUsedRef.current)
        )
      }
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => {
      handleUnload()
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [userId])

  // Track page views
  useEffect(() => {
    if (!algorithmRef.current || !pathname) return

    // Log time spent on previous page
    const duration = Date.now() - pageViewStartRef.current

    algorithmRef.current.logActivity({
      type: 'page_view',
      name: `view_${pathname.replace(/\//g, '_')}`,
      pagePath: pathname,
      duration
    })

    // Reset for new page
    pageViewStartRef.current = Date.now()
    pagesViewedRef.current++

    // Track feature from path
    const featureMatch = pathname.match(/\/dashboard\/([^\/]+)/)
    if (featureMatch && featureMatch[1]) {
      featuresUsedRef.current.add(featureMatch[1].replace(/-v2$/, ''))
    }
  }, [pathname])

  // Log custom activity
  const logActivity = useCallback(async (action: {
    type: string
    name: string
    entityType?: string
    entityId?: string
    metadata?: Record<string, any>
  }) => {
    if (!algorithmRef.current) return

    actionsCountRef.current++

    await algorithmRef.current.logActivity({
      ...action,
      pagePath: pathname || '/'
    })
  }, [pathname])

  // Track button clicks
  const trackClick = useCallback((buttonName: string, metadata?: Record<string, any>) => {
    logActivity({
      type: 'button_click',
      name: `click_${buttonName}`,
      ...(metadata && { metadata })
    })
  }, [logActivity])

  // Track form submissions
  const trackFormSubmit = useCallback((formName: string, metadata?: Record<string, any>) => {
    logActivity({
      type: 'form_submit',
      name: `submit_${formName}`,
      ...(metadata && { metadata })
    })
  }, [logActivity])

  // Track feature usage
  const trackFeatureUse = useCallback((featureName: string, metadata?: Record<string, any>) => {
    featuresUsedRef.current.add(featureName)
    logActivity({
      type: 'feature_use',
      name: `use_${featureName}`,
      ...(metadata && { metadata })
    })
  }, [logActivity])

  // Track entity actions (CRUD)
  const trackEntityAction = useCallback((
    action: 'create' | 'read' | 'update' | 'delete',
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) => {
    logActivity({
      type: `entity_${action}`,
      name: `${action}_${entityType}`,
      entityType,
      ...(entityId && { entityId }),
      ...(metadata && { metadata })
    })
  }, [logActivity])

  return {
    logActivity,
    trackClick,
    trackFormSubmit,
    trackFeatureUse,
    trackEntityAction
  }
}

// ============================================================================
// PERSONALIZED ONBOARDING HOOK
// ============================================================================

export interface OnboardingStep {
  id: string
  title: string
  description: string
  action: string
  actionUrl: string
  completed: boolean
  skippable: boolean
}

export function usePersonalizedOnboarding() {
  const { profile, loading: profileLoading } = useEngagement()

  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  // Generate personalized onboarding steps based on user behavior
  useEffect(() => {
    if (profileLoading || !profile) return

    const generateSteps = () => {
      const baseSteps: OnboardingStep[] = [
        {
          id: 'welcome',
          title: 'Welcome to KAZI!',
          description: 'Let\'s set up your workspace for maximum productivity',
          action: 'Get Started',
          actionUrl: '/dashboard',
          completed: true,
          skippable: false
        },
        {
          id: 'first_project',
          title: 'Create Your First Project',
          description: 'Projects help you organize your work and track progress',
          action: 'Create Project',
          actionUrl: '/dashboard/projects-hub-v2?new=true',
          completed: (profile.featureFrequency?.['projects'] ?? 0) > 0,
          skippable: true
        },
        {
          id: 'add_client',
          title: 'Add a Client',
          description: 'Keep track of your clients and their projects',
          action: 'Add Client',
          actionUrl: '/dashboard/clients-v2?new=true',
          completed: (profile.featureFrequency?.['clients'] ?? 0) > 0,
          skippable: true
        },
        {
          id: 'explore_ai',
          title: 'Meet Your AI Assistant',
          description: 'Let AI help you with content, analysis, and automation',
          action: 'Try AI Assistant',
          actionUrl: '/dashboard/ai-assistant-v2',
          completed: (profile.featureFrequency?.['ai-assistant'] ?? 0) > 0,
          skippable: true
        },
        {
          id: 'customize',
          title: 'Customize Your Dashboard',
          description: 'Make KAZI work the way you want',
          action: 'Customize',
          actionUrl: '/dashboard/settings-v2',
          completed: false,
          skippable: true
        }
      ]

      // Filter out completed steps, keep first incomplete
      const incompleteSteps = baseSteps.filter(s => !s.completed)

      if (incompleteSteps.length === 0) {
        setCompleted(true)
        setSteps([])
      } else {
        setSteps(incompleteSteps)
        setCurrentStep(0)
      }

      setLoading(false)
    }

    generateSteps()
  }, [profile, profileLoading])

  // Mark step as complete
  const completeStep = useCallback((stepId: string) => {
    setSteps(prev => {
      const updated = prev.map(s =>
        s.id === stepId ? { ...s, completed: true } : s
      )
      const incomplete = updated.filter(s => !s.completed)
      if (incomplete.length === 0) {
        setCompleted(true)
      }
      return updated
    })
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  // Skip step
  const skipStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = prev + 1
      if (next >= steps.length) {
        setCompleted(true)
        return prev
      }
      return next
    })
  }, [steps.length])

  // Get progress percentage
  const progress = steps.length > 0
    ? (steps.filter(s => s.completed).length / steps.length) * 100
    : 100

  return {
    steps,
    currentStep,
    currentStepData: steps[currentStep],
    completed,
    loading,
    progress,
    completeStep,
    skipStep,
    isNewUser: profile?.tier === 'new'
  }
}

// ============================================================================
// USER PREFERENCES HOOK
// ============================================================================

export function useUserPreferences() {
  const { profile } = useEngagement()

  const [preferences, setPreferences] = useState({
    viewMode: 'grid' as 'grid' | 'list' | 'kanban',
    sidebarCollapsed: false,
    theme: 'system' as 'light' | 'dark' | 'system',
    dashboardWidgets: [] as string[],
    emailFrequency: 'daily' as 'realtime' | 'daily' | 'weekly' | 'none'
  })

  // Load preferences from profile
  useEffect(() => {
    if (profile) {
      setPreferences(prev => ({
        ...prev,
        viewMode: (profile.preferredViewMode as any) || 'grid',
        dashboardWidgets: profile.preferredDashboardWidgets || []
      }))
    }
  }, [profile])

  // Update preference
  const updatePreference = useCallback(async <K extends keyof typeof preferences>(
    key: K,
    value: typeof preferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))

    // Save to database
    // This would update user_preferences table
  }, [])

  return {
    preferences,
    updatePreference,
    suggestedWidgets: profile?.topFeatures || []
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDeviceType(): string {
  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

function getBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Opera')) return 'Opera'
  return 'Unknown'
}

function getOS(): string {
  const ua = navigator.userAgent
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS'
  return 'Unknown'
}
