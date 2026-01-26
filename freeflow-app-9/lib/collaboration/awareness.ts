/**
 * Awareness Manager for Real-Time Collaboration
 *
 * Manages user presence, cursor positions, selections, and activity states
 * across collaborative sessions using the Yjs awareness protocol.
 */

import type { Awareness } from 'y-protocols/awareness'

// Types
export interface AwarenessState {
  user: UserAwareness
  cursor?: CursorState
  selection?: SelectionState
  activity?: ActivityState
  custom?: Record<string, any>
}

export interface UserAwareness {
  id: string
  name: string
  email?: string
  avatar?: string
  color: string
  role?: 'owner' | 'editor' | 'viewer' | 'commenter'
}

export interface CursorState {
  x: number
  y: number
  page?: number | string
  timestamp: number
}

export interface SelectionState {
  anchor: number
  head: number
  ranges?: Array<{ start: number; end: number }>
  elementId?: string
}

export interface ActivityState {
  status: 'active' | 'idle' | 'away'
  lastActive: number
  isTyping?: boolean
  isViewing?: string // Element or page being viewed
}

export interface AwarenessChangeEvent {
  added: number[]
  updated: number[]
  removed: number[]
}

// Collaborator colors
const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
  '#F8B500', // Orange
  '#00CED1', // Dark Cyan
  '#FF69B4', // Hot Pink
  '#32CD32', // Lime
  '#FF4500'  // Orange Red
]

/**
 * AwarenessManager class for handling collaborative awareness
 */
export class AwarenessManager {
  private awareness: Awareness
  private localUser: UserAwareness | null = null
  private idleTimeout: NodeJS.Timeout | null = null
  private idleThreshold = 60000 // 1 minute
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map()
  // Store references to event handlers for proper cleanup
  private activityHandler: (() => void) | null = null
  private visibilityHandler: (() => void) | null = null
  private boundEvents: string[] = []

  constructor(awareness: Awareness) {
    this.awareness = awareness
    this.setupListeners()
  }

  /**
   * Initialize local user in awareness
   */
  setLocalUser(user: Omit<UserAwareness, 'color'>) {
    const color = this.generateUserColor(user.id)
    this.localUser = { ...user, color }

    this.awareness.setLocalStateField('user', this.localUser)
    this.setActivity('active')

    // Setup idle detection
    this.setupIdleDetection()
  }

  /**
   * Get all current awareness states
   */
  getStates(): Map<number, AwarenessState> {
    return this.awareness.getStates() as Map<number, AwarenessState>
  }

  /**
   * Get all collaborators (excluding local user)
   */
  getCollaborators(): Array<AwarenessState & { clientId: number }> {
    const states = this.getStates()
    const localClientId = this.awareness.clientID
    const collaborators: Array<AwarenessState & { clientId: number }> = []

    states.forEach((state, clientId) => {
      if (clientId !== localClientId && state.user) {
        collaborators.push({ ...state, clientId })
      }
    })

    return collaborators
  }

  /**
   * Update cursor position
   */
  setCursor(cursor: Omit<CursorState, 'timestamp'> | null) {
    if (cursor) {
      this.awareness.setLocalStateField('cursor', {
        ...cursor,
        timestamp: Date.now()
      })
    } else {
      this.awareness.setLocalStateField('cursor', null)
    }

    this.resetIdleTimer()
  }

  /**
   * Update selection
   */
  setSelection(selection: SelectionState | null) {
    this.awareness.setLocalStateField('selection', selection)
    this.resetIdleTimer()
  }

  /**
   * Update activity status
   */
  setActivity(status: ActivityState['status'], extra?: Partial<ActivityState>) {
    const activity: ActivityState = {
      status,
      lastActive: Date.now(),
      ...extra
    }
    this.awareness.setLocalStateField('activity', activity)
  }

  /**
   * Set typing indicator
   */
  setTyping(isTyping: boolean) {
    const current = this.awareness.getLocalState()?.activity || {}
    this.awareness.setLocalStateField('activity', {
      ...current,
      isTyping,
      lastActive: Date.now(),
      status: 'active'
    })
  }

  /**
   * Set currently viewed element/page
   */
  setViewing(elementId: string | null) {
    const current = this.awareness.getLocalState()?.activity || {}
    this.awareness.setLocalStateField('activity', {
      ...current,
      isViewing: elementId,
      lastActive: Date.now()
    })
  }

  /**
   * Set custom awareness field
   */
  setCustomField(key: string, value: any) {
    const current = this.awareness.getLocalState()?.custom || {}
    this.awareness.setLocalStateField('custom', {
      ...current,
      [key]: value
    })
  }

