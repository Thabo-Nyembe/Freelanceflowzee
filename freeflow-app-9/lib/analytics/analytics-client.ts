'use client'

import { track } from '@vercel/analytics'

interface AnalyticsEvent {
  event_type: string
  event_name: string
  properties?: Record<string, any>
  performance_metrics?: Record<string, number>
}

interface ErrorDetails {
  error_type: string;
  message: string;
  stack?: string;
  code?: string;
  context?: Record<string, unknown>;
  [key: string]: unknown; // Allow additional properties
}

class IntegratedAnalyticsClient {
  private sessionId: string
  private isInitialized: boolean = false

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeIfNeeded()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeIfNeeded() {
    if (this.isInitialized || typeof window === 'undefined') return
    this.isInitialized = true
    this.setupPerformanceTracking()
    this.setupErrorTracking()
  }

  private setupPerformanceTracking() {
    if ('PerformanceObserver' in window) {
      // Track Core Web Vitals and send to both systems
      this.observePerformanceMetric('largest-contentful-paint', (entries) => {
        const lcp = entries[entries.length - 1].startTime
        this.trackPerformance('lcp', lcp)
      })

      this.observePerformanceMetric('first-input', (entries) => {
        const fid = entries[0].processingStart - entries[0].startTime
        this.trackPerformance('fid', fid)
      })
    }
  }

  private observePerformanceMetric(entryType: string, callback: (entries: Record<string, unknown>[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries())
      })
      observer.observe({ entryTypes: [entryType] })
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error)
    }
  }

  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise_rejection', {
        message: event.reason?.toString() || 'Unknown promise rejection'
      })
    })
  }

  // Public tracking methods
  public trackEvent(eventName: string, properties: Record<string, any> = {}) {
    const enrichedProperties = {
      ...properties,
      timestamp: Date.now(),
      session_id: this.sessionId,
      user_agent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    }

    // Send to internal analytics API
    this.sendToInternalAnalytics(eventName, enrichedProperties)

    // Send important events to Vercel Analytics
    if (this.isImportantEvent(eventName)) {
      try {
        track(eventName, enrichedProperties)
      } catch (error) {
        console.warn('Vercel Analytics tracking failed:', error)
      }
    }
  }

  public trackPageView(path: string, title?: string) {
    const pageData = {
      path,
      title: title || document.title,
      referrer: document.referrer || 'direct'
    }

    this.trackEvent('page_view', pageData)
  }

  public trackConversion(action: string, value?: number, currency?: string) {
    const conversionData: Record<string, any> = { action }
    if (value !== undefined) conversionData.value = value
    if (currency) conversionData.currency = currency

    this.trackEvent('conversion', conversionData)
  }

  public trackPerformance(metric: string, value: number) {
    const performanceData = {
      metric,
      value,
      page: window.location.pathname
    }

    this.trackEvent('performance', performanceData)
  }

  public trackError(type: string, details: Partial<ErrorDetails> & { message: string }) {
    try {
      // Ensure required fields are present
      if (!type || !details.message) {
        throw new Error('Error type and message are required')
      }

      // Format error details
      const errorData: ErrorDetails = {
        error_type: type,
        message: details.message,
        stack: details.stack,
        code: details.code,
        context: details.context,
        timestamp: new Date().toISOString()
      }

      this.trackEvent('error', errorData)
    } catch (error) {
      // Log error but don't throw to prevent error tracking from breaking the app
      console.error('Failed to track error:', {
        error_type: 'analytics_error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        context: {
          originalError: details
        }
      } as ErrorDetails)
    }
  }

  // Helper methods
  private isImportantEvent(eventName: string): boolean {
    const importantEvents = ['page_view', 'conversion', 'signup', 'login', 'purchase', 'subscription', 'error', 'performance'
    ]
    return importantEvents.includes(eventName)
  }

  private async sendToInternalAnalytics(eventName: string, properties: Record<string, any>) {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: eventName,
          properties
        })
      })
    } catch (error) {
      console.warn('Internal analytics tracking failed:', error)
    }
  }
}

// Singleton instance
let analyticsClient: IntegratedAnalyticsClient | null = null

export function getAnalytics(): IntegratedAnalyticsClient {
  if (!analyticsClient && typeof window !== 'undefined') {
    analyticsClient = new IntegratedAnalyticsClient()
  }
  return analyticsClient!
}

// React hook for easy usage
export function useIntegratedAnalytics() {
  return getAnalytics()
} 