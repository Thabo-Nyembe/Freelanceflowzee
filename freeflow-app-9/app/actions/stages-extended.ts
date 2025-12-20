'use server'

/**
 * Extended Stages Server Actions
 * Tables: stages, stage_transitions, stage_rules, stage_assignments, stage_history, stage_automations
 */

import { createClient } from '@/lib/supabase/server'

export async function getStage(stageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stages').select('*, stage_transitions(*), stage_rules(*), stage_automations(*)').eq('id', stageId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStage(stageData: { name: string; description?: string; pipeline_id: string; order_index: number; color?: string; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stages').insert({ ...stageData, is_active: stageData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStage(stageId: string, updates: Partial<{ name: string; description: string; order_index: number; color: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', stageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStage(stageId: string) {
  try { const supabase = await createClient(); await supabase.from('stage_transitions').delete().or(`from_stage_id.eq.${stageId},to_stage_id.eq.${stageId}`); await supabase.from('stage_rules').delete().eq('stage_id', stageId); const { error } = await supabase.from('stages').delete().eq('id', stageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStages(options?: { pipeline_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('stages').select('*, stage_assignments(count)'); if (options?.pipeline_id) query = query.eq('pipeline_id', options.pipeline_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('order_index', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTransition(transitionData: { from_stage_id: string; to_stage_id: string; name?: string; conditions?: any; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stage_transitions').insert({ ...transitionData, is_active: transitionData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTransitions(pipelineId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('stage_transitions').select('*, from_stage:from_stage_id(*), to_stage:to_stage_id(*)'); if (pipelineId) { const { data: stages } = await supabase.from('stages').select('id').eq('pipeline_id', pipelineId); const stageIds = stages?.map(s => s.id) || []; query = query.in('from_stage_id', stageIds) } const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function moveToStage(entityType: string, entityId: string, fromStageId: string, toStageId: string, movedBy?: string) {
  try { const supabase = await createClient(); const { data: transition } = await supabase.from('stage_transitions').select('*').eq('from_stage_id', fromStageId).eq('to_stage_id', toStageId).eq('is_active', true).single(); if (!transition) return { success: false, error: 'Transition not allowed' }; await supabase.from('stage_history').insert({ entity_type: entityType, entity_id: entityId, from_stage_id: fromStageId, to_stage_id: toStageId, moved_by: movedBy, moved_at: new Date().toISOString(), created_at: new Date().toISOString() }); await supabase.from('stage_assignments').upsert({ entity_type: entityType, entity_id: entityId, stage_id: toStageId, assigned_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'entity_type,entity_id' }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStageHistory(entityType: string, entityId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stage_history').select('*, from_stage:from_stage_id(*), to_stage:to_stage_id(*), users(*)').eq('entity_type', entityType).eq('entity_id', entityId).order('moved_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStageRule(ruleData: { stage_id: string; name: string; rule_type: string; conditions: any; actions: any; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stage_rules').insert({ ...ruleData, is_active: ruleData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderStages(pipelineId: string, stageOrders: { id: string; order_index: number }[]) {
  try { const supabase = await createClient(); for (const stage of stageOrders) { await supabase.from('stages').update({ order_index: stage.order_index, updated_at: new Date().toISOString() }).eq('id', stage.id).eq('pipeline_id', pipelineId) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

