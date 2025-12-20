'use server'

/**
 * Extended Pages Server Actions
 * Tables: pages, page_versions, page_blocks, page_seo, page_permissions, page_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getPage(pageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pages').select('*, page_blocks(*), page_seo(*), page_versions(*)').eq('id', pageId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPageBySlug(slug: string, options?: { organization_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('pages').select('*, page_blocks(*), page_seo(*)').eq('slug', slug).eq('status', 'published'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPage(pageData: { title: string; slug: string; content?: any; type?: string; organization_id?: string; author_id: string; parent_id?: string; template_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pages').insert({ ...pageData, status: 'draft', version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePage(pageId: string, updates: Partial<{ title: string; slug: string; content: any; status: string; metadata: any }>, createVersion: boolean = true) {
  try { const supabase = await createClient(); if (createVersion) { const { data: current } = await supabase.from('pages').select('*').eq('id', pageId).single(); if (current) { await supabase.from('page_versions').insert({ page_id: pageId, version: current.version, title: current.title, content: current.content, created_at: new Date().toISOString() }) } } const { data, error } = await supabase.from('pages').update({ ...updates, version: supabase.sql`version + 1`, updated_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishPage(pageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pages').update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpublishPage(pageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pages').update({ status: 'draft', updated_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePage(pageId: string) {
  try { const supabase = await createClient(); await supabase.from('page_blocks').delete().eq('page_id', pageId); await supabase.from('page_seo').delete().eq('page_id', pageId); await supabase.from('page_versions').delete().eq('page_id', pageId); await supabase.from('page_permissions').delete().eq('page_id', pageId); const { error } = await supabase.from('pages').delete().eq('id', pageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPages(options?: { organization_id?: string; author_id?: string; type?: string; status?: string; parent_id?: string | null; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('pages').select('*'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.author_id) query = query.eq('author_id', options.author_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.parent_id !== undefined) { options.parent_id ? query = query.eq('parent_id', options.parent_id) : query = query.is('parent_id', null) } const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBlock(pageId: string, blockData: { type: string; content: any; order: number; settings?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('page_blocks').insert({ page_id: pageId, ...blockData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBlock(blockId: string, updates: Partial<{ content: any; order: number; settings: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('page_blocks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', blockId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeBlock(blockId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('page_blocks').delete().eq('id', blockId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setSeo(pageId: string, seoData: { title?: string; description?: string; keywords?: string[]; og_image?: string; canonical_url?: string; no_index?: boolean }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('page_seo').select('id').eq('page_id', pageId).single(); if (existing) { const { data, error } = await supabase.from('page_seo').update({ ...seoData, updated_at: new Date().toISOString() }).eq('page_id', pageId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('page_seo').insert({ page_id: pageId, ...seoData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setPermission(pageId: string, permissionData: { user_id?: string; role_id?: string; permission: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('page_permissions').insert({ page_id: pageId, ...permissionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordAnalytics(pageId: string, analyticsData: { view_count?: number; unique_visitors?: number; avg_time_on_page?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('page_analytics').insert({ page_id: pageId, ...analyticsData, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function restoreVersion(pageId: string, versionId: string) {
  try { const supabase = await createClient(); const { data: version, error: versionError } = await supabase.from('page_versions').select('*').eq('id', versionId).single(); if (versionError) throw versionError; const { data: current } = await supabase.from('pages').select('*').eq('id', pageId).single(); if (current) { await supabase.from('page_versions').insert({ page_id: pageId, version: current.version, title: current.title, content: current.content, created_at: new Date().toISOString() }) } const { data, error } = await supabase.from('pages').update({ title: version.title, content: version.content, version: supabase.sql`version + 1`, updated_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
