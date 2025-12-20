'use server'

/**
 * Extended Forum Server Actions - Covers all Forum-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getForums(parentId?: string | null, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('forums').select('*').order('sort_order', { ascending: true }); if (parentId === null) query = query.is('parent_id', null); else if (parentId) query = query.eq('parent_id', parentId); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getForum(forumId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forums').select('*').eq('id', forumId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createForum(input: { name: string; slug?: string; description?: string; parent_id?: string; icon?: string; color?: string; sort_order?: number }) {
  try { const supabase = await createClient(); const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('forums').insert({ ...input, slug, is_active: true, topic_count: 0, post_count: 0, member_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateForum(forumId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forums').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', forumId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteForum(forumId: string) {
  try { const supabase = await createClient(); await supabase.from('forum_topics').delete().eq('forum_id', forumId); await supabase.from('forums').update({ parent_id: null }).eq('parent_id', forumId); const { error } = await supabase.from('forums').delete().eq('id', forumId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getForumTopics(forumId: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('forum_topics').select('*').eq('forum_id', forumId).order('is_pinned', { ascending: false }).order('last_activity_at', { ascending: false }).limit(limit); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createForumTopic(forumId: string, input: { author_id: string; title: string; content: string; tags?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_topics').insert({ forum_id: forumId, ...input, status: 'open', view_count: 0, reply_count: 0, like_count: 0, last_activity_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: forum } = await supabase.from('forums').select('topic_count').eq('id', forumId).single(); await supabase.from('forums').update({ topic_count: (forum?.topic_count || 0) + 1, last_activity_at: new Date().toISOString() }).eq('id', forumId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getForumTopic(topicId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_topics').select('*').eq('id', topicId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateForumTopic(topicId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_topics').update({ ...updates, is_edited: true, edited_at: new Date().toISOString() }).eq('id', topicId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function pinForumTopic(topicId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_topics').update({ is_pinned: true, pinned_at: new Date().toISOString() }).eq('id', topicId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function lockForumTopic(topicId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_topics').update({ is_locked: true, locked_at: new Date().toISOString() }).eq('id', topicId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementTopicViewCount(topicId: string) {
  try { const supabase = await createClient(); const { data: topic } = await supabase.from('forum_topics').select('view_count').eq('id', topicId).single(); const { data, error } = await supabase.from('forum_topics').update({ view_count: (topic?.view_count || 0) + 1 }).eq('id', topicId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getForumStats(forumId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forums').select('topic_count, post_count, member_count, last_activity_at').eq('id', forumId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchForumTopics(query: string, forumId?: string, limit = 20) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('forum_topics').select('*').or(`title.ilike.%${query}%,content.ilike.%${query}%`).order('last_activity_at', { ascending: false }).limit(limit); if (forumId) dbQuery = dbQuery.eq('forum_id', forumId); const { data, error } = await dbQuery; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
