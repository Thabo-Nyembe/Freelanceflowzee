/**
 * Presence Manager
 *
 * Industry-leading presence management with:
 * - Real-time online/offline status
 * - Custom status messages
 * - Activity tracking
 * - Last seen timestamps
 * - Multi-device support
 * - Presence caching
 * - Batch updates
 * - Heartbeat monitoring
 */

// ============================================================================
// Types
// ============================================================================

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline' | 'invisible'

export interface UserPresence {
  userId: string
  status: PresenceStatus
  statusMessage?: string
  statusEmoji?: string
  lastSeen: Date
  lastActivity: Date
  activeDevice?: string
  devices: DevicePresence[]
  currentChannel?: string
  isTyping?: boolean
  customStatus?: CustomStatus
}

export interface DevicePresence {
  deviceId: string
  deviceType: 'web' | 'desktop' | 'mobile' | 'tablet'
  status: PresenceStatus
  lastSeen: Date
  userAgent?: string
  ipAddress?: string
}

export interface CustomStatus {
  text: string
  emoji?: string
  expiresAt?: Date
  clearAfterStatus?: PresenceStatus
}

export interface PresenceUpdate {
  userId: string
  status?: PresenceStatus
  statusMessage?: string
  statusEmoji?: string
  customStatus?: CustomStatus | null
  deviceId?: string
}

export interface PresenceSubscription {
  id: string
  subscriberId: string
  targetUserId: string
  createdAt: Date
}

export interface PresenceEvent {
  type: 'status_change' | 'custom_status' | 'activity' | 'device_change'
  userId: string
  presence: UserPresence
  timestamp: Date
}

export interface BulkPresenceQuery {
  userIds: string[]
  includeDevices?: boolean
  includeCustomStatus?: boolean
}

// ============================================================================
// Configuration
// ============================================================================

export interface PresenceManagerConfig {
  heartbeatInterval?: number // in ms
  offlineThreshold?: number // in ms
  awayThreshold?: number // in ms
  maxDevicesPerUser?: number
  presenceCacheTtl?: number // in ms
  batchUpdateInterval?: number // in ms
  enableActivityTracking?: boolean
  persistOfflineStatus?: boolean
}

const DEFAULT_CONFIG: Required<PresenceManagerConfig> = {
  heartbeatInterval: 30000, // 30 seconds
  offlineThreshold: 60000, // 1 minute
  awayThreshold: 300000, // 5 minutes
  maxDevicesPerUser: 5,
  presenceCacheTtl: 60000, // 1 minute
  batchUpdateInterval: 1000, // 1 second
  enableActivityTracking: true,
  persistOfflineStatus: true,
}

// ============================================================================
// Presence Manager Class
// ============================================================================

export class PresenceManager {
  private config: Required<PresenceManagerConfig>
  private presence: Map<string, UserPresence> = new Map()
  private subscriptions: Map<string, Set<string>> = new Map() // userId -> subscriber userIds
  private pendingUpdates: Map<string, PresenceUpdate> = new Map()
  private heartbeatTimers: Map<string, NodeJS.Timeout> = new Map()
  private batchTimer: NodeJS.Timeout | null = null
  private eventListeners: Map<string, Set<(event: PresenceEvent) => void>> = new Map()

  constructor(config: PresenceManagerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startBatchProcessor()
  }

  // ==========================================================================
  // Presence Operations
  // ==========================================================================

  /**
   * Set user presence
   */
  setPresence(userId: string, update: Partial<PresenceUpdate>): UserPresence {
    const existing = this.presence.get(userId)
    const now = new Date()

    const presence: UserPresence = {
      userId,
      status: update.status || existing?.status || 'online',
      statusMessage: update.statusMessage ?? existing?.statusMessage,
      statusEmoji: update.statusEmoji ?? existing?.statusEmoji,
      lastSeen: now,
      lastActivity: now,
      activeDevice: update.deviceId || existing?.activeDevice,
      devices: existing?.devices || [],
      customStatus: update.customStatus === null ? undefined : (update.customStatus || existing?.customStatus),
    }

    // Update device presence
    if (update.deviceId) {
      this.updateDevicePresence(presence, update.deviceId, update.status || 'online')
    }

    this.presence.set(userId, presence)

    // Schedule batch update
    this.pendingUpdates.set(userId, { userId, ...update })

    // Emit event
    this.emitEvent({
      type: 'status_change',
      userId,
      presence,
      timestamp: now,
    })

    return presence
  }

