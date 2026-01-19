/**
 * Typing Indicators Manager
 *
 * Industry-leading typing indicator system with:
 * - Real-time typing status
 * - Auto-expiration
 * - Throttled updates
 * - Multi-user support
 * - Channel-based tracking
 * - Event debouncing
 * - Memory-efficient storage
 */

// ============================================================================
// Types
// ============================================================================

export interface TypingUser {
  userId: string
  userName: string
  userAvatar?: string
  startedAt: Date
  expiresAt: Date
}

export interface ChannelTypingState {
  channelId: string
  users: Map<string, TypingUser>
  lastUpdated: Date
}

export interface TypingEvent {
  type: 'start' | 'stop' | 'update'
  channelId: string
  userId: string
  userName: string
  userAvatar?: string
  timestamp: Date
  typingUsers: TypingUser[]
}

export interface TypingIndicatorConfig {
  typingTimeout?: number // ms before auto-stop
  throttleInterval?: number // ms between updates
  maxTypingUsers?: number // max users to track per channel
  cleanupInterval?: number // ms between cleanup runs
  showDuration?: number // ms to show indicator after typing stops
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<TypingIndicatorConfig> = {
  typingTimeout: 5000, // 5 seconds
  throttleInterval: 1000, // 1 second
  maxTypingUsers: 10,
  cleanupInterval: 1000, // 1 second
  showDuration: 500, // 500ms fade out
}

// ============================================================================
// Typing Indicators Manager
// ============================================================================

export class TypingIndicatorsManager {
  private config: Required<TypingIndicatorConfig>
  private channels: Map<string, ChannelTypingState> = new Map()
  private userTimeouts: Map<string, NodeJS.Timeout> = new Map() // `${channelId}:${userId}` -> timeout
  private throttleTimers: Map<string, NodeJS.Timeout> = new Map()
  private cleanupTimer: NodeJS.Timeout | null = null
  private eventListeners: Set<(event: TypingEvent) => void> = new Set()

  constructor(config: TypingIndicatorConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startCleanupTimer()
  }

  // ==========================================================================
  // Typing Operations
  // ==========================================================================

  /**
   * Start typing indicator for a user in a channel
   */
  startTyping(
    channelId: string,
    userId: string,
    userName: string,
    userAvatar?: string
  ): void {
    const key = this.getKey(channelId, userId)

    // Throttle updates
    if (this.throttleTimers.has(key)) {
      return
    }

    // Get or create channel state
    let channelState = this.channels.get(channelId)
    if (!channelState) {
      channelState = {
        channelId,
        users: new Map(),
        lastUpdated: new Date(),
      }
      this.channels.set(channelId, channelState)
    }

    // Check max users limit
    if (
      channelState.users.size >= this.config.maxTypingUsers &&
      !channelState.users.has(userId)
    ) {
      // Remove oldest user
      const oldestUser = this.getOldestTypingUser(channelState)
      if (oldestUser) {
        this.stopTyping(channelId, oldestUser.userId)
      }
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.config.typingTimeout)

    // Add or update typing user
    const typingUser: TypingUser = {
      userId,
      userName,
      userAvatar,
      startedAt: channelState.users.get(userId)?.startedAt || now,
      expiresAt,
    }

    channelState.users.set(userId, typingUser)
    channelState.lastUpdated = now

    // Clear existing timeout
    const existingTimeout = this.userTimeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.stopTyping(channelId, userId)
    }, this.config.typingTimeout)
    this.userTimeouts.set(key, timeout)

    // Set throttle timer
    const throttleTimer = setTimeout(() => {
      this.throttleTimers.delete(key)
    }, this.config.throttleInterval)
    this.throttleTimers.set(key, throttleTimer)

