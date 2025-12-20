'use server'

/**
 * Extended Script Server Actions - Covers all Script-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getScript(scriptId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scripts').select('*').eq('id', scriptId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createScript(scriptData: { name: string; script_type: string; code: string; language?: string; description?: string; version?: string; parameters?: Array<{ name: string; type: string; required?: boolean; default?: any }>; is_active?: boolean; timeout_ms?: number; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scripts').insert({ ...scriptData, is_active: scriptData.is_active ?? true, version: scriptData.version || '1.0.0', execution_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateScript(scriptId: string, updates: Partial<{ name: string; code: string; description: string; version: string; parameters: Array<{ name: string; type: string; required?: boolean; default?: any }>; is_active: boolean; timeout_ms: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scripts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', scriptId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteScript(scriptId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('scripts').delete().eq('id', scriptId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getScripts(options?: { scriptType?: string; language?: string; isActive?: boolean; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('scripts').select('*'); if (options?.scriptType) query = query.eq('script_type', options.scriptType); if (options?.language) query = query.eq('language', options.language); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordScriptExecution(scriptId: string, execution: { status: 'success' | 'error' | 'timeout'; duration_ms: number; input_params?: Record<string, any>; output?: any; error_message?: string; executed_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('script_executions').insert({ script_id: scriptId, ...execution, executed_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('scripts').update({ execution_count: supabase.rpc('increment_count', { row_id: scriptId }), last_executed_at: new Date().toISOString() }).eq('id', scriptId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getScriptExecutions(scriptId: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('script_executions').select('*').eq('script_id', scriptId).order('executed_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function activateScript(scriptId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scripts').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', scriptId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateScript(scriptId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scripts').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', scriptId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateScript(scriptId: string, newName?: string, newVersion?: string) {
  try { const supabase = await createClient(); const { data: original, error: fetchError } = await supabase.from('scripts').select('*').eq('id', scriptId).single(); if (fetchError) throw fetchError; const { id, created_at, updated_at, execution_count, last_executed_at, ...scriptData } = original; const { data, error } = await supabase.from('scripts').insert({ ...scriptData, name: newName || `${original.name} (Copy)`, version: newVersion || original.version, execution_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
