'use server'

/**
 * Extended Changelog Server Actions - Covers all Changelog-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getChangelog(changelogId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('changelogs').select('*').eq('id', changelogId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createChangelog(changelogData: { version: string; title: string; description?: string; content?: string; changes?: Array<{ type: string; description: string; breaking?: boolean }>; release_date?: string; is_published?: boolean; user_id?: string; product_id?: string; tags?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('changelogs').insert({ ...changelogData, is_published: changelogData.is_published ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateChangelog(changelogId: string, updates: Partial<{ title: string; description: string; content: string; changes: Array<{ type: string; description: string; breaking?: boolean }>; release_date: string; is_published: boolean; tags: string[] }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('changelogs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', changelogId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteChangelog(changelogId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('changelogs').delete().eq('id', changelogId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishChangelog(changelogId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('changelogs').update({ is_published: true, published_at: new Date().toISOString() }).eq('id', changelogId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpublishChangelog(changelogId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('changelogs').update({ is_published: false, published_at: null }).eq('id', changelogId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChangelogs(options?: { productId?: string; isPublished?: boolean; limit?: number; offset?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('changelogs').select('*'); if (options?.productId) query = query.eq('product_id', options.productId); if (options?.isPublished !== undefined) query = query.eq('is_published', options.isPublished); const { data, error } = await query.order('release_date', { ascending: false }).range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 20) - 1); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLatestChangelog(productId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('changelogs').select('*').eq('is_published', true); if (productId) query = query.eq('product_id', productId); const { data, error } = await query.order('release_date', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChangelogsByTag(tag: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('changelogs').select('*').contains('tags', [tag]).eq('is_published', true).order('release_date', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function searchChangelogs(query: string, options?: { productId?: string; limit?: number }) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('changelogs').select('*').eq('is_published', true).or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`); if (options?.productId) dbQuery = dbQuery.eq('product_id', options.productId); const { data, error } = await dbQuery.order('release_date', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
