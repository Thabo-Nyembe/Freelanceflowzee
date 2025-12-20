'use server'

/**
 * Extended Content Server Actions - Covers all Content-related tables
 * Tables: content, content_blocks, content_versions, content_categories
 */

import { createClient } from '@/lib/supabase/server'

export async function getContent(contentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content').select('*, content_blocks(*), content_categories(*)').eq('id', contentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createContent(contentData: { title: string; slug?: string; content_type: string; user_id: string; body?: string; excerpt?: string; featured_image?: string; status?: string; category_id?: string; tags?: string[]; metadata?: Record<string, any>; seo?: Record<string, any> }) {
  try { const supabase = await createClient(); const slug = contentData.slug || contentData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); const { data, error } = await supabase.from('content').insert({ ...contentData, slug, status: contentData.status || 'draft', view_count: 0, like_count: 0, comment_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateContent(contentId: string, updates: Partial<{ title: string; slug: string; body: string; excerpt: string; featured_image: string; status: string; category_id: string; tags: string[]; metadata: Record<string, any>; seo: Record<string, any>; published_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', contentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteContent(contentId: string) {
  try { const supabase = await createClient(); await supabase.from('content_blocks').delete().eq('content_id', contentId); await supabase.from('content_versions').delete().eq('content_id', contentId); const { error } = await supabase.from('content').delete().eq('id', contentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContents(filters: { user_id?: string; content_type?: string; status?: string; category_id?: string; tag?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('content').select('*, content_categories(*)'); if (filters.user_id) query = query.eq('user_id', filters.user_id); if (filters.content_type) query = query.eq('content_type', filters.content_type); if (filters.status) query = query.eq('status', filters.status); if (filters.category_id) query = query.eq('category_id', filters.category_id); if (filters.tag) query = query.contains('tags', [filters.tag]); const { data, error } = await query.order('created_at', { ascending: false }).limit(filters.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publishContent(contentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content').update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', contentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpublishContent(contentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content').update({ status: 'draft', updated_at: new Date().toISOString() }).eq('id', contentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createContentBlock(blockData: { content_id: string; block_type: string; content: Record<string, any>; order: number; settings?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content_blocks').insert({ ...blockData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateContentBlock(blockId: string, updates: Partial<{ block_type: string; content: Record<string, any>; order: number; settings: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content_blocks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', blockId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteContentBlock(blockId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('content_blocks').delete().eq('id', blockId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderContentBlocks(contentId: string, blockOrders: { id: string; order: number }[]) {
  try { const supabase = await createClient(); for (const block of blockOrders) { await supabase.from('content_blocks').update({ order: block.order, updated_at: new Date().toISOString() }).eq('id', block.id) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContentBlocks(contentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content_blocks').select('*').eq('content_id', contentId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createContentVersion(versionData: { content_id: string; version_number: number; body: string; metadata?: Record<string, any>; created_by: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content_versions').insert({ ...versionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContentVersions(contentId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content_versions').select('*').eq('content_id', contentId).order('version_number', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function restoreContentVersion(contentId: string, versionId: string) {
  try { const supabase = await createClient(); const { data: version } = await supabase.from('content_versions').select('body, metadata').eq('id', versionId).single(); if (!version) return { success: false, error: 'Version not found' }; const { data, error } = await supabase.from('content').update({ body: version.body, metadata: version.metadata, updated_at: new Date().toISOString() }).eq('id', contentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContentCategory(categoryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content_categories').select('*').eq('id', categoryId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContentCategories(options?: { parent_id?: string | null }) {
  try { const supabase = await createClient(); let query = supabase.from('content_categories').select('*'); if (options?.parent_id === null) { query = query.is('parent_id', null) } else if (options?.parent_id) { query = query.eq('parent_id', options.parent_id) } const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createContentCategory(categoryData: { name: string; slug?: string; description?: string; parent_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); const { data, error } = await supabase.from('content_categories').insert({ ...categoryData, slug, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementViewCount(contentId: string) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('content').select('view_count').eq('id', contentId).single(); const { data, error } = await supabase.from('content').update({ view_count: (current?.view_count || 0) + 1 }).eq('id', contentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchContent(query: string, options?: { content_type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('content').select('*, content_categories(*)').or(`title.ilike.%${query}%,body.ilike.%${query}%,excerpt.ilike.%${query}%`); if (options?.content_type) dbQuery = dbQuery.eq('content_type', options.content_type); if (options?.status) dbQuery = dbQuery.eq('status', options.status); const { data, error } = await dbQuery.order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getContentBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('content').select('*, content_blocks(*), content_categories(*)').eq('slug', slug).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
