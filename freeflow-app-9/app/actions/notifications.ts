// Server Actions for Notifications Management
// Created: December 14, 2024
// Updated to A+++ Standard

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  type ActionResult
} from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema, dateSchema } from '@/lib/validations'

// ============================================
// LOGGER
// ============================================

const logger = createFeatureLogger('notifications')

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  message: z.string().min(1, 'Message is required').max(1000),
  notification_type: z.enum(['info', 'success', 'warning', 'error', 'mention', 'assignment', 'reminder']).default('info'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  action_url: z.string().url().optional().nullable(),
  action_label: z.string().max(100).optional().nullable(),
  action_type: z.string().max(50).optional().nullable(),
  related_entity_type: z.string().max(50).optional().nullable(),
  related_entity_id: uuidSchema.optional().nullable(),
  icon: z.string().max(100).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  badge: z.string().max(50).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  send_email: z.boolean().default(false),
  send_push: z.boolean().default(false),
  send_sms: z.boolean().default(false),
  group_key: z.string().max(100).optional().nullable(),
  expires_at: dateSchema.optional().nullable(),
  requires_action: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
  data: z.record(z.unknown()).optional()
})

const updateNotificationSchema = createNotificationSchema.partial()

// ============================================
// TYPE DEFINITIONS
// ============================================

interface NotificationData {
  id: string
  user_id: string
  title: string
  message: string
  notification_type: string
  priority: string
  action_url?: string | null
  action_label?: string | null
  action_type?: string | null
  related_entity_type?: string | null
  related_entity_id?: string | null
  icon?: string | null
  color?: string | null
  badge?: string | null
  image_url?: string | null
  send_email: boolean
  send_push: boolean
  send_sms: boolean
  group_key?: string | null
  expires_at?: string | null
  requires_action: boolean
  is_read: boolean
  read_at?: string | null
  is_dismissed: boolean
  dismissed_at?: string | null
  status: string
  metadata?: Record<string, unknown>
  data?: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

interface NotificationStats {
  total: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  byPriority: Record<string, number>
  unread: number
  read: number
  dismissed: number
}

type CreateNotificationInput = z.infer<typeof createNotificationSchema>
type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create a new notification
 */
export async function createNotification(
  data: CreateNotificationInput
): Promise<ActionResult<NotificationData>> {
  try {
    // Validate input
    const validation = createNotificationSchema.safeParse(data)
    if (!validation.success) {
      logger.warn('Notification creation validation failed', { errors: validation.error.errors })
      return actionValidationError(validation.error.errors)
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Notification creation attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        ...validation.data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create notification', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Notification created successfully', {
      notificationId: notification.id,
      userId: user.id,
      type: notification.notification_type
    })

    revalidatePath('/dashboard/notifications-v2')
    return actionSuccess(notification as NotificationData, 'Notification created successfully')
  } catch (error) {
    logger.error('Unexpected error creating notification', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing notification
 */
export async function updateNotification(
  id: string,
  data: UpdateNotificationInput
): Promise<ActionResult<NotificationData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid notification ID format', 'VALIDATION_ERROR')
    }

    // Validate input
    const validation = updateNotificationSchema.safeParse(data)
    if (!validation.success) {
      logger.warn('Notification update validation failed', { errors: validation.error.errors })
      return actionValidationError(validation.error.errors)
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Notification update attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .update(validation.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update notification', { error, userId: user.id, notificationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Notification updated successfully', {
      notificationId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/notifications-v2')
    return actionSuccess(notification as NotificationData, 'Notification updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating notification', { error, notificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a notification (soft delete)
 */
export async function deleteNotification(id: string): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid notification ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Notification deletion attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Soft delete notification
    const { error } = await supabase
      .from('notifications')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'deleted'
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete notification', { error, userId: user.id, notificationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Notification deleted successfully', {
      notificationId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/notifications-v2')
    return actionSuccess({ deleted: true }, 'Notification deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting notification', { error, notificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(id: string): Promise<ActionResult<NotificationData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid notification ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Mark notification as read attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Mark as read
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

    if (error) {
      logger.error('Failed to mark notification as read', { error, userId: user.id, notificationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Notification marked as read', {
      notificationId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/notifications-v2')
    return actionSuccess(notification as NotificationData, 'Notification marked as read')
  } catch (error) {
    logger.error('Unexpected error marking notification as read', { error, notificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<ActionResult<{ updated: number }>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Mark all notifications as read attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Mark all as read
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        status: 'read'
      })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select()

    if (error) {
      logger.error('Failed to mark all notifications as read', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const updatedCount = data?.length || 0

    logger.info('All notifications marked as read', {
      userId: user.id,
      count: updatedCount
    })

    revalidatePath('/dashboard/notifications-v2')
    return actionSuccess({ updated: updatedCount }, `${updatedCount} notifications marked as read`)
  } catch (error) {
    logger.error('Unexpected error marking all notifications as read', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Dismiss a notification
 */
export async function dismissNotification(id: string): Promise<ActionResult<NotificationData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid notification ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Dismiss notification attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Dismiss notification
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

    if (error) {
      logger.error('Failed to dismiss notification', { error, userId: user.id, notificationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Notification dismissed', {
      notificationId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/notifications-v2')
    return actionSuccess(notification as NotificationData, 'Notification dismissed')
  } catch (error) {
    logger.error('Unexpected error dismissing notification', { error, notificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Archive a notification
 */
export async function archiveNotification(id: string): Promise<ActionResult<NotificationData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid notification ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Archive notification attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Archive notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive notification', { error, userId: user.id, notificationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Notification archived', {
      notificationId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/notifications-v2')
    return actionSuccess(notification as NotificationData, 'Notification archived')
  } catch (error) {
    logger.error('Unexpected error archiving notification', { error, notificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Clear old notifications
 */
export async function clearOldNotifications(daysOld: number = 30): Promise<ActionResult<{ deleted: number }>> {
  try {
    // Validate days
    if (daysOld < 1 || daysOld > 365) {
      return actionError('Days must be between 1 and 365', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Clear old notifications attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // Delete old read notifications
    const { data, error } = await supabase
      .from('notifications')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'deleted'
      })
      .eq('user_id', user.id)
      .eq('is_read', true)
      .lt('created_at', cutoffDate.toISOString())
      .select()

    if (error) {
      logger.error('Failed to clear old notifications', { error, userId: user.id, daysOld })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const deletedCount = data?.length || 0

    logger.info('Old notifications cleared', {
      userId: user.id,
      daysOld,
      count: deletedCount
    })

    revalidatePath('/dashboard/notifications-v2')
    return actionSuccess({ deleted: deletedCount }, `${deletedCount} old notifications cleared`)
  } catch (error) {
    logger.error('Unexpected error clearing old notifications', { error, daysOld })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<ActionResult<NotificationStats>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Get notification stats attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Fetch all notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('status, notification_type, priority, is_read')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch notification stats', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Calculate stats
    const stats: NotificationStats = {
      total: notifications?.length || 0,
      byStatus: {},
      byType: {},
      byPriority: {},
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

    logger.info('Notification stats retrieved', {
      userId: user.id,
      total: stats.total,
      unread: stats.unread
    })

    return actionSuccess(stats)
  } catch (error) {
    logger.error('Unexpected error getting notification stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
