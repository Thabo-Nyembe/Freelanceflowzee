'use server'

/**
 * Extended Priority Server Actions - Covers all Priority-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPriority(priorityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('priorities').select('*').eq('id', priorityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPriority(priorityData: { name: string; level: number; color?: string; icon?: string; description?: string; is_default?: boolean; entity_type?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); if (priorityData.is_default) { await supabase.from('priorities').update({ is_default: false }).eq('entity_type', priorityData.entity_type || 'default'); } const { data, error } = await supabase.from('priorities').insert({ ...priorityData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePriority(priorityId: string, updates: Partial<{ name: string; level: number; color: string; icon: string; description: string; is_default: boolean }>) {
  try { const supabase = await createClient(); if (updates.is_default) { const { data: existing } = await supabase.from('priorities').select('entity_type').eq('id', priorityId).single(); if (existing) { await supabase.from('priorities').update({ is_default: false }).eq('entity_type', existing.entity_type); } } const { data, error } = await supabase.from('priorities').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', priorityId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePriority(priorityId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('priorities').delete().eq('id', priorityId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPriorities(options?: { entityType?: string; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('priorities').select('*'); if (options?.entityType) query = query.eq('entity_type', options.entityType); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('level', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDefaultPriority(entityType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('priorities').select('*').eq('is_default', true); if (entityType) query = query.eq('entity_type', entityType); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setEntityPriority(entityType: string, entityId: string, priorityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('entity_priorities').upsert({ entity_type: entityType, entity_id: entityId, priority_id: priorityId, updated_at: new Date().toISOString() }, { onConflict: 'entity_type,entity_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEntityPriority(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('entity_priorities').select('priority_id, priorities(*)').eq('entity_type', entityType).eq('entity_id', entityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data?.priorities || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderPriorities(priorities: Array<{ id: string; level: number }>) {
  try { const supabase = await createClient(); for (const p of priorities) { await supabase.from('priorities').update({ level: p.level }).eq('id', p.id); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
