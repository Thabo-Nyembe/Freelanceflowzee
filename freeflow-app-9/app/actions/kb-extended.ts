'use server'

/**
 * Extended KB (Knowledge Base) Server Actions - Covers all 12 KB-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getKBArticles(categoryId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('kb_articles').select('*').order('created_at', { ascending: false })
    if (categoryId) query = query.eq('category_id', categoryId)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getKBArticle(articleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_articles').select('*').eq('id', articleId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createKBArticle(input: { title: string; content: string; category_id?: string; author_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_articles').insert({ ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateKBArticle(articleId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_articles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', articleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteKBArticle(articleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('kb_articles').delete().eq('id', articleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBArticleFeedback(articleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_article_feedback').select('*').eq('article_id', articleId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function submitKBArticleFeedback(articleId: string, userId: string, helpful: boolean, comment?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_article_feedback').insert({ article_id: articleId, user_id: userId, helpful, comment }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBArticleVersions(articleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_article_versions').select('*').eq('article_id', articleId).order('version_number', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createKBArticleVersion(articleId: string, content: string, versionNumber: number, createdBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_article_versions').insert({ article_id: articleId, content, version_number: versionNumber, created_by: createdBy }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBArticleViews(articleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_article_views').select('*').eq('article_id', articleId).order('viewed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackKBArticleView(articleId: string, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_article_views').insert({ article_id: articleId, user_id: userId, viewed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBBookmarks(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addKBBookmark(userId: string, articleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_bookmarks').insert({ user_id: userId, article_id: articleId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeKBBookmark(userId: string, articleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('kb_bookmarks').delete().eq('user_id', userId).eq('article_id', articleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_categories').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createKBCategory(name: string, description?: string, parentId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_categories').insert({ name, description, parent_id: parentId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateKBCategory(categoryId: string, updates: { name?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_categories').update(updates).eq('id', categoryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBFaqs(categoryId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('kb_faqs').select('*').order('order_index', { ascending: true })
    if (categoryId) query = query.eq('category_id', categoryId)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createKBFaq(input: { question: string; answer: string; category_id?: string; order_index?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_faqs').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBSearchQueries(userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('kb_search_queries').select('*').order('searched_at', { ascending: false }).limit(100)
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logKBSearchQuery(query: string, userId?: string, resultsCount?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_search_queries').insert({ query, user_id: userId, results_count: resultsCount, searched_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBSuggestedTopics() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_suggested_topics').select('*').eq('is_active', true).order('priority', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createKBSuggestedTopic(topic: string, priority?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_suggested_topics').insert({ topic, priority: priority || 0, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBVideoFeedback(videoId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_video_feedback').select('*').eq('video_id', videoId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function submitKBVideoFeedback(videoId: string, userId: string, rating: number, comment?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_video_feedback').insert({ video_id: videoId, user_id: userId, rating, comment }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBVideoTutorials(categoryId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('kb_video_tutorials').select('*').order('created_at', { ascending: false })
    if (categoryId) query = query.eq('category_id', categoryId)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createKBVideoTutorial(input: { title: string; video_url: string; category_id?: string; description?: string; duration?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_video_tutorials').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKBVideoViews(videoId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_video_views').select('*').eq('video_id', videoId).order('viewed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackKBVideoView(videoId: string, userId?: string, watchDuration?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('kb_video_views').insert({ video_id: videoId, user_id: userId, watch_duration: watchDuration, viewed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
