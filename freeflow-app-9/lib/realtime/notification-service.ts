/**
 * KAZI Real-time Notification Service
 *
 * A comprehensive real-time notification system that handles:
 * - Push notifications
 * - In-app notifications
 * - Email notifications
 * - WebSocket broadcasts
 * - Notification preferences
 * - Batch processing
 * - Delivery tracking
 */

import { createClient } from '@/lib/supabase/server'

// Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system'
export type NotificationCategory =
  | 'general'
  | 'project'
  | 'task'
  | 'invoice'
  | 'payment'
  | 'client'
  | 'team'
  | 'file'
  | 'message'
  | 'workflow'
  | 'security'
  | 'system'

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms'
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read'

export interface NotificationPayload {
  userId: string
  title: string
  message: string
  type?: NotificationType
  category?: NotificationCategory
  channels?: NotificationChannel[]
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  data?: Record<string, unknown>
  actionUrl?: string
  actionLabel?: string
  expiresAt?: string
  groupId?: string
  tags?: string[]
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  category: NotificationCategory
  priority: string
  data: Record<string, unknown>
  action_url?: string
  action_label?: string
  is_read: boolean
  read_at?: string
  expires_at?: string
  group_id?: string
  tags: string[]
  created_at: string
}

export interface NotificationDelivery {
  id: string
  notification_id: string
  channel: NotificationChannel
  status: DeliveryStatus
  sent_at?: string
  delivered_at?: string
  failed_at?: string
  error_message?: string
  retry_count: number
}

export interface NotificationPreferences {
  user_id: string
  channel_preferences: Record<NotificationCategory, NotificationChannel[]>
  quiet_hours: {
    enabled: boolean
    start: string // HH:MM
    end: string // HH:MM
    timezone: string
  }
  email_digest: {
    enabled: boolean
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  }
  disabled_categories: NotificationCategory[]
  push_enabled: boolean
}

// Real-time event types for Supabase Realtime
export interface RealtimeEvent {
  type: 'notification' | 'update' | 'delete' | 'batch'
  payload: unknown
}

