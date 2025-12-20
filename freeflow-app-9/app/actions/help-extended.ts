'use server'

/**
 * Extended Help Server Actions - Covers all 4 Help-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getHelpArticles(categoryId?: string, publishedOnly = true) {
  try { const supabase = await createClient(); let query = supabase.from('help_articles').select('*').order('title', { ascending: true }); if (categoryId) query = query.eq('category_id', categoryId); if (publishedOnly) query = query.eq('is_published', true); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getHelpArticle(articleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_articles').select('*').eq('id', articleId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createHelpArticle(input: { title: string; content: string; category_id?: string; slug?: string; meta_description?: string }) {
  try { const supabase = await createClient(); const slug = input.slug || input.title.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('help_articles').insert({ ...input, slug, is_published: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateHelpArticle(articleId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_articles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', articleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishHelpArticle(articleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_articles').update({ is_published: true, published_at: new Date().toISOString() }).eq('id', articleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpublishHelpArticle(articleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_articles').update({ is_published: false }).eq('id', articleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteHelpArticle(articleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('help_articles').delete().eq('id', articleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchHelpArticles(query: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_articles').select('*').eq('is_published', true).or(`title.ilike.%${query}%,content.ilike.%${query}%`).order('title', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getHelpCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_categories').select('*').order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createHelpCategory(input: { name: string; description?: string; slug?: string; icon?: string; order_index?: number }) {
  try { const supabase = await createClient(); const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('help_categories').insert({ ...input, slug }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateHelpCategory(categoryId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_categories').update(updates).eq('id', categoryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteHelpCategory(categoryId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('help_categories').delete().eq('id', categoryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHelpDocs(categoryId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('help_docs').select('*').order('title', { ascending: true }); if (categoryId) query = query.eq('category_id', categoryId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createHelpDoc(input: { title: string; content: string; category_id?: string; slug?: string }) {
  try { const supabase = await createClient(); const slug = input.slug || input.title.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('help_docs').insert({ ...input, slug }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateHelpDoc(docId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_docs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', docId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHelpFeedback(articleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_feedback').select('*').eq('article_id', articleId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function submitHelpFeedback(articleId: string, userId: string | null, input: { helpful: boolean; comment?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_feedback').insert({ article_id: articleId, user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHelpFeedbackStats(articleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('help_feedback').select('helpful').eq('article_id', articleId); if (error) throw error; const helpful = data?.filter(f => f.helpful).length || 0; const notHelpful = data?.filter(f => !f.helpful).length || 0; return { success: true, data: { helpful, notHelpful, total: data?.length || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
