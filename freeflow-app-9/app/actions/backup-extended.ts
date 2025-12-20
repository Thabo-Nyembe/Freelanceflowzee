'use server'

/**
 * Extended Backup Server Actions - Covers all Backup-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getBackups(status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('backups').select('*').order('created_at', { ascending: false }).limit(limit); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBackup(backupId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backups').select('*').eq('id', backupId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBackup(input: { name: string; description?: string; backup_type: string; source?: string; destination?: string; include_tables?: string[]; exclude_tables?: string[]; compression?: boolean; encryption?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backups').insert({ ...input, status: 'pending', size_bytes: 0, started_at: null, completed_at: null }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startBackup(backupId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backups').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', backupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeBackup(backupId: string, sizeBytes: number, filePath?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backups').update({ status: 'completed', completed_at: new Date().toISOString(), size_bytes: sizeBytes, file_path: filePath }).eq('id', backupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failBackup(backupId: string, errorMessage: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backups').update({ status: 'failed', completed_at: new Date().toISOString(), error_message: errorMessage }).eq('id', backupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBackup(backupId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('backups').delete().eq('id', backupId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function restoreBackup(backupId: string, restoreTo?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backups').update({ status: 'restoring', restore_started_at: new Date().toISOString(), restore_destination: restoreTo }).eq('id', backupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBackupSchedules(isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('backup_schedules').select('*').order('name', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBackupSchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backup_schedules').select('*').eq('id', scheduleId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBackupSchedule(input: { name: string; description?: string; backup_type: string; frequency: string; cron_expression?: string; retention_days?: number; destination?: string; include_tables?: string[]; exclude_tables?: string[]; notify_on_completion?: boolean; notify_on_failure?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backup_schedules').insert({ ...input, is_active: true, last_run_at: null, next_run_at: null, run_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBackupSchedule(scheduleId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backup_schedules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleBackupSchedule(scheduleId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backup_schedules').update({ is_active: isActive }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function runBackupScheduleNow(scheduleId: string) {
  try { const supabase = await createClient(); const { data: schedule, error: scheduleError } = await supabase.from('backup_schedules').select('*').eq('id', scheduleId).single(); if (scheduleError) throw scheduleError; const { data: backup, error: backupError } = await supabase.from('backups').insert({ name: `${schedule.name} - Manual Run`, backup_type: schedule.backup_type, destination: schedule.destination, include_tables: schedule.include_tables, exclude_tables: schedule.exclude_tables, schedule_id: scheduleId, status: 'pending' }).select().single(); if (backupError) throw backupError; await supabase.from('backup_schedules').update({ last_run_at: new Date().toISOString(), run_count: (schedule.run_count || 0) + 1 }).eq('id', scheduleId); return { success: true, data: backup } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBackupSchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('backup_schedules').delete().eq('id', scheduleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
