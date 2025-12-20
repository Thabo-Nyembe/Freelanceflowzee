'use server'

/**
 * Extended Label Server Actions - Covers all Label-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getLabel(labelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('labels').select('*').eq('id', labelId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLabel(labelData: { name: string; color?: string; description?: string; label_type?: string; icon?: string; is_system?: boolean; parent_id?: string; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('labels').insert({ ...labelData, usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLabel(labelId: string, updates: Partial<{ name: string; color: string; description: string; icon: string; parent_id: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('labels').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', labelId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLabel(labelId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('labels').delete().eq('id', labelId).eq('is_system', false); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function applyLabel(entityType: string, entityId: string, labelId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('entity_labels').upsert({ entity_type: entityType, entity_id: entityId, label_id: labelId, applied_at: new Date().toISOString() }, { onConflict: 'entity_type,entity_id,label_id' }); if (error) throw error; await supabase.from('labels').update({ usage_count: supabase.rpc('increment_label_usage', { label_id: labelId }) }).eq('id', labelId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeLabel(entityType: string, entityId: string, labelId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('entity_labels').delete().eq('entity_type', entityType).eq('entity_id', entityId).eq('label_id', labelId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLabels(options?: { labelType?: string; workspaceId?: string; parentId?: string; includeSystem?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('labels').select('*'); if (options?.labelType) query = query.eq('label_type', options.labelType); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); if (options?.parentId) query = query.eq('parent_id', options.parentId); if (!options?.includeSystem) query = query.eq('is_system', false); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEntityLabels(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('entity_labels').select('label_id, labels(*)').eq('entity_type', entityType).eq('entity_id', entityId); if (error) throw error; return { success: true, data: data?.map(el => el.labels) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function searchLabels(query: string, options?: { labelType?: string; limit?: number }) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('labels').select('*').ilike('name', `%${query}%`); if (options?.labelType) dbQuery = dbQuery.eq('label_type', options.labelType); const { data, error } = await dbQuery.order('usage_count', { ascending: false }).limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bulkApplyLabels(entityType: string, entityId: string, labelIds: string[]) {
  try { const supabase = await createClient(); const records = labelIds.map(labelId => ({ entity_type: entityType, entity_id: entityId, label_id: labelId, applied_at: new Date().toISOString() })); const { error } = await supabase.from('entity_labels').upsert(records, { onConflict: 'entity_type,entity_id,label_id' }); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
