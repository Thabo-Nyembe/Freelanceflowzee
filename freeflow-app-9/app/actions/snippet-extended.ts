'use server'

/**
 * Extended Snippet Server Actions - Covers all Snippet-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSnippet(snippetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('snippets').select('*').eq('id', snippetId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSnippet(snippetData: { name: string; language: string; code: string; description?: string; tags?: string[]; is_public?: boolean; category?: string; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('snippets').insert({ ...snippetData, is_public: snippetData.is_public ?? false, usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSnippet(snippetId: string, updates: Partial<{ name: string; code: string; description: string; tags: string[]; is_public: boolean; category: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('snippets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', snippetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSnippet(snippetId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('snippets').delete().eq('id', snippetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSnippets(options?: { language?: string; category?: string; isPublic?: boolean; tags?: string[]; workspaceId?: string; userId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('snippets').select('*'); if (options?.language) query = query.eq('language', options.language); if (options?.category) query = query.eq('category', options.category); if (options?.isPublic !== undefined) query = query.eq('is_public', options.isPublic); if (options?.tags?.length) query = query.overlaps('tags', options.tags); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); if (options?.userId) query = query.eq('user_id', options.userId); const { data, error } = await query.order('usage_count', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function incrementSnippetUsage(snippetId: string) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('snippets').select('usage_count').eq('id', snippetId).single(); const { data, error } = await supabase.from('snippets').update({ usage_count: (current?.usage_count || 0) + 1, last_used_at: new Date().toISOString() }).eq('id', snippetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchSnippets(searchTerm: string, options?: { language?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('snippets').select('*').or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`); if (options?.language) query = query.eq('language', options.language); const { data, error } = await query.order('usage_count', { ascending: false }).limit(50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPopularSnippets(limit = 20, language?: string) {
  try { const supabase = await createClient(); let query = supabase.from('snippets').select('*').eq('is_public', true); if (language) query = query.eq('language', language); const { data, error } = await query.order('usage_count', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function duplicateSnippet(snippetId: string, newName?: string) {
  try { const supabase = await createClient(); const { data: original, error: fetchError } = await supabase.from('snippets').select('*').eq('id', snippetId).single(); if (fetchError) throw fetchError; const { id, created_at, updated_at, usage_count, last_used_at, ...snippetData } = original; const { data, error } = await supabase.from('snippets').insert({ ...snippetData, name: newName || `${original.name} (Copy)`, usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
