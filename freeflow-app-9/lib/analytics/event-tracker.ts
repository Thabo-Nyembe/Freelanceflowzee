/**
 * Event Tracker Service
 *
 * Comprehensive event tracking with queue batching, offline support,
 * and automatic enrichment. Server-side compatible with client hydration.
 */

export type EventCategory =
  | 'page'
  | 'user'
  | 'interaction'
  | 'conversion'
  | 'error'
  | 'performance'
  | 'feature'
  | 'engagement'
  | 'system'
  | 'custom'

export interface TrackedEvent {
  id: string
  name: string
  category: EventCategory
  properties: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
  deviceId: string
  metadata: EventMetadata
}

export interface EventMetadata {
  url?: string
  referrer?: string
  userAgent?: string
  viewport?: { width: number; height: number }
  locale?: string
  timezone?: string
  screenResolution?: { width: number; height: number }
  connectionType?: string
  deviceMemory?: number
  hardwareConcurrency?: number
}

export interface EventTrackerConfig {
  batchSize?: number
  flushInterval?: number
  maxQueueSize?: number
  endpoint?: string
  debug?: boolean
  enrichMetadata?: boolean
  offlineSupport?: boolean
  onError?: (error: Error, events: TrackedEvent[]) => void
}

const DEFAULT_CONFIG: Required<EventTrackerConfig> = {
  batchSize: 10,
  flushInterval: 5000,
  maxQueueSize: 1000,
  endpoint: '/api/analytics/realtime',
  debug: false,
  enrichMetadata: true,
  offlineSupport: true,
  onError: () => {}
}

/**
 * EventTracker class for tracking user events
 */
