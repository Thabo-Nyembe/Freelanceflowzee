/**
 * Browser Extension Database Queries
 * Extension installations, page captures, quick actions, sync tracking
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'brave' | 'opera'
export type CaptureType = 'screenshot' | 'full_page' | 'selection' | 'video' | 'text' | 'article' | 'pdf'
export type ActionType = 'task' | 'link' | 'share' | 'translate' | 'summarize' | 'analyze' | 'bookmark' | 'note'
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict'
export type ExtensionStatus = 'active' | 'inactive' | 'needs_update' | 'error'

export interface BrowserExtensionInstallation {
  id: string
  user_id: string
  browser: BrowserType
  browser_version: string
  extension_version: string
  status: ExtensionStatus
  installed_at: string
  last_active_at?: string
  last_sync_at?: string
  device_id?: string
  os?: string
  os_version?: string
  settings: Record<string, any>
  enabled_features: string[]
  total_captures: number
  total_actions: number
  storage_used: number
  created_at: string
  updated_at: string
}

export interface ExtensionPageCapture {
  id: string
  user_id: string
  installation_id?: string
  capture_type: CaptureType
  title: string
  url: string
  thumbnail_url?: string
  content_url?: string
  content_text?: string
  file_size: number
  viewport_width?: number
  viewport_height?: number
  scroll_position?: number
  tags: string[]
  notes?: string
  browser: BrowserType
  page_title?: string
  page_meta: Record<string, any>
  sync_status: SyncStatus
  synced_at?: string
  is_favorite: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface ExtensionQuickAction {
  id: string
  user_id: string
  installation_id?: string
  action_type: ActionType
  action_name: string
  description?: string
  shortcut_key?: string
  is_enabled: boolean
  target_url?: string
  action_data: Record<string, any>
  result_data: Record<string, any>
  usage_count: number
  last_used_at?: string
  average_duration_ms?: number
  last_status?: string
  last_error?: string
  created_at: string
  updated_at: string
}

export interface ExtensionSyncQueue {
  id: string
  user_id: string
  installation_id: string
  sync_type: string
  resource_id?: string
  resource_type?: string
  sync_data: Record<string, any>
  sync_direction: string
  sync_status: SyncStatus
  priority: number
  attempted_at?: string
  completed_at?: string
  failed_at?: string
  retry_count: number
  max_retries: number
  error_message?: string
  error_code?: string
  created_at: string
  updated_at: string
}

export interface ExtensionUsageAnalytics {
  id: string
  user_id: string
  installation_id?: string
  period_start: string
  period_end: string
  total_captures: number
  captures_by_type: Record<string, number>
  total_actions: number
  actions_by_type: Record<string, number>
  most_active_hour?: number
  most_active_day?: string
  average_session_duration_minutes?: number
  average_capture_time_ms?: number
  average_sync_time_ms?: number
  features_used: string[]
  most_used_feature?: string
  created_at: string
}

// ============================================================================
// INSTALLATIONS
// ============================================================================

export async function getUserInstallations(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('browser_extension_installations')
    .select('*')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false })
}

export async function getInstallationById(installationId: string) {
  const supabase = createClient()
  return await supabase
    .from('browser_extension_installations')
    .select('*')
    .eq('id', installationId)
    .single()
}

export async function createInstallation(userId: string, installationData: Partial<BrowserExtensionInstallation>) {
  const supabase = createClient()
  return await supabase
    .from('browser_extension_installations')
    .insert({
      user_id: userId,
      ...installationData
    })
    .select()
    .single()
}

export async function updateInstallation(installationId: string, updates: Partial<BrowserExtensionInstallation>) {
  const supabase = createClient()
  return await supabase
    .from('browser_extension_installations')
    .update(updates)
    .eq('id', installationId)
    .select()
    .single()
}

export async function deleteInstallation(installationId: string) {
  const supabase = createClient()
  return await supabase
    .from('browser_extension_installations')
    .delete()
    .eq('id', installationId)
}

export async function getActiveInstallations(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('browser_extension_installations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('last_active_at', { ascending: false })
}

export async function updateInstallationActivity(installationId: string) {
  const supabase = createClient()
  return await supabase
    .from('browser_extension_installations')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', installationId)
    .select()
    .single()
}

export async function getInstallationByBrowser(userId: string, browser: BrowserType, deviceId?: string) {
  const supabase = createClient()
  let query = supabase
    .from('browser_extension_installations')
    .select('*')
    .eq('user_id', userId)
    .eq('browser', browser)

  if (deviceId) {
    query = query.eq('device_id', deviceId)
  }

  return await query.single()
}

// ============================================================================
// PAGE CAPTURES
// ============================================================================

export async function getUserCaptures(userId: string, limit: number = 100) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function getCaptureById(captureId: string) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .select('*')
    .eq('id', captureId)
    .single()
}

export async function createCapture(userId: string, captureData: Partial<ExtensionPageCapture>) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .insert({
      user_id: userId,
      ...captureData
    })
    .select()
    .single()
}

export async function updateCapture(captureId: string, updates: Partial<ExtensionPageCapture>) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .update(updates)
    .eq('id', captureId)
    .select()
    .single()
}

export async function deleteCapture(captureId: string) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .delete()
    .eq('id', captureId)
}

export async function getCapturesByType(userId: string, captureType: CaptureType, limit: number = 50) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .select('*')
    .eq('user_id', userId)
    .eq('capture_type', captureType)
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function getFavoriteCaptures(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false })
}

export async function toggleCaptureFavorite(captureId: string, isFavorite: boolean) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .update({ is_favorite: isFavorite })
    .eq('id', captureId)
    .select()
    .single()
}

export async function archiveCapture(captureId: string) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .update({ is_archived: true })
    .eq('id', captureId)
    .select()
    .single()
}

export async function searchCaptures(userId: string, searchTerm: string, limit: number = 50) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,url.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function getCapturesByTags(userId: string, tags: string[]) {
  const supabase = createClient()
  return await supabase
    .from('extension_page_captures')
    .select('*')
    .eq('user_id', userId)
    .contains('tags', tags)
    .order('created_at', { ascending: false })
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================

export async function getUserActions(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('extension_quick_actions')
    .select('*')
    .eq('user_id', userId)
    .order('usage_count', { ascending: false })
}

export async function getActionById(actionId: string) {
  const supabase = createClient()
  return await supabase
    .from('extension_quick_actions')
    .select('*')
    .eq('id', actionId)
    .single()
}

export async function createAction(userId: string, actionData: Partial<ExtensionQuickAction>) {
  const supabase = createClient()
  return await supabase
    .from('extension_quick_actions')
    .insert({
      user_id: userId,
      ...actionData
    })
    .select()
    .single()
}

export async function updateAction(actionId: string, updates: Partial<ExtensionQuickAction>) {
  const supabase = createClient()
  return await supabase
    .from('extension_quick_actions')
    .update(updates)
    .eq('id', actionId)
    .select()
    .single()
}

export async function deleteAction(actionId: string) {
  const supabase = createClient()
  return await supabase
    .from('extension_quick_actions')
    .delete()
    .eq('id', actionId)
}

export async function incrementActionUsage(actionId: string, durationMs?: number) {
  const supabase = createClient()

  const { data: action } = await getActionById(actionId)

  if (!action) {
    return { data: null, error: new Error('Action not found') }
  }

  const updates: Partial<ExtensionQuickAction> = {
    usage_count: action.usage_count + 1,
    last_used_at: new Date().toISOString()
  }

  if (durationMs !== undefined) {
    // Calculate new average duration
    const totalDuration = (action.average_duration_ms || 0) * action.usage_count + durationMs
    updates.average_duration_ms = Math.round(totalDuration / (action.usage_count + 1))
  }

  return await supabase
    .from('extension_quick_actions')
    .update(updates)
    .eq('id', actionId)
    .select()
    .single()
}

export async function toggleActionEnabled(actionId: string, isEnabled: boolean) {
  const supabase = createClient()
  return await supabase
    .from('extension_quick_actions')
    .update({ is_enabled: isEnabled })
    .eq('id', actionId)
    .select()
    .single()
}

export async function getEnabledActions(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('extension_quick_actions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_enabled', true)
    .order('usage_count', { ascending: false })
}

export async function getMostUsedActions(userId: string, limit: number = 10) {
  const supabase = createClient()
  return await supabase
    .from('extension_quick_actions')
    .select('*')
    .eq('user_id', userId)
    .order('usage_count', { ascending: false })
    .limit(limit)
}

// ============================================================================
// SYNC QUEUE
// ============================================================================

export async function addToSyncQueue(syncData: Partial<ExtensionSyncQueue>) {
  const supabase = createClient()
  return await supabase
    .from('extension_sync_queue')
    .insert(syncData)
    .select()
    .single()
}

export async function getPendingSyncItems(userId: string, limit: number = 100) {
  const supabase = createClient()
  return await supabase
    .from('extension_sync_queue')
    .select('*')
    .eq('user_id', userId)
    .eq('sync_status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at')
    .limit(limit)
}

export async function updateSyncStatus(syncId: string, status: SyncStatus, errorMessage?: string, errorCode?: string) {
  const supabase = createClient()

  const updates: Partial<ExtensionSyncQueue> = {
    sync_status: status
  }

  if (errorMessage) updates.error_message = errorMessage
  if (errorCode) updates.error_code = errorCode

  return await supabase
    .from('extension_sync_queue')
    .update(updates)
    .eq('id', syncId)
    .select()
    .single()
}

export async function getFailedSyncItems(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('extension_sync_queue')
    .select('*')
    .eq('user_id', userId)
    .eq('sync_status', 'failed')
    .lt('retry_count', supabase.rpc('max_retries'))
    .order('created_at')
}

export async function clearCompletedSyncs(userId: string, olderThanDays: number = 7) {
  const supabase = createClient()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  return await supabase
    .from('extension_sync_queue')
    .delete()
    .eq('user_id', userId)
    .eq('sync_status', 'synced')
    .lt('completed_at', cutoffDate.toISOString())
}

export async function getSyncQueueStats(userId: string) {
  const supabase = createClient()

  const { data: syncItems } = await supabase
    .from('extension_sync_queue')
    .select('*')
    .eq('user_id', userId)

  if (!syncItems) {
    return {
      total: 0,
      pending: 0,
      syncing: 0,
      synced: 0,
      failed: 0
    }
  }

  return {
    total: syncItems.length,
    pending: syncItems.filter(s => s.sync_status === 'pending').length,
    syncing: syncItems.filter(s => s.sync_status === 'syncing').length,
    synced: syncItems.filter(s => s.sync_status === 'synced').length,
    failed: syncItems.filter(s => s.sync_status === 'failed').length
  }
}

// ============================================================================
// USAGE ANALYTICS
// ============================================================================

export async function createUsageAnalytics(analyticsData: Partial<ExtensionUsageAnalytics>) {
  const supabase = createClient()
  return await supabase
    .from('extension_usage_analytics')
    .insert(analyticsData)
    .select()
    .single()
}

export async function getUserAnalytics(userId: string, limit: number = 30) {
  const supabase = createClient()
  return await supabase
    .from('extension_usage_analytics')
    .select('*')
    .eq('user_id', userId)
    .order('period_start', { ascending: false })
    .limit(limit)
}

export async function getAnalyticsForPeriod(userId: string, startDate: string, endDate: string) {
  const supabase = createClient()
  return await supabase
    .from('extension_usage_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('period_start', startDate)
    .lte('period_end', endDate)
    .order('period_start')
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getExtensionStats(userId: string) {
  const supabase = createClient()

  const [installationsResult, capturesResult, actionsResult, syncResult] = await Promise.all([
    getUserInstallations(userId),
    getUserCaptures(userId, 1000),
    getUserActions(userId),
    getSyncQueueStats(userId)
  ])

  const installations = installationsResult.data || []
  const captures = capturesResult.data || []
  const actions = actionsResult.data || []

  const totalStorage = installations.reduce((sum, i) => sum + i.storage_used, 0)

  const capturesByType = captures.reduce((acc, c) => {
    acc[c.capture_type] = (acc[c.capture_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const actionsByType = actions.reduce((acc, a) => {
    acc[a.action_type] = (acc[a.action_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostUsedAction = actions.sort((a, b) => b.usage_count - a.usage_count)[0]

  return {
    installations: {
      total: installations.length,
      active: installations.filter(i => i.status === 'active').length,
      totalStorage: totalStorage,
      byBrowser: installations.reduce((acc, i) => {
        acc[i.browser] = (acc[i.browser] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    },
    captures: {
      total: captures.length,
      favorites: captures.filter(c => c.is_favorite).length,
      archived: captures.filter(c => c.is_archived).length,
      byType: capturesByType,
      totalSize: captures.reduce((sum, c) => sum + c.file_size, 0)
    },
    actions: {
      total: actions.length,
      enabled: actions.filter(a => a.is_enabled).length,
      byType: actionsByType,
      mostUsed: mostUsedAction,
      totalUsage: actions.reduce((sum, a) => sum + a.usage_count, 0)
    },
    sync: syncResult
  }
}
