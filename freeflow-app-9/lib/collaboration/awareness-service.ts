/**
 * Advanced Awareness Protocol Service
 *
 * Rich real-time awareness of collaborators including:
 * - Cursor positions with smooth interpolation
 * - Selection ranges and highlights
 * - User activity states
 * - Focus/attention tracking
 * - Device and viewport information
 * - Undo/redo stacks per user
 */

import { createFeatureLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

const logger = createFeatureLogger('AwarenessService')

// ============================================================================
// Types
// ============================================================================

export interface UserAwareness {
  userId: string
  userName: string
  userColor: string
  userAvatar?: string

  // Cursor state
  cursor: CursorState | null
  selection: SelectionState | null

  // Activity state
  activity: ActivityState
  lastActive: Date

  // Focus state
  focus: FocusState | null

  // Device info
  device: DeviceInfo

  // Edit state
  editState: EditState | null

  // Custom state (for specific document types)
  custom: Record<string, any>

  // Timestamps
  joinedAt: Date
  updatedAt: Date
}

export interface CursorState {
  x: number
  y: number
  // For text editors
  line?: number
  column?: number
  offset?: number
  // For canvas
  canvasX?: number
  canvasY?: number
  // Interpolation
  velocity?: { x: number; y: number }
  timestamp: number
}

export interface SelectionState {
  // Text selection
  start?: {
    line: number
    column: number
    offset: number
  }
  end?: {
    line: number
    column: number
    offset: number
  }
  // Canvas selection
  bounds?: {
    x: number
    y: number
    width: number
    height: number
  }
  // Selected element IDs
  elementIds?: string[]
  // Selection type
  type: 'text' | 'range' | 'elements' | 'region'
  timestamp: number
}

export type ActivityState =
  | 'active'        // Actively editing
  | 'viewing'       // Looking but not editing
  | 'idle'          // No activity for 30s+
  | 'away'          // No activity for 5m+
  | 'offline'       // Disconnected

export interface FocusState {
  // What the user is focused on
  target: 'document' | 'comment' | 'toolbar' | 'chat' | 'other'
  // Specific element or region
  elementId?: string
  region?: string
  // Viewport info
  viewport: {
    scrollX: number
    scrollY: number
    zoom: number
    visibleRange?: { start: number; end: number }
  }
  timestamp: number
}

export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile'
  os: string
  browser: string
  screenSize: { width: number; height: number }
  isTouch: boolean
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
}

export interface EditState {
  // Current action
  action: 'typing' | 'selecting' | 'drawing' | 'moving' | 'resizing' | 'idle'
  // Typing state
  isTyping: boolean
  typingStartedAt?: Date
  // Drawing state
  isDrawing: boolean
  drawingTool?: string
  // Undo/redo info
  undoStackSize: number
  redoStackSize: number
  canUndo: boolean
  canRedo: boolean
  timestamp: number
}

export interface AwarenessUpdate {
  type: 'full' | 'cursor' | 'selection' | 'activity' | 'focus' | 'edit' | 'custom'
  userId: string
  data: Partial<UserAwareness>
  timestamp: number
}

export interface AwarenessState {
  documentId: string
  users: Map<string, UserAwareness>
  localUserId: string
  updatedAt: Date
}

// ============================================================================
// Constants
// ============================================================================

const IDLE_TIMEOUT = 30 * 1000           // 30 seconds
const AWAY_TIMEOUT = 5 * 60 * 1000       // 5 minutes
const CURSOR_THROTTLE = 16               // ~60fps
const SELECTION_THROTTLE = 100           // 100ms
const FOCUS_THROTTLE = 200               // 200ms
const HEARTBEAT_INTERVAL = 5000          // 5 seconds
const CURSOR_INTERPOLATION_FACTOR = 0.3  // Smooth cursor movement

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#82E0AA'
]

// ============================================================================
// Awareness Manager Class
// ============================================================================

export class AwarenessManager {
  private documentId: string
  private localUser: UserAwareness
  private remoteUsers: Map<string, UserAwareness> = new Map()
  private lastActivity: number = Date.now()
  private heartbeatInterval?: NodeJS.Timeout
  private activityCheckInterval?: NodeJS.Timeout

