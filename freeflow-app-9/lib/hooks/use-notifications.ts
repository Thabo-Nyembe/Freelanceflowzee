// Hook for Notifications management
// Created: December 14, 2024
// Updated: Real-time notifications with Supabase Realtime

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { createClient } from '@/lib/supabase/client'

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'user' | 'task' | 'message' | 'reminder' | 'alert'
export type NotificationStatus = 'unread' | 'read' | 'dismissed' | 'archived' | 'deleted'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical'

export interface Notification {
  id: string
  user_id: string
  organization_id: string | null
  title: string
  message: string
  notification_type: NotificationType
  status: NotificationStatus
  priority: NotificationPriority
  is_read: boolean
  read_at: string | null
  is_dismissed: boolean
  dismissed_at: string | null
  action_url: string | null
  action_label: string | null
  action_type: string | null
  related_entity_type: string | null
  related_entity_id: string | null
  icon: string | null
  color: string | null
  badge: string | null
  image_url: string | null
  send_email: boolean
  email_sent_at: string | null
  send_push: boolean
  push_sent_at: string | null
  send_sms: boolean
  sms_sent_at: string | null
  send_in_app: boolean
  group_key: string | null
  is_grouped: boolean
  expires_at: string | null
  auto_delete_after_days: number
  is_silent: boolean
  requires_action: boolean
  metadata: any
  data: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseNotificationsOptions {
  status?: NotificationStatus | 'all'
  notificationType?: NotificationType | 'all'
  priority?: NotificationPriority | 'all'
  limit?: number
  realtime?: boolean
  onNewNotification?: (notification: Notification) => void
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { status, notificationType, priority, limit, realtime = true, onNewNotification } = options
  const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([])
  const supabase = createClient()
  const onNewNotificationRef = useRef(onNewNotification)

  // Keep callback ref up to date
  useEffect(() => {
    onNewNotificationRef.current = onNewNotification
  }, [onNewNotification])

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (notificationType && notificationType !== 'all') filters.notification_type = notificationType
  if (priority && priority !== 'all') filters.priority = priority

  const queryOptions: any = {
    table: 'notifications',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: realtime
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Notification>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'notifications',
    onSuccess: refetch
  })

  // Real-time subscription for new notifications with callback support
  useEffect(() => {
    if (!realtime) return

    // Use unique channel name to prevent conflicts
    const channelName = `notifications-realtime-${Math.random().toString(36).slice(2, 11)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotification = payload.new as Notification

          // Deduplicate - check if notification already exists
          setRealtimeNotifications(prev => {
            const exists = prev.some(n => n.id === newNotification.id)
            if (exists) return prev
            return [newNotification, ...prev]
          })

          // Call the callback if provided (only once per notification)
          if (onNewNotificationRef.current) {
            onNewNotificationRef.current(newNotification)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setRealtimeNotifications(prev =>
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notifications' },
        (payload) => {
          const deletedId = payload.old.id
          setRealtimeNotifications(prev => prev.filter(n => n.id !== deletedId))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtime])

  // Merge database data with realtime updates
  const notifications = useMemo(() => {
    if (!data) return realtimeNotifications

    // Merge and deduplicate, prioritizing realtime updates
    const merged = [...realtimeNotifications]
    data.forEach(notification => {
      if (!merged.find(n => n.id === notification.id)) {
        merged.push(notification)
      }
    })

    // Sort by created_at descending
    return merged.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [data, realtimeNotifications])

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read && n.status !== 'dismissed').length
  }, [notifications])

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        status: 'read' as NotificationStatus
      })
      .eq('id', notificationId)

    if (!error) {
      setRealtimeNotifications(prev =>
        prev.map(n => n.id === notificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString(), status: 'read' as NotificationStatus }
          : n
        )
      )
      refetch()
    }
    return !error
  }, [supabase, refetch])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return true

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        status: 'read' as NotificationStatus
      })
      .in('id', unreadIds)

    if (!error) {
      setRealtimeNotifications(prev =>
        prev.map(n => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
          status: 'read' as NotificationStatus
        }))
      )
      refetch()
    }
    return !error
  }, [supabase, notifications, refetch])

  // Dismiss notification
  const dismissNotification = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_dismissed: true,
        dismissed_at: new Date().toISOString(),
        status: 'dismissed' as NotificationStatus
      })
      .eq('id', notificationId)

    if (!error) {
      setRealtimeNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      )
      refetch()
    }
    return !error
  }, [supabase, refetch])

  // Clear all realtime notifications (local state only)
  const clearRealtimeNotifications = useCallback(() => {
    setRealtimeNotifications([])
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    mutating,
    createNotification: create,
    updateNotification: update,
    deleteNotification: remove,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearRealtimeNotifications,
    refetch
  }
}
