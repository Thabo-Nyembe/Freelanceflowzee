'use server'

/**
 * Extended Pipelines Server Actions
 * Tables: pipelines, pipeline_stages, pipeline_items, pipeline_automations, pipeline_triggers, pipeline_metrics
 */

import { createClient } from '@/lib/supabase/server'

export async function getPipeline(pipelineId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pipelines').select('*, pipeline_stages(*), pipeline_automations(*)').eq('id', pipelineId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPipeline(pipelineData: { name: string; description?: string; type: string; organization_id?: string; owner_id: string; settings?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pipelines').insert({ ...pipelineData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePipeline(pipelineId: string, updates: Partial<{ name: string; description: string; status: string; settings: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pipelines').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', pipelineId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePipeline(pipelineId: string) {
  try { const supabase = await createClient(); await supabase.from('pipeline_items').delete().eq('pipeline_id', pipelineId); await supabase.from('pipeline_stages').delete().eq('pipeline_id', pipelineId); await supabase.from('pipeline_automations').delete().eq('pipeline_id', pipelineId); await supabase.from('pipeline_triggers').delete().eq('pipeline_id', pipelineId); const { error } = await supabase.from('pipelines').delete().eq('id', pipelineId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPipelines(options?: { organization_id?: string; owner_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('pipelines').select('*, pipeline_stages(count), pipeline_items(count)'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addStage(pipelineId: string, stageData: { name: string; order: number; color?: string; probability?: number; settings?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pipeline_stages').insert({ pipeline_id: pipelineId, ...stageData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStage(stageId: string, updates: Partial<{ name: string; order: number; color: string; probability: number; settings: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pipeline_stages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', stageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStage(stageId: string) {
  try { const supabase = await createClient(); await supabase.from('pipeline_items').update({ stage_id: null }).eq('stage_id', stageId); const { error } = await supabase.from('pipeline_stages').delete().eq('id', stageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStages(pipelineId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pipeline_stages').select('*, pipeline_items(count)').eq('pipeline_id', pipelineId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addItem(pipelineId: string, itemData: { stage_id: string; title: string; description?: string; value?: number; entity_type?: string; entity_id?: string; owner_id?: string; priority?: string; due_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pipeline_items').insert({ pipeline_id: pipelineId, ...itemData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateItem(itemId: string, updates: Partial<{ stage_id: string; title: string; description: string; value: number; priority: string; due_date: string; status: string; owner_id: string }>) {
  try { const supabase = await createClient(); const { data: oldItem } = await supabase.from('pipeline_items').select('stage_id').eq('id', itemId).single(); const { data, error } = await supabase.from('pipeline_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; if (updates.stage_id && oldItem && updates.stage_id !== oldItem.stage_id) { await supabase.from('pipeline_metrics').insert({ pipeline_id: data.pipeline_id, item_id: itemId, from_stage_id: oldItem.stage_id, to_stage_id: updates.stage_id, moved_at: new Date().toISOString() }) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function moveItem(itemId: string, toStageId: string, position?: number) {
  try { const supabase = await createClient(); const { data: item, error: fetchError } = await supabase.from('pipeline_items').select('stage_id, pipeline_id').eq('id', itemId).single(); if (fetchError) throw fetchError; const { data, error } = await supabase.from('pipeline_items').update({ stage_id: toStageId, position, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; await supabase.from('pipeline_metrics').insert({ pipeline_id: item.pipeline_id, item_id: itemId, from_stage_id: item.stage_id, to_stage_id: toStageId, moved_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getItems(pipelineId: string, options?: { stage_id?: string; status?: string; owner_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('pipeline_items').select('*, pipeline_stages(*)').eq('pipeline_id', pipelineId); if (options?.stage_id) query = query.eq('stage_id', options.stage_id); if (options?.status) query = query.eq('status', options.status); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); const { data, error } = await query.order('position', { ascending: true }).order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAutomation(pipelineId: string, automationData: { name: string; trigger_type: string; trigger_config: any; action_type: string; action_config: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pipeline_automations').insert({ pipeline_id: pipelineId, ...automationData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAutomation(automationId: string, updates: Partial<{ name: string; trigger_config: any; action_config: any; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pipeline_automations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', automationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPipelineMetrics(pipelineId: string, options?: { from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('pipeline_metrics').select('*, pipeline_stages!from_stage_id(*), pipeline_stages!to_stage_id(*)').eq('pipeline_id', pipelineId); if (options?.from_date) query = query.gte('moved_at', options.from_date); if (options?.to_date) query = query.lte('moved_at', options.to_date); const { data, error } = await query.order('moved_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
