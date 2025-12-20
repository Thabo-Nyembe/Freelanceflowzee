'use server'

/**
 * Extended Agent Server Actions - Covers all Agent-related tables
 * Tables: agent_configuration, agent_configurations, agent_executions, agent_logs, agent_metrics
 */

import { createClient } from '@/lib/supabase/server'

export async function getAgentConfiguration(configId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('agent_configurations').select('*').eq('id', configId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAgentConfiguration(configData: { name: string; agent_type: string; config: Record<string, any>; is_active?: boolean; user_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('agent_configurations').insert({ ...configData, is_active: configData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAgentConfiguration(configId: string, updates: Partial<{ name: string; config: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('agent_configurations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', configId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAgentConfiguration(configId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('agent_configurations').delete().eq('id', configId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAgentConfigurations(options?: { agentType?: string; isActive?: boolean; userId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('agent_configurations').select('*'); if (options?.agentType) query = query.eq('agent_type', options.agentType); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.userId) query = query.eq('user_id', options.userId); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAgentExecution(executionData: { agent_config_id: string; input: Record<string, any>; status?: string; user_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('agent_executions').insert({ ...executionData, status: executionData.status || 'pending', started_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAgentExecution(executionId: string, updates: Partial<{ status: string; output: Record<string, any>; error_message: string }>) {
  try { const supabase = await createClient(); const updateData: any = { ...updates, updated_at: new Date().toISOString() }; if (updates.status === 'completed' || updates.status === 'failed') updateData.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('agent_executions').update(updateData).eq('id', executionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAgentExecutions(options?: { agentConfigId?: string; status?: string; userId?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('agent_executions').select('*, agent_configurations(name, agent_type)'); if (options?.agentConfigId) query = query.eq('agent_config_id', options.agentConfigId); if (options?.status) query = query.eq('status', options.status); if (options?.userId) query = query.eq('user_id', options.userId); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAgentLog(logData: { agent_execution_id: string; level: string; message: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('agent_logs').insert({ ...logData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAgentLogs(executionId: string, options?: { level?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('agent_logs').select('*').eq('agent_execution_id', executionId); if (options?.level) query = query.eq('level', options.level); const { data, error } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordAgentMetrics(metricsData: { agent_config_id: string; execution_count: number; success_count: number; failure_count: number; avg_duration_ms: number; period_start: string; period_end: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('agent_metrics').insert({ ...metricsData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAgentMetrics(agentConfigId: string, options?: { startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('agent_metrics').select('*').eq('agent_config_id', agentConfigId); if (options?.startDate) query = query.gte('period_start', options.startDate); if (options?.endDate) query = query.lte('period_end', options.endDate); const { data, error } = await query.order('period_start', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAgentStats(agentConfigId: string) {
  try { const supabase = await createClient(); const { data: executions } = await supabase.from('agent_executions').select('status').eq('agent_config_id', agentConfigId); const total = executions?.length || 0; const completed = executions?.filter(e => e.status === 'completed').length || 0; const failed = executions?.filter(e => e.status === 'failed').length || 0; const pending = executions?.filter(e => e.status === 'pending' || e.status === 'running').length || 0; return { success: true, data: { total, completed, failed, pending, successRate: total > 0 ? (completed / total * 100).toFixed(1) : '0' } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