  /**
   * Subscribe to awareness changes
   */
  on(event: 'change' | 'update', callback: (event: AwarenessChangeEvent) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  /**
   * Get cursor positions of all collaborators
   */
  getCursors(): Array<{ userId: string; cursor: CursorState; user: UserAwareness }> {
    const collaborators = this.getCollaborators()
    return collaborators
      .filter(c => c.cursor && c.user)
      .map(c => ({
        userId: c.user.id,
        cursor: c.cursor!,
        user: c.user
      }))
  }

  /**
   * Get selections of all collaborators
   */
  getSelections(): Array<{ userId: string; selection: SelectionState; user: UserAwareness }> {
    const collaborators = this.getCollaborators()
    return collaborators
      .filter(c => c.selection && c.user)
      .map(c => ({
        userId: c.user.id,
        selection: c.selection!,
        user: c.user
      }))
  }

  /**
   * Check if a user is currently active
   */
  isUserActive(userId: string): boolean {
    const collaborators = this.getCollaborators()
    const user = collaborators.find(c => c.user?.id === userId)
    if (!user?.activity) return false

    return (
      user.activity.status === 'active' &&
      Date.now() - user.activity.lastActive < this.idleThreshold
    )
  }

  /**
   * Get users currently typing
   */
  getTypingUsers(): UserAwareness[] {
    return this.getCollaborators()
      .filter(c => c.activity?.isTyping)
      .map(c => c.user)
  }

  /**
   * Get users viewing a specific element
   */
  getUsersViewing(elementId: string): UserAwareness[] {
    return this.getCollaborators()
      .filter(c => c.activity?.isViewing === elementId)
      .map(c => c.user)
  }

  /**
   * Destroy the manager
   */
  destroy() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout)
    }

    // Remove activity event listeners to prevent memory leaks
    if (typeof window !== 'undefined' && this.activityHandler) {
      this.boundEvents.forEach(event => {
        window.removeEventListener(event, this.activityHandler!)
      })
    }

    // Remove visibility change listener
    if (typeof document !== 'undefined' && this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
    }

    this.activityHandler = null
    this.visibilityHandler = null
    this.boundEvents = []
    this.listeners.clear()
  }

  // Private methods

  private setupListeners() {
    this.awareness.on('change', (changes: AwarenessChangeEvent) => {
      this.listeners.get('change')?.forEach(cb => cb(changes))
    })

    this.awareness.on('update', (changes: AwarenessChangeEvent) => {
      this.listeners.get('update')?.forEach(cb => cb(changes))
    })
  }

  private setupIdleDetection() {
    if (typeof window === 'undefined') return

    const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart']
    this.boundEvents = events

    // Store reference for cleanup
    this.activityHandler = () => {
      this.resetIdleTimer()
      if (this.awareness.getLocalState()?.activity?.status === 'idle') {
        this.setActivity('active')
      }
    }

    events.forEach(event => {
      window.addEventListener(event, this.activityHandler!, { passive: true })
    })

    // Store reference for cleanup
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.setActivity('away')
      } else {
        this.setActivity('active')
      }
    }
    document.addEventListener('visibilitychange', this.visibilityHandler)

    this.resetIdleTimer()
  }

  private resetIdleTimer() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout)
    }

    this.idleTimeout = setTimeout(() => {
      this.setActivity('idle')
    }, this.idleThreshold)
  }

  private generateUserColor(userId: string): string {
    // Generate consistent color based on user ID
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }
    return COLORS[Math.abs(hash) % COLORS.length]
  }
}

/**
 * Create awareness manager from Yjs awareness
 */
export function createAwarenessManager(awareness: Awareness): AwarenessManager {
  return new AwarenessManager(awareness)
}

/**
 * Format cursor position for display
 */
export function formatCursorLabel(user: UserAwareness, maxLength: number = 15): string {
  const name = user.name || user.email || 'Anonymous'
  if (name.length <= maxLength) return name
  return name.substring(0, maxLength - 2) + '...'
}

/**
 * Calculate cursor offset to avoid overlapping
 */
export function calculateCursorOffset(
  cursors: Array<{ x: number; y: number }>,
  threshold: number = 20
): Map<number, { offsetX: number; offsetY: number }> {
  const offsets = new Map<number, { offsetX: number; offsetY: number }>()

  cursors.forEach((cursor, index) => {
    let offsetX = 0
    let offsetY = 0

    // Check for nearby cursors
    cursors.forEach((other, otherIndex) => {
      if (index !== otherIndex) {
        const dx = Math.abs(cursor.x - other.x)
        const dy = Math.abs(cursor.y - other.y)

        if (dx < threshold && dy < threshold) {
          // Offset based on index
          offsetX = (index % 3) * 10
          offsetY = Math.floor(index / 3) * 10
        }
      }
    })

    offsets.set(index, { offsetX, offsetY })
  })

  return offsets
}
