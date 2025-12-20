'use server'

/**
 * Extended Exports Server Actions
 * Tables: exports, export_jobs, export_templates, export_schedules
 */

import { createClient } from '@/lib/supabase/server'

export async function getExport(exportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('exports').select('*').eq('id', exportId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createExport(exportData: { user_id: string; name: string; type: string; format: string; source: string; config?: any; filters?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('exports').insert({ ...exportData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExportStatus(exportId: string, status: string, details?: { file_url?: string; file_size?: number; row_count?: number; error_message?: string }) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'completed') updates.completed_at = new Date().toISOString(); if (details?.file_url) updates.file_url = details.file_url; if (details?.file_size) updates.file_size = details.file_size; if (details?.row_count) updates.row_count = details.row_count; if (details?.error_message) updates.error_message = details.error_message; const { data, error } = await supabase.from('exports').update(updates).eq('id', exportId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserExports(userId: string, options?: { type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('exports').select('*').eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteExport(exportId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('exports').delete().eq('id', exportId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createExportJob(jobData: { export_id: string; config: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('export_jobs').insert({ ...jobData, status: 'queued', queued_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExportTemplates(options?: { type?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('export_templates').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createExportTemplate(templateData: { name: string; type: string; format: string; config: any; is_public?: boolean; user_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('export_templates').insert({ ...templateData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function scheduleExport(scheduleData: { user_id: string; template_id: string; schedule: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('export_schedules').insert({ ...scheduleData, is_active: scheduleData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExportSchedules(userId: string, options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('export_schedules').select('*, export_templates(*)').eq('user_id', userId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