  /**
   * Get user presence
   */
  getPresence(userId: string): UserPresence | null {
    const presence = this.presence.get(userId)
    if (!presence) return null

    // Check if presence is stale
    const now = new Date()
    const timeSinceLastSeen = now.getTime() - presence.lastSeen.getTime()

    if (timeSinceLastSeen > this.config.offlineThreshold) {
      // Mark as offline
      presence.status = 'offline'
    } else if (timeSinceLastSeen > this.config.awayThreshold && presence.status === 'online') {
      // Mark as away
      presence.status = 'away'
    }

    return presence
  }

  /**
   * Get multiple users' presence
   */
  getBulkPresence(query: BulkPresenceQuery): Map<string, UserPresence> {
    const results = new Map<string, UserPresence>()

    for (const userId of query.userIds) {
      const presence = this.getPresence(userId)
      if (presence) {
        const result: UserPresence = {
          ...presence,
          devices: query.includeDevices ? presence.devices : [],
          customStatus: query.includeCustomStatus ? presence.customStatus : undefined,
        }
        results.set(userId, result)
      } else {
        // Return offline presence for unknown users
        results.set(userId, {
          userId,
          status: 'offline',
          lastSeen: new Date(0),
          lastActivity: new Date(0),
          devices: [],
        })
      }
    }

    return results
  }

  /**
   * Update user activity (call on any user action)
   */
  updateActivity(userId: string, activity?: string): void {
    const presence = this.presence.get(userId)
    if (!presence) return

    const now = new Date()
    presence.lastActivity = now
    presence.lastSeen = now

    // If user was away, bring them back online
    if (presence.status === 'away') {
      presence.status = 'online'
      this.emitEvent({
        type: 'activity',
        userId,
        presence,
        timestamp: now,
      })
    }

    this.presence.set(userId, presence)
  }

  /**
   * Set custom status
   */
  setCustomStatus(userId: string, customStatus: CustomStatus | null): UserPresence | null {
    const presence = this.presence.get(userId)
    if (!presence) return null

    const now = new Date()
    presence.customStatus = customStatus || undefined
    presence.lastSeen = now

    this.presence.set(userId, presence)

    this.emitEvent({
      type: 'custom_status',
      userId,
      presence,
      timestamp: now,
    })

    return presence
  }

  /**
   * Clear expired custom statuses
   */
  clearExpiredStatuses(): void {
    const now = new Date()

    for (const [userId, presence] of this.presence.entries()) {
      if (presence.customStatus?.expiresAt && presence.customStatus.expiresAt <= now) {
        presence.customStatus = undefined

        // Restore status if configured
        if (presence.customStatus?.clearAfterStatus) {
          presence.status = presence.customStatus.clearAfterStatus
        }

        this.presence.set(userId, presence)
        this.emitEvent({
          type: 'custom_status',
          userId,
          presence,
          timestamp: now,
        })
      }
    }
  }

  // ==========================================================================
  // Device Management
  // ==========================================================================

  /**
   * Update device presence
   */
  private updateDevicePresence(
    presence: UserPresence,
    deviceId: string,
    status: PresenceStatus
  ): void {
    const now = new Date()
    const existingDevice = presence.devices.find((d) => d.deviceId === deviceId)

    if (existingDevice) {
      existingDevice.status = status
      existingDevice.lastSeen = now
    } else {
      // Add new device
      if (presence.devices.length >= this.config.maxDevicesPerUser) {
        // Remove oldest device
        presence.devices.sort((a, b) => a.lastSeen.getTime() - b.lastSeen.getTime())
        presence.devices.shift()
      }

      presence.devices.push({
        deviceId,
        deviceType: this.detectDeviceType(deviceId),
        status,
        lastSeen: now,
      })
    }
  }

