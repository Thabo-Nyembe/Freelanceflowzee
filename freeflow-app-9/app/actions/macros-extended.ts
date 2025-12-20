'use server'

/**
 * Extended Macros Server Actions
 * Tables: macros, macro_steps, macro_triggers, macro_executions, macro_variables, macro_schedules
 */

import { createClient } from '@/lib/supabase/server'

export async function getMacro(macroId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('macros').select('*, macro_steps(*), macro_triggers(*), macro_variables(*)').eq('id', macroId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMacro(macroData: { name: string; description?: string; user_id: string; organization_id?: string; category?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('macros').insert({ ...macroData, status: 'draft', execution_count: 0, is_enabled: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMacro(macroId: string, updates: Partial<{ name: string; description: string; category: string; is_enabled: boolean; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('macros').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', macroId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMacro(macroId: string) {
  try { const supabase = await createClient(); await supabase.from('macro_steps').delete().eq('macro_id', macroId); await supabase.from('macro_triggers').delete().eq('macro_id', macroId); await supabase.from('macro_variables').delete().eq('macro_id', macroId); const { error } = await supabase.from('macros').delete().eq('id', macroId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMacros(options?: { user_id?: string; organization_id?: string; category?: string; is_enabled?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('macros').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.category) query = query.eq('category', options.category); if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMacroStep(stepData: { macro_id: string; action_type: string; action_config: any; order: number; condition?: any; timeout_ms?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('macro_steps').insert({ ...stepData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMacroStep(stepId: string, updates: Partial<{ action_type: string; action_config: any; order: number; condition: any; is_enabled: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('macro_steps').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', stepId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMacroStep(stepId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('macro_steps').delete().eq('id', stepId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMacroSteps(macroId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('macro_steps').select('*').eq('macro_id', macroId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMacroTrigger(triggerData: { macro_id: string; trigger_type: string; trigger_config: any; is_enabled?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('macro_triggers').insert({ ...triggerData, is_enabled: triggerData.is_enabled ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function executeMacro(macroId: string, inputVariables?: Record<string, any>, triggeredBy?: string) {
  try { const supabase = await createClient(); const { data: execution, error } = await supabase.from('macro_executions').insert({ macro_id: macroId, status: 'running', input_variables: inputVariables, triggered_by: triggeredBy, started_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('macros').update({ execution_count: supabase.sql`execution_count + 1`, last_executed_at: new Date().toISOString() }).eq('id', macroId); return { success: true, data: execution } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExecution(executionId: string, updates: Partial<{ status: string; current_step: number; output: any; error_message: string }>) {
  try { const supabase = await createClient(); const updateData: any = { ...updates, updated_at: new Date().toISOString() }; if (updates.status === 'completed' || updates.status === 'failed') updateData.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('macro_executions').update(updateData).eq('id', executionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExecutions(macroId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('macro_executions').select('*').eq('macro_id', macroId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMacroVariable(variableData: { macro_id: string; name: string; value_type: string; default_value?: any; description?: string; is_required?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('macro_variables').insert({ ...variableData, is_required: variableData.is_required ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function scheduleMacro(scheduleData: { macro_id: string; cron_expression: string; timezone?: string; is_enabled?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('macro_schedules').insert({ ...scheduleData, timezone: scheduleData.timezone || 'UTC', is_enabled: scheduleData.is_enabled ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