// Notification Service Class
export class NotificationService {
  private static instance: NotificationService

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  /**
   * Send a notification to a user
   */
  async send(payload: NotificationPayload): Promise<Notification> {
    const supabase = await createClient()

    // Get user preferences
    const preferences = await this.getPreferences(payload.userId)

    // Check if category is disabled
    if (preferences?.disabled_categories?.includes(payload.category || 'general')) {
      throw new Error('Notification category is disabled by user')
    }

    // Check quiet hours
    if (preferences?.quiet_hours?.enabled && this.isQuietHours(preferences.quiet_hours)) {
      // Queue for later delivery instead of immediate
      payload.data = { ...payload.data, queued_during_quiet_hours: true }
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type || 'info',
        category: payload.category || 'general',
        priority: payload.priority || 'normal',
        data: payload.data || {},
        action_url: payload.actionUrl,
        action_label: payload.actionLabel,
        expires_at: payload.expiresAt,
        group_id: payload.groupId,
        tags: payload.tags || [],
        is_read: false
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create notification: ${error.message}`)

    // Determine channels
    const channels = payload.channels ||
      preferences?.channel_preferences?.[payload.category || 'general'] ||
      ['in_app']

    // Create delivery records and send
    for (const channel of channels) {
      await this.deliverToChannel(notification, channel)
    }

    // Broadcast via Supabase Realtime
    await this.broadcastRealtime(payload.userId, {
      type: 'notification',
      payload: notification
    })

    return notification
  }

  /**
   * Send notification to multiple users
   */
  async sendBulk(
    userIds: string[],
    notification: Omit<NotificationPayload, 'userId'>
  ): Promise<Notification[]> {
    const notifications: Notification[] = []

    for (const userId of userIds) {
      try {
        const result = await this.send({ ...notification, userId })
        notifications.push(result)
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error)
      }
    }

    return notifications
  }

  /**
   * Send notification to all team members
   */
  async sendToTeam(
    teamId: string,
    notification: Omit<NotificationPayload, 'userId'>,
    excludeUserIds?: string[]
  ): Promise<Notification[]> {
    const supabase = await createClient()

    const { data: members } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('status', 'active')

    if (!members?.length) return []

    const userIds = members
      .map(m => m.user_id)
      .filter(id => !excludeUserIds?.includes(id))

    return this.sendBulk(userIds, notification)
  }

  /**
   * Deliver notification to specific channel
   */
  private async deliverToChannel(
    notification: Notification,
    channel: NotificationChannel
  ): Promise<void> {
    const supabase = await createClient()

    // Create delivery record
    const { data: delivery, error } = await supabase
      .from('notification_deliveries')
      .insert({
        notification_id: notification.id,
        channel,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create delivery record:', error)
      return
    }

    try {
      switch (channel) {
        case 'in_app':
          // Already stored, just update status
          await this.updateDeliveryStatus(delivery.id, 'delivered')
          break

        case 'email':
          await this.sendEmailNotification(notification)
          await this.updateDeliveryStatus(delivery.id, 'sent')
          break

        case 'push':
          await this.sendPushNotification(notification)
          await this.updateDeliveryStatus(delivery.id, 'sent')
          break

        case 'sms':
          await this.sendSmsNotification(notification)
          await this.updateDeliveryStatus(delivery.id, 'sent')
          break
      }
    } catch (error) {
      await this.updateDeliveryStatus(
        delivery.id,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    // Integration with email service (SendGrid, SES, etc.)
    // For now, log the email
    console.log('Email notification:', {
      to: notification.user_id,
      subject: notification.title,
      body: notification.message
    })

    // In production:
    // await emailService.send({
    //   to: userEmail,
    //   subject: notification.title,
    //   template: 'notification',
    //   data: {
    //     title: notification.title,
    //     message: notification.message,
    //     actionUrl: notification.action_url,
    //     actionLabel: notification.action_label
    //   }
    // })
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    // Integration with push service (Firebase, OneSignal, etc.)
    console.log('Push notification:', {
      userId: notification.user_id,
      title: notification.title,
      body: notification.message
    })

    // In production:
    // await pushService.send({
    //   userId: notification.user_id,
    //   notification: {
    //     title: notification.title,
    //     body: notification.message,
    //     data: notification.data
    //   }
    // })
  }

  /**
   * Send SMS notification
   */
  private async sendSmsNotification(notification: Notification): Promise<void> {
    // Integration with SMS service (Twilio, etc.)
    console.log('SMS notification:', {
      userId: notification.user_id,
      message: `${notification.title}: ${notification.message}`
    })
  }

  /**
   * Update delivery status
   */
  private async updateDeliveryStatus(
    deliveryId: string,
    status: DeliveryStatus,
    errorMessage?: string
  ): Promise<void> {
    const supabase = await createClient()

    const updates: Record<string, unknown> = { status }

    if (status === 'sent') updates.sent_at = new Date().toISOString()
    if (status === 'delivered') updates.delivered_at = new Date().toISOString()
    if (status === 'failed') {
      updates.failed_at = new Date().toISOString()
      updates.error_message = errorMessage
    }

    await supabase
      .from('notification_deliveries')
      .update(updates)
      .eq('id', deliveryId)
  }

  /**
   * Broadcast via Supabase Realtime
   */
  private async broadcastRealtime(
    userId: string,
    event: RealtimeEvent
  ): Promise<void> {
    const supabase = await createClient()

    // Use Supabase Realtime broadcast
    // The client subscribes to a channel named `notifications:${userId}`
    await supabase
      .from('realtime_broadcasts')
      .insert({
        channel: `notifications:${userId}`,
        event_type: event.type,
        payload: event.payload
      })
      .then(() => {
        // Broadcast is stored, clients will receive via subscription
      })
      .catch(err => {
        // Table might not exist, that's ok - clients use direct Realtime
        console.log('Realtime broadcast skipped:', err.message)
      })
  }

  /**
   * Get user notifications
   */
  async getNotifications(
    userId: string,
    options?: {
      category?: NotificationCategory
      type?: NotificationType
      isRead?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const supabase = await createClient()

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    if (options?.type) {
      query = query.eq('type', options.type)
    }

    if (options?.isRead !== undefined) {
      query = query.eq('is_read', options.isRead)
    }

    // Filter out expired notifications
    query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    const limit = options?.limit || 50
    const offset = options?.offset || 0

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(`Failed to get notifications: ${error.message}`)

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    return {
      notifications: data || [],
      total: count || 0,
      unreadCount: unreadCount || 0
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to mark as read: ${error.message}`)

    // Broadcast update
    await this.broadcastRealtime(userId, {
      type: 'update',
      payload: { id: notificationId, is_read: true }
    })
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string, category?: NotificationCategory): Promise<number> {
    const supabase = await createClient()

    let query = supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query.select()

    if (error) throw new Error(`Failed to mark all as read: ${error.message}`)

    // Broadcast batch update
    await this.broadcastRealtime(userId, {
      type: 'batch',
      payload: { action: 'mark_all_read', category }
    })

    return data?.length || 0
  }

