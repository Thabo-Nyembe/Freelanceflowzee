/**
 * Notifications Center Database Queries
 * Notification grouping, snoozing, bulk operations, saved filters
 */

import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

// ============================================================================
// TYPES
// ============================================================================

export type SnoozeDuration = '1_hour' | '3_hours' | '1_day' | '3_days' | '1_week' | 'custom'
export type BulkActionType = 'mark_read' | 'mark_unread' | 'archive' | 'delete' | 'snooze' | 'categorize'
export type NotificationGroupType = 'by_type' | 'by_category' | 'by_sender' | 'by_project' | 'by_date'

export interface NotificationGroup {
  id: string
  user_id: string
  group_type: NotificationGroupType
  group_key: string
  group_name: string
  description?: string
  total_notifications: number
  unread_count: number
  is_collapsed: boolean
  sort_order: number
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface SnoozedNotification {
  id: string
  user_id: string
  notification_id: string
  snooze_duration: SnoozeDuration
  snoozed_at: string
  snooze_until: string
  custom_duration_minutes?: number
  reactivated: boolean
  reactivated_at?: string
  snooze_reason?: string
  created_at: string
}

export interface NotificationBulkAction {
  id: string
  user_id: string
  action_type: BulkActionType
  action_description: string
  notification_ids: string[]
  notifications_count: number
  filters_applied: Record<string, JsonValue>
  successful_count: number
  failed_count: number
  error_messages?: string[]
  is_undoable: boolean
  undone: boolean
  undone_at?: string
  executed_at: string
  created_at: string
}

export interface SavedNotificationFilter {
  id: string
  user_id: string
  filter_name: string
  description?: string
  filter_criteria: Record<string, JsonValue>
  usage_count: number
  last_used_at?: string
  is_default: boolean
  is_favorite: boolean
  notify_on_new_match: boolean
  created_at: string
  updated_at: string
}

export interface NotificationReaction {
  id: string
  user_id: string
  notification_id: string
  reaction_type: string
  emoji?: string
  feedback?: string
  created_at: string
}

// ============================================================================
// NOTIFICATION GROUPS
// ============================================================================

export async function getUserNotificationGroups(userId: string, groupType?: NotificationGroupType) {
  const supabase = createClient()
  let query = supabase
    .from('notification_groups')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')

  if (groupType) {
    query = query.eq('group_type', groupType)
  }

  return await query
}

export async function getNotificationGroup(userId: string, groupType: NotificationGroupType, groupKey: string) {
  const supabase = createClient()
  return await supabase
    .from('notification_groups')
    .select('*')
    .eq('user_id', userId)
    .eq('group_type', groupType)
    .eq('group_key', groupKey)
    .single()
}

export async function createNotificationGroup(userId: string, groupData: Partial<NotificationGroup>) {
  const supabase = createClient()
  return await supabase
    .from('notification_groups')
    .insert({
      user_id: userId,
      ...groupData
    })
    .select()
    .single()
}

export async function updateNotificationGroup(groupId: string, updates: Partial<NotificationGroup>) {
  const supabase = createClient()
  return await supabase
    .from('notification_groups')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single()
}

export async function toggleGroupCollapse(groupId: string, collapsed: boolean) {
  const supabase = createClient()
  return await supabase
    .from('notification_groups')
    .update({ is_collapsed: collapsed })
    .eq('id', groupId)
    .select()
    .single()
}

export async function updateGroupSortOrder(groupId: string, sortOrder: number) {
  const supabase = createClient()
  return await supabase
    .from('notification_groups')
    .update({ sort_order: sortOrder })
    .eq('id', groupId)
    .select()
    .single()
}

export async function deleteNotificationGroup(groupId: string) {
  const supabase = createClient()
  return await supabase
    .from('notification_groups')
    .delete()
    .eq('id', groupId)
}

export async function getGroupsWithUnread(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('notification_groups')
    .select('*')
    .eq('user_id', userId)
    .gt('unread_count', 0)
    .order('unread_count', { ascending: false })
}

// ============================================================================
// SNOOZED NOTIFICATIONS
// ============================================================================

export async function getSnoozedNotifications(userId: string, includeReactivated: boolean = false) {
  const supabase = createClient()
  let query = supabase
    .from('snoozed_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('snooze_until')

  if (!includeReactivated) {
    query = query.eq('reactivated', false)
  }

  return await query
}

export async function snoozeNotification(
  userId: string,
  notificationId: string,
  duration: SnoozeDuration,
  customMinutes?: number,
  reason?: string
) {
  const supabase = createClient()

  // Calculate snooze_until based on duration
  const now = new Date()
  let snoozeUntil: Date

  switch (duration) {
    case '1_hour':
      snoozeUntil = new Date(now.getTime() + 60 * 60 * 1000)
      break
    case '3_hours':
      snoozeUntil = new Date(now.getTime() + 3 * 60 * 60 * 1000)
      break
    case '1_day':
      snoozeUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      break
    case '3_days':
      snoozeUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      break
    case '1_week':
      snoozeUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      break
    case 'custom':
      if (!customMinutes) throw new Error('Custom duration requires customMinutes parameter')
      snoozeUntil = new Date(now.getTime() + customMinutes * 60 * 1000)
      break
    default:
      throw new Error(`Invalid snooze duration: ${duration}`)
  }

  return await supabase
    .from('snoozed_notifications')
    .insert({
      user_id: userId,
      notification_id: notificationId,
      snooze_duration: duration,
      snooze_until: snoozeUntil.toISOString(),
      custom_duration_minutes: customMinutes,
      snooze_reason: reason
    })
    .select()
    .single()
}

export async function unsnoozeNotification(snoozedId: string) {
  const supabase = createClient()
  return await supabase
    .from('snoozed_notifications')
    .update({
      reactivated: true,
      reactivated_at: new Date().toISOString()
    })
    .eq('id', snoozedId)
    .select()
    .single()
}

export async function getSnoozedNotification(notificationId: string) {
  const supabase = createClient()
  return await supabase
    .from('snoozed_notifications')
    .select('*')
    .eq('notification_id', notificationId)
    .eq('reactivated', false)
    .single()
}

export async function getExpiredSnoozedNotifications() {
  const supabase = createClient()
  return await supabase
    .from('snoozed_notifications')
    .select('*')
    .lte('snooze_until', new Date().toISOString())
    .eq('reactivated', false)
}

export async function deleteSnoozedNotification(snoozedId: string) {
  const supabase = createClient()
  return await supabase
    .from('snoozed_notifications')
    .delete()
    .eq('id', snoozedId)
}

// ============================================================================
// BULK ACTIONS
// ============================================================================

export async function createBulkAction(
  userId: string,
  actionType: BulkActionType,
  notificationIds: string[],
  actionDescription: string,
  filtersApplied?: Record<string, JsonValue>
) {
  const supabase = createClient()
  return await supabase
    .from('notification_bulk_actions')
    .insert({
      user_id: userId,
      action_type: actionType,
      action_description: actionDescription,
      notification_ids: notificationIds,
      notifications_count: notificationIds.length,
      filters_applied: filtersApplied || {}
    })
    .select()
    .single()
}

export async function getUserBulkActions(userId: string, limit: number = 50) {
  const supabase = createClient()
  return await supabase
    .from('notification_bulk_actions')
    .select('*')
    .eq('user_id', userId)
    .order('executed_at', { ascending: false })
    .limit(limit)
}

export async function getBulkActionById(actionId: string) {
  const supabase = createClient()
  return await supabase
    .from('notification_bulk_actions')
    .select('*')
    .eq('id', actionId)
    .single()
}

export async function undoBulkAction(actionId: string) {
  const supabase = createClient()
  return await supabase
    .from('notification_bulk_actions')
    .update({
      undone: true,
      undone_at: new Date().toISOString()
    })
    .eq('id', actionId)
    .eq('is_undoable', true)
    .select()
    .single()
}

export async function updateBulkActionResults(
  actionId: string,
  successfulCount: number,
  failedCount: number,
  errorMessages?: string[]
) {
  const supabase = createClient()
  return await supabase
    .from('notification_bulk_actions')
    .update({
      successful_count: successfulCount,
      failed_count: failedCount,
      error_messages: errorMessages
    })
    .eq('id', actionId)
    .select()
    .single()
}

export async function getUndoableBulkActions(userId: string, limit: number = 10) {
  const supabase = createClient()
  return await supabase
    .from('notification_bulk_actions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_undoable', true)
    .eq('undone', false)
    .order('executed_at', { ascending: false })
    .limit(limit)
}

// ============================================================================
// SAVED FILTERS
// ============================================================================

export async function getSavedFilters(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('saved_notification_filters')
    .select('*')
    .eq('user_id', userId)
    .order('is_favorite', { ascending: false })
    .order('usage_count', { ascending: false })
}

export async function getDefaultFilter(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('saved_notification_filters')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single()
}

export async function getFavoriteFilters(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('saved_notification_filters')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('usage_count', { ascending: false })
}

export async function createSavedFilter(userId: string, filterData: Partial<SavedNotificationFilter>) {
  const supabase = createClient()
  return await supabase
    .from('saved_notification_filters')
    .insert({
      user_id: userId,
      ...filterData
    })
    .select()
    .single()
}

export async function updateSavedFilter(filterId: string, updates: Partial<SavedNotificationFilter>) {
  const supabase = createClient()
  return await supabase
    .from('saved_notification_filters')
    .update(updates)
    .eq('id', filterId)
    .select()
    .single()
}

export async function deleteSavedFilter(filterId: string) {
  const supabase = createClient()
  return await supabase
    .from('saved_notification_filters')
    .delete()
    .eq('id', filterId)
}

export async function setDefaultFilter(filterId: string, userId: string) {
  const supabase = createClient()
  return await supabase
    .from('saved_notification_filters')
    .update({ is_default: true })
    .eq('id', filterId)
    .eq('user_id', userId)
    .select()
    .single()
}

export async function toggleFilterFavorite(filterId: string, isFavorite: boolean) {
  const supabase = createClient()
  return await supabase
    .from('saved_notification_filters')
    .update({ is_favorite: isFavorite })
    .eq('id', filterId)
    .select()
    .single()
}

export async function incrementFilterUsage(filterId: string) {
  const supabase = createClient()

  const { data: filter } = await supabase
    .from('saved_notification_filters')
    .select('usage_count')
    .eq('id', filterId)
    .single()

  if (!filter) {
    return { data: null, error: new Error('Filter not found') }
  }

  return await supabase
    .from('saved_notification_filters')
    .update({
      usage_count: filter.usage_count + 1,
      last_used_at: new Date().toISOString()
    })
    .eq('id', filterId)
    .select()
    .single()
}

// ============================================================================
// NOTIFICATION REACTIONS
// ============================================================================

export async function getNotificationReactions(notificationId: string) {
  const supabase = createClient()
  return await supabase
    .from('notification_reactions')
    .select('*')
    .eq('notification_id', notificationId)
}

export async function getUserReactionForNotification(userId: string, notificationId: string) {
  const supabase = createClient()
  return await supabase
    .from('notification_reactions')
    .select('*')
    .eq('user_id', userId)
    .eq('notification_id', notificationId)
}

export async function addNotificationReaction(
  userId: string,
  notificationId: string,
  reactionType: string,
  emoji?: string,
  feedback?: string
) {
  const supabase = createClient()
  return await supabase
    .from('notification_reactions')
    .insert({
      user_id: userId,
      notification_id: notificationId,
      reaction_type: reactionType,
      emoji,
      feedback
    })
    .select()
    .single()
}

export async function removeNotificationReaction(reactionId: string) {
  const supabase = createClient()
  return await supabase
    .from('notification_reactions')
    .delete()
    .eq('id', reactionId)
}

export async function getReactionStats(notificationId: string) {
  const supabase = createClient()
  const { data: reactions } = await getNotificationReactions(notificationId)

  if (!reactions) {
    return {
      total: 0,
      byType: {}
    }
  }

  const byType = reactions.reduce((acc, reaction) => {
    acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total: reactions.length,
    byType
  }
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getNotificationCenterStats(userId: string) {
  const supabase = createClient()

  const [
    groupsResult,
    snoozedResult,
    bulkActionsResult,
    filtersResult,
    reactionsResult
  ] = await Promise.all([
    getUserNotificationGroups(userId),
    getSnoozedNotifications(userId),
    getUserBulkActions(userId, 100),
    getSavedFilters(userId),
    supabase.from('notification_reactions').select('*').eq('user_id', userId)
  ])

  const groups = groupsResult.data || []
  const snoozed = snoozedResult.data || []
  const bulkActions = bulkActionsResult.data || []
  const filters = filtersResult.data || []
  const reactions = reactionsResult.data || []

  const totalUnread = groups.reduce((sum, group) => sum + group.unread_count, 0)
  const totalNotifications = groups.reduce((sum, group) => sum + group.total_notifications, 0)

  const activeSnoozed = snoozed.filter(s => !s.reactivated).length
  const expiringSoon = snoozed.filter(s => {
    const timeUntilExpiry = new Date(s.snooze_until).getTime() - Date.now()
    return timeUntilExpiry > 0 && timeUntilExpiry <= 24 * 60 * 60 * 1000 // 24 hours
  }).length

  const recentBulkActions = bulkActions.slice(0, 10)
  const undoableActions = bulkActions.filter(a => a.is_undoable && !a.undone).length

  return {
    groups: {
      total: groups.length,
      totalNotifications,
      totalUnread,
      byType: groups.reduce((acc, group) => {
        acc[group.group_type] = (acc[group.group_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    },
    snoozed: {
      total: snoozed.length,
      active: activeSnoozed,
      expiringSoon
    },
    bulkActions: {
      total: bulkActions.length,
      recent: recentBulkActions,
      undoable: undoableActions
    },
    filters: {
      total: filters.length,
      favorites: filters.filter(f => f.is_favorite).length,
      default: filters.find(f => f.is_default)
    },
    reactions: {
      total: reactions.length,
      byType: reactions.reduce((acc, reaction) => {
        acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }
}

export async function getNotificationActivity(userId: string, days: number = 30) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [bulkActionsResult, reactionsResult] = await Promise.all([
    supabase
      .from('notification_bulk_actions')
      .select('*')
      .eq('user_id', userId)
      .gte('executed_at', startDate.toISOString()),
    supabase
      .from('notification_reactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
  ])

  const bulkActions = bulkActionsResult.data || []
  const reactions = reactionsResult.data || []

  return {
    period: `Last ${days} days`,
    bulkActions: bulkActions.length,
    reactions: reactions.length,
    activityByDay: {} // Could group by day for charts
  }
}
