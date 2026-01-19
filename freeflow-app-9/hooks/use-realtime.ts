/**
 * REAL-TIME HOOKS
 *
 * Supabase real-time subscriptions made easy
 * Plug-and-play hooks for instant real-time features
 *
 * FEATURES:
 * - Real-time database changes
 * - Presence tracking (who's online)
 * - Broadcast messages
 * - Type-safe subscriptions
 * - Automatic cleanup
 *
 * USAGE:
 * ```tsx
 * const messages = useRealtimeTable('messages', { filter: 'chat_id=eq.123' })
 * const online = usePresence('chat-123')
 * useBroadcast('notifications', (payload) => console.log(payload))
 * ```
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// ==================== TYPES ====================

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

export interface RealtimeSubscriptionOptions {
  event?: RealtimeEvent
  filter?: string
  schema?: string
}

export interface PresenceState {
  [key: string]: any
}

export interface BroadcastPayload<T = any> {
  type: string
  payload: T
  event: string
}

// ==================== HOOK: TABLE SUBSCRIPTION ====================

/**
 * Subscribe to real-time changes on a table
 *
 * @example
 * ```tsx
 * const messages = useRealtimeTable<Message>('messages', {
 *   event: 'INSERT',
 *   filter: 'chat_id=eq.123'
 * })
 * ```
 */
export function useRealtimeTable<T = any>(
  table: string,
  options: RealtimeSubscriptionOptions = {}
) {
  const [data, setData] = useState<T[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isMountedRef = useRef(true)

  const { event = '*', filter, schema = 'public' } = options

  useEffect(() => {
    isMountedRef.current = true
    const supabase = createClient()

    // Create channel
    const channel = supabase
      .channel(`realtime:${table}`)
      .on<T>(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter
        } as any,
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (!isMountedRef.current) return

          if (payload.eventType === 'INSERT') {
            setData((prev) => [...prev, payload.new as T])
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item: any) =>
                item.id === (payload.new as any).id ? (payload.new as T) : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setData((prev) => prev.filter((item: any) => item.id !== (payload.old as any).id))
          }
        }
      )
      .subscribe((status) => {
        if (isMountedRef.current && status === 'SUBSCRIBED') {
          setIsSubscribed(true)
        }
      })

    channelRef.current = channel

    return () => {
      isMountedRef.current = false
      channel.unsubscribe()
      setIsSubscribed(false)
    }
  }, [table, event, filter, schema])

  return { data, isSubscribed }
}

// ==================== HOOK: SINGLE RECORD SUBSCRIPTION ====================

/**
 * Subscribe to changes on a single record
 *
 * @example
 * ```tsx
 * const project = useRealtimeRecord<Project>('projects', 'id', projectId)
 * ```
 */
export function useRealtimeRecord<T = any>(
  table: string,
  idColumn: string,
  id: string
) {
  const [record, setRecord] = useState<T | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    if (!id) return

    isMountedRef.current = true
    const supabase = createClient()

    const channel = supabase
      .channel(`realtime:${table}:${id}`)
      .on<T>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `${idColumn}=eq.${id}`
        } as any,
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (!isMountedRef.current) return

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setRecord(payload.new as T)
          } else if (payload.eventType === 'DELETE') {
            setRecord(null)
          }
        }
      )
      .subscribe((status) => {
        if (isMountedRef.current && status === 'SUBSCRIBED') {
          setIsSubscribed(true)
        }
      })

    return () => {
      isMountedRef.current = false
      channel.unsubscribe()
      setIsSubscribed(false)
    }
  }, [table, idColumn, id])

  return { record, isSubscribed }
}

// ==================== HOOK: PRESENCE (WHO'S ONLINE) ====================

/**
 * Track who's online in a room/channel
 *
 * @example
 * ```tsx
 * const { presenceState, track, untrack } = usePresence('chat-123', {
 *   user_id: currentUserId,
 *   username: 'John Doe'
 * })
 * ```
 */
export function usePresence(
  roomId: string,
  initialState?: PresenceState
) {
  const [presenceState, setPresenceState] = useState<{ [key: string]: PresenceState[] }>({})
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const supabase = createClient()

    const channel = supabase.channel(`presence:${roomId}`, {
      config: {
        presence: {
          key: roomId
        }
      }
    })

    // Track presence state changes
    channel
      .on('presence', { event: 'sync' }, () => {
        if (!isMountedRef.current) return
        const state = channel.presenceState()
        setPresenceState(state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })

    // Subscribe and track if initial state provided
    channel.subscribe(async (status) => {
      if (isMountedRef.current && status === 'SUBSCRIBED' && initialState) {
        await channel.track(initialState)
      }
    })

    channelRef.current = channel

    return () => {
      isMountedRef.current = false
      channel.unsubscribe()
    }
  }, [roomId])

  const track = useCallback(
    async (state: PresenceState) => {
      if (channelRef.current) {
        await channelRef.current.track(state)
      }
    },
    []
  )

  const untrack = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.untrack()
    }
  }, [])

  // Get list of online users
  const onlineUsers = Object.values(presenceState).flat()

  return {
    presenceState,
    onlineUsers,
    track,
    untrack,
    count: onlineUsers.length
  }
}