  /**
   * Delete notification
   */
  async delete(userId: string, notificationId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to delete notification: ${error.message}`)

    // Broadcast deletion
    await this.broadcastRealtime(userId, {
      type: 'delete',
      payload: { id: notificationId }
    })
  }

  /**
   * Delete all notifications
   */
  async deleteAll(userId: string, category?: NotificationCategory): Promise<number> {
    const supabase = await createClient()

    let query = supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query.select()

    if (error) throw new Error(`Failed to delete all: ${error.message}`)

    // Broadcast batch deletion
    await this.broadcastRealtime(userId, {
      type: 'batch',
      payload: { action: 'delete_all', category }
    })

    return data?.length || 0
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw new Error(`Failed to update preferences: ${error.message}`)
    return data
  }

  /**
   * Check if current time is in quiet hours
   */
  private isQuietHours(quietHours: NotificationPreferences['quiet_hours']): boolean {
    if (!quietHours.enabled) return false

    const now = new Date()
    // In production, use timezone-aware comparison
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const { start, end } = quietHours

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end
    }

    return currentTime >= start && currentTime <= end
  }

  /**
   * Get notification statistics
   */
  async getStatistics(userId: string, days: number = 30): Promise<Record<string, unknown>> {
    const supabase = await createClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: notifications } = await supabase
      .from('notifications')
      .select('type, category, is_read, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (!notifications) return {}

    const stats = {
      total: notifications.length,
      read: notifications.filter(n => n.is_read).length,
      unread: notifications.filter(n => !n.is_read).length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byDay: {} as Record<string, number>
    }

    notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1
      stats.byCategory[n.category] = (stats.byCategory[n.category] || 0) + 1

      const day = n.created_at.split('T')[0]
      stats.byDay[day] = (stats.byDay[day] || 0) + 1
    })

    return stats
  }

  /**
   * Process email digest
   */
  async processEmailDigest(frequency: 'hourly' | 'daily' | 'weekly'): Promise<void> {
    const supabase = await createClient()

    // Get users with this digest frequency
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('email_digest->>enabled', 'true')
      .eq('email_digest->>frequency', frequency)

    if (!preferences?.length) return

    for (const pref of preferences) {
      try {
        await this.sendDigestEmail(pref.user_id, frequency)
      } catch (error) {
        console.error(`Failed to send digest to user ${pref.user_id}:`, error)
      }
    }
  }

  /**
   * Send digest email to user
   */
  private async sendDigestEmail(
    userId: string,
    frequency: 'hourly' | 'daily' | 'weekly'
  ): Promise<void> {
    const supabase = await createClient()

    // Calculate time range
    const startDate = new Date()
    switch (frequency) {
      case 'hourly': startDate.setHours(startDate.getHours() - 1); break
      case 'daily': startDate.setDate(startDate.getDate() - 1); break
      case 'weekly': startDate.setDate(startDate.getDate() - 7); break
    }

    // Get unread notifications in range
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (!notifications?.length) return

    // Send digest email
    console.log('Sending digest email:', {
      userId,
      frequency,
      notificationCount: notifications.length
    })

    // In production:
    // await emailService.send({
    //   to: userEmail,
    //   subject: `Your ${frequency} notification digest`,
    //   template: 'notification-digest',
    //   data: { notifications }
    // })
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpired(): Promise<number> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .not('expires_at', 'is', null)
      .select()

    if (error) throw new Error(`Failed to cleanup: ${error.message}`)
    return data?.length || 0
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()

// Convenience functions for common notifications
export const notifications = {
  // Project notifications
  projectCreated: (userId: string, projectName: string) =>
    notificationService.send({
      userId,
      title: 'Project Created',
      message: `Your project "${projectName}" has been created successfully.`,
      type: 'success',
      category: 'project'
    }),

  projectCompleted: (userId: string, projectName: string) =>
    notificationService.send({
      userId,
      title: 'Project Completed',
      message: `Congratulations! "${projectName}" has been marked as complete.`,
      type: 'success',
      category: 'project'
    }),

  // Task notifications
  taskAssigned: (userId: string, taskName: string, assignerName: string) =>
    notificationService.send({
      userId,
      title: 'Task Assigned',
      message: `${assignerName} assigned you to "${taskName}".`,
      type: 'info',
      category: 'task',
      priority: 'high'
    }),

  taskDueSoon: (userId: string, taskName: string, dueDate: string) =>
    notificationService.send({
      userId,
      title: 'Task Due Soon',
      message: `"${taskName}" is due on ${dueDate}.`,
      type: 'warning',
      category: 'task',
      priority: 'high'
    }),

  // Invoice notifications
  invoiceReceived: (userId: string, invoiceNumber: string, amount: string) =>
    notificationService.send({
      userId,
      title: 'Invoice Received',
      message: `Invoice ${invoiceNumber} for ${amount} has been received.`,
      type: 'info',
      category: 'invoice'
    }),

  paymentReceived: (userId: string, amount: string, clientName: string) =>
    notificationService.send({
      userId,
      title: 'Payment Received',
      message: `You received a payment of ${amount} from ${clientName}.`,
      type: 'success',
      category: 'payment',
      priority: 'high'
    }),

  // Client notifications
  newClient: (userId: string, clientName: string) =>
    notificationService.send({
      userId,
      title: 'New Client',
      message: `${clientName} has been added as a new client.`,
      type: 'success',
      category: 'client'
    }),

  // Team notifications
  teamMemberJoined: (userId: string, memberName: string, teamName: string) =>
    notificationService.send({
      userId,
      title: 'Team Member Joined',
      message: `${memberName} has joined ${teamName}.`,
      type: 'info',
      category: 'team'
    }),

  // File notifications
  fileShared: (userId: string, fileName: string, sharerName: string) =>
    notificationService.send({
      userId,
      title: 'File Shared',
      message: `${sharerName} shared "${fileName}" with you.`,
      type: 'info',
      category: 'file'
    }),

  // Message notifications
  newMessage: (userId: string, senderName: string, preview: string) =>
    notificationService.send({
      userId,
      title: `Message from ${senderName}`,
      message: preview.substring(0, 100) + (preview.length > 100 ? '...' : ''),
      type: 'info',
      category: 'message',
      priority: 'high'
    }),

  // Security notifications
  loginFromNewDevice: (userId: string, device: string, location: string) =>
    notificationService.send({
      userId,
      title: 'New Device Login',
      message: `Your account was accessed from a new device (${device}) in ${location}.`,
      type: 'warning',
      category: 'security',
      priority: 'urgent'
    }),

  // System notifications
  maintenanceScheduled: (userId: string, date: string, duration: string) =>
    notificationService.send({
      userId,
      title: 'Scheduled Maintenance',
      message: `System maintenance is scheduled for ${date}. Expected duration: ${duration}.`,
      type: 'info',
      category: 'system'
    })
}
