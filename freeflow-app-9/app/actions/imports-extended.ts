'use server'

/**
 * Extended Imports Server Actions
 * Tables: imports, import_jobs, import_mappings, import_errors, import_templates, import_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getImport(importId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('imports').select('*, import_jobs(*), import_errors(*)').eq('id', importId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createImport(importData: { user_id: string; name: string; type: string; source: string; file_url?: string; settings?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('imports').insert({ ...importData, status: 'pending', total_records: 0, processed_records: 0, error_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateImport(importId: string, updates: Partial<{ status: string; total_records: number; processed_records: number; error_count: number; completed_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('imports').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', importId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getImports(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('imports').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createImportJob(jobData: { import_id: string; batch_number: number; records: any[]; status?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('import_jobs').insert({ ...jobData, status: jobData.status || 'pending', record_count: jobData.records.length, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateImportJob(jobId: string, updates: Partial<{ status: string; processed_count: number; error_count: number; completed_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('import_jobs').update({ ...updates }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getImportJobs(importId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('import_jobs').select('*').eq('import_id', importId).order('batch_number', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createImportMapping(mappingData: { import_id: string; source_field: string; target_field: string; transformation?: string; default_value?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('import_mappings').insert({ ...mappingData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getImportMappings(importId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('import_mappings').select('*').eq('import_id', importId).order('source_field', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logImportError(errorData: { import_id: string; job_id?: string; row_number?: number; field?: string; error_message: string; raw_data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('import_errors').insert({ ...errorData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('imports').update({ error_count: (await supabase.from('imports').select('error_count').eq('id', errorData.import_id).single()).data?.error_count + 1 || 1 }).eq('id', errorData.import_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getImportErrors(importId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('import_errors').select('*').eq('import_id', importId).order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getImportTemplates(options?: { type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('import_templates').select('*'); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createImportTemplate(templateData: { name: string; type: string; mappings: any; settings?: any; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('import_templates').insert({ ...templateData, usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getImportHistory(userId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('import_history').select('*').eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
