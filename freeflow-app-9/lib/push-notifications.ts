/**
 * Push Notification Service
 *
 * Web Push implementation for KAZI using the Web Push API
 * Supports browser notifications and mobile push via service workers
 *
 * @module lib/push-notifications
 */

import { createClient } from '@/lib/supabase/server'

// VAPID keys configuration
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@kazi.io'

// Types
export interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  device_info?: {
    browser?: string
    os?: string
    device_type?: 'desktop' | 'mobile' | 'tablet'
  }
  created_at: string
  last_used_at: string
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: Record<string, unknown>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
  renotify?: boolean
  timestamp?: number
  vibrate?: number[]
}

export type NotificationType =
  | 'message'
  | 'project_update'
  | 'task_assigned'
  | 'invoice_paid'
  | 'payment_received'
  | 'deadline_reminder'
  | 'collaboration_invite'
  | 'file_shared'
  | 'comment_added'
  | 'approval_required'
  | 'system_alert'

export interface NotificationTemplate {
  type: NotificationType
  title: string
  body: string
  icon: string
  actions?: NotificationPayload['actions']
}

// Default notification templates
const notificationTemplates: Record<NotificationType, NotificationTemplate> = {
  message: {
    type: 'message',
    title: 'New Message',
    body: 'You have a new message',
    icon: '/icons/notification-message.png',
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  },
  project_update: {
    type: 'project_update',
    title: 'Project Update',
    body: 'A project you\'re working on has been updated',
    icon: '/icons/notification-project.png',
    actions: [
      { action: 'view', title: 'View Project' }
    ]
  },
  task_assigned: {
    type: 'task_assigned',
    title: 'New Task Assigned',
    body: 'You\'ve been assigned a new task',
    icon: '/icons/notification-task.png',
    actions: [
      { action: 'view', title: 'View Task' },
      { action: 'accept', title: 'Accept' }
    ]
  },
  invoice_paid: {
    type: 'invoice_paid',
    title: 'Invoice Paid',
    body: 'Your invoice has been paid',
    icon: '/icons/notification-payment.png',
    actions: [
      { action: 'view', title: 'View Details' }
    ]
  },
  payment_received: {
    type: 'payment_received',
    title: 'Payment Received',
    body: 'You\'ve received a payment',
    icon: '/icons/notification-payment.png',
    actions: [
      { action: 'view', title: 'View Transaction' }
    ]
  },
  deadline_reminder: {
    type: 'deadline_reminder',
    title: 'Deadline Approaching',
    body: 'A deadline is approaching',
    icon: '/icons/notification-deadline.png',
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'snooze', title: 'Remind Later' }
    ]
  },
  collaboration_invite: {
    type: 'collaboration_invite',
    title: 'Collaboration Invite',
    body: 'You\'ve been invited to collaborate',
    icon: '/icons/notification-invite.png',
    actions: [
      { action: 'accept', title: 'Accept' },
      { action: 'decline', title: 'Decline' }
    ]
  },
  file_shared: {
    type: 'file_shared',
    title: 'File Shared',
    body: 'A file has been shared with you',
    icon: '/icons/notification-file.png',
    actions: [
      { action: 'view', title: 'View File' }
    ]
  },
  comment_added: {
    type: 'comment_added',
    title: 'New Comment',
    body: 'Someone commented on your work',
    icon: '/icons/notification-comment.png',
    actions: [
      { action: 'view', title: 'View Comment' },
      { action: 'reply', title: 'Reply' }
    ]
  },
  approval_required: {
    type: 'approval_required',
    title: 'Approval Required',
    body: 'An item is waiting for your approval',
    icon: '/icons/notification-approval.png',
    actions: [
      { action: 'approve', title: 'Approve' },
      { action: 'review', title: 'Review' }
    ]
  },
  system_alert: {
    type: 'system_alert',
    title: 'System Alert',
    body: 'Important system notification',
    icon: '/icons/notification-alert.png',
    actions: [
      { action: 'view', title: 'View' }
    ]
  }
}

/**
 * Push Notification Service Class
 */
export class PushNotificationService {
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null

  /**
   * Initialize Supabase client
   */
  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  // ============================================================================
  // Subscription Management
  // ============================================================================

