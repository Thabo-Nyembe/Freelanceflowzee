// Hook for Notifications management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

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
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { status, notificationType, priority, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (notificationType && notificationType !== 'all') filters.notification_type = notificationType
  if (priority && priority !== 'all') filters.priority = priority

  const queryOptions: any = {
    table: 'notifications',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Notification>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'notifications',
    onSuccess: refetch
  })

  return {
    notifications: data,
    loading,
    error,
    mutating,
    createNotification: create,
    updateNotification: update,
    deleteNotification: remove,
    refetch
  }
}