  /**
   * Detect device type from device ID or user agent
   */
  private detectDeviceType(deviceId: string): 'web' | 'desktop' | 'mobile' | 'tablet' {
    // In production, would parse user agent
    if (deviceId.includes('mobile')) return 'mobile'
    if (deviceId.includes('tablet')) return 'tablet'
    if (deviceId.includes('desktop')) return 'desktop'
    return 'web'
  }

  /**
   * Disconnect device
   */
  disconnectDevice(userId: string, deviceId: string): void {
    const presence = this.presence.get(userId)
    if (!presence) return

    const deviceIndex = presence.devices.findIndex((d) => d.deviceId === deviceId)
    if (deviceIndex >= 0) {
      presence.devices.splice(deviceIndex, 1)
    }

    // If no devices left, mark as offline
    if (presence.devices.length === 0) {
      presence.status = 'offline'
      presence.lastSeen = new Date()
    } else {
      // Update active device
      presence.activeDevice = presence.devices[0].deviceId
    }

    this.presence.set(userId, presence)

    this.emitEvent({
      type: 'device_change',
      userId,
      presence,
      timestamp: new Date(),
    })
  }

  // ==========================================================================
  // Heartbeat
  // ==========================================================================

  /**
   * Start heartbeat monitoring for a user
   */
  startHeartbeat(userId: string): void {
    // Clear existing timer
    this.stopHeartbeat(userId)

    // Set up new timer
    const timer = setInterval(() => {
      this.checkHeartbeat(userId)
    }, this.config.heartbeatInterval)

    this.heartbeatTimers.set(userId, timer)
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeat(userId: string): void {
    const timer = this.heartbeatTimers.get(userId)
    if (timer) {
      clearInterval(timer)
      this.heartbeatTimers.delete(userId)
    }
  }

  /**
   * Process heartbeat from user
   */
  heartbeat(userId: string, deviceId?: string): void {
    const presence = this.presence.get(userId)
    if (!presence) return

    const now = new Date()
    presence.lastSeen = now

    if (deviceId) {
      const device = presence.devices.find((d) => d.deviceId === deviceId)
      if (device) {
        device.lastSeen = now
      }
    }

    // If was away/offline, bring back online
    if (presence.status === 'away' || presence.status === 'offline') {
      presence.status = 'online'
      this.emitEvent({
        type: 'status_change',
        userId,
        presence,
        timestamp: now,
      })
    }

    this.presence.set(userId, presence)
  }

  /**
   * Check if user heartbeat is stale
   */
  private checkHeartbeat(userId: string): void {
    const presence = this.presence.get(userId)
    if (!presence) return

    const now = new Date()
    const timeSinceLastSeen = now.getTime() - presence.lastSeen.getTime()

    if (timeSinceLastSeen > this.config.offlineThreshold) {
      if (presence.status !== 'offline' && presence.status !== 'invisible') {
        presence.status = 'offline'
        this.presence.set(userId, presence)
        this.emitEvent({
          type: 'status_change',
          userId,
          presence,
          timestamp: now,
        })
      }
    } else if (timeSinceLastSeen > this.config.awayThreshold) {
      if (presence.status === 'online') {
        presence.status = 'away'
        this.presence.set(userId, presence)
        this.emitEvent({
          type: 'status_change',
          userId,
          presence,
          timestamp: now,
        })
      }
    }
  }

  // ==========================================================================
  // Subscriptions
  // ==========================================================================

  /**
   * Subscribe to a user's presence updates
   */
  subscribe(subscriberId: string, targetUserId: string): void {
    let subscribers = this.subscriptions.get(targetUserId)
    if (!subscribers) {
      subscribers = new Set()
      this.subscriptions.set(targetUserId, subscribers)
    }
    subscribers.add(subscriberId)
  }

  /**
   * Unsubscribe from a user's presence updates
   */
  unsubscribe(subscriberId: string, targetUserId: string): void {
    const subscribers = this.subscriptions.get(targetUserId)
    if (subscribers) {
      subscribers.delete(subscriberId)
      if (subscribers.size === 0) {
        this.subscriptions.delete(targetUserId)
      }
    }
  }

  /**
   * Get all subscribers for a user
   */
  getSubscribers(userId: string): string[] {
    const subscribers = this.subscriptions.get(userId)
    return subscribers ? Array.from(subscribers) : []
  }

  // ==========================================================================
  // Events
  // ==========================================================================

  /**
   * Add event listener
   */
  addEventListener(
    event: 'presence' | 'all',
    callback: (event: PresenceEvent) => void
  ): () => void {
    let listeners = this.eventListeners.get(event)
    if (!listeners) {
      listeners = new Set()
      this.eventListeners.set(event, listeners)
    }
    listeners.add(callback)

    // Return unsubscribe function
    return () => {
      listeners?.delete(callback)
    }
  }

  /**
   * Emit presence event
   */
  private emitEvent(event: PresenceEvent): void {
    // Emit to specific listeners
    const specificListeners = this.eventListeners.get('presence')
    if (specificListeners) {
      for (const listener of specificListeners) {
        try {
          listener(event)
        } catch (error) {
          console.error('[Presence] Event listener error:', error)
        }
      }
    }

    // Emit to 'all' listeners
    const allListeners = this.eventListeners.get('all')
    if (allListeners) {
      for (const listener of allListeners) {
        try {
          listener(event)
        } catch (error) {
          console.error('[Presence] Event listener error:', error)
        }
      }
    }
  }

  // ==========================================================================
  // Batch Processing
  // ==========================================================================

  /**
   * Start batch update processor
   */
  private startBatchProcessor(): void {
    this.batchTimer = setInterval(() => {
      this.processBatchUpdates()
    }, this.config.batchUpdateInterval)
  }

  /**
   * Process pending batch updates
   */
  private processBatchUpdates(): void {
    if (this.pendingUpdates.size === 0) return

    // In production, this would sync to database and broadcast via socket
    const updates = Array.from(this.pendingUpdates.values())
    this.pendingUpdates.clear()

    // Batch broadcast updates
    for (const update of updates) {
      const subscribers = this.getSubscribers(update.userId)
      // In production, would send to subscribers via socket
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get online users count
   */
  getOnlineCount(): number {
    let count = 0
    for (const presence of this.presence.values()) {
      if (presence.status === 'online' || presence.status === 'away' || presence.status === 'busy') {
        count++
      }
    }
    return count
  }

  /**
   * Get all online user IDs
   */
  getOnlineUsers(): string[] {
    const users: string[] = []
    for (const [userId, presence] of this.presence.entries()) {
      if (presence.status !== 'offline' && presence.status !== 'invisible') {
        users.push(userId)
      }
    }
    return users
  }

  /**
   * Check if user is online
   */
  isOnline(userId: string): boolean {
    const presence = this.getPresence(userId)
    return presence?.status === 'online' || presence?.status === 'away' || presence?.status === 'busy'
  }

  /**
   * Get presence stats
   */
  getStats(): {
    total: number
    online: number
    away: number
    busy: number
    offline: number
    invisible: number
  } {
    const stats = {
      total: this.presence.size,
      online: 0,
      away: 0,
      busy: 0,
      offline: 0,
      invisible: 0,
    }

    for (const presence of this.presence.values()) {
      stats[presence.status]++
    }

    return stats
  }

  /**
   * Clear all presence data
   */
  clear(): void {
    // Stop all heartbeats
    for (const timer of this.heartbeatTimers.values()) {
      clearInterval(timer)
    }
    this.heartbeatTimers.clear()

    this.presence.clear()
    this.subscriptions.clear()
    this.pendingUpdates.clear()
  }

  /**
   * Graceful shutdown
   */
  shutdown(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer)
    }

    // Process remaining updates
    this.processBatchUpdates()

    this.clear()
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let instance: PresenceManager | null = null

export function createPresenceManager(config?: PresenceManagerConfig): PresenceManager {
  if (!instance) {
    instance = new PresenceManager(config)
  }
  return instance
}

export function getPresenceManager(): PresenceManager | null {
  return instance
}

export default PresenceManager
