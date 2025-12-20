'use server'

/**
 * Extended Execution Server Actions
 * Tables: executions, execution_logs, execution_steps, execution_results
 */

import { createClient } from '@/lib/supabase/server'

export async function getExecution(executionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('executions').select('*, execution_steps(*), execution_logs(*)').eq('id', executionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createExecution(executionData: { name: string; type: string; workflow_id?: string; pipeline_id?: string; triggered_by?: string; config?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('executions').insert({ ...executionData, status: 'pending', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExecutionStatus(executionId: string, status: string, details?: { error_message?: string; duration_ms?: number }) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'completed' || status === 'failed') updates.completed_at = new Date().toISOString(); if (details?.error_message) updates.error_message = details.error_message; if (details?.duration_ms) updates.duration_ms = details.duration_ms; const { data, error } = await supabase.from('executions').update(updates).eq('id', executionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExecutions(options?: { type?: string; status?: string; workflow_id?: string; triggered_by?: string; date_from?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('executions').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.workflow_id) query = query.eq('workflow_id', options.workflow_id); if (options?.triggered_by) query = query.eq('triggered_by', options.triggered_by); if (options?.date_from) query = query.gte('started_at', options.date_from); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addExecutionStep(stepData: { execution_id: string; name: string; order: number; config?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('execution_steps').insert({ ...stepData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStepStatus(stepId: string, status: string, result?: any) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'completed' || status === 'failed') { updates.completed_at = new Date().toISOString(); if (result) updates.result = result }; const { data, error } = await supabase.from('execution_steps').update(updates).eq('id', stepId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addExecutionLog(logData: { execution_id: string; step_id?: string; level: string; message: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('execution_logs').insert({ ...logData, logged_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExecutionLogs(executionId: string, options?: { step_id?: string; level?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('execution_logs').select('*').eq('execution_id', executionId); if (options?.step_id) query = query.eq('step_id', options.step_id); if (options?.level) query = query.eq('level', options.level); const { data, error } = await query.order('logged_at', { ascending: true }).limit(options?.limit || 500); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveExecutionResult(resultData: { execution_id: string; output: any; artifacts?: any; metrics?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('execution_results').insert({ ...resultData, saved_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function retryExecution(executionId: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('executions').select('*').eq('id', executionId).single(); if (!original) throw new Error('Execution not found'); const { data, error } = await supabase.from('executions').insert({ name: original.name, type: original.type, workflow_id: original.workflow_id, pipeline_id: original.pipeline_id, config: original.config, triggered_by: original.triggered_by, retry_of: executionId, status: 'pending', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
