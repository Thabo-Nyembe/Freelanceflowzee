'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  useRef
} from 'react'
import { usePathname } from 'next/navigation'
import { EventTracker, createEventTracker, EventCategory } from './event-tracker'
import { SessionTracker, createSessionTracker, SessionData } from './session-tracker'

/**
 * Analytics Context Types
 */
export interface AnalyticsContextValue {
  // Event tracking
  track: (name: string, category?: EventCategory, properties?: Record<string, any>) => void
  trackPageView: (path?: string, title?: string) => void
  trackInteraction: (element: string, action: string, properties?: Record<string, any>) => void
  trackConversion: (type: string, value?: number, currency?: string, properties?: Record<string, any>) => void
  trackFeature: (feature: string, action: string, properties?: Record<string, any>) => void
  trackError: (type: string, message: string, stack?: string, properties?: Record<string, any>) => void
  trackTiming: (category: string, variable: string, timeMs: number, label?: string) => void
  trackFunnelStep: (funnelId: string, stepId: string, stepIndex: number, properties?: Record<string, any>) => void

  // Session management
  session: SessionData | null
  sessionId: string | null
  setUserId: (userId: string | undefined) => void
  startNewSession: () => void

  // State
  isReady: boolean
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
}

export interface AnalyticsProviderProps {
  children: React.ReactNode
  userId?: string
  enabled?: boolean
  debug?: boolean
  trackRoutes?: boolean
  consentRequired?: boolean
  onConsent?: () => void
}

// Create context
const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

/**
 * Analytics Provider Component
 */
