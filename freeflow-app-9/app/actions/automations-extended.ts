'use server'

/**
 * Extended Automations Server Actions - Covers all Automation-related tables
 * Tables: automation, automations
 */

import { createClient } from '@/lib/supabase/server'

export async function getAutomation(automationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('automations').select('*').eq('id', automationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAutomation(automationData: { name: string; description?: string; user_id: string; trigger_type: string; trigger_config: Record<string, any>; actions: Record<string, any>[]; conditions?: Record<string, any>[]; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('automations').insert({ ...automationData, is_active: automationData.is_active ?? true, run_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAutomation(automationId: string, updates: Partial<{ name: string; description: string; trigger_type: string; trigger_config: Record<string, any>; actions: Record<string, any>[]; conditions: Record<string, any>[]; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('automations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', automationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAutomation(automationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('automations').delete().eq('id', automationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAutomations(userId: string, options?: { isActive?: boolean; triggerType?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('automations').select('*').eq('user_id', userId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.triggerType) query = query.eq('trigger_type', options.triggerType); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleAutomation(automationId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('automations').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', automationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function runAutomation(automationId: string) {
  try { const supabase = await createClient(); const { data: automation } = await supabase.from('automations').select('*').eq('id', automationId).single(); if (!automation) return { success: false, error: 'Automation not found' }; if (!automation.is_active) return { success: false, error: 'Automation is not active' }; const runLog = { automation_id: automationId, status: 'running', started_at: new Date().toISOString() }; const { data: log } = await supabase.from('automation_runs').insert(runLog).select().single(); await supabase.from('automations').update({ run_count: automation.run_count + 1, last_run_at: new Date().toISOString() }).eq('id', automationId); return { success: true, data: { automation, runId: log?.id } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeAutomationRun(runId: string, status: 'completed' | 'failed', result?: Record<string, any>, errorMessage?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('automation_runs').update({ status, result, error_message: errorMessage, completed_at: new Date().toISOString() }).eq('id', runId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAutomationRuns(automationId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('automation_runs').select('*').eq('automation_id', automationId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function duplicateAutomation(automationId: string, newName?: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('automations').select('*').eq('id', automationId).single(); if (!original) return { success: false, error: 'Automation not found' }; const { id, created_at, updated_at, run_count, last_run_at, ...rest } = original; const { data, error } = await supabase.from('automations').insert({ ...rest, name: newName || `${original.name} (Copy)`, is_active: false, run_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAutomationStats(userId: string) {
  try { const supabase = await createClient(); const { data: automations } = await supabase.from('automations').select('id, is_active, run_count').eq('user_id', userId); const total = automations?.length || 0; const active = automations?.filter(a => a.is_active).length || 0; const totalRuns = automations?.reduce((sum, a) => sum + (a.run_count || 0), 0) || 0; return { success: true, data: { total, active, inactive: total - active, totalRuns } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAutomationsByTrigger(triggerType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('automations').select('*').eq('trigger_type', triggerType).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
