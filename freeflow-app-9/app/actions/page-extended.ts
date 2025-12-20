'use server'

/**
 * Extended Page Server Actions
 * Tables: pages, page_versions, page_components, page_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getPage(pageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pages').select('*').eq('id', pageId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPageBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPage(pageData: { user_id: string; title: string; slug: string; content?: string; template_id?: string; is_published?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pages').insert({ ...pageData, is_published: pageData.is_published ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePage(pageId: string, updates: Partial<{ title: string; slug: string; content: string; template_id: string; is_published: boolean; meta_title: string; meta_description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePage(pageId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('pages').delete().eq('id', pageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPages(options?: { user_id?: string; is_published?: boolean; template_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('pages').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published); if (options?.template_id) query = query.eq('template_id', options.template_id); const { data, error } = await query.order('title', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publishPage(pageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pages').update({ is_published: true, published_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpublishPage(pageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pages').update({ is_published: false, unpublished_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPageVersions(pageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('page_versions').select('*').eq('page_id', pageId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
