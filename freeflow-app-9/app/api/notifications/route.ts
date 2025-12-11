/**
 * KAZI Notifications API
 *
 * Comprehensive API for managing user notifications,
 * preferences, and real-time updates.
 *
 * Features:
 * - Multi-channel delivery (in-app, email, push, SMS)
 * - User preferences management
 * - Bulk operations
 * - Notification templates
 * - Real-time broadcasting
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notificationService } from '@/lib/realtime/notification-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-Notifications')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // If not authenticated, return mock data for development
    if (authError || !user) {
      return getMockNotificationsResponse(request)
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'

    switch (action) {
      case 'list': {
        const category = searchParams.get('category') as any
        const type = searchParams.get('type') as any
        const isRead = searchParams.get('isRead')
        const filter = searchParams.get('filter')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        const { notifications, total, unreadCount } = await notificationService.getNotifications(
          user.id,
          {
            category,
            type,
            isRead: isRead !== null ? isRead === 'true' :
                    filter === 'unread' ? false :
                    filter === 'read' ? true : undefined,
            limit,
            offset
          }
        )

        return NextResponse.json({
          success: true,
          notifications,
          total,
          unreadCount,
          limit,
          offset
        })
      }

      case 'get': {
        const notificationId = searchParams.get('notificationId')

        if (!notificationId) {
          return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
        }

        const { data: notification, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('id', notificationId)
          .eq('user_id', user.id)
          .single()

        if (error || !notification) {
          return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, notification })
      }

      case 'unread_count': {
        const { data } = await supabase
          .rpc('get_unread_notification_count', { p_user_id: user.id })

        return NextResponse.json({ success: true, unreadCount: data || 0 })
      }

      case 'preferences': {
        const preferences = await notificationService.getPreferences(user.id)

        return NextResponse.json({ success: true, preferences: preferences || getDefaultPreferences() })
      }

      case 'statistics': {
        const days = parseInt(searchParams.get('days') || '30')

        const stats = await notificationService.getStatistics(user.id, days)

        return NextResponse.json({ success: true, statistics: stats })
      }

      case 'templates': {
        const { data: templates, error } = await supabase
          .from('notification_templates')
          .select('*')
          .or(`user_id.is.null,user_id.eq.${user.id}`)
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (error) throw error

        return NextResponse.json({ success: true, templates })
      }

      case 'push_subscriptions': {
        const { data: subscriptions, error } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ success: true, subscriptions })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Notifications API GET error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const body = await request.json()
    const { action, data } = body

    // If not authenticated, handle with mock responses for backward compatibility
    if (authError || !user) {
      return handleMockAction(action, data)
    }

    switch (action) {
      case 'send': {
        const targetUserId = data?.userId || user.id

        const notification = await notificationService.send({
          userId: targetUserId,
          title: data.title,
          message: data.message,
          type: data.type,
          category: data.category,
          channels: data.channels,
          priority: data.priority,
          data: data.data,
          actionUrl: data.actionUrl,
          actionLabel: data.actionLabel,
          expiresAt: data.expiresAt,
          groupId: data.groupId,
          tags: data.tags
        })

        return NextResponse.json({ success: true, notification }, { status: 201 })
      }

      case 'send_bulk':
      case 'send-bulk': {
        const notifications = await notificationService.sendBulk(
          data.userIds,
          {
            title: data.title,
            message: data.message,
            type: data.type,
            category: data.category,
            channels: data.channels,
            priority: data.priority,
            data: data.data
          }
        )

        return NextResponse.json({
          success: true,
          notifications,
          count: notifications.length
        }, { status: 201 })
      }

      case 'mark-read':
      case 'mark_read': {
        const notificationId = data?.notificationId

        if (!notificationId) {
          return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
        }

        await notificationService.markAsRead(user.id, notificationId)

        return NextResponse.json({
          success: true,
          action: 'mark-read',
          notificationId,
          read: true,
          message: 'Notification marked as read'
        })
      }

      case 'mark-all-read':
      case 'mark_all_read': {
        const count = await notificationService.markAllAsRead(user.id, data?.category)

        return NextResponse.json({
          success: true,
          action: 'mark-all-read',
          count,
          message: `${count} notifications marked as read`,
          achievement: count >= 20 ? {
            message: 'Inbox Zero Hero! All caught up!',
            badge: 'Organized',
            points: 10,
          } : undefined
        })
      }

      case 'archive': {
        const notificationIds = data?.notificationIds || [data?.notificationId]
        let count = 0

        for (const id of notificationIds) {
          try {
            await supabase
              .from('notifications')
              .update({ data: { ...data?.data, archived: true } })
              .eq('id', id)
              .eq('user_id', user.id)
            count++
          } catch {}
        }

        return NextResponse.json({
          success: true,
          action: 'archive',
          count,
          message: `${count} notification(s) archived`,
          undoAvailable: true,
          undoExpires: '30 seconds',
        })
      }

      case 'delete': {
        const notificationIds = data?.notificationIds || [data?.notificationId]
        let count = 0

        for (const id of notificationIds) {
          try {
            await notificationService.delete(user.id, id)
            count++
          } catch {}
        }

        return NextResponse.json({
          success: true,
          action: 'delete',
          count,
          permanent: data?.permanent || false,
          message: `${count} notification(s) deleted`,
          undoAvailable: !data?.permanent,
          undoExpires: !data?.permanent ? '30 seconds' : undefined,
        })
      }

      case 'delete_all':
      case 'delete-all': {
        const count = await notificationService.deleteAll(user.id, data?.category)

        return NextResponse.json({
          success: true,
          action: 'delete-all',
          count,
          message: `${count} notifications deleted`
        })
      }

      case 'bulk-action': {
        const notificationIds = data?.notificationIds || []
        const bulkAction = data?.bulkAction
        let count = 0

        switch (bulkAction) {
          case 'read':
            for (const id of notificationIds) {
              try {
                await notificationService.markAsRead(user.id, id)
                count++
              } catch {}
            }
            break
          case 'unread':
            for (const id of notificationIds) {
              await supabase
                .from('notifications')
                .update({ is_read: false, read_at: null })
                .eq('id', id)
                .eq('user_id', user.id)
              count++
            }
            break
          case 'delete':
            for (const id of notificationIds) {
              try {
                await notificationService.delete(user.id, id)
                count++
              } catch {}
            }
            break
        }

        return NextResponse.json({
          success: true,
          action: 'bulk-action',
          bulkAction,
          count,
          message: `${count} notifications ${bulkAction}`,
          achievement: count >= 10 ? {
            message: 'Bulk Action Master! Efficiency at its finest!',
            badge: 'Productivity Pro',
            points: 15,
          } : undefined,
        })
      }

      case 'update-preferences':
      case 'update_preferences': {
        const preferences = await notificationService.updatePreferences(user.id, {
          channel_preferences: data?.channelPreferences,
          quiet_hours: data?.quietHours,
          email_digest: data?.emailDigest,
          disabled_categories: data?.disabledCategories || data?.categories,
          push_enabled: data?.pushNotifications ?? data?.pushEnabled
        })

        return NextResponse.json({
          success: true,
          action: 'update-preferences',
          preferences,
          message: 'Notification preferences updated',
          nextSteps: [
            'Changes take effect immediately',
            'You can always update preferences later',
          ],
        })
      }

      case 'register_push': {
        const { endpoint, p256dhKey, authKey, deviceName, deviceType, browser, os } = data

        if (!endpoint || !p256dhKey || !authKey) {
          return NextResponse.json({ error: 'Push subscription data required' }, { status: 400 })
        }

        const { data: subscription, error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            endpoint,
            p256dh_key: p256dhKey,
            auth_key: authKey,
            device_name: deviceName,
            device_type: deviceType || 'web',
            browser,
            os,
            is_active: true,
            last_used_at: new Date().toISOString()
          }, { onConflict: 'user_id,endpoint' })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ success: true, subscription }, { status: 201 })
      }

      case 'test_push': {
        await notificationService.send({
          userId: user.id,
          title: 'Test Notification',
          message: 'This is a test push notification from KAZI.',
          type: 'info',
          category: 'system',
          channels: ['push'],
          priority: 'normal'
        })

        return NextResponse.json({ success: true, sent: true })
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Notifications API POST error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get default notification preferences
 */
