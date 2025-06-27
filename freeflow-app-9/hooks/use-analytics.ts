'use client&apos;

import React, { useEffect, useCallback, useRef } from &apos;react&apos;
import { usePathname } from &apos;next/navigation&apos;
import { track } from &apos;@vercel/analytics&apos;

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
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}
  }

  private initializeIfNeeded() {
    if (this.isInitialized || typeof window === &apos;undefined&apos;) return

    this.isInitialized = true
    this.setupPerformanceTracking()
    this.trackPageLoad()
    this.setupErrorTracking()
    this.setupUnloadTracking()
  }

  private setupPerformanceTracking() {
    // Track Web Vitals using PerformanceObserver
    if (&apos;PerformanceObserver&apos; in window) {
      // Largest Contentful Paint
      this.observePerformanceMetric(&apos;largest-contentful-paint&apos;, (entries) => {
        const lastEntry = entries[entries.length - 1]
        this.trackEvent(&apos;performance&apos;, &apos;lcp_measured&apos;, {
          performance_metrics: {
            largest_contentful_paint: lastEntry.startTime
          }
        })
      })

      // First Input Delay
      this.observePerformanceMetric(&apos;first-input&apos;, (entries) => {
        const firstEntry = entries[0]
        this.fidValue = firstEntry.processingStart - firstEntry.startTime
        this.trackEvent(&apos;performance&apos;, &apos;fid_measured&apos;, {
          performance_metrics: {
            first_input_delay: this.fidValue
          }
        })
      })

      // Cumulative Layout Shift
      this.observePerformanceMetric(&apos;layout-shift&apos;, (entries) => {
        entries.forEach((entry: unknown) => {
          if (!entry.hadRecentInput) {
            this.clsValue += entry.value
          }
        })
      })
    }

    // Track page load performance
    window.addEventListener(&apos;load&apos;, () => {
      setTimeout(() => {
        this.trackPagePerformance()
      }, 0)
    })
  }

  private observePerformanceMetric(entryType: string, callback: (entries: unknown[]) => void) {
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
    this.trackEvent(&apos;page_view&apos;, &apos;page_loaded&apos;, {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || &apos;direct&apos;
    })
  }

  private trackPagePerformance() {
    const navigation = performance.getEntriesByType(&apos;navigation&apos;)[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType(&apos;paint&apos;)

    const metrics: PerformanceMetrics = {
      page_load_time: navigation.loadEventEnd - navigation.fetchStart,
      dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    }

    // Add paint timings
    paint.forEach((entry) => {
      if (entry.name === &apos;first-contentful-paint&apos;) {
        metrics.first_contentful_paint = entry.startTime
      }
    })

    // Add CLS if measured
    if (this.clsValue > 0) {
      metrics.cumulative_layout_shift = this.clsValue
    }

    this.trackEvent(&apos;performance&apos;, &apos;page_performance&apos;, {
      performance_metrics: metrics
    })
  }

  private setupErrorTracking() {
    window.addEventListener(&apos;error&apos;, (event) => {
      this.trackEvent(&apos;error&apos;, &apos;javascript_error&apos;, {
        error_message: event.message,
        filename: event.filename,
        line_number: event.lineno,
        column_number: event.colno,
        stack: event.error?.stack
      })
    })

    window.addEventListener(&apos;unhandledrejection&apos;, (event) => {
      this.trackEvent(&apos;error&apos;, &apos;unhandled_promise_rejection&apos;, {
        error_message: event.reason?.toString() || &apos;Unknown promise rejection&apos;,
        stack: event.reason?.stack
      })
    })
  }

  private setupUnloadTracking() {
    const trackSessionEnd = () => {
      this.trackEvent(&apos;session&apos;, &apos;session_ended&apos;, {
        session_duration: Date.now() - parseInt(this.sessionId.split(&apos;-')[0])
      })
      
      // Send any queued events before page unload
      this.flushEvents()
    }

    window.addEventListener(&apos;beforeunload&apos;, trackSessionEnd)
    window.addEventListener(&apos;pagehide&apos;, trackSessionEnd)
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
        console.warn(&apos;Vercel Analytics tracking failed:&apos;, error)
      }
    }
  }

  private shouldTrackInVercel(eventType: string, eventName: string): boolean {
    // Track important business events in Vercel Analytics
    const importantEvents = [
      &apos;page_view&apos;,
      &apos;user_signup&apos;,
      &apos;user_login&apos;,
      &apos;project_created&apos;,
      &apos;payment_completed&apos;,
      &apos;file_uploaded&apos;,
      &apos;comment_added&apos;,
      &apos;feedback_submitted&apos;
    ]
    
    return importantEvents.includes(eventName) || 
           eventType === &apos;conversion&apos; || 
           eventType === &apos;business_metric&apos;
  }

  public trackPageView(path: string, title?: string) {
    const pageData = {
      path,
      title: title || document.title,
      referrer: document.referrer || &apos;direct&apos;
    }

    // Track in our internal system
    this.trackEvent(&apos;page_view&apos;, &apos;page_visited&apos;, pageData)

    // Also track in Vercel Analytics
    try {
      track(&apos;page_view&apos;, pageData)
    } catch (error) {
      console.warn(&apos;Vercel Analytics page view tracking failed:&apos;, error)
    }
  }

  public trackUserAction(action: string, element?: string, value?: unknown) {
    this.trackEvent(&apos;user_action&apos;, action, {
      element,
      value,
      path: window.location.pathname
    })
  }

  public trackBusinessMetric(metricName: string, value: number, unit: string = &apos;count&apos;) {
    const metricData = {
      metric_name: metricName,
      value,
      unit
    }

    this.trackEvent(&apos;business_metric&apos;, metricName, metricData)

    // Track key business metrics in Vercel Analytics
    if ([&apos;revenue&apos;, &apos;conversion&apos;, &apos;signup&apos;, &apos;upgrade&apos;].includes(metricName.toLowerCase())) {
      try {
        track(&apos;business_metric&apos;, metricData)
      } catch (error) {
        console.warn(&apos;Vercel Analytics business metric tracking failed:&apos;, error)
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
          &apos;/api/analytics/events&apos;,
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
      console.error(&apos;Failed to send analytics event:&apos;, error)
      // Queue for retry
      this.eventQueue.push(event)
    }
  }

  private async sendWithFetch(payload: unknown) {
    try {
      await fetch(&apos;/api/analytics/events&apos;, {
        method: &apos;POST&apos;,
        headers: {
          &apos;Content-Type&apos;: &apos;application/json&apos;,
        },
        body: JSON.stringify(payload),
        keepalive: true
      })
    } catch (error) {
      console.error(&apos;Fetch analytics error:&apos;, error)
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
  if (!analyticsInstance && typeof window !== &apos;undefined&apos;) {
    analyticsInstance = new AnalyticsClient()
  }
  return analyticsInstance
}

// React hook for analytics
export function useAnalytics() {
  const pathname = usePathname()
  const previousPath = useRef<string>('&apos;)

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

  const trackUserAction = useCallback((action: string, element?: string, value?: unknown) => {
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
    trackUserAction(&apos;button_clicked&apos;, buttonName, { location })
  }, [trackUserAction])

  const trackFormSubmit = useCallback((formName: string, success: boolean = true) => {
    trackUserAction(&apos;form_submitted&apos;, formName, { success })
  }, [trackUserAction])

  const trackFileUpload = useCallback((fileName: string, fileSize: number, fileType: string) => {
    trackUserAction(&apos;file_uploaded&apos;, &apos;file_upload&apos;, {
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType
    })
  }, [trackUserAction])

  const trackPayment = useCallback((amount: number, currency: string = &apos;USD&apos;, success: boolean = true) => {
    if (success) {
      trackBusinessMetric(&apos;revenue&apos;, amount, currency.toLowerCase())
      trackBusinessMetric(&apos;payments_completed&apos;, 1, &apos;count&apos;)
    }
    trackUserAction(&apos;payment_attempted&apos;, &apos;payment_form&apos;, {
      amount,
      currency,
      success
    })
  }, [trackUserAction, trackBusinessMetric])

  const trackProjectCreated = useCallback(() => {
    trackBusinessMetric(&apos;projects_created&apos;, 1, &apos;count&apos;)
    trackUserAction(&apos;project_created&apos;, &apos;project_form&apos;)
  }, [trackUserAction, trackBusinessMetric])

  const trackSearch = useCallback((query: string, results: number) => {
    trackUserAction(&apos;search_performed&apos;, &apos;search_box&apos;, {
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
  
  trackUserAction: (action: string, element?: string, value?: unknown) => {
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