export function AnalyticsProvider({
  children,
  userId,
  enabled = true,
  debug = false,
  trackRoutes = true,
  consentRequired = false,
  onConsent
}: AnalyticsProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [isEnabled, setIsEnabled] = useState(enabled && !consentRequired)
  const [session, setSession] = useState<SessionData | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const eventTrackerRef = useRef<EventTracker | null>(null)
  const sessionTrackerRef = useRef<SessionTracker | null>(null)
  const pathname = usePathname()
  const prevPathname = useRef<string>('')

  // Initialize trackers
  useEffect(() => {
    if (typeof window === 'undefined') return

    eventTrackerRef.current = createEventTracker({
      debug,
      offlineSupport: true
    })

    sessionTrackerRef.current = createSessionTracker({
      debug,
      trackPageViews: false, // We handle this ourselves for Next.js
      onSessionStart: (sess) => {
        setSession(sess)
        setSessionId(sess.id)
      },
      onSessionEnd: () => {
        setSession(null)
        setSessionId(null)
      }
    })

    setSession(sessionTrackerRef.current.getSession())
    setSessionId(sessionTrackerRef.current.getSessionId())
    setIsReady(true)

    return () => {
      eventTrackerRef.current?.destroy()
      sessionTrackerRef.current?.destroy()
    }
  }, [debug])

  // Set user ID
  useEffect(() => {
    if (!isReady) return
    eventTrackerRef.current?.setUserId(userId)
    sessionTrackerRef.current?.setUserId(userId)
  }, [userId, isReady])

  // Track route changes
  useEffect(() => {
    if (!isReady || !isEnabled || !trackRoutes) return
    if (!pathname || pathname === prevPathname.current) return

    prevPathname.current = pathname
    eventTrackerRef.current?.trackPageView(pathname)
    sessionTrackerRef.current?.trackPageView(pathname)

    if (debug) {
      console.log('[Analytics] Page view:', pathname)
    }
  }, [pathname, isReady, isEnabled, trackRoutes, debug])

  // Track function
  const track = useCallback((
    name: string,
    category: EventCategory = 'custom',
    properties: Record<string, any> = {}
  ) => {
    if (!isEnabled) return
    eventTrackerRef.current?.track(name, category, properties)
    sessionTrackerRef.current?.trackEvent()
  }, [isEnabled])

  // Track page view
  const trackPageView = useCallback((path?: string, title?: string) => {
    if (!isEnabled) return
    eventTrackerRef.current?.trackPageView(path, title)
    sessionTrackerRef.current?.trackPageView(path)
  }, [isEnabled])

  // Track interaction
  const trackInteraction = useCallback((
    element: string,
    action: string,
    properties?: Record<string, any>
  ) => {
    if (!isEnabled) return
    eventTrackerRef.current?.trackInteraction(element, action, properties)
    sessionTrackerRef.current?.trackEvent()
  }, [isEnabled])

  // Track conversion
  const trackConversion = useCallback((
    type: string,
    value?: number,
    currency?: string,
    properties?: Record<string, any>
  ) => {
    if (!isEnabled) return
    eventTrackerRef.current?.trackConversion(type, value, currency, properties)
    sessionTrackerRef.current?.trackEvent()
  }, [isEnabled])

  // Track feature
  const trackFeature = useCallback((
    feature: string,
    action: string,
    properties?: Record<string, any>
  ) => {
    if (!isEnabled) return
    eventTrackerRef.current?.trackFeature(feature, action, properties)
    sessionTrackerRef.current?.trackEvent()
  }, [isEnabled])

  // Track error
  const trackError = useCallback((
    type: string,
    message: string,
    stack?: string,
    properties?: Record<string, any>
  ) => {
    if (!isEnabled) return
    eventTrackerRef.current?.trackError(type, message, stack, properties)
  }, [isEnabled])

  // Track timing
  const trackTiming = useCallback((
    category: string,
    variable: string,
    timeMs: number,
    label?: string
  ) => {
    if (!isEnabled) return
    eventTrackerRef.current?.trackTiming(category, variable, timeMs, label)
  }, [isEnabled])

  // Track funnel step
  const trackFunnelStep = useCallback((
    funnelId: string,
    stepId: string,
    stepIndex: number,
    properties?: Record<string, any>
  ) => {
    if (!isEnabled) return
    eventTrackerRef.current?.trackFunnelStep(funnelId, stepId, stepIndex, properties)
    sessionTrackerRef.current?.trackEvent()
  }, [isEnabled])

  // Set user ID
  const setUserIdFn = useCallback((id: string | undefined) => {
    eventTrackerRef.current?.setUserId(id)
    sessionTrackerRef.current?.setUserId(id)
  }, [])

  // Start new session
  const startNewSession = useCallback(() => {
    sessionTrackerRef.current?.startNewSession()
    eventTrackerRef.current?.startNewSession()
  }, [])

  // Set enabled
  const setEnabled = useCallback((value: boolean) => {
    setIsEnabled(value)
    if (value && consentRequired && onConsent) {
      onConsent()
    }
  }, [consentRequired, onConsent])

  const value: AnalyticsContextValue = {
    track,
    trackPageView,
    trackInteraction,
    trackConversion,
    trackFeature,
    trackError,
    trackTiming,
    trackFunnelStep,
    session,
    sessionId,
    setUserId: setUserIdFn,
    startNewSession,
    isReady,
    isEnabled,
    setEnabled
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

/**
 * Hook to use analytics
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider')
  }
  return context
}

/**
 * Hook to track a specific event on mount or condition
 */
export function useTrackEvent(
  name: string,
  category?: EventCategory,
  properties?: Record<string, any>,
  condition: boolean = true
): void {
  const { track, isReady } = useAnalytics()
  const tracked = useRef(false)

  useEffect(() => {
    if (isReady && condition && !tracked.current) {
      track(name, category, properties)
      tracked.current = true
    }
  }, [isReady, condition, name, category, properties, track])
}

/**
 * Hook to track timing
 */
export function useTrackTiming(
  category: string,
  variable: string,
  label?: string
): { startTiming: () => void; stopTiming: () => void } {
  const { trackTiming, isReady } = useAnalytics()
  const startTime = useRef<number | null>(null)

  const startTimingFn = useCallback(() => {
    startTime.current = performance.now()
  }, [])

  const stopTiming = useCallback(() => {
    if (startTime.current !== null && isReady) {
      const duration = performance.now() - startTime.current
      trackTiming(category, variable, Math.round(duration), label)
      startTime.current = null
    }
  }, [category, variable, label, trackTiming, isReady])

  return { startTiming: startTimingFn, stopTiming }
}

/**
 * Hook to track funnel progress
 */
export function useTrackFunnel(funnelId: string) {
  const { trackFunnelStep, isReady } = useAnalytics()
  const [currentStep, setCurrentStep] = useState(0)

  const trackStep = useCallback((stepId: string, stepIndex: number, properties?: Record<string, any>) => {
    if (isReady) {
      trackFunnelStep(funnelId, stepId, stepIndex, properties)
      setCurrentStep(stepIndex)
    }
  }, [funnelId, trackFunnelStep, isReady])

  const nextStep = useCallback((stepId: string, properties?: Record<string, any>) => {
    trackStep(stepId, currentStep + 1, properties)
  }, [trackStep, currentStep])

  const resetFunnel = useCallback(() => {
    setCurrentStep(0)
  }, [])

  return { trackStep, nextStep, currentStep, resetFunnel }
}

/**
 * Hook to track feature usage
 */
export function useTrackFeature(featureName: string) {
  const { trackFeature, isReady } = useAnalytics()

  const trackUsage = useCallback((action: string, properties?: Record<string, any>) => {
    if (isReady) {
      trackFeature(featureName, action, properties)
    }
  }, [featureName, trackFeature, isReady])

  return {
    trackEnabled: () => trackUsage('enabled'),
    trackDisabled: () => trackUsage('disabled'),
    trackUsed: (properties?: Record<string, any>) => trackUsage('used', properties),
    trackConfigured: (properties?: Record<string, any>) => trackUsage('configured', properties),
    track: trackUsage
  }
}

/**
 * Higher-order component to track component mount/unmount
 */
export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  const ComponentWithAnalytics: React.FC<P> = (props) => {
    useTrackEvent(`${componentName}_mounted`, 'feature', { component: componentName })

    return <WrappedComponent {...props} />
  }

  ComponentWithAnalytics.displayName = `WithAnalytics(${componentName})`
  return ComponentWithAnalytics
}
