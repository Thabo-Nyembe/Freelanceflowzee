/**
 * Session Tracker Service
 *
 * Comprehensive session management with activity tracking,
 * session lifecycle events, and cross-tab synchronization.
 */

export interface SessionData {
  id: string
  userId?: string
  startTime: number
  lastActivity: number
  pageViews: number
  events: number
  duration: number
  isActive: boolean
  device: DeviceInfo
  location?: LocationInfo
  entryPage: string
  exitPage?: string
  referrer?: string
  utmParams?: UTMParams
}

export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile' | 'unknown'
  os: string
  browser: string
  browserVersion: string
  screenResolution: string
  viewportSize: string
  language: string
  timezone: string
}

export interface LocationInfo {
  country?: string
  region?: string
  city?: string
  ip?: string
}

export interface UTMParams {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

export interface SessionTrackerConfig {
  sessionTimeout?: number // ms of inactivity before new session
  heartbeatInterval?: number // ms between heartbeats
  endpoint?: string
  debug?: boolean
  trackPageViews?: boolean
  trackVisibility?: boolean
  crossTabSync?: boolean
  onSessionStart?: (session: SessionData) => void
  onSessionEnd?: (session: SessionData) => void
  onHeartbeat?: (session: SessionData) => void
}

const DEFAULT_CONFIG: Required<SessionTrackerConfig> = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  heartbeatInterval: 30 * 1000, // 30 seconds
  endpoint: '/api/analytics/realtime',
  debug: false,
  trackPageViews: true,
  trackVisibility: true,
  crossTabSync: true,
  onSessionStart: () => {},
  onSessionEnd: () => {},
  onHeartbeat: () => {}
}

const SESSION_STORAGE_KEY = 'analytics_session'
const CROSS_TAB_CHANNEL = 'session_tracker_channel'

/**
 * SessionTracker class
 */
export class SessionTracker {
  private config: Required<SessionTrackerConfig>
  private session: SessionData | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private activityTimer: NodeJS.Timeout | null = null
  private broadcastChannel: BroadcastChannel | null = null
  private isLeaderTab: boolean = false

  constructor(config: SessionTrackerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    if (typeof window !== 'undefined') {
      this.initializeSession()
      this.setupEventListeners()
      this.setupCrossTabSync()
      this.startHeartbeat()
    }
  }

  /**
   * Get current session
   */
  getSession(): SessionData | null {
    return this.session
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    return this.session?.id || null
  }

  /**
   * Set user ID
   */
  setUserId(userId: string | undefined): void {
    if (this.session) {
      this.session.userId = userId
      this.persistSession()
    }
  }

  /**
   * Track page view
   */
  trackPageView(path?: string): void {
    if (!this.session) return

    this.session.pageViews++
    this.session.exitPage = path || window.location.pathname
    this.recordActivity()

    if (this.config.debug) {
      console.log('[SessionTracker] Page view:', this.session.pageViews)
    }
  }

  /**
   * Track event
   */
  trackEvent(): void {
    if (!this.session) return
    this.session.events++
    this.recordActivity()
  }

  /**
   * Record user activity
   */
  recordActivity(): void {
    if (!this.session) return

    this.session.lastActivity = Date.now()
    this.session.duration = this.session.lastActivity - this.session.startTime
    this.session.isActive = true

    this.persistSession()
    this.resetActivityTimer()
  }

  /**
   * End current session
   */
  endSession(): void {
    if (!this.session) return

    this.session.isActive = false
    this.session.duration = Date.now() - this.session.startTime

    // Send session end event
    this.sendSessionEvent('end')
    this.config.onSessionEnd(this.session)

    if (this.config.debug) {
      console.log('[SessionTracker] Session ended:', this.session)
    }

    // Clear session
    this.clearPersistedSession()
    this.session = null
  }

  /**
   * Force start a new session
   */
  startNewSession(): void {
    if (this.session) {
      this.endSession()
    }
    this.createSession()
  }

  /**
   * Get session duration in seconds
   */
  getDuration(): number {
    if (!this.session) return 0
    return Math.floor((Date.now() - this.session.startTime) / 1000)
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    return this.session?.isActive || false
  }

