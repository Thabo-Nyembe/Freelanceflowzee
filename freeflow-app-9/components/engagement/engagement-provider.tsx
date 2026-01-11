'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { createEngagementAlgorithm, EngagementAlgorithm } from '@/lib/engagement-algorithm'

interface EngagementContextValue {
  trackClick: (buttonName: string, metadata?: Record<string, any>) => void
  trackFormSubmit: (formName: string, metadata?: Record<string, any>) => void
  trackFeatureUse: (featureName: string, metadata?: Record<string, any>) => void
  trackEntityAction: (
    action: 'create' | 'read' | 'update' | 'delete',
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) => void
}

const EngagementContext = createContext<EngagementContextValue | null>(null)

export function useEngagementTracking() {
  const context = useContext(EngagementContext)
  if (!context) {
    // Return no-op functions if not in provider
    return {
      trackClick: () => {},
      trackFormSubmit: () => {},
      trackFeatureUse: () => {},
      trackEntityAction: () => {}
    }
  }
  return context
}

interface EngagementProviderProps {
  children: ReactNode
  userId?: string
}

// Safe session hook that doesn't require SessionProvider
function useSafeSession() {
  const [sessionUserId, setSessionUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    let isMounted = true
    // Fetch session directly from API to avoid SessionProvider requirement
    fetch('/api/auth/session')
      .then(res => {
        if (!res.ok) throw new Error('Session fetch failed')
        return res.json()
      })
      .then(data => {
        if (isMounted && data?.user?.id) {
          setSessionUserId(data.user.id)
        }
      })
      .catch(() => {
        // Session fetch failed, continue without user ID
      })
    return () => { isMounted = false }
  }, [])

  return sessionUserId
}

export function EngagementProvider({ children, userId: propUserId }: EngagementProviderProps) {
  const sessionUserId = useSafeSession()
  const userId = propUserId || sessionUserId
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
    if (!algorithmRef.current || sessionIdRef.current) return undefined

    const startSession = async () => {
      try {
        const deviceType = getDeviceType()
        const browser = getBrowser()
        const os = getOS()

        const sessionId = await algorithmRef.current!.startSession({
          deviceType,
          browser,
          os,
          screenSize: typeof window !== 'undefined'
            ? `${window.innerWidth}x${window.innerHeight}`
            : 'unknown'
        })
        sessionIdRef.current = sessionId
      } catch {
        // Session tracking failed - continue without it
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

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleUnload)
      return () => {
        handleUnload()
        window.removeEventListener('beforeunload', handleUnload)
      }
    }
    return undefined
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

  // Tracking functions
  const logActivity = async (action: {
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
  }

  const trackClick = (buttonName: string, metadata?: Record<string, any>) => {
    logActivity({
      type: 'button_click',
      name: `click_${buttonName}`,
      ...(metadata && { metadata })
    })
  }

  const trackFormSubmit = (formName: string, metadata?: Record<string, any>) => {
    logActivity({
      type: 'form_submit',
      name: `submit_${formName}`,
      ...(metadata && { metadata })
    })
  }

  const trackFeatureUse = (featureName: string, metadata?: Record<string, any>) => {
    featuresUsedRef.current.add(featureName)
    logActivity({
      type: 'feature_use',
      name: `use_${featureName}`,
      ...(metadata && { metadata })
    })
  }

  const trackEntityAction = (
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
  }

  const contextValue: EngagementContextValue = {
    trackClick,
    trackFormSubmit,
    trackFeatureUse,
    trackEntityAction
  }

  return (
    <EngagementContext.Provider value={contextValue}>
      {children}
    </EngagementContext.Provider>
  )
}

// Helper functions
function getDeviceType(): string {
  if (typeof navigator === 'undefined') return 'unknown'
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
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Opera')) return 'Opera'
  return 'Unknown'
}

function getOS(): string {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS'
  return 'Unknown'
}
