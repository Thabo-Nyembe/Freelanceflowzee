'use server'

/**
 * Extended Automation Server Actions
 * Tables: automation_workflows, automation_triggers, automation_actions, automation_logs
 */

import { createClient } from '@/lib/supabase/server'

export async function getAutomationWorkflow(workflowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('automation_workflows').select('*, automation_triggers(*), automation_actions(*)').eq('id', workflowId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAutomationWorkflow(workflowData: { user_id: string; name: string; description?: string; triggers?: Record<string, any>[]; actions?: Record<string, any>[]; conditions?: Record<string, any>; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('automation_workflows').insert({ ...workflowData, is_active: workflowData.is_active ?? false, run_count: 0, last_run_at: null, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAutomationWorkflow(workflowId: string, updates: Partial<{ name: string; description: string; triggers: Record<string, any>[]; actions: Record<string, any>[]; conditions: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('automation_workflows').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', workflowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAutomationWorkflow(workflowId: string) {
  try { const supabase = await createClient(); await supabase.from('automation_logs').delete().eq('workflow_id', workflowId); await supabase.from('automation_actions').delete().eq('workflow_id', workflowId); await supabase.from('automation_triggers').delete().eq('workflow_id', workflowId); const { error } = await supabase.from('automation_workflows').delete().eq('id', workflowId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAutomationWorkflows(options?: { user_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('automation_workflows').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleAutomationWorkflow(workflowId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('automation_workflows').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', workflowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function runAutomationWorkflow(workflowId: string, triggerData?: Record<string, any>) {
  try { const supabase = await createClient(); await supabase.from('automation_logs').insert({ workflow_id: workflowId, trigger_data: triggerData, status: 'running', started_at: new Date().toISOString() }); await supabase.from('automation_workflows').update({ run_count: supabase.rpc('increment', { x: 1 }), last_run_at: new Date().toISOString() }).eq('id', workflowId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAutomationLogs(workflowId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('automation_logs').select('*').eq('workflow_id', workflowId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAutomationStats(userId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('automation_workflows').select('is_active, run_count').eq('user_id', userId); if (!data) return { success: true, data: { total: 0, active: 0, inactive: 0, totalRuns: 0 } }; const total = data.length; const active = data.filter(w => w.is_active).length; const inactive = total - active; const totalRuns = data.reduce((sum, w) => sum + (w.run_count || 0), 0); return { success: true, data: { total, active, inactive, totalRuns } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { total: 0, active: 0, inactive: 0, totalRuns: 0 } } }
}

export async function duplicateAutomationWorkflow(workflowId: string, userId: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('automation_workflows').select('*').eq('id', workflowId).single(); if (!original) return { success: false, error: 'Workflow not found' }; const { data, error } = await supabase.from('automation_workflows').insert({ ...original, id: undefined, user_id: userId, name: `${original.name} (Copy)`, is_active: false, run_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
