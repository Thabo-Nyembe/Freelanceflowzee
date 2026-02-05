/**
 * Notifications Center API Routes
 *
 * REST endpoints for Notifications Center:
 * GET - Groups, snoozed notifications, bulk actions, saved filters, stats
 * POST - Create groups, snooze notifications, bulk actions, saved filters, reactions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('notifications-center')
import {
  getUserNotificationGroups,
  createNotificationGroup,
  getGroupsWithUnread,
  getSnoozedNotifications,
  snoozeNotification,
  getExpiredSnoozedNotifications,
  getUserBulkActions,
  createBulkAction,
  getUndoableBulkActions,
  getSavedFilters,
  createSavedFilter,
  getDefaultFilter,
  getFavoriteFilters,
  getNotificationReactions,
  addNotificationReaction,
  getNotificationCenterStats,
  getNotificationActivity
} from '@/lib/notifications-center-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'stats'
    const groupType = searchParams.get('group_type') as string | null
    const notificationId = searchParams.get('notification_id')
    const includeReactivated = searchParams.get('include_reactivated') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30

    switch (type) {
      case 'groups': {
        const result = await getUserNotificationGroups(user.id, groupType)
        return NextResponse.json({ data: result.data })
      }

      case 'groups-with-unread': {
        const result = await getGroupsWithUnread(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'snoozed': {
        const result = await getSnoozedNotifications(user.id, includeReactivated)
        return NextResponse.json({ data: result.data })
      }

      case 'expired-snoozed': {
        const result = await getExpiredSnoozedNotifications()
        return NextResponse.json({ data: result.data })
      }

      case 'bulk-actions': {
        const result = await getUserBulkActions(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'undoable-actions': {
        const result = await getUndoableBulkActions(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'saved-filters': {
        const result = await getSavedFilters(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'default-filter': {
        const result = await getDefaultFilter(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'favorite-filters': {
        const result = await getFavoriteFilters(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'reactions': {
        if (!notificationId) {
          return NextResponse.json({ error: 'notification_id required' }, { status: 400 })
        }
        const result = await getNotificationReactions(notificationId)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getNotificationCenterStats(user.id)
        return NextResponse.json({ data: result })
      }

      case 'activity': {
        const result = await getNotificationActivity(user.id, days)
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Notifications Center API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Notifications Center data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-group': {
        const result = await createNotificationGroup(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'snooze': {
        const result = await snoozeNotification(
          user.id,
          payload.notification_id,
          payload.duration,
          payload.custom_minutes,
          payload.reason
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'bulk-action': {
        const result = await createBulkAction(
          user.id,
          payload.action_type,
          payload.notification_ids,
          payload.description,
          payload.filters_applied
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-filter': {
        const result = await createSavedFilter(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'add-reaction': {
        const result = await addNotificationReaction(
          user.id,
          payload.notification_id,
          payload.reaction_type,
          payload.emoji,
          payload.feedback
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Notifications Center API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Notifications Center request' },
      { status: 500 }
    )
  }
}
