'use client'

import { useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@vercel/analytics'

interface AnalyticsEvent {
  event_type: string
  event_name: string
  properties?: Record<string, any>
  performance_metrics?: Record<string, number>
}

interface PerformanceMetrics {
  page_load_time?: number
  dom_content_loaded?: number
  first_contentful_paint?: number
  largest_contentful_paint?: number
  cumulative_layout_shift?: number
  first_input_delay?: number
  time_to_interactive?: number
}

class AnalyticsClient {
  private sessionId: string
  private isInitialized: boolean = false
  private eventQueue: AnalyticsEvent[] = []
  private performanceObserver: PerformanceObserver | null = null
  private clsValue: number = 0
  private fidValue: number = 0

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeIfNeeded()
  }

  private generateSessionId(): string {
    // use slice instead of deprecated substr
    const randomPart = Math.random().toString(36).slice(2, 11)
    return `${Date.now()}-${randomPart}`
  }

  private initializeIfNeeded() {
    if (this.isInitialized || typeof window === 'undefined') return

    this.isInitialized = true
    this.setupPerformanceTracking()
    this.trackPageLoad()
    this.setupErrorTracking()
    this.setupUnloadTracking()
  }

  private setupPerformanceTracking() {
    // Track Web Vitals using PerformanceObserver
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      this.observePerformanceMetric('largest-contentful-paint', (entries) => {
        const lastEntry = entries[entries.length - 1]
        this.trackEvent('performance', 'lcp_measured', {
          performance_metrics: {
            largest_contentful_paint: lastEntry.startTime
          }
        })
      })

      // First Input Delay
      this.observePerformanceMetric('first-input', (entries) => {
        const firstEntry = entries[0]
        this.fidValue = firstEntry.processingStart - firstEntry.startTime
        this.trackEvent('performance', 'fid_measured', {
          performance_metrics: {
            first_input_delay: this.fidValue
          }
        })
      })

      // Cumulative Layout Shift
      this.observePerformanceMetric('layout-shift', (entries) => {
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            this.clsValue += entry.value
          }
        })
      })
    }

    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.trackPagePerformance()
      }, 0)
    })
  }

  private observePerformanceMetric(entryType: string, callback: (entries: any[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries())
      })
      observer.observe({ entryTypes: [entryType] })
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error)
    }
  }

  private trackPageLoad() {
    // Track initial page load
    this.trackEvent('page_view', 'page_loaded', {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || 'direct'
    })
  }

  private trackPagePerformance() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')

    const metrics: PerformanceMetrics = {
      page_load_time: navigation.loadEventEnd - navigation.navigationStart,
      dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
    }

    // Add paint timings
    paint.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        metrics.first_contentful_paint = entry.startTime
      }
    })

    // Add CLS if measured
    if (this.clsValue > 0) {
      metrics.cumulative_layout_shift = this.clsValue
    }

    this.trackEvent('performance', 'page_performance', {
      performance_metrics: metrics
    })
  }

  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackEvent('error', 'javascript_error', {
        error_message: event.message,
        filename: event.filename,
        line_number: event.lineno,
        column_number: event.colno,
        stack: event.error?.stack
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', 'unhandled_promise_rejection', {
        error_message: event.reason?.toString() || 'Unknown promise rejection',
        stack: event.reason?.stack
      })
    })
  }

  private setupUnloadTracking() {
    const trackSessionEnd = () => {
      this.trackEvent('session', 'session_ended', {
        session_duration: Date.now() - parseInt(this.sessionId.split('-')[0])
      })
      
      // Send any queued events before page unload
      this.flushEvents()
    }

    window.addEventListener('beforeunload', trackSessionEnd)
    window.addEventListener('pagehide', trackSessionEnd)
  }

  public trackEvent(
    eventType: string,
    eventName: string,
    properties: Record<string, any> = {}
  ) {
    const event: AnalyticsEvent = {
      event_type: eventType,
      event_name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }

    // Send to our internal analytics
    this.sendEvent(event)

    // Also send to Vercel Analytics for key events
    if (this.shouldTrackInVercel(eventType, eventName)) {
      try {
        track(eventName, {
          event_type: eventType,
          ...properties
        })
      } catch (error) {
        console.warn('Vercel Analytics tracking failed:', error)
      }
    }
  }

  private shouldTrackInVercel(eventType: string, eventName: string): boolean {
    // Track important business events in Vercel Analytics
    const importantEvents = [
      'page_view',
      'user_signup',
      'user_login',
      'project_created',
      'payment_completed',
      'file_uploaded',
      'comment_added',
      'feedback_submitted'
    ]
    
    return importantEvents.includes(eventName) || 
           eventType === 'conversion' || 
           eventType === 'business_metric'
  }

  public trackPageView(path: string, title?: string) {
    const pageData = {
      path,
      title: title || document.title,
      referrer: document.referrer || 'direct'
    }

    // Track in our internal system
    this.trackEvent('page_view', 'page_visited', pageData)

    // Also track in Vercel Analytics
    try {
      track('page_view', pageData)
    } catch (error) {
      console.warn('Vercel Analytics page view tracking failed:', error)
    }
  }

  public trackUserAction(action: string, element?: string, value?: any) {
    this.trackEvent('user_action', action, {
      element,
      value,
      path: window.location.pathname
    })
  }

  public trackBusinessMetric(metricName: string, value: number, unit: string = 'count') {
    const metricData = {
      metric_name: metricName,
      value,
      unit
    }

    this.trackEvent('business_metric', metricName, metricData)

    // Track key business metrics in Vercel Analytics
    if (['revenue', 'conversion', 'signup', 'upgrade'].includes(metricName.toLowerCase())) {
      try {
        track('business_metric', metricData)
      } catch (error) {
        console.warn('Vercel Analytics business metric tracking failed:', error)
      }
    }
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      const payload = {
        ...event,
        session_id: this.sessionId,
        page_url: window.location.href
      }

      // Use beacon API for reliable delivery
      if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(
          '/api/analytics/events',
          JSON.stringify(payload)
        )
        
        if (!success) {
          // Fallback to fetch
          this.sendWithFetch(payload)
        }
      } else {
        this.sendWithFetch(payload)
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error)
      // Queue for retry
      this.eventQueue.push(event)
    }
  }

  private async sendWithFetch(payload: any) {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true
      })
    } catch (error) {
      console.error('Fetch analytics error:', error)
    }
  }

  private flushEvents() {
    // Send any queued events
    this.eventQueue.forEach(event => {
      this.sendEvent(event)
    })
    this.eventQueue = []
  }
}

