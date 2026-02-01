'use client'

/**
 * useCollaborationAwareness - React hook for real-time presence and awareness
 *
 * Features:
 * - User presence tracking (online/away/offline)
 * - Cursor positions with smooth interpolation
 * - Selection highlighting
 * - Activity status (typing, viewing, idle)
 * - Collaborative focus indicators
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from './use-current-user'

// ============================================================================
// Types
// ============================================================================

export type ActivityStatus = 'active' | 'typing' | 'viewing' | 'idle' | 'away' | 'offline'

export interface UserPresence {
  userId: string
  userName: string
  userEmail?: string
  userAvatar?: string
  userColor: string
  status: ActivityStatus
  lastSeen: Date
  joinedAt: Date
  deviceInfo?: DeviceInfo
}

export interface CursorPosition {
  userId: string
  userName: string
  userColor: string
  x: number
  y: number
  // For text editors
  line?: number
  column?: number
  offset?: number
  // For canvas
  viewportX?: number
  viewportY?: number
  zoom?: number
  // Interpolation
  velocity?: { x: number; y: number }
  timestamp: number
}

export interface SelectionRange {
  userId: string
  userName: string
  userColor: string
  type: 'text' | 'elements' | 'region'
  // Text selection
  startOffset?: number
  endOffset?: number
  startLine?: number
  startColumn?: number
  endLine?: number
  endColumn?: number
  // Element selection
  elementIds?: string[]
  // Region selection
  bounds?: {
    x: number
    y: number
    width: number
    height: number
  }
  timestamp: number
}

export interface FocusIndicator {
  userId: string
  userName: string
  userColor: string
  focusType: 'element' | 'section' | 'viewport'
  elementId?: string
  sectionId?: string
  viewport?: {
    x: number
    y: number
    width: number
    height: number
    zoom: number
  }
  timestamp: number
}

export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile'
  browser: string
  os: string
  screenSize?: { width: number; height: number }
}

export interface AwarenessConfig {
  documentId: string
  enableCursors?: boolean
  enableSelections?: boolean
  enableFocus?: boolean
  cursorInterpolation?: boolean
  idleTimeout?: number // ms before marking as idle (default: 30000)
  awayTimeout?: number // ms before marking as away (default: 300000)
  broadcastInterval?: number // ms between awareness updates (default: 50)
  onUserJoin?: (user: UserPresence) => void
  onUserLeave?: (userId: string) => void
  onStatusChange?: (userId: string, status: ActivityStatus) => void
}

export interface UseCollaborationAwarenessReturn {
  // Presence
  onlineUsers: UserPresence[]
  totalOnline: number

  // Cursors
  cursors: CursorPosition[]
  updateCursor: (position: Omit<CursorPosition, 'userId' | 'userName' | 'userColor' | 'timestamp'>) => void

  // Selections
  selections: SelectionRange[]
  updateSelection: (selection: Omit<SelectionRange, 'userId' | 'userName' | 'userColor' | 'timestamp'>) => void
  clearSelection: () => void

  // Focus
  focusIndicators: FocusIndicator[]
  updateFocus: (focus: Omit<FocusIndicator, 'userId' | 'userName' | 'userColor' | 'timestamp'>) => void
  clearFocus: () => void

  // Status
  myStatus: ActivityStatus
  setStatus: (status: ActivityStatus) => void
  setTyping: (isTyping: boolean) => void

  // State
  isConnected: boolean
  isLoading: boolean
  error: Error | null
}

// ============================================================================
// Color Generation
// ============================================================================

const PRESENCE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
  '#FF7F50', '#87CEEB', '#DEB887', '#BC8F8F',
  '#9370DB', '#20B2AA', '#FF69B4', '#32CD32'
]

function generateUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length]
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { type: 'desktop', browser: 'unknown', os: 'unknown' }
  }

  const ua = navigator.userAgent
  let type: 'desktop' | 'tablet' | 'mobile' = 'desktop'
  if (/tablet|ipad/i.test(ua)) type = 'tablet'
  else if (/mobile|iphone|android/i.test(ua)) type = 'mobile'

  let browser = 'unknown'
  if (/chrome/i.test(ua)) browser = 'Chrome'
  else if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/safari/i.test(ua)) browser = 'Safari'
  else if (/edge/i.test(ua)) browser = 'Edge'

  let os = 'unknown'
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/mac/i.test(ua)) os = 'macOS'
  else if (/linux/i.test(ua)) os = 'Linux'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS'

  return {
    type,
    browser,
    os,
    screenSize: { width: window.innerWidth, height: window.innerHeight }
  }
}

// ============================================================================
// React Hook
// ============================================================================

export function useCollaborationAwareness(config: AwarenessConfig): UseCollaborationAwarenessReturn {
  const { user } = useCurrentUser()
  const supabaseRef = useRef(createClient())

  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([])
  const [cursors, setCursors] = useState<CursorPosition[]>([])
  const [selections, setSelections] = useState<SelectionRange[]>([])
  const [focusIndicators, setFocusIndicators] = useState<FocusIndicator[]>([])
  const [myStatus, setMyStatus] = useState<ActivityStatus>('active')

  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const userColor = useMemo(() => user ? generateUserColor(user.id) : '#888888', [user])

  // Idle/Away detection
  useEffect(() => {
    if (typeof window === 'undefined') return

    const idleTimeout = config.idleTimeout ?? 30000
    const awayTimeout = config.awayTimeout ?? 300000

    const checkActivity = () => {
      const now = Date.now()
      const elapsed = now - lastActivityRef.current

      if (elapsed > awayTimeout) {
        setMyStatus('away')
      } else if (elapsed > idleTimeout) {
        setMyStatus('idle')
      }
    }

    const resetActivity = () => {
      lastActivityRef.current = Date.now()
      if (myStatus === 'idle' || myStatus === 'away') {
        setMyStatus('active')
      }
    }

    const interval = setInterval(checkActivity, 5000)

    window.addEventListener('mousemove', resetActivity)
    window.addEventListener('keydown', resetActivity)
    window.addEventListener('click', resetActivity)
    window.addEventListener('scroll', resetActivity)

    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', resetActivity)
      window.removeEventListener('keydown', resetActivity)
      window.removeEventListener('click', resetActivity)
      window.removeEventListener('scroll', resetActivity)
    }
  }, [config.idleTimeout, config.awayTimeout, myStatus])

  // Supabase Realtime channel connection
  useEffect(() => {
    if (!config.documentId || !user) return

    const supabase = supabaseRef.current

    const channel = supabase.channel(`awareness:${config.documentId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: user.id }
      }
    })

    channelRef.current = channel

    // Handle presence sync
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const users: UserPresence[] = []

      Object.entries(state).forEach(([userId, presences]) => {
        const presence = (presences as unknown[])[0]
        if (presence && userId !== user.id) {
          users.push({
            userId,
            userName: presence.userName || 'Anonymous',
            userEmail: presence.userEmail,
            userAvatar: presence.userAvatar,
            userColor: presence.userColor || generateUserColor(userId),
            status: presence.status || 'active',
            lastSeen: new Date(presence.lastSeen || Date.now()),
            joinedAt: new Date(presence.joinedAt || Date.now()),
            deviceInfo: presence.deviceInfo
          })
        }
      })

      setOnlineUsers(users)
    })

    // Handle user join
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      const presence = (newPresences as unknown[])[0]
      if (presence && key !== user.id) {
        const newUser: UserPresence = {
          userId: key,
          userName: presence.userName || 'Anonymous',
          userEmail: presence.userEmail,
          userAvatar: presence.userAvatar,
          userColor: presence.userColor || generateUserColor(key),
          status: presence.status || 'active',
          lastSeen: new Date(),
          joinedAt: new Date(),
          deviceInfo: presence.deviceInfo
        }
        config.onUserJoin?.(newUser)
      }
    })

    // Handle user leave
    channel.on('presence', { event: 'leave' }, ({ key }) => {
      if (key !== user.id) {
        config.onUserLeave?.(key)
      }
    })

    // Handle cursor broadcasts
    if (config.enableCursors !== false) {
      channel.on('broadcast', { event: 'cursor' }, ({ payload }) => {
        if (payload.userId !== user.id) {
          setCursors(prev => {
            const filtered = prev.filter(c => c.userId !== payload.userId)
            return [...filtered, payload as CursorPosition]
          })
        }
      })
    }

    // Handle selection broadcasts
    if (config.enableSelections !== false) {
      channel.on('broadcast', { event: 'selection' }, ({ payload }) => {
        if (payload.userId !== user.id) {
          if (payload.clear) {
            setSelections(prev => prev.filter(s => s.userId !== payload.userId))
          } else {
            setSelections(prev => {
              const filtered = prev.filter(s => s.userId !== payload.userId)
              return [...filtered, payload as SelectionRange]
            })
          }
        }
      })
    }

    // Handle focus broadcasts
    if (config.enableFocus !== false) {
      channel.on('broadcast', { event: 'focus' }, ({ payload }) => {
        if (payload.userId !== user.id) {
          if (payload.clear) {
            setFocusIndicators(prev => prev.filter(f => f.userId !== payload.userId))
          } else {
            setFocusIndicators(prev => {
              const filtered = prev.filter(f => f.userId !== payload.userId)
              return [...filtered, payload as FocusIndicator]
            })
          }
        }
      })
    }

    // Handle status broadcasts
    channel.on('broadcast', { event: 'status' }, ({ payload }) => {
      if (payload.userId !== user.id) {
        config.onStatusChange?.(payload.userId, payload.status)
      }
    })

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        setIsLoading(false)

        await channel.track({
          userName: user.name || user.email || 'Anonymous',
          userEmail: user.email,
          userAvatar: user.avatar_url,
          userColor,
          status: myStatus,
          lastSeen: Date.now(),
          joinedAt: Date.now(),
          deviceInfo: getDeviceInfo()
        })
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false)
        setError(new Error('Channel connection failed'))
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [config.documentId, user, userColor])

  // Broadcast status changes
  useEffect(() => {
    if (!channelRef.current || !isConnected || !user) return

    channelRef.current.send({
      type: 'broadcast',
      event: 'status',
      payload: { userId: user.id, status: myStatus }
    })

    // Update presence
    channelRef.current.track({
      userName: user.name || user.email || 'Anonymous',
      userEmail: user.email,
      userAvatar: user.avatar_url,
      userColor,
      status: myStatus,
      lastSeen: Date.now(),
      joinedAt: Date.now(),
      deviceInfo: getDeviceInfo()
    })
  }, [myStatus, isConnected, user, userColor])

  // Cursor update
  const updateCursor = useCallback((position: Omit<CursorPosition, 'userId' | 'userName' | 'userColor' | 'timestamp'>) => {
    if (!channelRef.current || !isConnected || !user) return

    lastActivityRef.current = Date.now()

    const cursorData: CursorPosition = {
      ...position,
      userId: user.id,
      userName: user.name || user.email || 'Anonymous',
      userColor,
      timestamp: Date.now()
    }

    channelRef.current.send({
      type: 'broadcast',
      event: 'cursor',
      payload: cursorData
    })
  }, [isConnected, user, userColor])

  // Selection update
  const updateSelection = useCallback((selection: Omit<SelectionRange, 'userId' | 'userName' | 'userColor' | 'timestamp'>) => {
    if (!channelRef.current || !isConnected || !user) return

    lastActivityRef.current = Date.now()

    const selectionData: SelectionRange = {
      ...selection,
      userId: user.id,
      userName: user.name || user.email || 'Anonymous',
      userColor,
      timestamp: Date.now()
    }

    channelRef.current.send({
      type: 'broadcast',
      event: 'selection',
      payload: selectionData
    })
  }, [isConnected, user, userColor])

  const clearSelection = useCallback(() => {
    if (!channelRef.current || !isConnected || !user) return

    channelRef.current.send({
      type: 'broadcast',
      event: 'selection',
      payload: { userId: user.id, clear: true }
    })
  }, [isConnected, user])

  // Focus update
  const updateFocus = useCallback((focus: Omit<FocusIndicator, 'userId' | 'userName' | 'userColor' | 'timestamp'>) => {
    if (!channelRef.current || !isConnected || !user) return

    lastActivityRef.current = Date.now()

    const focusData: FocusIndicator = {
      ...focus,
      userId: user.id,
      userName: user.name || user.email || 'Anonymous',
      userColor,
      timestamp: Date.now()
    }

    channelRef.current.send({
      type: 'broadcast',
      event: 'focus',
      payload: focusData
    })
  }, [isConnected, user, userColor])

  const clearFocus = useCallback(() => {
    if (!channelRef.current || !isConnected || !user) return

    channelRef.current.send({
      type: 'broadcast',
      event: 'focus',
      payload: { userId: user.id, clear: true }
    })
  }, [isConnected, user])

  // Status update
  const setStatus = useCallback((status: ActivityStatus) => {
    lastActivityRef.current = Date.now()
    setMyStatus(status)
  }, [])

  const setTyping = useCallback((isTyping: boolean) => {
    lastActivityRef.current = Date.now()
    setMyStatus(isTyping ? 'typing' : 'active')
  }, [])

  return {
    onlineUsers,
    totalOnline: onlineUsers.length + 1, // +1 for current user
    cursors,
    updateCursor,
    selections,
    updateSelection,
    clearSelection,
    focusIndicators,
    updateFocus,
    clearFocus,
    myStatus,
    setStatus,
    setTyping,
    isConnected,
    isLoading,
    error
  }
}

export default useCollaborationAwareness