// ==================== HOOK: BROADCAST ====================

/**
 * Send and receive broadcast messages
 *
 * @example
 * ```tsx
 * const { send } = useBroadcast('notifications', (payload) => {
 *   toast.success(payload.message)
 * })
 *
 * send({ type: 'notification', message: 'Hello!' })
 * ```
 */
export function useBroadcast<T = any>(
  channelName: string,
  onMessage?: (payload: BroadcastPayload<T>) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const supabase = createClient()

    const channel = supabase.channel(`broadcast:${channelName}`)

    if (onMessage) {
      channel.on('broadcast', { event: '*' }, (payload) => {
        if (isMountedRef.current) {
          onMessage(payload as BroadcastPayload<T>)
        }
      })
    }

    channel.subscribe((status) => {
      if (isMountedRef.current && status === 'SUBSCRIBED') {
        setIsSubscribed(true)
      }
    })

    channelRef.current = channel

    return () => {
      isMountedRef.current = false
      channel.unsubscribe()
      setIsSubscribed(false)
    }
  }, [channelName, onMessage])

  const send = useCallback(
    async (payload: T, event = 'message') => {
      if (channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event,
          payload
        })
      }
    },
    []
  )

  return { send, isSubscribed }
}

// ==================== HOOK: TYPING INDICATOR ====================

/**
 * Real-time typing indicators
 *
 * @example
 * ```tsx
 * const { startTyping, stopTyping, typingUsers } = useTypingIndicator('chat-123', currentUserId)
 * ```
 */
export function useTypingIndicator(chatId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase.channel(`typing:${chatId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state)
          .flat()
          .map((p: any) => p.user_id)
          .filter((id) => id !== userId)

        setTypingUsers(users)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      channel.unsubscribe()
    }
  }, [chatId, userId])

  const startTyping = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.track({ user_id: userId, typing: true })

      // Auto-stop typing after 3 seconds
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        stopTyping()
      }, 3000)
    }
  }, [userId])

  const stopTyping = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.untrack()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isTyping: typingUsers.length > 0
  }
}

// ==================== HOOK: NOTIFICATIONS ====================

/**
 * Real-time notifications
 *
 * @example
 * ```tsx
 * const { notifications, markAsRead } = useNotifications(userId)
 * ```
 */
export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const { data: newNotifications } = useRealtimeTable('notifications', {
    event: 'INSERT',
    filter: `user_id=eq.${userId}`
  })

  useEffect(() => {
    if (newNotifications.length > 0) {
      setNotifications((prev) => [...newNotifications, ...prev])
      setUnreadCount((prev) => prev + newNotifications.length)
    }
  }, [newNotifications])

  const markAsRead = useCallback(async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(async () => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [userId])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  }
}

// ==================== EXAMPLE USAGE ====================

/**
 * Example: Real-time Messages
 *
 * ```tsx
 * const { data: messages } = useRealtimeTable<Message>('messages', {
 *   filter: `chat_id=eq.${chatId}`
 * })
 * ```
 */

/**
 * Example: Online Users
 *
 * ```tsx
 * const { onlineUsers, count } = usePresence('chat-123', {
 *   user_id: userId,
 *   username: userName
 * })
 *
 * <p>{count} users online</p>
 * ```
 */

/**
 * Example: Typing Indicator
 *
 * ```tsx
 * const { startTyping, stopTyping, typingUsers } = useTypingIndicator(chatId, userId)
 *
 * <Input
 *   onKeyDown={startTyping}
 *   onBlur={stopTyping}
 * />
 * {typingUsers.length > 0 && <p>Someone is typing...</p>}
 * ```
 */

/**
 * Example: Broadcast Events
 *
 * ```tsx
 * const { send } = useBroadcast('app-events', (payload) => {
 *   if (payload.type === 'refresh') {
 *     refreshData()
 *   }
 * })
 *
 * send({ type: 'refresh' })
 * ```
 */

export default {
  useRealtimeTable,
  useRealtimeRecord,
  usePresence,
  useBroadcast,
  useTypingIndicator,
  useNotifications
}
