'use server'

/**
 * Extended Workflows Server Actions
 * Tables: workflows, workflow_steps, workflow_runs, workflow_triggers
 */

import { createClient } from '@/lib/supabase/server'

export async function getWorkflow(workflowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflows').select('*, workflow_steps(*), workflow_triggers(*)').eq('id', workflowId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWorkflow(workflowData: { name: string; user_id: string; description?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflows').insert({ ...workflowData, is_active: workflowData.is_active ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWorkflow(workflowId: string, updates: Partial<{ name: string; description: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflows').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', workflowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWorkflow(workflowId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('workflows').delete().eq('id', workflowId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkflows(options?: { user_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('workflows').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWorkflowSteps(workflowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_steps').select('*').eq('workflow_id', workflowId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addWorkflowStep(workflowId: string, stepData: { name: string; type: string; config?: Record<string, any>; order: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_steps').insert({ workflow_id: workflowId, ...stepData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkflowRuns(workflowId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('workflow_runs').select('*').eq('workflow_id', workflowId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function triggerWorkflow(workflowId: string, triggerData?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_runs').insert({ workflow_id: workflowId, trigger_data: triggerData, status: 'pending', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
