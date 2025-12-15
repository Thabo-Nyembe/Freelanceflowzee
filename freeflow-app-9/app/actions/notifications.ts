// Server Actions for Notifications Management
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

interface CreateNotificationData {
  title: string
  message: string
  notification_type?: string
  priority?: string
  action_url?: string
  action_label?: string
  action_type?: string
  related_entity_type?: string
  related_entity_id?: string
  icon?: string
  color?: string
  badge?: string
  image_url?: string
  send_email?: boolean
  send_push?: boolean
  send_sms?: boolean
  group_key?: string
  expires_at?: string
  requires_action?: boolean
  metadata?: any
  data?: any
}

interface UpdateNotificationData extends Partial<CreateNotificationData> {
  id: string
}

// Create new notification
export async function createNotification(data: CreateNotificationData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/notifications-v2')
  return notification
}

// Update existing notification
export async function updateNotification({ id, ...data }: UpdateNotificationData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: notification, error } = await supabase
    .from('notifications')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/notifications-v2')
  return notification
}

// Delete notification (soft delete)
export async function deleteNotification(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('notifications')
    .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/notifications-v2')
}

// Mark notification as read
export async function markNotificationAsRead(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: notification, error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      status: 'read'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/notifications-v2')
  return notification
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      status: 'read'
    })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) throw error

  revalidatePath('/dashboard/notifications-v2')
}

// Dismiss notification
export async function dismissNotification(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: notification, error } = await supabase
    .from('notifications')
    .update({
      is_dismissed: true,
      dismissed_at: new Date().toISOString(),
      status: 'dismissed'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/notifications-v2')
  return notification
}

// Archive notification
export async function archiveNotification(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: notification, error } = await supabase
    .from('notifications')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/notifications-v2')
  return notification
}

// Clear old notifications
export async function clearOldNotifications(daysOld: number = 30) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const { error } = await supabase
    .from('notifications')
    .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
    .eq('user_id', user.id)
    .eq('is_read', true)
    .lt('created_at', cutoffDate.toISOString())

  if (error) throw error

  revalidatePath('/dashboard/notifications-v2')
}

// Get notification statistics
export async function getNotificationStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('status, notification_type, priority, is_read')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (error) throw error

  const stats = {
    total: notifications?.length || 0,
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    unread: 0,
    read: 0,
    dismissed: 0
  }

  notifications?.forEach(notification => {
    stats.byStatus[notification.status] = (stats.byStatus[notification.status] || 0) + 1
    stats.byType[notification.notification_type] = (stats.byType[notification.notification_type] || 0) + 1
    stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1
    if (!notification.is_read) stats.unread++
    if (notification.is_read) stats.read++
  })

  return stats
}