function getDefaultPreferences() {
  return {
    channel_preferences: {
      general: ['in_app'],
      project: ['in_app', 'email'],
      task: ['in_app', 'email'],
      invoice: ['in_app', 'email'],
      payment: ['in_app', 'email', 'push'],
      client: ['in_app'],
      team: ['in_app'],
      file: ['in_app'],
      message: ['in_app', 'push'],
      workflow: ['in_app'],
      security: ['in_app', 'email', 'push'],
      system: ['in_app', 'email']
    },
    quiet_hours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
      timezone: 'UTC'
    },
    email_digest: {
      enabled: false,
      frequency: 'daily'
    },
    disabled_categories: [],
    push_enabled: true
  }
}

/**
 * Handle mock actions for unauthenticated users (backward compatibility)
 */
function handleMockAction(action: string, data: any): NextResponse {
  switch (action) {
    case 'mark-read':
      return NextResponse.json({
        success: true,
        action: 'mark-read',
        notificationId: data?.notificationId,
        read: true,
        message: 'Notification marked as read',
      })

    case 'mark-all-read':
      const readCount = Math.floor(Math.random() * 20) + 5
      return NextResponse.json({
        success: true,
        action: 'mark-all-read',
        count: readCount,
        message: `${readCount} notifications marked as read`,
        achievement: readCount >= 20 ? {
          message: 'Inbox Zero Hero! All caught up!',
          badge: 'Organized',
          points: 10,
        } : undefined,
      })

    case 'archive':
      const archiveCount = data?.notificationIds?.length || 1
      return NextResponse.json({
        success: true,
        action: 'archive',
        count: archiveCount,
        message: `${archiveCount} notification(s) archived`,
        undoAvailable: true,
        undoExpires: '30 seconds',
      })

    case 'delete':
      const deleteCount = data?.notificationIds?.length || 1
      return NextResponse.json({
        success: true,
        action: 'delete',
        count: deleteCount,
        permanent: data?.permanent || false,
        message: `${deleteCount} notification(s) deleted`,
        undoAvailable: !data?.permanent,
        undoExpires: !data?.permanent ? '30 seconds' : undefined,
      })

    case 'bulk-action':
      const bulkCount = data?.notificationIds?.length || 0
      return NextResponse.json({
        success: true,
        action: 'bulk-action',
        bulkAction: data?.bulkAction,
        count: bulkCount,
        message: `${bulkCount} notifications ${data?.bulkAction}`,
        achievement: bulkCount >= 10 ? {
          message: 'Bulk Action Master! Efficiency at its finest!',
          badge: 'Productivity Pro',
          points: 15,
        } : undefined,
      })

    case 'update-preferences':
      return NextResponse.json({
        success: true,
        action: 'update-preferences',
        preferences: data,
        message: 'Notification preferences updated',
        nextSteps: [
          'Changes take effect immediately',
          'You can always update preferences later',
        ],
      })

    default:
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
  }
}

