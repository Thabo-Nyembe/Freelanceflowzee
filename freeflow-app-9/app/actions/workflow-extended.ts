'use server'

/**
 * Extended Workflow Server Actions - Covers all 9 Workflow-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getWorkflowActionLogs(workflowId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_action_logs').select('*').eq('workflow_id', workflowId).order('created_at', { ascending: false }).limit(limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logWorkflowAction(workflowId: string, actionId: string, status: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_action_logs').insert({ workflow_id: workflowId, action_id: actionId, status, details }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkflowActions(workflowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_actions').select('*').eq('workflow_id', workflowId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createWorkflowAction(workflowId: string, input: { name: string; type: string; config: any; order_index: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_actions').insert({ workflow_id: workflowId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWorkflowAction(actionId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_actions').update(updates).eq('id', actionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWorkflowAction(actionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('workflow_actions').delete().eq('id', actionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkflowEventSubscriptions(workflowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_event_subscriptions').select('*').eq('workflow_id', workflowId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function subscribeToWorkflowEvent(workflowId: string, eventType: string, config?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_event_subscriptions').insert({ workflow_id: workflowId, event_type: eventType, config, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unsubscribeFromWorkflowEvent(subscriptionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_event_subscriptions').update({ is_active: false }).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkflowExecutions(workflowId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_executions').select('*').eq('workflow_id', workflowId).order('started_at', { ascending: false }).limit(limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startWorkflowExecution(workflowId: string, triggeredBy: string, input?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_executions').insert({ workflow_id: workflowId, triggered_by: triggeredBy, input, status: 'running', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWorkflowExecution(executionId: string, status: string, output?: any) {
  try { const supabase = await createClient(); const updates: any = { status }; if (status === 'completed' || status === 'failed') updates.completed_at = new Date().toISOString(); if (output) updates.output = output; const { data, error } = await supabase.from('workflow_executions').update(updates).eq('id', executionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkflowLogs(executionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_logs').select('*').eq('execution_id', executionId).order('timestamp', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addWorkflowLog(executionId: string, level: string, message: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_logs').insert({ execution_id: executionId, level, message, details, timestamp: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkflowSchedules(workflowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_schedules').select('*').eq('workflow_id', workflowId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createWorkflowSchedule(workflowId: string, input: { cron_expression: string; timezone?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_schedules').insert({ workflow_id: workflowId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleWorkflowSchedule(scheduleId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_schedules').update({ is_active: isActive }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWorkflowSchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('workflow_schedules').delete().eq('id', scheduleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkflowTemplates(userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('workflow_templates').select('*').order('name', { ascending: true })
    if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createWorkflowTemplate(userId: string, input: { name: string; description?: string; template_data: any; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_templates').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkflowVariables(workflowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_variables').select('*').eq('workflow_id', workflowId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setWorkflowVariable(workflowId: string, name: string, value: any, varType?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_variables').upsert({ workflow_id: workflowId, name, value, type: varType }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWorkflowVariable(workflowId: string, name: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('workflow_variables').delete().eq('workflow_id', workflowId).eq('name', name); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkflowWebhooks(workflowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_webhooks').select('*').eq('workflow_id', workflowId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createWorkflowWebhook(workflowId: string, input: { url: string; method?: string; headers?: any; secret?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_webhooks').insert({ workflow_id: workflowId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleWorkflowWebhook(webhookId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workflow_webhooks').update({ is_active: isActive }).eq('id', webhookId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
