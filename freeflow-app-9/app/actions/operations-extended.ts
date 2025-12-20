'use server'

/**
 * Extended Operations Server Actions
 * Tables: operations, operation_logs, operation_steps, operation_schedules, operation_metrics, operation_alerts
 */

import { createClient } from '@/lib/supabase/server'

export async function getOperation(operationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operations').select('*, operation_logs(*), operation_steps(*), operation_metrics(*)').eq('id', operationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createOperation(operationData: { name: string; type: string; description?: string; organization_id?: string; owner_id: string; config?: any; scheduled_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operations').insert({ ...operationData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOperation(operationId: string, updates: Partial<{ name: string; description: string; status: string; config: any; result: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', operationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startOperation(operationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operations').update({ status: 'running', started_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', operationId).select().single(); if (error) throw error; await supabase.from('operation_logs').insert({ operation_id: operationId, level: 'info', message: 'Operation started', created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeOperation(operationId: string, result?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operations').update({ status: 'completed', result, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', operationId).select().single(); if (error) throw error; await supabase.from('operation_logs').insert({ operation_id: operationId, level: 'info', message: 'Operation completed', created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failOperation(operationId: string, errorMessage: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operations').update({ status: 'failed', error: errorMessage, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', operationId).select().single(); if (error) throw error; await supabase.from('operation_logs').insert({ operation_id: operationId, level: 'error', message: errorMessage, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelOperation(operationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operations').update({ status: 'cancelled', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', operationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOperations(options?: { organization_id?: string; owner_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('operations').select('*'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLog(operationId: string, logData: { level: string; message: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operation_logs').insert({ operation_id: operationId, ...logData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLogs(operationId: string, options?: { level?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('operation_logs').select('*').eq('operation_id', operationId); if (options?.level) query = query.eq('level', options.level); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addStep(operationId: string, stepData: { name: string; order: number; config?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operation_steps').insert({ operation_id: operationId, ...stepData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStep(stepId: string, updates: Partial<{ status: string; result: any; error: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operation_steps').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', stepId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function scheduleOperation(operationId: string, scheduleData: { cron_expression?: string; run_at?: string; repeat?: boolean; timezone?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operation_schedules').insert({ operation_id: operationId, ...scheduleData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordMetric(operationId: string, metricData: { name: string; value: number; unit?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operation_metrics').insert({ operation_id: operationId, ...metricData, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAlert(operationId: string, alertData: { type: string; message: string; severity: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('operation_alerts').insert({ operation_id: operationId, ...alertData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