  /**
   * Save a push subscription for a user
   */
  async saveSubscription(
    userId: string,
    subscription: {
      endpoint: string
      keys: { p256dh: string; auth: string }
    },
    deviceInfo?: PushSubscription['device_info']
  ): Promise<PushSubscription> {
    const supabase = await this.getSupabase()

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .single()

    if (existing) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('push_subscriptions')
        .update({
          user_id: userId,
          keys: subscription.keys,
          device_info: deviceInfo,
          last_used_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw new Error(`Failed to update subscription: ${error.message}`)
      return data
    }

    // Create new subscription
    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert({
        user_id: userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        device_info: deviceInfo
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to save subscription: ${error.message}`)
    return data
  }

  /**
   * Remove a push subscription
   */
  async removeSubscription(endpoint: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)

    return !error
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to get subscriptions: ${error.message}`)
    return data || []
  }

  // ============================================================================
  // Send Notifications
  // ============================================================================

  /**
   * Send notification to a specific user
   */
  async sendToUser(
    userId: string,
    notification: NotificationPayload
  ): Promise<{ success: number; failed: number }> {
    const subscriptions = await this.getUserSubscriptions(userId)
    return this.sendToSubscriptions(subscriptions, notification)
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    notification: NotificationPayload
  ): Promise<{ success: number; failed: number }> {
    const supabase = await this.getSupabase()

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)

    return this.sendToSubscriptions(subscriptions || [], notification)
  }

  /**
   * Send notification using a template
   */
  async sendTemplatedNotification(
    userId: string,
    type: NotificationType,
    data?: {
      titleParams?: Record<string, string>
      bodyParams?: Record<string, string>
      extraData?: Record<string, unknown>
      url?: string
    }
  ): Promise<{ success: number; failed: number }> {
    const template = notificationTemplates[type]

    // Replace placeholders in title and body
    let title = template.title
    let body = template.body

    if (data?.titleParams) {
      for (const [key, value] of Object.entries(data.titleParams)) {
        title = title.replace(`{${key}}`, value)
      }
    }

    if (data?.bodyParams) {
      for (const [key, value] of Object.entries(data.bodyParams)) {
        body = body.replace(`{${key}}`, value)
      }
    }

    const notification: NotificationPayload = {
      title,
      body,
      icon: template.icon,
      badge: '/icons/badge.png',
      actions: template.actions,
      data: {
        type,
        url: data?.url,
        ...data?.extraData
      },
      timestamp: Date.now()
    }

    return this.sendToUser(userId, notification)
  }

  /**
   * Send to all subscriptions
   */
  private async sendToSubscriptions(
    subscriptions: PushSubscription[],
    notification: NotificationPayload
  ): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    const results = await Promise.allSettled(
      subscriptions.map(sub => this.sendPush(sub, notification))
    )

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        success++
      } else {
        failed++
      }
    }

    return { success, failed }
  }

  /**
   * Send push notification to a single subscription
   */
  private async sendPush(
    subscription: PushSubscription,
    notification: NotificationPayload
  ): Promise<boolean> {
    try {
      // Import web-push dynamically (server-side only)
      const webPush = await import('web-push')

      webPush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
      )

      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      }

      await webPush.sendNotification(
        pushSubscription,
        JSON.stringify(notification),
        {
          TTL: 86400, // 24 hours
          urgency: 'normal'
        }
      )

      // Update last used timestamp
      const supabase = await this.getSupabase()
      await supabase
        .from('push_subscriptions')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', subscription.id)

      return true
    } catch (error: unknown) {
      console.error('Push notification error:', error)

      // If subscription is no longer valid, remove it
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await this.removeSubscription(subscription.endpoint)
        }
      }

      return false
    }
  }

  // ============================================================================
  // Notification Preferences
  // ============================================================================

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<Record<NotificationType, boolean>> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('notification_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single()

    if (data?.preferences) {
      return data.preferences as Record<NotificationType, boolean>
    }

    // Return default preferences (all enabled)
    return Object.keys(notificationTemplates).reduce((acc, type) => {
      acc[type as NotificationType] = true
      return acc
    }, {} as Record<NotificationType, boolean>)
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<Record<NotificationType, boolean>>
  ): Promise<Record<NotificationType, boolean>> {
    const supabase = await this.getSupabase()

    // Get current preferences
    const current = await this.getUserPreferences(userId)
    const updated = { ...current, ...preferences }

    // Upsert preferences
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        preferences: updated,
        updated_at: new Date().toISOString()
      })

    if (error) throw new Error(`Failed to update preferences: ${error.message}`)
    return updated
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get VAPID public key for client-side subscription
   */
  getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY
  }

  /**
   * Check if push notifications are configured
   */
  isConfigured(): boolean {
    return !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)
  }

  /**
   * Generate VAPID keys (for setup)
   */
  async generateVapidKeys(): Promise<{ publicKey: string; privateKey: string }> {
    const webPush = await import('web-push')
    return webPush.generateVAPIDKeys()
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService()

// Export notification templates for reference
export { notificationTemplates }
