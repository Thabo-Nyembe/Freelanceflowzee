'use server'

/**
 * Extended Data Server Actions - Covers all Data-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getDataExports(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('data_exports').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDataExport(exportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('data_exports').select('*').eq('id', exportId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDataExport(userId: string, input: { export_type: string; data_types: string[]; format: string; filters?: any; date_range?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('data_exports').insert({ user_id: userId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startDataExport(exportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('data_exports').update({ status: 'processing', started_at: new Date().toISOString() }).eq('id', exportId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeDataExport(exportId: string, fileUrl: string, fileSize: number, recordCount: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('data_exports').update({ status: 'completed', file_url: fileUrl, file_size: fileSize, record_count: recordCount, completed_at: new Date().toISOString() }).eq('id', exportId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failDataExport(exportId: string, errorMessage: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('data_exports').update({ status: 'failed', error_message: errorMessage }).eq('id', exportId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDataExport(exportId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('data_exports').delete().eq('id', exportId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDataImports(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('data_imports').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDataImport(userId: string, input: { import_type: string; source_file_url: string; file_name: string; file_size: number; mapping?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('data_imports').insert({ user_id: userId, ...input, status: 'pending', processed_rows: 0, failed_rows: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startDataImport(importId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('data_imports').update({ status: 'processing', started_at: new Date().toISOString() }).eq('id', importId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateImportProgress(importId: string, processedRows: number, failedRows: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('data_imports').update({ processed_rows: processedRows, failed_rows: failedRows }).eq('id', importId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeDataImport(importId: string, totalRows: number, processedRows: number, failedRows: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('data_imports').update({ status: 'completed', total_rows: totalRows, processed_rows: processedRows, failed_rows: failedRows, completed_at: new Date().toISOString() }).eq('id', importId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failDataImport(importId: string, errorMessage: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('data_imports').update({ status: 'failed', error_message: errorMessage }).eq('id', importId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDataImport(importId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('data_imports').delete().eq('id', importId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