export class EventTracker {
  private config: Required<EventTrackerConfig>
  private queue: TrackedEvent[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private sessionId: string
  private deviceId: string
  private userId?: string
  private isOnline: boolean = true
  private persistKey = 'event_tracker_queue'

  constructor(config: EventTrackerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateId()
    this.deviceId = this.getOrCreateDeviceId()

    if (typeof window !== 'undefined') {
      this.setupOnlineListener()
      this.loadPersistedQueue()
      this.startFlushTimer()
    }
  }

  /**
   * Track an event
   */
  track(
    name: string,
    category: EventCategory = 'custom',
    properties: Record<string, any> = {}
  ): void {
    const event: TrackedEvent = {
      id: this.generateId(),
      name,
      category,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      deviceId: this.deviceId,
      metadata: this.config.enrichMetadata ? this.getMetadata() : {}
    }

    this.addToQueue(event)

    if (this.config.debug) {
      console.log('[EventTracker] Tracked:', event)
    }

    if (this.queue.length >= this.config.batchSize) {
      this.flush()
    }
  }

  /**
   * Track page view
   */
  trackPageView(path?: string, title?: string): void {
    this.track('page_view', 'page', {
      path: path || (typeof window !== 'undefined' ? window.location.pathname : ''),
      title: title || (typeof document !== 'undefined' ? document.title : ''),
      search: typeof window !== 'undefined' ? window.location.search : '',
      hash: typeof window !== 'undefined' ? window.location.hash : ''
    })
  }

  /**
   * Track user interaction
   */
  trackInteraction(
    element: string,
    action: 'click' | 'hover' | 'focus' | 'scroll' | 'drag' | 'input',
    properties?: Record<string, any>
  ): void {
    this.track(`${element}_${action}`, 'interaction', {
      element,
      action,
      ...properties
    })
  }

  /**
   * Track conversion event
   */
  trackConversion(
    conversionType: string,
    value?: number,
    currency?: string,
    properties?: Record<string, any>
  ): void {
    this.track('conversion', 'conversion', {
      conversionType,
      value,
      currency,
      ...properties
    })
  }

  /**
   * Track feature usage
   */
  trackFeature(featureName: string, action: string, properties?: Record<string, any>): void {
    this.track(`feature_${action}`, 'feature', {
      feature: featureName,
      action,
      ...properties
    })
  }

  /**
   * Track error
   */
  trackError(
    errorType: string,
    message: string,
    stack?: string,
    properties?: Record<string, any>
  ): void {
    this.track('error', 'error', {
      errorType,
      message,
      stack,
      ...properties
    })
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, unit?: string): void {
    this.track('performance', 'performance', {
      metric,
      value,
      unit
    })
  }

  /**
   * Track engagement
   */
  trackEngagement(
    contentType: string,
    contentId: string,
    action: 'view' | 'like' | 'share' | 'comment' | 'save' | 'complete',
    properties?: Record<string, any>
  ): void {
    this.track(`engagement_${action}`, 'engagement', {
      contentType,
      contentId,
      action,
      ...properties
    })
  }

  /**
   * Track funnel step
   */
  trackFunnelStep(
    funnelId: string,
    stepId: string,
    stepIndex: number,
    properties?: Record<string, any>
  ): void {
    this.track('funnel_step', 'conversion', {
      funnelId,
      stepId,
      stepIndex,
      ...properties
    })
  }

  /**
   * Track custom timing
   */
  trackTiming(
    category: string,
    variable: string,
    timeMs: number,
    label?: string
  ): void {
    this.track('timing', 'performance', {
      category,
      variable,
      timeMs,
      label
    })
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string | undefined): void {
    this.userId = userId
  }

  /**
   * Start a new session
   */
  startNewSession(): void {
    this.sessionId = this.generateId()
    this.track('session_start', 'system')
  }

  /**
   * Flush pending events
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const eventsToSend = this.queue.splice(0, this.config.batchSize)

    if (!this.isOnline && this.config.offlineSupport) {
      // Re-add to queue if offline
      this.queue.unshift(...eventsToSend)
      this.persistQueue()
      return
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track-event',
          events: eventsToSend
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      if (this.config.debug) {
        console.log(`[EventTracker] Flushed ${eventsToSend.length} events`)
      }

      // Clear persisted queue on success
      this.clearPersistedQueue()

    } catch (error) {
      // Re-add failed events to queue
      this.queue.unshift(...eventsToSend)
      this.config.onError(error as Error, eventsToSend)

      if (this.config.offlineSupport) {
        this.persistQueue()
      }

      if (this.config.debug) {
        console.error('[EventTracker] Flush failed:', error)
      }
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length
  }

  /**
   * Destroy tracker
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush()
  }

  // Private methods

  private addToQueue(event: TrackedEvent): void {
    if (this.queue.length >= this.config.maxQueueSize) {
      // Remove oldest events if queue is full
      this.queue.shift()
    }
    this.queue.push(event)

    if (this.config.offlineSupport) {
      this.persistQueue()
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  private getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') return 'server'

    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = this.generateId()
      localStorage.setItem('device_id', deviceId)
    }
    return deviceId
  }

  private getMetadata(): EventMetadata {
    if (typeof window === 'undefined') return {}

    const metadata: EventMetadata = {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      locale: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: {
        width: window.screen.width,
        height: window.screen.height
      }
    }

    // Optional navigator properties
    if ('connection' in navigator) {
      const conn = (navigator as Record<string, unknown>).connection
      metadata.connectionType = conn?.effectiveType
    }

    if ('deviceMemory' in navigator) {
      metadata.deviceMemory = (navigator as Record<string, unknown>).deviceMemory
    }

    if ('hardwareConcurrency' in navigator) {
      metadata.hardwareConcurrency = navigator.hardwareConcurrency
    }

    return metadata
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flush() // Flush queued events when back online
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    this.isOnline = navigator.onLine
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private persistQueue(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(this.persistKey, JSON.stringify(this.queue))
    } catch (error) {
      console.warn('[EventTracker] Failed to persist queue:', error)
    }
  }

  private loadPersistedQueue(): void {
    if (typeof window === 'undefined') return
    try {
      const persisted = localStorage.getItem(this.persistKey)
      if (persisted) {
        const events = JSON.parse(persisted)
        this.queue = [...events, ...this.queue]
      }
    } catch (error) {
      console.warn('[EventTracker] Failed to load persisted queue:', error)
    }
  }

  private clearPersistedQueue(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(this.persistKey)
    } catch (error) {
      console.warn('[EventTracker] Failed to clear persisted queue:', error)
    }
  }
}

// Singleton instance
let trackerInstance: EventTracker | null = null

/**
 * Get or create event tracker instance
 */
export function getEventTracker(config?: EventTrackerConfig): EventTracker {
  if (!trackerInstance) {
    trackerInstance = new EventTracker(config)
  }
  return trackerInstance
}

/**
 * Create a new event tracker instance
 */
export function createEventTracker(config?: EventTrackerConfig): EventTracker {
  return new EventTracker(config)
}

/**
 * Quick track function
 */
export function trackEvent(
  name: string,
  category: EventCategory = 'custom',
  properties: Record<string, any> = {}
): void {
  getEventTracker().track(name, category, properties)
}

/**
 * Quick track page view
 */
export function trackPageView(path?: string, title?: string): void {
  getEventTracker().trackPageView(path, title)
}
