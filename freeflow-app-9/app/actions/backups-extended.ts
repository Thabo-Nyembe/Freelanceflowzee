'use server'

/**
 * Extended Backups Server Actions
 * Tables: backups, backup_schedules, backup_restores
 */

import { createClient } from '@/lib/supabase/server'

export async function getBackup(backupId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backups').select('*').eq('id', backupId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBackup(backupData: { user_id: string; name?: string; type: string; source: string; size?: number; storage_path?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backups').insert({ ...backupData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBackupStatus(backupId: string, status: string, updates?: { size?: number; storage_path?: string; error_message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backups').update({ status, ...updates, completed_at: status === 'completed' ? new Date().toISOString() : undefined, updated_at: new Date().toISOString() }).eq('id', backupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBackup(backupId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('backups').delete().eq('id', backupId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBackups(options?: { user_id?: string; type?: string; status?: string; source?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('backups').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.source) query = query.eq('source', options.source); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBackupSchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backup_schedules').select('*').eq('id', scheduleId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBackupSchedule(scheduleData: { user_id: string; name: string; source: string; frequency: string; retention_days?: number; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backup_schedules').insert({ ...scheduleData, retention_days: scheduleData.retention_days || 30, is_active: scheduleData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function restoreBackup(backupId: string, options?: { target?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('backup_restores').insert({ backup_id: backupId, target: options?.target, status: 'pending', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBackupStats(userId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('backups').select('status, size, type').eq('user_id', userId); if (!data) return { success: true, data: { total: 0, totalSize: 0, byStatus: {}, byType: {} } }; const total = data.length; const totalSize = data.reduce((sum, b) => sum + (b.size || 0), 0); const byStatus = data.reduce((acc: Record<string, number>, b) => { acc[b.status || 'unknown'] = (acc[b.status || 'unknown'] || 0) + 1; return acc }, {}); const byType = data.reduce((acc: Record<string, number>, b) => { acc[b.type || 'unknown'] = (acc[b.type || 'unknown'] || 0) + 1; return acc }, {}); return { success: true, data: { total, totalSize, byStatus, byType } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { total: 0, totalSize: 0, byStatus: {}, byType: {} } } }
}
