'use server'

/**
 * Extended Knowledge Server Actions - Covers all Knowledge-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getKnowledgeBases(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('knowledge_bases').select('*').eq('owner_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getKnowledgeBase(baseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('knowledge_bases').select('*').eq('id', baseId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createKnowledgeBase(userId: string, input: { name: string; description?: string; visibility?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('knowledge_bases').insert({ owner_id: userId, ...input, entry_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateKnowledgeBase(baseId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('knowledge_bases').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', baseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteKnowledgeBase(baseId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('knowledge_bases').delete().eq('id', baseId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKnowledgeEntries(baseId: string, category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('knowledge_entries').select('*').eq('base_id', baseId).order('title', { ascending: true }); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getKnowledgeEntry(entryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('knowledge_entries').select('*').eq('id', entryId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createKnowledgeEntry(baseId: string, authorId: string, input: { title: string; content: string; category?: string; tags?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('knowledge_entries').insert({ base_id: baseId, author_id: authorId, ...input, status: 'published', view_count: 0 }).select().single(); if (error) throw error; await supabase.rpc('increment', { table_name: 'knowledge_bases', column_name: 'entry_count', row_id: baseId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateKnowledgeEntry(entryId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('knowledge_entries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', entryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteKnowledgeEntry(entryId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('knowledge_entries').delete().eq('id', entryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementEntryViewCount(entryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.rpc('increment', { table_name: 'knowledge_entries', column_name: 'view_count', row_id: entryId }); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchKnowledgeEntries(baseId: string, query: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('knowledge_entries').select('*').eq('base_id', baseId).or(`title.ilike.%${query}%,content.ilike.%${query}%`).order('view_count', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
