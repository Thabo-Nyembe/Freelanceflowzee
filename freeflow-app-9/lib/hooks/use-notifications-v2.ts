'use client'

/**
 * Comprehensive Notifications Hook for Notifications V2
 *
 * Features:
 * - Real-time Supabase subscriptions
 * - Full CRUD operations
 * - Filtering by type, status, category
 * - Mark as read/unread
 * - Mark all as read
 * - Star/unstar notifications
 * - Archive notifications
 * - Delete notifications
 * - Statistics calculation
 * - Loading and error states
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

export type NotificationTypeV2 = 'info' | 'success' | 'warning' | 'error' | 'system' | 'mention' | 'reminder' | 'alert'
export type NotificationStatusV2 = 'unread' | 'read' | 'archived' | 'dismissed'
export type NotificationPriorityV2 = 'low' | 'normal' | 'high' | 'urgent'
export type NotificationChannelV2 = 'push' | 'email' | 'sms' | 'in_app' | 'slack' | 'webhook'

export interface NotificationV2 {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationTypeV2
  category: string
  priority: NotificationPriorityV2
  status: NotificationStatusV2
  channel: NotificationChannelV2
  is_read: boolean
  read_at: string | null
  is_starred: boolean
  action_url: string | null
  action_label: string | null
  sender: string | null
  sender_avatar: string | null
  group_id: string | null
  tags: string[]
  data: Record<string, any>
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationStatsV2 {
  total: number
  unread: number
  read: number
  starred: number
  archived: number
  byCategory: Record<string, number>
  byType: Record<string, number>
  byPriority: Record<string, number>
  byChannel: Record<string, number>
}

export interface NotificationFilters {
  status?: NotificationStatusV2 | 'all'
  type?: NotificationTypeV2 | 'all'
  category?: string | 'all'
  channel?: NotificationChannelV2 | 'all'
  priority?: NotificationPriorityV2 | 'all'
  search?: string
  starred?: boolean
  startDate?: string
  endDate?: string
}

export interface UseNotificationsV2Options {
  filters?: NotificationFilters
  limit?: number
  realtime?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

// ============================================================================
// HOOK
// ============================================================================

export function useNotificationsV2(options: UseNotificationsV2Options = {}) {
  const {
    filters = {},
    limit = 100,
    realtime = true,
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  const [notifications, setNotifications] = useState<NotificationV2[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'unread') {
          query = query.eq('is_read', false)
        } else if (filters.status === 'read') {
          query = query.eq('is_read', true)
        } else if (filters.status === 'archived') {
          query = query.not('data->archived', 'is', null)
        }
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority)
      }

      if (filters.starred) {
        query = query.eq('data->starred', true)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Transform data to include computed fields
      const transformedData: NotificationV2[] = (data || []).map(n => ({
        id: n.id,
        user_id: n.user_id,
        title: n.title,
        message: n.message,
        type: (n.type || 'info') as NotificationTypeV2,
        category: n.category || 'general',
        priority: (n.priority || 'normal') as NotificationPriorityV2,
        status: n.is_read ? 'read' : 'unread' as NotificationStatusV2,
        channel: (n.data?.channel || 'in_app') as NotificationChannelV2,
        is_read: n.is_read || false,
        read_at: n.read_at,
        is_starred: n.data?.starred || false,
        action_url: n.action_url,
        action_label: n.action_label,
        sender: n.data?.sender || null,
        sender_avatar: n.data?.sender_avatar || null,
        group_id: n.group_id,
        tags: n.tags || [],
        data: n.data || {},
        expires_at: n.expires_at,
        created_at: n.created_at,
        updated_at: n.updated_at || n.created_at
      }))

      // Apply client-side search filter
      let filtered = transformedData
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(n =>
          n.title.toLowerCase().includes(searchLower) ||
          n.message.toLowerCase().includes(searchLower)
        )
      }

      setNotifications(filtered)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, filters.status, filters.type, filters.category, filters.priority, filters.starred, filters.search, limit])

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  // Real-time subscription
  useEffect(() => {
    if (!userId || !realtime) return

    const channel = supabase
      .channel(`notifications-v2-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Record<string, unknown>
          const transformed: NotificationV2 = {
            id: newNotification.id,
            user_id: newNotification.user_id,
            title: newNotification.title,
            message: newNotification.message,
            type: (newNotification.type || 'info') as NotificationTypeV2,
            category: newNotification.category || 'general',
            priority: (newNotification.priority || 'normal') as NotificationPriorityV2,
            status: 'unread',
            channel: (newNotification.data?.channel || 'in_app') as NotificationChannelV2,
            is_read: false,
            read_at: null,
            is_starred: newNotification.data?.starred || false,
            action_url: newNotification.action_url,
            action_label: newNotification.action_label,
            sender: newNotification.data?.sender || null,
            sender_avatar: newNotification.data?.sender_avatar || null,
            group_id: newNotification.group_id,
            tags: newNotification.tags || [],
            data: newNotification.data || {},
            expires_at: newNotification.expires_at,
            created_at: newNotification.created_at,
            updated_at: newNotification.updated_at || newNotification.created_at
          }
          setNotifications(prev => [transformed, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updated = payload.new as Record<string, unknown>
          setNotifications(prev =>
            prev.map(n => {
              if (n.id === updated.id) {
                return {
                  ...n,
                  title: updated.title,
                  message: updated.message,
                  type: (updated.type || n.type) as NotificationTypeV2,
                  category: updated.category || n.category,
                  priority: (updated.priority || n.priority) as NotificationPriorityV2,
                  status: updated.is_read ? 'read' : 'unread',
                  is_read: updated.is_read || false,
                  read_at: updated.read_at,
                  is_starred: updated.data?.starred || false,
                  data: updated.data || n.data,
                  updated_at: updated.updated_at || new Date().toISOString()
                }
              }
              return n
            })
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const deleted = payload.old as Record<string, unknown>
          setNotifications(prev => prev.filter(n => n.id !== deleted.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, realtime])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return

    const interval = setInterval(fetchNotifications, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchNotifications, userId])

  // ============================================================================
  // OPERATIONS
  // ============================================================================

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    if (!userId) return false

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Optimistic update
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString(), status: 'read' as NotificationStatusV2 }
            : n
        )
      )

      return true
    } catch (err) {
      console.error('Error marking as read:', err)
      toast.error('Failed to mark notification as read')
      return false
    }
  }, [userId])

  // Mark as unread
  const markAsUnread = useCallback(async (notificationId: string): Promise<boolean> => {
    if (!userId) return false

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: false,
          read_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: false, read_at: null, status: 'unread' as NotificationStatusV2 }
            : n
        )
      )

      return true
    } catch (err) {
      console.error('Error marking as unread:', err)
      toast.error('Failed to mark notification as unread')
      return false
    }
  }, [userId])

  // Mark all as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!userId) return false

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          is_read: true,
          read_at: n.read_at || new Date().toISOString(),
          status: 'read' as NotificationStatusV2
        }))
      )

      toast.success('All notifications marked as read')
      return true
    } catch (err) {
      console.error('Error marking all as read:', err)
      toast.error('Failed to mark all as read')
      return false
    }
  }, [userId])

  // Toggle star
  const toggleStar = useCallback(async (notificationId: string): Promise<boolean> => {
    if (!userId) return false

    const notification = notifications.find(n => n.id === notificationId)
    if (!notification) return false

    const newStarred = !notification.is_starred

    try {
      const currentData = notification.data || {}
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          data: { ...currentData, starred: newStarred },
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_starred: newStarred, data: { ...n.data, starred: newStarred } }
            : n
        )
      )

      toast.success(newStarred ? 'Notification starred' : 'Star removed')
      return true
    } catch (err) {
      console.error('Error toggling star:', err)
      toast.error('Failed to update star')
      return false
    }
  }, [userId, notifications])

  // Archive notification
  const archiveNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    if (!userId) return false

    const notification = notifications.find(n => n.id === notificationId)
    if (!notification) return false

    try {
      const currentData = notification.data || {}
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          data: { ...currentData, archived: true, archived_at: new Date().toISOString() },
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, status: 'archived' as NotificationStatusV2, data: { ...n.data, archived: true } }
            : n
        )
      )

      toast.success('Notification archived')
      return true
    } catch (err) {
      console.error('Error archiving notification:', err)
      toast.error('Failed to archive notification')
      return false
    }
  }, [userId, notifications])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    if (!userId) return false

    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      setNotifications(prev => prev.filter(n => n.id !== notificationId))

      toast.success('Notification deleted')
      return true
    } catch (err) {
      console.error('Error deleting notification:', err)
      toast.error('Failed to delete notification')
      return false
    }
  }, [userId])

  // Clear all notifications
  const clearAll = useCallback(async (): Promise<boolean> => {
    if (!userId) return false

    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      setNotifications([])
      toast.success('All notifications cleared')
      return true
    } catch (err) {
      console.error('Error clearing notifications:', err)
      toast.error('Failed to clear notifications')
      return false
    }
  }, [userId])

  // Create notification
  const createNotification = useCallback(async (notification: Partial<NotificationV2>): Promise<NotificationV2 | null> => {
    if (!userId) return null

    try {
      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title || 'Notification',
          message: notification.message || '',
          type: notification.type || 'info',
          category: notification.category || 'general',
          priority: notification.priority || 'normal',
          is_read: false,
          action_url: notification.action_url,
          action_label: notification.action_label,
          data: {
            channel: notification.channel || 'in_app',
            sender: notification.sender,
            sender_avatar: notification.sender_avatar,
            starred: notification.is_starred || false,
            ...notification.data
          },
          tags: notification.tags || [],
          group_id: notification.group_id
        })
        .select()
        .single()

      if (insertError) throw insertError

      const transformed: NotificationV2 = {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type as NotificationTypeV2,
        category: data.category,
        priority: data.priority as NotificationPriorityV2,
        status: 'unread',
        channel: (data.data?.channel || 'in_app') as NotificationChannelV2,
        is_read: false,
        read_at: null,
        is_starred: data.data?.starred || false,
        action_url: data.action_url,
        action_label: data.action_label,
        sender: data.data?.sender || null,
        sender_avatar: data.data?.sender_avatar || null,
        group_id: data.group_id,
        tags: data.tags || [],
        data: data.data || {},
        expires_at: data.expires_at,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at
      }

      return transformed
    } catch (err) {
      console.error('Error creating notification:', err)
      toast.error('Failed to create notification')
      return null
    }
  }, [userId])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Statistics
  const stats = useMemo((): NotificationStatsV2 => {
    const byCategory: Record<string, number> = {}
    const byType: Record<string, number> = {}
    const byPriority: Record<string, number> = {}
    const byChannel: Record<string, number> = {}

    let unread = 0
    let read = 0
    let starred = 0
    let archived = 0

    notifications.forEach(n => {
      // Count by status
      if (!n.is_read) unread++
      else read++
      if (n.is_starred) starred++
      if (n.data?.archived) archived++

      // Count by category
      byCategory[n.category] = (byCategory[n.category] || 0) + 1

      // Count by type
      byType[n.type] = (byType[n.type] || 0) + 1

      // Count by priority
      byPriority[n.priority] = (byPriority[n.priority] || 0) + 1

      // Count by channel
      byChannel[n.channel] = (byChannel[n.channel] || 0) + 1
    })

    return {
      total: notifications.length,
      unread,
      read,
      starred,
      archived,
      byCategory,
      byType,
      byPriority,
      byChannel
    }
  }, [notifications])

  // Filtered lists
  const unreadNotifications = useMemo(() =>
    notifications.filter(n => !n.is_read && !n.data?.archived),
    [notifications]
  )

  const starredNotifications = useMemo(() =>
    notifications.filter(n => n.is_starred && !n.data?.archived),
    [notifications]
  )

  const archivedNotifications = useMemo(() =>
    notifications.filter(n => n.data?.archived),
    [notifications]
  )

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(notifications.map(n => n.category))
    return Array.from(cats).sort()
  }, [notifications])

  return {
    // Data
    notifications,
    unreadNotifications,
    starredNotifications,
    archivedNotifications,
    stats,
    categories,

    // State
    isLoading,
    error,
    userId,

    // Operations
    refresh: fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    toggleStar,
    archiveNotification,
    deleteNotification,
    clearAll,
    createNotification
  }
}

export default useNotificationsV2
