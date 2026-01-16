/**
 * Notifications API Client
 *
 * Provides typed API access to notifications, real-time alerts, and user preferences
 * Supports multiple notification types: in-app, email, push, SMS
 */

import { BaseApiClient } from './base-client'
import { createClient } from '@/lib/supabase/client'

export interface Notification {
  id: string
  user_id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'system' | 'chat' | 'task' | 'project' | 'invoice' | 'booking'
  category: 'general' | 'project' | 'task' | 'client' | 'invoice' | 'message' | 'booking' | 'system'
  title: string
  message: string
  icon: string | null
  image_url: string | null
  link_url: string | null
  link_text: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_read: boolean
  is_archived: boolean
  is_pinned: boolean
  read_at: string | null
  archived_at: string | null
  expires_at: string | null
  metadata: Record<string, any>
  action_buttons: NotificationAction[] | null
  related_id: string | null // ID of related entity (project, task, etc.)
  related_type: string | null // Type of related entity
  created_at: string
  updated_at: string
}

export interface NotificationAction {
  label: string
  action: string
  url?: string
  style?: 'primary' | 'secondary' | 'danger'
}

export interface NotificationPreferences {
  id: string
  user_id: string

  // Channel preferences
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  in_app_enabled: boolean

  // Category preferences
  projects_enabled: boolean
  tasks_enabled: boolean
  clients_enabled: boolean
  invoices_enabled: boolean
  messages_enabled: boolean
  bookings_enabled: boolean
  system_enabled: boolean

  // Email settings
  email_digest: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'never'
  email_summary_enabled: boolean

  // Push settings
  push_sound_enabled: boolean
  push_vibrate_enabled: boolean

  // Quiet hours
  quiet_hours_enabled: boolean
  quiet_hours_start: string | null // HH:MM format
  quiet_hours_end: string | null // HH:MM format

  // Do not disturb
  do_not_disturb: boolean

  created_at: string
  updated_at: string
}

export interface CreateNotificationData {
  type?: Notification['type']
  category: Notification['category']
  title: string
  message: string
  icon?: string
  image_url?: string
  link_url?: string
  link_text?: string
  priority?: Notification['priority']
  expires_at?: string
  metadata?: Record<string, any>
  action_buttons?: NotificationAction[]
  related_id?: string
  related_type?: string
}

export interface NotificationFilters {
  type?: Notification['type'][]
  category?: Notification['category'][]
  priority?: Notification['priority'][]
  is_read?: boolean
  is_archived?: boolean
  is_pinned?: boolean
  created_after?: string
  created_before?: string
  search?: string
}

export interface NotificationStats {
  total_notifications: number
  unread_count: number
  archived_count: number
  pinned_count: number
  by_type: Array<{
    type: Notification['type']
    count: number
  }>
  by_category: Array<{
    category: Notification['category']
    count: number
  }>
  by_priority: Array<{
    priority: Notification['priority']
    count: number
  }>
  recent_unread: number
  oldest_unread_date: string | null
}

