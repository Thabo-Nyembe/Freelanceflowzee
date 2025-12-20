'use server'

/**
 * Extended Import Server Actions - Covers all Import-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getImport(importId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('imports').select('*').eq('id', importId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createImport(importData: { import_type: string; source_type: string; file_url?: string; file_name?: string; file_size?: number; entity_type?: string; mapping?: Record<string, string>; options?: Record<string, any>; user_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('imports').insert({ ...importData, status: 'pending', progress: 0, processed_rows: 0, failed_rows: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateImportStatus(importId: string, status: 'pending' | 'validating' | 'processing' | 'completed' | 'failed' | 'cancelled', updates?: { progress?: number; processed_rows?: number; failed_rows?: number; total_rows?: number; error_message?: string; errors?: Array<{ row: number; field: string; message: string }> }) {
  try { const supabase = await createClient(); const updateData: Record<string, any> = { status, updated_at: new Date().toISOString() }; if (updates?.progress !== undefined) updateData.progress = updates.progress; if (updates?.processed_rows !== undefined) updateData.processed_rows = updates.processed_rows; if (updates?.failed_rows !== undefined) updateData.failed_rows = updates.failed_rows; if (updates?.total_rows !== undefined) updateData.total_rows = updates.total_rows; if (updates?.error_message) updateData.error_message = updates.error_message; if (updates?.errors) updateData.errors = updates.errors; if (status === 'completed' || status === 'failed') updateData.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('imports').update(updateData).eq('id', importId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelImport(importId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('imports').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', importId).in('status', ['pending', 'validating', 'processing']).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteImport(importId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('imports').delete().eq('id', importId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserImports(userId: string, options?: { status?: string; importType?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('imports').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.importType) query = query.eq('import_type', options.importType); if (options?.limit) query = query.limit(options.limit); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getImportErrors(importId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('imports').select('errors, failed_rows').eq('id', importId).single(); return { success: true, errors: data?.errors || [], failedRows: data?.failed_rows || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', errors: [] } }
}

export async function validateImportMapping(importId: string, mapping: Record<string, string>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('imports').update({ mapping, status: 'validating', updated_at: new Date().toISOString() }).eq('id', importId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function retryImport(importId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('imports').update({ status: 'pending', progress: 0, processed_rows: 0, failed_rows: 0, errors: null, error_message: null, updated_at: new Date().toISOString() }).eq('id', importId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getImportPreview(importId: string, rows = 5) {
  try { const supabase = await createClient(); const { data } = await supabase.from('imports').select('preview_data').eq('id', importId).single(); return { success: true, preview: data?.preview_data?.slice(0, rows) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', preview: [] } }
}