// Global analytics instance
let analyticsInstance: AnalyticsClient | null = null

const getAnalytics = () => {
  if (!analyticsInstance && typeof window !== 'undefined') {
    analyticsInstance = new AnalyticsClient()
  }
  return analyticsInstance
}

// React hook for analytics
export function useAnalytics() {
  const pathname = usePathname()
  const previousPath = useRef<string>('')

  // Track page views when pathname changes
  useEffect(() => {
    if (pathname && pathname !== previousPath.current) {
      const analytics = getAnalytics()
      if (analytics) {
        analytics.trackPageView(pathname)
        previousPath.current = pathname
      }
    }
  }, [pathname])

  const trackEvent = useCallback((
    eventType: string,
    eventName: string,
    properties?: Record<string, any>
  ) => {
    const analytics = getAnalytics()
    if (analytics) {
      analytics.trackEvent(eventType, eventName, properties)
    }
  }, [])

  const trackPageView = useCallback((path: string, title?: string) => {
    const analytics = getAnalytics()
    if (analytics) {
      analytics.trackPageView(path, title)
    }
  }, [])

  const trackUserAction = useCallback((action: string, element?: string, value?: any) => {
    const analytics = getAnalytics()
    if (analytics) {
      analytics.trackUserAction(action, element, value)
    }
  }, [])

  const trackBusinessMetric = useCallback((metricName: string, value: number, unit?: string) => {
    const analytics = getAnalytics()
    if (analytics) {
      analytics.trackBusinessMetric(metricName, value, unit)
    }
  }, [])

  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    trackUserAction('button_clicked', buttonName, { location })
  }, [trackUserAction])

  const trackFormSubmit = useCallback((formName: string, success: boolean = true) => {
    trackUserAction('form_submitted', formName, { success })
  }, [trackUserAction])

  const trackFileUpload = useCallback((fileName: string, fileSize: number, fileType: string) => {
    trackUserAction('file_uploaded', 'file_upload', {
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType
    })
  }, [trackUserAction])

  const trackPayment = useCallback((amount: number, currency: string = 'USD', success: boolean = true) => {
    if (success) {
      trackBusinessMetric('revenue', amount, currency.toLowerCase())
      trackBusinessMetric('payments_completed', 1, 'count')
    }
    trackUserAction('payment_attempted', 'payment_form', {
      amount,
      currency,
      success
    })
  }, [trackUserAction, trackBusinessMetric])

  const trackProjectCreated = useCallback(() => {
    trackBusinessMetric('projects_created', 1, 'count')
    trackUserAction('project_created', 'project_form')
  }, [trackUserAction, trackBusinessMetric])

  const trackSearch = useCallback((query: string, results: number) => {
    trackUserAction('search_performed', 'search_box', {
      query,
      results_count: results
    })
  }, [trackUserAction])

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackBusinessMetric,
    trackButtonClick,
    trackFormSubmit,
    trackFileUpload,
    trackPayment,
    trackProjectCreated,
    trackSearch
  }
}

// Higher-order component for automatic analytics tracking
export function withAnalytics<T extends object>(WrappedComponent: React.ComponentType<T>) {
  return function AnalyticsWrapper(props: T) {
    useAnalytics() // Initialize analytics for the component tree
    return <WrappedComponent {...props} />
  }
}

// Utility function for manual tracking outside of React
export const analytics = {
  track: (eventType: string, eventName: string, properties?: Record<string, any>) => {
    const instance = getAnalytics()
    if (instance) {
      instance.trackEvent(eventType, eventName, properties)
    }
  },
  
  trackPageView: (path: string, title?: string) => {
    const instance = getAnalytics()
    if (instance) {
      instance.trackPageView(path, title)
    }
  },
  
  trackUserAction: (action: string, element?: string, value?: any) => {
    const instance = getAnalytics()
    if (instance) {
      instance.trackUserAction(action, element, value)
    }
  },
  
  trackBusinessMetric: (metricName: string, value: number, unit?: string) => {
    const instance = getAnalytics()
    if (instance) {
      instance.trackBusinessMetric(metricName, value, unit)
    }
  }
}

export default useAnalytics 
