'use server'

/**
 * Extended Tag Server Actions - Covers all Tag-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTags(tagType?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('tags').select('*').order('name', { ascending: true }); if (tagType) query = query.eq('tag_type', tagType); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTag(tagId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tags').select('*').eq('id', tagId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTagBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tags').select('*').eq('slug', slug).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTag(input: { name: string; slug?: string; description?: string; tag_type?: string; color?: string; icon?: string }) {
  try { const supabase = await createClient(); const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('tags').insert({ ...input, slug, is_active: true, usage_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTag(tagId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tags').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tagId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTag(tagId: string) {
  try { const supabase = await createClient(); await supabase.from('tag_assignments').delete().eq('tag_id', tagId); const { error } = await supabase.from('tags').delete().eq('id', tagId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchTags(query: string, tagType?: string, limit = 20) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('tags').select('*').ilike('name', `%${query}%`).eq('is_active', true).limit(limit); if (tagType) dbQuery = dbQuery.eq('tag_type', tagType); const { data, error } = await dbQuery; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPopularTags(tagType?: string, limit = 20) {
  try { const supabase = await createClient(); let query = supabase.from('tags').select('*').eq('is_active', true).order('usage_count', { ascending: false }).limit(limit); if (tagType) query = query.eq('tag_type', tagType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOrCreateTag(name: string, tagType?: string) {
  try { const supabase = await createClient(); const slug = name.toLowerCase().replace(/\s+/g, '-'); const { data: existing } = await supabase.from('tags').select('*').eq('slug', slug).single(); if (existing) return { success: true, data: existing }; return createTag({ name, slug, tag_type: tagType }); } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTagAssignments(tagId?: string, itemId?: string, itemType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('tag_assignments').select('*, tags(*)').order('created_at', { ascending: false }); if (tagId) query = query.eq('tag_id', tagId); if (itemId) query = query.eq('item_id', itemId); if (itemType) query = query.eq('item_type', itemType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignTag(tagId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('tag_assignments').select('id').eq('tag_id', tagId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('tag_assignments').insert({ tag_id: tagId, item_id: itemId, item_type: itemType }).select().single(); if (error) throw error; const { data: tag } = await supabase.from('tags').select('usage_count').eq('id', tagId).single(); await supabase.from('tags').update({ usage_count: (tag?.usage_count || 0) + 1 }).eq('id', tagId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unassignTag(tagId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('tag_assignments').delete().eq('tag_id', tagId).eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; const { data: tag } = await supabase.from('tags').select('usage_count').eq('id', tagId).single(); await supabase.from('tags').update({ usage_count: Math.max(0, (tag?.usage_count || 1) - 1) }).eq('id', tagId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setItemTags(itemId: string, itemType: string, tagIds: string[]) {
  try { const supabase = await createClient(); await supabase.from('tag_assignments').delete().eq('item_id', itemId).eq('item_type', itemType); if (tagIds.length > 0) { const inserts = tagIds.map(tagId => ({ tag_id: tagId, item_id: itemId, item_type: itemType })); const { error } = await supabase.from('tag_assignments').insert(inserts); if (error) throw error; } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getItemTags(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tag_assignments').select('*, tags(*)').eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true, data: data?.map(ta => (ta as any).tags) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getItemsByTag(tagId: string, itemType?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('tag_assignments').select('item_id, item_type').eq('tag_id', tagId).limit(limit); if (itemType) query = query.eq('item_type', itemType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
