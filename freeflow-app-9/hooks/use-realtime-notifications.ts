/**
 * KAZI Real-time Notifications Hook
 *
 * React hook for real-time notifications using WebSocket
 * with fallback to polling for environments without WebSocket support.
 *
 * Features:
 * - Auto-connect/disconnect
 * - Notification queue
 * - Sound alerts
 * - Desktop notifications
 * - Badge updates
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  category: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  actionUrl?: string
  read: boolean
  createdAt: Date
  data?: Record<string, unknown>
}

export interface UseRealtimeNotificationsOptions {
  enabled?: boolean
  pollingInterval?: number // ms, fallback polling
  showToasts?: boolean
  playSound?: boolean
  requestDesktopPermission?: boolean
}

export interface UseRealtimeNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  refresh: () => Promise<void>
}

export function useRealtimeNotifications(
  options: UseRealtimeNotificationsOptions = {}
): UseRealtimeNotificationsReturn {
  const {
    enabled = true,
    pollingInterval = 30000, // 30 seconds
    showToasts = true,
    playSound = true,
    requestDesktopPermission = false
  } = options

  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const socketRef = useRef<WebSocket | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio for notification sound
  useEffect(() => {
    if (typeof window !== 'undefined' && playSound) {
      audioRef.current = new Audio('/sounds/notification.mp3')
      audioRef.current.volume = 0.5
    }
  }, [playSound])

  // Request desktop notification permission
  useEffect(() => {
    if (requestDesktopPermission && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [requestDesktopPermission])

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (status !== 'authenticated') return

    try {
      const response = await fetch('/api/notifications?filter=all&limit=50')
      const data = await response.json()

      if (data.success) {
        const newNotifications = data.notifications.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type || 'info',
          category: n.category || 'general',
          priority: n.priority || 'normal',
          actionUrl: n.action_url || n.actionUrl,
          read: n.is_read || n.read || false,
          createdAt: new Date(n.created_at || n.timestamp || n.createdAt),
          data: n.data
        }))

        // Check for new notifications
        const previousIds = new Set(notifications.map(n => n.id))
        const newOnes = newNotifications.filter((n: Notification) => !previousIds.has(n.id) && !n.read)

        // Show toast for new notifications
        if (showToasts && newOnes.length > 0) {
          newOnes.forEach((n: Notification) => {
            toast[n.type === 'error' ? 'error' : n.type === 'warning' ? 'warning' : 'info'](
              n.title,
              { description: n.message }
            )
          })
        }

        // Play sound for new notifications
        if (playSound && newOnes.length > 0 && audioRef.current) {
          audioRef.current.play().catch(() => {
            // Audio play failed (user hasn't interacted yet)
          })
        }

        // Show desktop notification
        if (newOnes.length > 0 && typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            newOnes.forEach((n: Notification) => {
              new Notification(n.title, {
                body: n.message,
                icon: '/icons/icon-192x192.png',
                tag: n.id
              })
            })
          }
        }

        setNotifications(newNotifications)
        setUnreadCount(data.unreadCount || newNotifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [status, notifications, showToasts, playSound])

  // WebSocket connection
  useEffect(() => {
    if (!enabled || status !== 'authenticated') return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.host}`

    try {
      const socket = new WebSocket(wsUrl)
      socketRef.current = socket

      socket.onopen = () => {
        console.log('[Notifications] WebSocket connected')
        setIsConnected(true)

        // Authenticate
        if (session?.user) {
          socket.send(JSON.stringify({
            type: 'authenticate',
            user: {
              id: (session.user as any).id,
              name: session.user.name,
              email: session.user.email
            }
          }))
        }
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'notification') {
            const notification: Notification = {
              id: data.id || `notif-${Date.now()}`,
              title: data.title,
              message: data.message,
              type: data.notificationType || 'info',
              category: data.category || 'general',
              priority: data.priority || 'normal',
              actionUrl: data.actionUrl,
              read: false,
              createdAt: new Date(),
              data: data.data
            }

            setNotifications(prev => [notification, ...prev])
            setUnreadCount(prev => prev + 1)

            // Show toast
            if (showToasts) {
              toast[notification.type === 'error' ? 'error' : notification.type === 'warning' ? 'warning' : 'info'](
                notification.title,
                { description: notification.message }
              )
            }

            // Play sound
            if (playSound && audioRef.current) {
              audioRef.current.play().catch(() => {})
            }
          }
        } catch (e) {
          console.error('[Notifications] Failed to parse message:', e)
        }
      }

      socket.onclose = () => {
        console.log('[Notifications] WebSocket disconnected')
        setIsConnected(false)
      }

      socket.onerror = (error) => {
        console.error('[Notifications] WebSocket error:', error)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('[Notifications] Failed to connect WebSocket:', error)
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [enabled, status, session, showToasts, playSound])

  // Fallback polling when WebSocket is not connected
  useEffect(() => {
    if (!enabled || status !== 'authenticated') return

    // Initial fetch
    fetchNotifications()

    // Set up polling as fallback
    if (!isConnected) {
      pollingRef.current = setInterval(fetchNotifications, pollingInterval)
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [enabled, status, isConnected, pollingInterval, fetchNotifications])

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', data: { notificationId: id } })
      })

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read', data: {} })
      })

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', data: { notificationId: id } })
      })

      setNotifications(prev => prev.filter(n => n.id !== id))
      setUnreadCount(prev => {
        const wasUnread = notifications.find(n => n.id === id && !n.read)
        return wasUnread ? Math.max(0, prev - 1) : prev
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [notifications])

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-all', data: {} })
      })

      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
    }
  }, [])

  // Refresh notifications
  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh
  }
}