/**
 * Get mock notifications response for unauthenticated users
 */
function getMockNotificationsResponse(request: NextRequest): NextResponse {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter') || 'all'
  const type = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '50')

  let notifications = getMockNotifications()

  if (filter === 'unread') {
    notifications = notifications.filter(n => !n.read)
  } else if (filter === 'read') {
    notifications = notifications.filter(n => n.read)
  } else if (filter === 'archived') {
    notifications = notifications.filter(n => n.archived)
  }

  if (type) {
    notifications = notifications.filter(n => n.type === type)
  }

  notifications = notifications.slice(0, limit)
  const unreadCount = notifications.filter(n => !n.read && !n.archived).length

  return NextResponse.json({
    success: true,
    notifications,
    unreadCount,
    total: notifications.length,
  })
}

interface MockNotification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  timestamp: Date
  category: string
  priority: string
  actionUrl?: string
  archived: boolean
}

/**
 * Get mock notifications data
 */
function getMockNotifications(): MockNotification[] {
  const now = new Date()

  return [
    {
      id: 'notif-1',
      title: 'New Project Assigned',
      message: 'You have been assigned to the "Mobile App Redesign" project',
      type: 'project',
      read: false,
      timestamp: new Date(now.getTime() - 300000),
      category: 'Projects',
      priority: 'high',
      actionUrl: '/dashboard/projects-hub',
      archived: false,
    },
    {
      id: 'notif-2',
      title: 'Payment Received',
      message: 'You received $2,500 from Acme Corp for Invoice #INV-2024-001',
      type: 'payment',
      read: false,
      timestamp: new Date(now.getTime() - 3600000),
      category: 'Payments',
      priority: 'medium',
      actionUrl: '/dashboard/financial',
      archived: false,
    },
    {
      id: 'notif-3',
      title: 'New Message',
      message: 'Sarah Johnson sent you a message: "Can we schedule a call?"',
      type: 'message',
      read: true,
      timestamp: new Date(now.getTime() - 7200000),
      category: 'Messages',
      priority: 'medium',
      actionUrl: '/dashboard/messages',
      archived: false,
    },
    {
      id: 'notif-4',
      title: 'Project Deadline Approaching',
      message: 'Website Redesign project is due in 2 days',
      type: 'warning',
      read: false,
      timestamp: new Date(now.getTime() - 14400000),
      category: 'Projects',
      priority: 'urgent',
      actionUrl: '/dashboard/projects-hub',
      archived: false,
    },
    {
      id: 'notif-5',
      title: 'Task Completed',
      message: 'Design mockups task has been marked as complete',
      type: 'success',
      read: true,
      timestamp: new Date(now.getTime() - 86400000),
      category: 'Tasks',
      priority: 'low',
      actionUrl: '/dashboard/my-day',
      archived: false,
    },
    {
      id: 'notif-6',
      title: 'System Update',
      message: 'KAZI platform has been updated to v2.5 with new features',
      type: 'system',
      read: false,
      timestamp: new Date(now.getTime() - 172800000),
      category: 'System',
      priority: 'low',
      archived: false,
    },
    {
      id: 'notif-7',
      title: 'New Booking Request',
      message: 'Client requested a consultation call for next Tuesday',
      type: 'info',
      read: false,
      timestamp: new Date(now.getTime() - 259200000),
      category: 'Bookings',
      priority: 'high',
      actionUrl: '/dashboard/bookings',
      archived: false,
    },
    {
      id: 'notif-8',
      title: 'File Shared',
      message: 'John Doe shared "Project Brief.pdf" with you',
      type: 'info',
      read: true,
      timestamp: new Date(now.getTime() - 345600000),
      category: 'Files',
      priority: 'low',
      actionUrl: '/dashboard/files-hub',
      archived: false,
    },
  ]
}
