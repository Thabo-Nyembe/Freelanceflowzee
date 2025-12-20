'use server'

/**
 * Extended Tags Server Actions
 * Tables: tags, tag_groups, tag_assignments, tag_rules, tag_suggestions, tag_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getTag(tagId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tags').select('*, tag_groups(*), tag_assignments(count)').eq('id', tagId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTag(tagData: { name: string; slug?: string; description?: string; group_id?: string; color?: string; icon?: string; is_system?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const slug = tagData.slug || tagData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); const { data, error } = await supabase.from('tags').insert({ ...tagData, slug, is_system: tagData.is_system ?? false, usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTag(tagId: string, updates: Partial<{ name: string; description: string; group_id: string; color: string; icon: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tags').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tagId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTag(tagId: string) {
  try { const supabase = await createClient(); await supabase.from('tag_assignments').delete().eq('tag_id', tagId); const { error } = await supabase.from('tags').delete().eq('id', tagId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTags(options?: { group_id?: string; entity_type?: string; is_system?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tags').select('*, tag_groups(*), tag_assignments(count)'); if (options?.group_id) query = query.eq('group_id', options.group_id); if (options?.is_system !== undefined) query = query.eq('is_system', options.is_system); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTagGroup(groupData: { name: string; description?: string; color?: string; is_exclusive?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tag_groups').insert({ ...groupData, is_exclusive: groupData.is_exclusive ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTagGroups(options?: { is_exclusive?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('tag_groups').select('*, tags(count)'); if (options?.is_exclusive !== undefined) query = query.eq('is_exclusive', options.is_exclusive); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignTag(entityType: string, entityId: string, tagId: string, assignedBy?: string) {
  try { const supabase = await createClient(); const { data: tag } = await supabase.from('tags').select('group_id, tag_groups(is_exclusive)').eq('id', tagId).single(); if (tag?.tag_groups?.is_exclusive) { const { data: groupTags } = await supabase.from('tags').select('id').eq('group_id', tag.group_id); const tagIds = groupTags?.map(t => t.id) || []; await supabase.from('tag_assignments').delete().eq('entity_type', entityType).eq('entity_id', entityId).in('tag_id', tagIds) } const { data, error } = await supabase.from('tag_assignments').upsert({ entity_type: entityType, entity_id: entityId, tag_id: tagId, assigned_by: assignedBy, assigned_at: new Date().toISOString() }, { onConflict: 'entity_type,entity_id,tag_id' }).select().single(); if (error) throw error; await updateTagUsageCount(tagId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeTag(entityType: string, entityId: string, tagId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('tag_assignments').delete().eq('entity_type', entityType).eq('entity_id', entityId).eq('tag_id', tagId); if (error) throw error; await updateTagUsageCount(tagId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateTagUsageCount(tagId: string) {
  const supabase = await createClient()
  const { count } = await supabase.from('tag_assignments').select('*', { count: 'exact', head: true }).eq('tag_id', tagId)
  await supabase.from('tags').update({ usage_count: count || 0, updated_at: new Date().toISOString() }).eq('id', tagId)
}

export async function getEntityTags(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tag_assignments').select('*, tags(*, tag_groups(*))').eq('entity_type', entityType).eq('entity_id', entityId); if (error) throw error; return { success: true, data: (data || []).map(a => a.tags) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEntitiesByTag(tagId: string, entityType?: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tag_assignments').select('entity_type, entity_id, assigned_at').eq('tag_id', tagId); if (entityType) query = query.eq('entity_type', entityType); const { data, error } = await query.order('assigned_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bulkAssignTags(entityType: string, entityId: string, tagIds: string[], assignedBy?: string) {
  try { const supabase = await createClient(); const assignments = tagIds.map(tagId => ({ entity_type: entityType, entity_id: entityId, tag_id: tagId, assigned_by: assignedBy, assigned_at: new Date().toISOString() })); const { error } = await supabase.from('tag_assignments').upsert(assignments, { onConflict: 'entity_type,entity_id,tag_id' }); if (error) throw error; for (const tagId of tagIds) { await updateTagUsageCount(tagId) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPopularTags(options?: { entity_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tags').select('*, tag_groups(*)'); if (options?.entity_type) { const { data: assignments } = await supabase.from('tag_assignments').select('tag_id').eq('entity_type', options.entity_type); const tagIds = [...new Set(assignments?.map(a => a.tag_id) || [])]; if (tagIds.length > 0) query = query.in('id', tagIds) } const { data, error } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function suggestTags(entityType: string, content: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 2); const { data, error } = await supabase.from('tags').select('*').or(words.map(w => `name.ilike.%${w}%`).join(',')).limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