class NotificationsApiClient extends BaseApiClient {
  /**
   * Get notifications with pagination and filters
   */
  async getNotifications(
    page: number = 1,
    pageSize: number = 20,
    filters?: NotificationFilters
  ) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    // Apply filters
    if (filters) {
      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type)
      }

      if (filters.category && filters.category.length > 0) {
        query = query.in('category', filters.category)
      }

      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority)
      }

      if (filters.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read)
      }

      if (filters.is_archived !== undefined) {
        query = query.eq('is_archived', filters.is_archived)
      }

      if (filters.is_pinned !== undefined) {
        query = query.eq('is_pinned', filters.is_pinned)
      }

      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after)
      }

      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before)
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`)
      }
    }

    const { data, error, count } = await query

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: {
        data: data as Notification[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      },
      error: null
    }
  }

  /**
   * Get single notification by ID
   */
  async getNotification(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Notification,
      error: null
    }
  }

  /**
   * Create a notification
   */
  async createNotification(notificationData: CreateNotificationData) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const notification = {
      user_id: user.id,
      type: notificationData.type || 'info',
      category: notificationData.category,
      title: notificationData.title,
      message: notificationData.message,
      icon: notificationData.icon || null,
      image_url: notificationData.image_url || null,
      link_url: notificationData.link_url || null,
      link_text: notificationData.link_text || null,
      priority: notificationData.priority || 'medium',
      is_read: false,
      is_archived: false,
      is_pinned: false,
      expires_at: notificationData.expires_at || null,
      metadata: notificationData.metadata || {},
      action_buttons: notificationData.action_buttons || null,
      related_id: notificationData.related_id || null,
      related_type: notificationData.related_type || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Notification,
      error: null
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Notification,
      error: null
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: null,
      error: null
    }
  }

  /**
   * Archive notification
   */
  async archiveNotification(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Notification,
      error: null
    }
  }

  /**
   * Pin/unpin notification
   */
  async togglePin(id: string, isPinned: boolean) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_pinned: isPinned,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Notification,
      error: null
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: null,
      error: null
    }
  }

  /**
   * Delete all archived notifications
   */
  async deleteAllArchived() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('is_archived', true)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: null,
      error: null
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // If no preferences exist, return defaults
      if (error.code === 'PGRST116') {
        return {
          success: true,
          data: this.getDefaultPreferences(user.id),
          error: null
        }
      }

      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as NotificationPreferences,
      error: null
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Try to update existing preferences
    const { data: existingPrefs } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingPrefs) {
      // Update existing
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: error.message,
          data: null
        }
      }

      return {
        success: true,
        data: data as NotificationPreferences,
        error: null
      }
    } else {
      // Create new
      const newPrefs = {
        ...this.getDefaultPreferences(user.id),
        ...preferences
      }

      const { data, error } = await supabase
        .from('notification_preferences')
        .insert(newPrefs)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: error.message,
          data: null
        }
      }

      return {
        success: true,
        data: data as NotificationPreferences,
        error: null
      }
    }
  }

  /**
   * Get notification statistics
   */
  async getStats() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { data: notifications } = await supabase
      .from('notifications')
      .select('type, category, priority, is_read, is_archived, is_pinned, created_at')
      .eq('user_id', user.id)

    if (!notifications) {
      return {
        success: true,
        data: this.getEmptyStats(),
        error: null
      }
    }

    // Calculate statistics
    const unreadNotifications = notifications.filter(n => !n.is_read)
    const unreadDates = unreadNotifications.map(n => new Date(n.created_at))
    const oldestUnread = unreadDates.length > 0
      ? new Date(Math.min(...unreadDates.map(d => d.getTime())))
      : null

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const stats: NotificationStats = {
      total_notifications: notifications.length,
      unread_count: unreadNotifications.length,
      archived_count: notifications.filter(n => n.is_archived).length,
      pinned_count: notifications.filter(n => n.is_pinned).length,
      by_type: this.groupByField(notifications, 'type'),
      by_category: this.groupByField(notifications, 'category'),
      by_priority: this.groupByField(notifications, 'priority'),
      recent_unread: unreadNotifications.filter(n => new Date(n.created_at) > oneDayAgo).length,
      oldest_unread_date: oldestUnread ? oldestUnread.toISOString() : null
    }

    return {
      success: true,
      data: stats,
      error: null
    }
  }

  /**
   * Helper: Get default preferences
   */
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      id: '',
      user_id: userId,
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      in_app_enabled: true,
      projects_enabled: true,
      tasks_enabled: true,
      clients_enabled: true,
      invoices_enabled: true,
      messages_enabled: true,
      bookings_enabled: true,
      system_enabled: true,
      email_digest: 'daily',
      email_summary_enabled: true,
      push_sound_enabled: true,
      push_vibrate_enabled: true,
      quiet_hours_enabled: false,
      quiet_hours_start: null,
      quiet_hours_end: null,
      do_not_disturb: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Helper: Get empty stats
   */
  private getEmptyStats(): NotificationStats {
    return {
      total_notifications: 0,
      unread_count: 0,
      archived_count: 0,
      pinned_count: 0,
      by_type: [],
      by_category: [],
      by_priority: [],
      recent_unread: 0,
      oldest_unread_date: null
    }
  }

  /**
   * Helper: Group by field
   */
  private groupByField<T extends Record<string, any>, K extends keyof T>(
    items: T[],
    field: K
  ): Array<{ [key in K]: T[K] } & { count: number }> {
    const grouped = items.reduce((acc, item) => {
      const key = String(item[field])
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped).map(([key, count]) => ({
      [field]: key,
      count
    })) as Array<{ [key in K]: T[K] } & { count: number }>
  }
}

export const notificationsClient = new NotificationsApiClient()