  /**
   * Destroy tracker
   */
  destroy(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close()
    }
    this.endSession()
  }

  // Private methods

  private initializeSession(): void {
    // Try to restore existing session
    const existingSession = this.loadPersistedSession()

    if (existingSession && this.isSessionValid(existingSession)) {
      this.session = existingSession
      this.recordActivity()

      if (this.config.debug) {
        console.log('[SessionTracker] Restored session:', this.session.id)
      }
    } else {
      this.createSession()
    }
  }

  private createSession(): void {
    const device = this.getDeviceInfo()
    const utmParams = this.getUTMParams()

    this.session = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 1,
      events: 0,
      duration: 0,
      isActive: true,
      device,
      entryPage: window.location.pathname,
      referrer: document.referrer || undefined,
      utmParams: Object.keys(utmParams).length > 0 ? utmParams : undefined
    }

    this.persistSession()
    this.sendSessionEvent('start')
    this.config.onSessionStart(this.session)

    if (this.config.debug) {
      console.log('[SessionTracker] New session:', this.session)
    }
  }

  private isSessionValid(session: SessionData): boolean {
    const now = Date.now()
    const timeSinceLastActivity = now - session.lastActivity
    return timeSinceLastActivity < this.config.sessionTimeout
  }

  private setupEventListeners(): void {
    // Activity events
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.recordActivity(), { passive: true })
    })

    // Page visibility
    if (this.config.trackVisibility) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.session) {
            this.session.isActive = false
            this.persistSession()
          }
        } else {
          this.recordActivity()
        }
      })
    }

    // Page unload
    window.addEventListener('beforeunload', () => {
      if (this.session) {
        this.session.exitPage = window.location.pathname
        this.persistSession()
        this.sendHeartbeat(true) // Final heartbeat
      }
    })

    // Page visibility for tracking
    if (this.config.trackPageViews) {
      // Initial page view is tracked in createSession
      window.addEventListener('popstate', () => {
        this.trackPageView()
      })
    }
  }

  private setupCrossTabSync(): void {
    if (!this.config.crossTabSync || typeof BroadcastChannel === 'undefined') return

    this.broadcastChannel = new BroadcastChannel(CROSS_TAB_CHANNEL)

    // Request leadership on start
    this.requestLeadership()

    this.broadcastChannel.onmessage = (event) => {
      const { type, data } = event.data

      switch (type) {
        case 'activity':
          // Sync activity across tabs
          if (this.session && data.sessionId === this.session.id) {
            this.session.lastActivity = Math.max(this.session.lastActivity, data.timestamp)
            this.session.pageViews = Math.max(this.session.pageViews, data.pageViews)
          }
          break

        case 'session_end':
          // Another tab ended the session
          if (this.session?.id === data.sessionId) {
            this.session = null
            this.clearPersistedSession()
          }
          break

        case 'leadership_request':
          // Another tab is requesting leadership
          if (this.isLeaderTab) {
            this.broadcastChannel?.postMessage({
              type: 'leadership_response',
              data: { tabId: this.getTabId() }
            })
          }
          break

        case 'leadership_response':
          // Another tab is already leader
          this.isLeaderTab = false
          break
      }
    }
  }

  private requestLeadership(): void {
    this.isLeaderTab = true
    this.broadcastChannel?.postMessage({
      type: 'leadership_request',
      data: { tabId: this.getTabId() }
    })

    // If no response in 100ms, we're the leader
    setTimeout(() => {
      if (this.config.debug && this.isLeaderTab) {
        console.log('[SessionTracker] This tab is leader')
      }
    }, 100)
  }

  private getTabId(): string {
    let tabId = sessionStorage.getItem('tab_id')
    if (!tabId) {
      tabId = Math.random().toString(36).slice(2, 11)
      sessionStorage.setItem('tab_id', tabId)
    }
    return tabId
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isLeaderTab || !this.config.crossTabSync) {
        this.sendHeartbeat()
      }
    }, this.config.heartbeatInterval)
  }

  private resetActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }

    this.activityTimer = setTimeout(() => {
      if (this.session) {
        this.session.isActive = false
        this.persistSession()
      }
    }, this.config.sessionTimeout)
  }

  private async sendHeartbeat(isFinal: boolean = false): Promise<void> {
    if (!this.session) return

    try {
      const method = isFinal ? 'sendBeacon' : 'fetch'
      const body = JSON.stringify({
        action: 'heartbeat',
        userId: this.session.userId,
        sessionId: this.session.id
      })

      if (isFinal && navigator.sendBeacon) {
        navigator.sendBeacon(this.config.endpoint, body)
      } else {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        })
      }

      this.config.onHeartbeat(this.session)

      if (this.config.debug) {
        console.log('[SessionTracker] Heartbeat sent')
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[SessionTracker] Heartbeat failed:', error)
      }
    }
  }

  private async sendSessionEvent(type: 'start' | 'end'): Promise<void> {
    if (!this.session) return

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track-event',
          userId: this.session.userId,
          sessionId: this.session.id,
          eventType: 'system',
          eventName: `session_${type}`,
          properties: {
            sessionId: this.session.id,
            duration: this.session.duration,
            pageViews: this.session.pageViews,
            events: this.session.events,
            entryPage: this.session.entryPage,
            exitPage: this.session.exitPage,
            device: this.session.device
          }
        })
      })
    } catch (error) {
      if (this.config.debug) {
        console.error(`[SessionTracker] Failed to send ${type} event:`, error)
      }
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  private getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent

    // Detect device type
    let deviceType: DeviceInfo['type'] = 'desktop'
    if (/Mobi|Android/i.test(ua)) {
      deviceType = /Tablet|iPad/i.test(ua) ? 'tablet' : 'mobile'
    }

    // Detect OS
    let os = 'Unknown'
    if (/Windows/i.test(ua)) os = 'Windows'
    else if (/Mac/i.test(ua)) os = 'macOS'
    else if (/Linux/i.test(ua)) os = 'Linux'
    else if (/Android/i.test(ua)) os = 'Android'
    else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS'

    // Detect browser
    let browser = 'Unknown'
    let browserVersion = ''
    if (/Chrome\/(\d+)/.test(ua)) {
      browser = 'Chrome'
      browserVersion = RegExp.$1
    } else if (/Firefox\/(\d+)/.test(ua)) {
      browser = 'Firefox'
      browserVersion = RegExp.$1
    } else if (/Safari\/(\d+)/.test(ua) && !/Chrome/.test(ua)) {
      browser = 'Safari'
      browserVersion = RegExp.$1
    } else if (/Edge\/(\d+)/.test(ua)) {
      browser = 'Edge'
      browserVersion = RegExp.$1
    }

    return {
      type: deviceType,
      os,
      browser,
      browserVersion,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  private getUTMParams(): UTMParams {
    const params = new URLSearchParams(window.location.search)
    const utm: UTMParams = {}

    const utmKeys: (keyof UTMParams)[] = ['source', 'medium', 'campaign', 'term', 'content']
    utmKeys.forEach(key => {
      const value = params.get(`utm_${key}`)
      if (value) utm[key] = value
    })

    return utm
  }

  private persistSession(): void {
    if (!this.session) return
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session))

      // Broadcast to other tabs
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'activity',
          data: {
            sessionId: this.session.id,
            timestamp: this.session.lastActivity,
            pageViews: this.session.pageViews
          }
        })
      }
    } catch (error) {
      console.warn('[SessionTracker] Failed to persist session:', error)
    }
  }

  private loadPersistedSession(): SessionData | null {
    try {
      const data = sessionStorage.getItem(SESSION_STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  private clearPersistedSession(): void {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)

      // Notify other tabs
      if (this.broadcastChannel && this.session) {
        this.broadcastChannel.postMessage({
          type: 'session_end',
          data: { sessionId: this.session.id }
        })
      }
    } catch (error) {
      console.warn('[SessionTracker] Failed to clear session:', error)
    }
  }
}

// Singleton instance
let sessionTrackerInstance: SessionTracker | null = null

/**
 * Get or create session tracker instance
 */
export function getSessionTracker(config?: SessionTrackerConfig): SessionTracker {
  if (!sessionTrackerInstance) {
    sessionTrackerInstance = new SessionTracker(config)
  }
  return sessionTrackerInstance
}

/**
 * Create new session tracker
 */
export function createSessionTracker(config?: SessionTrackerConfig): SessionTracker {
  return new SessionTracker(config)
}
