'use server'

/**
 * Extended Export Server Actions - Covers all Export-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getExport(exportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('exports').select('*').eq('id', exportId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createExport(exportData: { export_type: string; format: string; entity_type?: string; entity_id?: string; filters?: Record<string, any>; columns?: string[]; user_id?: string; name?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('exports').insert({ ...exportData, status: 'pending', progress: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExportStatus(exportId: string, status: 'pending' | 'processing' | 'completed' | 'failed', updates?: { progress?: number; file_url?: string; file_size?: number; row_count?: number; error_message?: string }) {
  try { const supabase = await createClient(); const updateData: Record<string, any> = { status, updated_at: new Date().toISOString() }; if (updates?.progress !== undefined) updateData.progress = updates.progress; if (updates?.file_url) updateData.file_url = updates.file_url; if (updates?.file_size) updateData.file_size = updates.file_size; if (updates?.row_count) updateData.row_count = updates.row_count; if (updates?.error_message) updateData.error_message = updates.error_message; if (status === 'completed') updateData.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('exports').update(updateData).eq('id', exportId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteExport(exportId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('exports').delete().eq('id', exportId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserExports(userId: string, options?: { status?: string; exportType?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('exports').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.exportType) query = query.eq('export_type', options.exportType); if (options?.limit) query = query.limit(options.limit); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getExportDownloadUrl(exportId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('exports').select('file_url, status, expires_at').eq('id', exportId).single(); if (!data) return { success: false, error: 'Export not found' }; if (data.status !== 'completed') return { success: false, error: 'Export not ready' }; if (data.expires_at && new Date(data.expires_at) < new Date()) return { success: false, error: 'Export has expired' }; return { success: true, url: data.file_url } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function scheduleExport(exportData: { export_type: string; format: string; schedule: string; filters?: Record<string, any>; columns?: string[]; user_id?: string; name?: string; recipients?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scheduled_exports').insert({ ...exportData, is_active: true, next_run_at: calculateNextRun(exportData.schedule), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function calculateNextRun(schedule: string): string {
  const now = new Date();
  switch (schedule) { case 'daily': now.setDate(now.getDate() + 1); now.setHours(0, 0, 0, 0); break; case 'weekly': now.setDate(now.getDate() + 7); break; case 'monthly': now.setMonth(now.getMonth() + 1); break; }
  return now.toISOString();
}

export async function cleanupExpiredExports(olderThanDays = 7) {
  try { const supabase = await createClient(); const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - olderThanDays); const { error } = await supabase.from('exports').delete().lt('created_at', cutoff.toISOString()).eq('status', 'completed'); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