    // Emit event
    this.emitEvent({
      type: 'start',
      channelId,
      userId,
      userName,
      userAvatar,
      timestamp: now,
      typingUsers: this.getTypingUsers(channelId),
    })
  }

  /**
   * Stop typing indicator for a user in a channel
   */
  stopTyping(channelId: string, userId: string): void {
    const key = this.getKey(channelId, userId)

    // Clear timeout
    const timeout = this.userTimeouts.get(key)
    if (timeout) {
      clearTimeout(timeout)
      this.userTimeouts.delete(key)
    }

    // Clear throttle
    const throttle = this.throttleTimers.get(key)
    if (throttle) {
      clearTimeout(throttle)
      this.throttleTimers.delete(key)
    }

    // Remove from channel
    const channelState = this.channels.get(channelId)
    if (!channelState) return

    const typingUser = channelState.users.get(userId)
    if (!typingUser) return

    channelState.users.delete(userId)
    channelState.lastUpdated = new Date()

    // Clean up empty channels
    if (channelState.users.size === 0) {
      this.channels.delete(channelId)
    }

    // Emit event
    this.emitEvent({
      type: 'stop',
      channelId,
      userId,
      userName: typingUser.userName,
      userAvatar: typingUser.userAvatar,
      timestamp: new Date(),
      typingUsers: this.getTypingUsers(channelId),
    })
  }

  /**
   * Toggle typing indicator
   */
  toggleTyping(
    channelId: string,
    userId: string,
    userName: string,
    isTyping: boolean,
    userAvatar?: string
  ): void {
    if (isTyping) {
      this.startTyping(channelId, userId, userName, userAvatar)
    } else {
      this.stopTyping(channelId, userId)
    }
  }

  /**
   * Handle keystroke - refreshes typing timeout
   */
  onKeystroke(channelId: string, userId: string, userName: string, userAvatar?: string): void {
    this.startTyping(channelId, userId, userName, userAvatar)
  }

  // ==========================================================================
  // Query Methods
  // ==========================================================================

  /**
   * Get all users currently typing in a channel
   */
  getTypingUsers(channelId: string): TypingUser[] {
    const channelState = this.channels.get(channelId)
    if (!channelState) return []

    const now = new Date()
    const users: TypingUser[] = []

    for (const user of channelState.users.values()) {
      // Skip expired users (cleanup will remove them)
      if (user.expiresAt > now) {
        users.push(user)
      }
    }

    // Sort by start time (oldest first)
    users.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())

    return users
  }

  /**
   * Get typing indicator text for display
   */
  getTypingText(channelId: string): string | null {
    const users = this.getTypingUsers(channelId)
    if (users.length === 0) return null

    const names = users.map((u) => u.userName)

    if (names.length === 1) {
      return `${names[0]} is typing...`
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`
    } else if (names.length === 3) {
      return `${names[0]}, ${names[1]}, and ${names[2]} are typing...`
    } else {
      return `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`
    }
  }

  /**
   * Check if a specific user is typing in a channel
   */
  isUserTyping(channelId: string, userId: string): boolean {
    const channelState = this.channels.get(channelId)
    if (!channelState) return false

    const user = channelState.users.get(userId)
    if (!user) return false

    return user.expiresAt > new Date()
  }

  /**
   * Check if anyone is typing in a channel
   */
  isAnyoneTyping(channelId: string): boolean {
    return this.getTypingUsers(channelId).length > 0
  }

  /**
   * Get typing user count for a channel
   */
  getTypingCount(channelId: string): number {
    return this.getTypingUsers(channelId).length
  }

  // ==========================================================================
  // Event Handling
  // ==========================================================================

  /**
   * Add event listener for typing events
   */
  addEventListener(callback: (event: TypingEvent) => void): () => void {
    this.eventListeners.add(callback)
    return () => {
      this.eventListeners.delete(callback)
    }
  }

  /**
   * Emit typing event to all listeners
   */
  private emitEvent(event: TypingEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event)
      } catch (error) {
        console.error('[TypingIndicators] Event listener error:', error)
      }
    }
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired()
    }, this.config.cleanupInterval)
  }

  /**
   * Clean up expired typing indicators
   */
  private cleanupExpired(): void {
    const now = new Date()

    for (const [channelId, channelState] of this.channels.entries()) {
      const expiredUsers: string[] = []

      for (const [userId, user] of channelState.users.entries()) {
        if (user.expiresAt <= now) {
          expiredUsers.push(userId)
        }
      }

      // Remove expired users
      for (const userId of expiredUsers) {
        this.stopTyping(channelId, userId)
      }
    }
  }

  /**
   * Get the oldest typing user in a channel
   */
  private getOldestTypingUser(channelState: ChannelTypingState): TypingUser | null {
    let oldest: TypingUser | null = null

    for (const user of channelState.users.values()) {
      if (!oldest || user.startedAt < oldest.startedAt) {
        oldest = user
      }
    }

    return oldest
  }

  /**
   * Clear all typing indicators for a user across all channels
   */
  clearUserTyping(userId: string): void {
    for (const channelId of this.channels.keys()) {
      this.stopTyping(channelId, userId)
    }
  }

  /**
   * Clear all typing indicators in a channel
   */
  clearChannelTyping(channelId: string): void {
    const channelState = this.channels.get(channelId)
    if (!channelState) return

    for (const userId of channelState.users.keys()) {
      this.stopTyping(channelId, userId)
    }
  }

  // ==========================================================================
  // Utility
  // ==========================================================================

  /**
   * Generate unique key for user in channel
   */
  private getKey(channelId: string, userId: string): string {
    return `${channelId}:${userId}`
  }

  /**
   * Get stats about typing indicators
   */
  getStats(): {
    activeChannels: number
    totalTypingUsers: number
    channelBreakdown: Map<string, number>
  } {
    const channelBreakdown = new Map<string, number>()
    let totalTypingUsers = 0

    for (const [channelId, channelState] of this.channels.entries()) {
      const count = channelState.users.size
      channelBreakdown.set(channelId, count)
      totalTypingUsers += count
    }

    return {
      activeChannels: this.channels.size,
      totalTypingUsers,
      channelBreakdown,
    }
  }

  /**
   * Shutdown and cleanup
   */
  shutdown(): void {
    // Stop cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    // Clear all timeouts
    for (const timeout of this.userTimeouts.values()) {
      clearTimeout(timeout)
    }
    this.userTimeouts.clear()

    for (const throttle of this.throttleTimers.values()) {
      clearTimeout(throttle)
    }
    this.throttleTimers.clear()

    // Clear all data
    this.channels.clear()
    this.eventListeners.clear()
  }
}

// ============================================================================
// React Hook Integration
// ============================================================================

/**
 * Create a typing indicator handler for React components
 */
export function createTypingHandler(
  manager: TypingIndicatorsManager,
  channelId: string,
  userId: string,
  userName: string,
  userAvatar?: string
): {
  onKeyDown: () => void
  onBlur: () => void
  onFocus: () => void
  stopTyping: () => void
} {
  let blurTimeout: NodeJS.Timeout | null = null

  return {
    onKeyDown: () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout)
        blurTimeout = null
      }
      manager.onKeystroke(channelId, userId, userName, userAvatar)
    },
    onBlur: () => {
      // Delay stop to handle tab switching
      blurTimeout = setTimeout(() => {
        manager.stopTyping(channelId, userId)
      }, 1000)
    },
    onFocus: () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout)
        blurTimeout = null
      }
    },
    stopTyping: () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout)
        blurTimeout = null
      }
      manager.stopTyping(channelId, userId)
    },
  }
}

// ============================================================================
// Typing Display Component Helpers
// ============================================================================

/**
 * Format typing users for display with animation support
 */
export function formatTypingDisplay(users: TypingUser[]): {
  text: string
  users: TypingUser[]
  shouldAnimate: boolean
} {
  if (users.length === 0) {
    return { text: '', users: [], shouldAnimate: false }
  }

  let text: string
  if (users.length === 1) {
    text = `${users[0].userName} is typing`
  } else if (users.length === 2) {
    text = `${users[0].userName} and ${users[1].userName} are typing`
  } else if (users.length === 3) {
    text = `${users[0].userName}, ${users[1].userName}, and ${users[2].userName} are typing`
  } else {
    text = `${users[0].userName}, ${users[1].userName}, and ${users.length - 2} others are typing`
  }

  return {
    text,
    users,
    shouldAnimate: true,
  }
}

/**
 * Generate animated dots for typing indicator
 */
export function getAnimatedDots(frame: number): string {
  const dots = ['', '.', '..', '...']
  return dots[frame % dots.length]
}

// ============================================================================
// Singleton Instance
// ============================================================================

let instance: TypingIndicatorsManager | null = null

export function createTypingIndicatorsManager(
  config?: TypingIndicatorConfig
): TypingIndicatorsManager {
  if (!instance) {
    instance = new TypingIndicatorsManager(config)
  }
  return instance
}

export function getTypingIndicatorsManager(): TypingIndicatorsManager | null {
  return instance
}

export default TypingIndicatorsManager
