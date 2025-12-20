'use server'

/**
 * Extended Sync Server Actions - Covers all Sync-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSync(syncId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('syncs').select('*').eq('id', syncId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSync(syncData: { sync_type: string; source_type: string; source_id: string; destination_type: string; destination_id: string; direction?: 'push' | 'pull' | 'bidirectional'; schedule?: string; mapping?: Record<string, string>; filters?: Record<string, any>; user_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('syncs').insert({ ...syncData, direction: syncData.direction || 'bidirectional', status: 'idle', is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startSync(syncId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('syncs').update({ status: 'running', started_at: new Date().toISOString(), error_message: null }).eq('id', syncId).eq('status', 'idle').select().single(); if (error) throw error; if (!data) return { success: false, error: 'Sync already running or not found' }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeSyncRun(syncId: string, result: { records_synced?: number; records_failed?: number; error_message?: string }) {
  try { const supabase = await createClient(); const status = result.error_message ? 'error' : 'idle'; const { data, error } = await supabase.from('syncs').update({ status, last_sync_at: new Date().toISOString(), last_sync_records: result.records_synced || 0, last_sync_errors: result.records_failed || 0, error_message: result.error_message || null, updated_at: new Date().toISOString() }).eq('id', syncId).select().single(); if (error) throw error; await supabase.from('sync_logs').insert({ sync_id: syncId, status, records_synced: result.records_synced || 0, records_failed: result.records_failed || 0, error_message: result.error_message, completed_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function pauseSync(syncId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('syncs').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', syncId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resumeSync(syncId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('syncs').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', syncId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSync(syncId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('syncs').delete().eq('id', syncId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserSyncs(userId: string, options?: { isActive?: boolean; syncType?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('syncs').select('*').eq('user_id', userId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.syncType) query = query.eq('sync_type', options.syncType); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSyncLogs(syncId: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sync_logs').select('*').eq('sync_id', syncId).order('completed_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateSyncMapping(syncId: string, mapping: Record<string, string>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('syncs').update({ mapping, updated_at: new Date().toISOString() }).eq('id', syncId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSyncSchedule(syncId: string, schedule: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('syncs').update({ schedule, next_run_at: calculateNextRun(schedule), updated_at: new Date().toISOString() }).eq('id', syncId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function calculateNextRun(schedule: string): string {
  const now = new Date();
  const [value, unit] = schedule.split(' ');
  const interval = parseInt(value) || 1;
  switch (unit) { case 'minutes': now.setMinutes(now.getMinutes() + interval); break; case 'hours': now.setHours(now.getHours() + interval); break; case 'days': now.setDate(now.getDate() + interval); break; default: now.setHours(now.getHours() + 1); }
  return now.toISOString();
}
