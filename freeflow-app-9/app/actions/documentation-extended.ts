'use server'

/**
 * Extended Documentation Server Actions
 * Tables: documentation, documentation_versions, documentation_categories, documentation_feedback
 */

import { createClient } from '@/lib/supabase/server'

export async function getDocumentation(docId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('documentation').select('*').eq('id', docId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDocumentation(docData: { title: string; content: string; category_id?: string; author_id?: string; slug?: string; is_published?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('documentation').insert({ ...docData, is_published: docData.is_published ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDocumentation(docId: string, updates: Partial<{ title: string; content: string; category_id: string; slug: string; is_published: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('documentation').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', docId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDocumentation(docId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('documentation').delete().eq('id', docId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocumentationList(options?: { category_id?: string; is_published?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('documentation').select('*'); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('title', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDocumentationCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('documentation_categories').select('*, documentation(count)').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDocumentationVersions(docId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('documentation_versions').select('*').eq('documentation_id', docId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publishDocumentation(docId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('documentation').update({ is_published: true, published_at: new Date().toISOString() }).eq('id', docId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
