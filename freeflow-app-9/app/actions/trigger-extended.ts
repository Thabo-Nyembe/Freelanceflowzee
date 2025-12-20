'use server'

/**
 * Extended Trigger Server Actions - Covers all Trigger-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTrigger(triggerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('triggers').select('*').eq('id', triggerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTrigger(triggerData: { name: string; trigger_type: string; event_type: string; entity_type?: string; conditions?: Record<string, any>; actions?: Array<{ action_type: string; config: Record<string, any> }>; priority?: number; user_id?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('triggers').insert({ ...triggerData, is_active: true, execution_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTrigger(triggerId: string, updates: Partial<{ name: string; conditions: Record<string, any>; actions: Array<{ action_type: string; config: Record<string, any> }>; priority: number; is_active: boolean; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('triggers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', triggerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTrigger(triggerId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('triggers').delete().eq('id', triggerId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function activateTrigger(triggerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('triggers').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', triggerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateTrigger(triggerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('triggers').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', triggerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function executeTrigger(triggerId: string, context: Record<string, any>) {
  try { const supabase = await createClient(); const { data: trigger } = await supabase.from('triggers').select('*').eq('id', triggerId).eq('is_active', true).single(); if (!trigger) return { success: false, error: 'Trigger not found or inactive' }; await supabase.from('triggers').update({ execution_count: trigger.execution_count + 1, last_executed_at: new Date().toISOString() }).eq('id', triggerId); await supabase.from('trigger_executions').insert({ trigger_id: triggerId, context, status: 'completed', executed_at: new Date().toISOString() }); return { success: true, actions: trigger.actions } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTriggersForEvent(eventType: string, entityType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('triggers').select('*').eq('event_type', eventType).eq('is_active', true); if (entityType) query = query.eq('entity_type', entityType); const { data, error } = await query.order('priority', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserTriggers(userId: string, options?: { isActive?: boolean; triggerType?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('triggers').select('*').eq('user_id', userId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.triggerType) query = query.eq('trigger_type', options.triggerType); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTriggerExecutions(triggerId: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trigger_executions').select('*').eq('trigger_id', triggerId).order('executed_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