  // Callbacks
  private onUpdate?: (users: Map<string, UserAwareness>) => void
  private onUserJoin?: (user: UserAwareness) => void
  private onUserLeave?: (userId: string) => void
  private broadcastCallback?: (update: AwarenessUpdate) => void

  // Throttling
  private lastCursorUpdate: number = 0
  private lastSelectionUpdate: number = 0
  private lastFocusUpdate: number = 0
  private pendingCursorUpdate: CursorState | null = null

  constructor(documentId: string, userId: string, userName: string, userAvatar?: string) {
    this.documentId = documentId

    this.localUser = {
      userId,
      userName,
      userColor: this.generateUserColor(userId),
      userAvatar,
      cursor: null,
      selection: null,
      activity: 'active',
      lastActive: new Date(),
      focus: null,
      device: this.detectDevice(),
      editState: null,
      custom: {},
      joinedAt: new Date(),
      updatedAt: new Date()
    }

    this.startHeartbeat()
    this.startActivityCheck()
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  private generateUserColor(userId: string): string {
    // Generate consistent color based on userId
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i)
      hash = hash & hash
    }
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
  }

  private detectDevice(): DeviceInfo {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua)
    const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua)

    return {
      type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      os: this.detectOS(ua),
      browser: this.detectBrowser(ua),
      screenSize: typeof window !== 'undefined'
        ? { width: window.innerWidth, height: window.innerHeight }
        : { width: 1920, height: 1080 },
      isTouch: typeof window !== 'undefined' && 'ontouchstart' in window,
      connectionType: 'unknown'
    }
  }

  private detectOS(ua: string): string {
    if (/Windows/i.test(ua)) return 'Windows'
    if (/Mac/i.test(ua)) return 'macOS'
    if (/Linux/i.test(ua)) return 'Linux'
    if (/Android/i.test(ua)) return 'Android'
    if (/iOS|iPhone|iPad/i.test(ua)) return 'iOS'
    return 'Unknown'
  }

  private detectBrowser(ua: string): string {
    if (/Chrome/i.test(ua)) return 'Chrome'
    if (/Firefox/i.test(ua)) return 'Firefox'
    if (/Safari/i.test(ua)) return 'Safari'
    if (/Edge/i.test(ua)) return 'Edge'
    return 'Unknown'
  }

  // ============================================================================
  // Local State Updates
  // ============================================================================

  updateCursor(cursor: Omit<CursorState, 'timestamp'>): void {
    const now = Date.now()

    // Calculate velocity for interpolation
    const velocity = this.localUser.cursor
      ? {
          x: cursor.x - this.localUser.cursor.x,
          y: cursor.y - this.localUser.cursor.y
        }
      : { x: 0, y: 0 }

    const newCursor: CursorState = {
      ...cursor,
      velocity,
      timestamp: now
    }

    this.pendingCursorUpdate = newCursor
    this.localUser.cursor = newCursor
    this.markActive()

    // Throttle broadcast
    if (now - this.lastCursorUpdate >= CURSOR_THROTTLE) {
      this.lastCursorUpdate = now
      this.broadcast({
        type: 'cursor',
        userId: this.localUser.userId,
        data: { cursor: newCursor },
        timestamp: now
      })
      this.pendingCursorUpdate = null
    }
  }

  updateSelection(selection: Omit<SelectionState, 'timestamp'> | null): void {
    const now = Date.now()

    if (selection) {
      this.localUser.selection = { ...selection, timestamp: now }
    } else {
      this.localUser.selection = null
    }

    this.markActive()

    // Throttle broadcast
    if (now - this.lastSelectionUpdate >= SELECTION_THROTTLE) {
      this.lastSelectionUpdate = now
      this.broadcast({
        type: 'selection',
        userId: this.localUser.userId,
        data: { selection: this.localUser.selection },
        timestamp: now
      })
    }
  }

  updateFocus(focus: Omit<FocusState, 'timestamp'> | null): void {
    const now = Date.now()

    if (focus) {
      this.localUser.focus = { ...focus, timestamp: now }
    } else {
      this.localUser.focus = null
    }

    // Throttle broadcast
    if (now - this.lastFocusUpdate >= FOCUS_THROTTLE) {
      this.lastFocusUpdate = now
      this.broadcast({
        type: 'focus',
        userId: this.localUser.userId,
        data: { focus: this.localUser.focus },
        timestamp: now
      })
    }
  }

  updateEditState(editState: Omit<EditState, 'timestamp'> | null): void {
    const now = Date.now()

    if (editState) {
      this.localUser.editState = { ...editState, timestamp: now }
    } else {
      this.localUser.editState = null
    }

    this.markActive()

    this.broadcast({
      type: 'edit',
      userId: this.localUser.userId,
      data: { editState: this.localUser.editState },
      timestamp: now
    })
  }

  updateCustomState(key: string, value: any): void {
    this.localUser.custom[key] = value
    this.localUser.updatedAt = new Date()

    this.broadcast({
      type: 'custom',
      userId: this.localUser.userId,
      data: { custom: { [key]: value } },
      timestamp: Date.now()
    })
  }

  // ============================================================================
  // Activity Management
  // ============================================================================

  private markActive(): void {
    this.lastActivity = Date.now()
    if (this.localUser.activity !== 'active') {
      this.localUser.activity = 'active'
      this.localUser.lastActive = new Date()
      this.broadcast({
        type: 'activity',
        userId: this.localUser.userId,
        data: { activity: 'active', lastActive: this.localUser.lastActive },
        timestamp: Date.now()
      })
    }
  }

  private startActivityCheck(): void {
    this.activityCheckInterval = setInterval(() => {
      const now = Date.now()
      const timeSinceActive = now - this.lastActivity

      let newActivity: ActivityState = 'active'

      if (timeSinceActive >= AWAY_TIMEOUT) {
        newActivity = 'away'
      } else if (timeSinceActive >= IDLE_TIMEOUT) {
        newActivity = 'idle'
      }

      if (newActivity !== this.localUser.activity) {
        this.localUser.activity = newActivity
        this.broadcast({
          type: 'activity',
          userId: this.localUser.userId,
          data: { activity: newActivity },
          timestamp: now
        })
      }

      // Also check remote user timeouts
      for (const [userId, user] of this.remoteUsers) {
        const userLastActive = user.lastActive.getTime()
        if (now - userLastActive > AWAY_TIMEOUT * 2) {
          // User probably disconnected
          this.handleUserLeave(userId)
        }
      }
    }, 1000)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.broadcast({
        type: 'full',
        userId: this.localUser.userId,
        data: this.localUser,
        timestamp: Date.now()
      })
    }, HEARTBEAT_INTERVAL)
  }

  // ============================================================================
  // Remote Updates
  // ============================================================================

  handleRemoteUpdate(update: AwarenessUpdate): void {
    if (update.userId === this.localUser.userId) return

    let user = this.remoteUsers.get(update.userId)
    const isNewUser = !user

    if (!user) {
      // Create new user entry
      user = {
        userId: update.userId,
        userName: update.data.userName || 'Unknown',
        userColor: update.data.userColor || this.generateUserColor(update.userId),
        userAvatar: update.data.userAvatar,
        cursor: null,
        selection: null,
        activity: 'active',
        lastActive: new Date(),
        focus: null,
        device: update.data.device || this.getDefaultDevice(),
        editState: null,
        custom: {},
        joinedAt: new Date(),
        updatedAt: new Date()
      }
      this.remoteUsers.set(update.userId, user)
    }

    // Apply update based on type
    switch (update.type) {
      case 'full':
        Object.assign(user, update.data)
        break
      case 'cursor':
        if (update.data.cursor) {
          // Interpolate cursor for smooth movement
          user.cursor = this.interpolateCursor(user.cursor, update.data.cursor)
        }
        break
      case 'selection':
        user.selection = update.data.selection || null
        break
      case 'activity':
        user.activity = update.data.activity || 'active'
        if (update.data.lastActive) {
          user.lastActive = new Date(update.data.lastActive)
        }
        break
      case 'focus':
        user.focus = update.data.focus || null
        break
      case 'edit':
        user.editState = update.data.editState || null
        break
      case 'custom':
        if (update.data.custom) {
          Object.assign(user.custom, update.data.custom)
        }
        break
    }

    user.updatedAt = new Date()

    // Callbacks
    if (isNewUser) {
      this.onUserJoin?.(user)
    }
    this.onUpdate?.(this.getAllUsers())
  }

  handleUserLeave(userId: string): void {
    if (this.remoteUsers.has(userId)) {
      this.remoteUsers.delete(userId)
      this.onUserLeave?.(userId)
      this.onUpdate?.(this.getAllUsers())
    }
  }

  private interpolateCursor(current: CursorState | null, target: CursorState): CursorState {
    if (!current) return target

    return {
      ...target,
      x: current.x + (target.x - current.x) * CURSOR_INTERPOLATION_FACTOR,
      y: current.y + (target.y - current.y) * CURSOR_INTERPOLATION_FACTOR
    }
  }

  private getDefaultDevice(): DeviceInfo {
    return {
      type: 'desktop',
      os: 'Unknown',
      browser: 'Unknown',
      screenSize: { width: 1920, height: 1080 },
      isTouch: false,
      connectionType: 'unknown'
    }
  }

  // ============================================================================
  // Broadcast
  // ============================================================================

  private broadcast(update: AwarenessUpdate): void {
    this.broadcastCallback?.(update)
  }

  setBroadcastCallback(callback: (update: AwarenessUpdate) => void): void {
    this.broadcastCallback = callback
  }

  // ============================================================================
  // Callbacks
  // ============================================================================

  setOnUpdate(callback: (users: Map<string, UserAwareness>) => void): void {
    this.onUpdate = callback
  }

  setOnUserJoin(callback: (user: UserAwareness) => void): void {
    this.onUserJoin = callback
  }

  setOnUserLeave(callback: (userId: string) => void): void {
    this.onUserLeave = callback
  }

  // ============================================================================
  // Getters
  // ============================================================================

  getLocalUser(): UserAwareness {
    return this.localUser
  }

  getRemoteUsers(): Map<string, UserAwareness> {
    return new Map(this.remoteUsers)
  }

  getAllUsers(): Map<string, UserAwareness> {
    const all = new Map(this.remoteUsers)
    all.set(this.localUser.userId, this.localUser)
    return all
  }

  getUserCount(): number {
    return this.remoteUsers.size + 1
  }

  getActiveUsers(): UserAwareness[] {
    const users: UserAwareness[] = [this.localUser]
    for (const user of this.remoteUsers.values()) {
      if (user.activity === 'active' || user.activity === 'viewing') {
        users.push(user)
      }
    }
    return users
  }

  getUsersInRegion(region: string): UserAwareness[] {
    const users: UserAwareness[] = []
    for (const user of this.getAllUsers().values()) {
      if (user.focus?.region === region) {
        users.push(user)
      }
    }
    return users
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval)
    }

    // Broadcast leave
    this.broadcast({
      type: 'activity',
      userId: this.localUser.userId,
      data: { activity: 'offline' },
      timestamp: Date.now()
    })

    this.remoteUsers.clear()
  }
}

// ============================================================================
// React Hook Helper
// ============================================================================

export interface UseAwarenessOptions {
  documentId: string
  userId: string
  userName: string
  userAvatar?: string
  onUpdate?: (users: Map<string, UserAwareness>) => void
  onUserJoin?: (user: UserAwareness) => void
  onUserLeave?: (userId: string) => void
}

export function createAwarenessManager(options: UseAwarenessOptions): AwarenessManager {
  const manager = new AwarenessManager(
    options.documentId,
    options.userId,
    options.userName,
    options.userAvatar
  )

  if (options.onUpdate) manager.setOnUpdate(options.onUpdate)
  if (options.onUserJoin) manager.setOnUserJoin(options.onUserJoin)
  if (options.onUserLeave) manager.setOnUserLeave(options.onUserLeave)

  return manager
}

export default {
  AwarenessManager,
  createAwarenessManager,
  USER_COLORS,
  IDLE_TIMEOUT,
  AWAY_TIMEOUT
}
