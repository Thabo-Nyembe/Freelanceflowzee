/**
 * Advanced Settings Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type ExportType = 'settings' | 'user_data' | 'gdpr' | 'backup' | 'custom'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
export type SyncStatus = 'synced' | 'syncing' | 'conflict' | 'failed'
export type BackupType = 'manual' | 'automatic' | 'scheduled' | 'pre_reset'
export type DeletionStatus = 'pending' | 'cancelled' | 'completed'

export interface UserDataExport {
  id: string
  user_id: string
  export_type: ExportType
  export_status: ExportStatus
  file_name: string
  file_size?: number
  file_url?: string
  includes_sections: string[]
  requested_at: string
  completed_at?: string
  expires_at?: string
  downloaded_at?: string
  error_message?: string
  retry_count: number
  gdpr_compliant: boolean
  created_at: string
  updated_at: string
}

export interface SettingsBackup {
  id: string
  user_id: string
  backup_type: BackupType
  profile_data: Record<string, any>
  notification_settings: Record<string, any>
  security_settings: Record<string, any>
  appearance_settings: Record<string, any>
  advanced_settings: Record<string, any>
  backup_name?: string
  description?: string
  file_size?: number
  restored_at?: string
  restore_count: number
  is_automatic: boolean
  keep_forever: boolean
  created_at: string
  updated_at: string
}

export interface SettingsSyncHistory {
  id: string
  user_id: string
  sync_status: SyncStatus
  synced_sections: string[]
  device_id?: string
  device_name?: string
  device_type?: string
  browser?: string
  ip_address?: string
  sync_started_at: string
  sync_completed_at?: string
  duration_ms?: number
  had_conflicts: boolean
  conflicts_resolved: number
  conflict_details: Record<string, any>
  error_message?: string
  created_at: string
}

export interface AccountDeletionRequest {
  id: string
  user_id: string
  reason?: string
  requested_at: string
  scheduled_for: string
  status: DeletionStatus
  cancelled_at?: string
  completed_at?: string
  confirmation_token?: string
  confirmation_sent_at?: string
  confirmed_at?: string
  grace_period_days: number
  reminder_sent_at?: string
  data_export_id?: string
  backup_created: boolean
  created_at: string
  updated_at: string
}

export interface CacheClearLog {
  id: string
  user_id?: string
  cleared_types: string[]
  signed_out: boolean
  device_info: Record<string, any>
  ip_address?: string
  created_at: string
}

// USER DATA EXPORTS
export async function getUserDataExports(userId: string, filters?: { export_type?: ExportType; export_status?: ExportStatus }) {
  const supabase = createClient()
  let query = supabase.from('user_data_exports').select('*').eq('user_id', userId).order('requested_at', { ascending: false })
  if (filters?.export_type) query = query.eq('export_type', filters.export_type)
  if (filters?.export_status) query = query.eq('export_status', filters.export_status)
  return await query
}

export async function getUserDataExport(exportId: string) {
  const supabase = createClient()
  return await supabase.from('user_data_exports').select('*').eq('id', exportId).single()
}

export async function createUserDataExport(userId: string, exportData: Partial<UserDataExport>) {
  const supabase = createClient()
  return await supabase.from('user_data_exports').insert({ user_id: userId, ...exportData }).select().single()
}

export async function updateUserDataExport(exportId: string, updates: Partial<UserDataExport>) {
  const supabase = createClient()
  return await supabase.from('user_data_exports').update(updates).eq('id', exportId).select().single()
}

export async function markExportDownloaded(exportId: string) {
  const supabase = createClient()
  return await supabase.from('user_data_exports').update({ downloaded_at: new Date().toISOString() }).eq('id', exportId).select().single()
}

export async function deleteExpiredExports(userId: string) {
  const supabase = createClient()
  return await supabase.from('user_data_exports').delete().eq('user_id', userId).lt('expires_at', new Date().toISOString())
}

export async function deleteUserDataExport(exportId: string) {
  const supabase = createClient()
  return await supabase.from('user_data_exports').delete().eq('id', exportId)
}

// SETTINGS BACKUPS
export async function getSettingsBackups(userId: string, filters?: { backup_type?: BackupType; is_automatic?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('settings_backups').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.backup_type) query = query.eq('backup_type', filters.backup_type)
  if (filters?.is_automatic !== undefined) query = query.eq('is_automatic', filters.is_automatic)
  return await query
}

export async function getSettingsBackup(backupId: string) {
  const supabase = createClient()
  return await supabase.from('settings_backups').select('*').eq('id', backupId).single()
}

export async function createSettingsBackup(userId: string, backup: Partial<SettingsBackup>) {
  const supabase = createClient()
  return await supabase.from('settings_backups').insert({ user_id: userId, ...backup }).select().single()
}

export async function updateSettingsBackup(backupId: string, updates: Partial<SettingsBackup>) {
  const supabase = createClient()
  return await supabase.from('settings_backups').update(updates).eq('id', backupId).select().single()
}

export async function restoreSettingsBackup(backupId: string) {
  const supabase = createClient()
  const { data: backup } = await supabase.from('settings_backups').select('*').eq('id', backupId).single()
  if (!backup) return { data: null, error: new Error('Backup not found') }

  return await supabase.from('settings_backups').update({
    restored_at: new Date().toISOString(),
    restore_count: backup.restore_count + 1
  }).eq('id', backupId).select().single()
}

export async function deleteSettingsBackup(backupId: string) {
  const supabase = createClient()
  return await supabase.from('settings_backups').delete().eq('id', backupId)
}

export async function deleteOldBackups(userId: string, keepCount: number = 10) {
  const supabase = createClient()
  const { data: backups } = await supabase.from('settings_backups')
    .select('id')
    .eq('user_id', userId)
    .eq('is_automatic', true)
    .eq('keep_forever', false)
    .order('created_at', { ascending: false })

  if (!backups || backups.length <= keepCount) return { data: null, error: null }

  const toDelete = backups.slice(keepCount).map(b => b.id)
  return await supabase.from('settings_backups').delete().in('id', toDelete)
}

// SETTINGS SYNC HISTORY
export async function getSettingsSyncHistory(userId: string, filters?: { sync_status?: SyncStatus; device_id?: string; limit?: number }) {
  const supabase = createClient()
  let query = supabase.from('settings_sync_history').select('*').eq('user_id', userId).order('sync_started_at', { ascending: false })
  if (filters?.sync_status) query = query.eq('sync_status', filters.sync_status)
  if (filters?.device_id) query = query.eq('device_id', filters.device_id)
  if (filters?.limit) query = query.limit(filters.limit)
  return await query
}

export async function getSettingsSyncRecord(syncId: string) {
  const supabase = createClient()
  return await supabase.from('settings_sync_history').select('*').eq('id', syncId).single()
}

export async function createSettingsSyncRecord(userId: string, sync: Partial<SettingsSyncHistory>) {
  const supabase = createClient()
  return await supabase.from('settings_sync_history').insert({ user_id: userId, ...sync }).select().single()
}

export async function updateSettingsSyncRecord(syncId: string, updates: Partial<SettingsSyncHistory>) {
  const supabase = createClient()
  return await supabase.from('settings_sync_history').update(updates).eq('id', syncId).select().single()
}

export async function completeSettingsSync(syncId: string, hadConflicts: boolean = false, conflictsResolved: number = 0) {
  const supabase = createClient()
  return await supabase.from('settings_sync_history').update({
    sync_status: 'synced',
    sync_completed_at: new Date().toISOString(),
    had_conflicts: hadConflicts,
    conflicts_resolved: conflictsResolved
  }).eq('id', syncId).select().single()
}

export async function markSyncFailed(syncId: string, errorMessage: string) {
  const supabase = createClient()
  return await supabase.from('settings_sync_history').update({
    sync_status: 'failed',
    error_message: errorMessage
  }).eq('id', syncId).select().single()
}

export async function getDeviceSyncHistory(userId: string, deviceId: string) {
  const supabase = createClient()
  return await supabase.from('settings_sync_history').select('*').eq('user_id', userId).eq('device_id', deviceId).order('sync_started_at', { ascending: false })
}

// ACCOUNT DELETION REQUESTS
export async function getAccountDeletionRequest(userId: string) {
  const supabase = createClient()
  return await supabase.from('account_deletion_requests').select('*').eq('user_id', userId).single()
}

export async function createAccountDeletionRequest(userId: string, reason?: string, gracePeriodDays: number = 7) {
  const supabase = createClient()
  const scheduledFor = new Date()
  scheduledFor.setDate(scheduledFor.getDate() + gracePeriodDays)

  return await supabase.from('account_deletion_requests').insert({
    user_id: userId,
    reason,
    grace_period_days: gracePeriodDays,
    scheduled_for: scheduledFor.toISOString()
  }).select().single()
}

export async function cancelAccountDeletionRequest(userId: string) {
  const supabase = createClient()
  return await supabase.from('account_deletion_requests').update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString()
  }).eq('user_id', userId).select().single()
}

export async function confirmAccountDeletionRequest(userId: string, confirmationToken: string) {
  const supabase = createClient()
  return await supabase.from('account_deletion_requests').update({
    confirmed_at: new Date().toISOString()
  }).eq('user_id', userId).eq('confirmation_token', confirmationToken).select().single()
}

export async function completeAccountDeletion(userId: string) {
  const supabase = createClient()
  return await supabase.from('account_deletion_requests').update({
    status: 'completed',
    completed_at: new Date().toISOString()
  }).eq('user_id', userId).select().single()
}

export async function getPendingDeletionRequests() {
  const supabase = createClient()
  return await supabase.from('account_deletion_requests')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
}

// CACHE CLEAR LOGS
export async function getCacheClearLogs(userId: string, limit: number = 20) {
  const supabase = createClient()
  return await supabase.from('cache_clear_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit)
}

export async function createCacheClearLog(userId: string | undefined, log: Partial<CacheClearLog>) {
  const supabase = createClient()
  return await supabase.from('cache_clear_logs').insert({ user_id: userId, ...log }).select().single()
}

// STATS
export async function getAdvancedSettingsStats(userId: string) {
  const supabase = createClient()
  const [exportsResult, backupsResult, syncResult, deletionResult, cacheResult] = await Promise.all([
    supabase.from('user_data_exports').select('id, export_type, export_status, file_size').eq('user_id', userId),
    supabase.from('settings_backups').select('id, backup_type, is_automatic, restore_count').eq('user_id', userId),
    supabase.from('settings_sync_history').select('id, sync_status, duration_ms, had_conflicts').eq('user_id', userId),
    supabase.from('account_deletion_requests').select('id, status').eq('user_id', userId).single(),
    supabase.from('cache_clear_logs').select('id', { count: 'exact' }).eq('user_id', userId)
  ])

  const totalExportSize = exportsResult.data?.reduce((sum, e) => sum + (e.file_size || 0), 0) || 0
  const completedExports = exportsResult.data?.filter(e => e.export_status === 'completed').length || 0
  const manualBackups = backupsResult.data?.filter(b => !b.is_automatic).length || 0
  const autoBackups = backupsResult.data?.filter(b => b.is_automatic).length || 0
  const totalRestores = backupsResult.data?.reduce((sum, b) => sum + (b.restore_count || 0), 0) || 0
  const successfulSyncs = syncResult.data?.filter(s => s.sync_status === 'synced').length || 0
  const syncConflicts = syncResult.data?.filter(s => s.had_conflicts).length || 0
  const avgSyncDuration = syncResult.data?.reduce((sum, s) => sum + (s.duration_ms || 0), 0) / (syncResult.data?.length || 1) || 0

  // Export types breakdown
  const exportTypeBreakdown = exportsResult.data?.reduce((acc, e) => {
    acc[e.export_type] = (acc[e.export_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    data: {
      total_exports: exportsResult.count || 0,
      completed_exports: completedExports,
      total_export_size_bytes: totalExportSize,
      export_type_breakdown: exportTypeBreakdown,
      total_backups: backupsResult.count || 0,
      manual_backups: manualBackups,
      automatic_backups: autoBackups,
      total_restores: totalRestores,
      total_syncs: syncResult.count || 0,
      successful_syncs: successfulSyncs,
      sync_conflicts: syncConflicts,
      avg_sync_duration_ms: avgSyncDuration,
      has_pending_deletion: deletionRequest?.status === 'pending',
      deletion_scheduled_for: deletionRequest?.scheduled_for,
      total_cache_clears: cacheResult.count || 0
    },
    error: exportsResult.error || backupsResult.error || syncResult.error || cacheResult.error
  }
}

export async function getRecentActivity(userId: string, limit: number = 10) {
  const supabase = createClient()
  const [exportsResult, backupsResult, syncResult] = await Promise.all([
    supabase.from('user_data_exports').select('id, export_type, export_status, requested_at').eq('user_id', userId).order('requested_at', { ascending: false }).limit(limit),
    supabase.from('settings_backups').select('id, backup_type, backup_name, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
    supabase.from('settings_sync_history').select('id, sync_status, device_name, sync_started_at').eq('user_id', userId).order('sync_started_at', { ascending: false }).limit(limit)
  ])

  return {
    data: {
      recent_exports: exportsResult.data || [],
      recent_backups: backupsResult.data || [],
      recent_syncs: syncResult.data || []
    },
    error: exportsResult.error || backupsResult.error || syncResult.error
  }
}
