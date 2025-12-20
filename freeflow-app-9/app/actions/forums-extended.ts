'use server'

/**
 * Extended Forums Server Actions
 * Tables: forums, forum_categories, forum_topics, forum_posts, forum_reactions, forum_moderators
 */

import { createClient } from '@/lib/supabase/server'

export async function getForum(forumId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forums').select('*, forum_categories(*), forum_moderators(*)').eq('id', forumId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createForum(forumData: { name: string; description?: string; slug: string; created_by: string; is_private?: boolean; rules?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forums').insert({ ...forumData, is_active: true, topic_count: 0, post_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateForum(forumId: string, updates: Partial<{ name: string; description: string; rules: string; is_active: boolean; is_private: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forums').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', forumId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getForums(options?: { is_active?: boolean; is_private?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('forums').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.is_private !== undefined) query = query.eq('is_private', options.is_private); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createForumCategory(categoryData: { forum_id: string; name: string; description?: string; icon?: string; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_categories').insert({ ...categoryData, topic_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getForumCategories(forumId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_categories').select('*').eq('forum_id', forumId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTopic(topicData: { forum_id: string; category_id?: string; title: string; content: string; author_id: string; is_pinned?: boolean; is_locked?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_topics').insert({ ...topicData, view_count: 0, reply_count: 0, is_pinned: topicData.is_pinned ?? false, is_locked: topicData.is_locked ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('forums').update({ topic_count: (await supabase.from('forums').select('topic_count').eq('id', topicData.forum_id).single()).data?.topic_count + 1 || 1 }).eq('id', topicData.forum_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTopic(topicId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_topics').select('*, forum_posts(*)').eq('id', topicId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTopics(options?: { forum_id?: string; category_id?: string; author_id?: string; is_pinned?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('forum_topics').select('*'); if (options?.forum_id) query = query.eq('forum_id', options.forum_id); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.author_id) query = query.eq('author_id', options.author_id); if (options?.is_pinned !== undefined) query = query.eq('is_pinned', options.is_pinned); const { data, error } = await query.order('is_pinned', { ascending: false }).order('last_activity_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPost(postData: { topic_id: string; author_id: string; content: string; reply_to_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_posts').insert({ ...postData, is_edited: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: topic } = await supabase.from('forum_topics').select('reply_count, forum_id').eq('id', postData.topic_id).single(); await supabase.from('forum_topics').update({ reply_count: (topic?.reply_count || 0) + 1, last_activity_at: new Date().toISOString() }).eq('id', postData.topic_id); await supabase.from('forums').update({ post_count: (await supabase.from('forums').select('post_count').eq('id', topic?.forum_id).single()).data?.post_count + 1 || 1 }).eq('id', topic?.forum_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePost(postId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_posts').update({ content, is_edited: true, edited_at: new Date().toISOString() }).eq('id', postId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTopicPosts(topicId: string, options?: { limit?: number; offset?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('forum_posts').select('*, forum_reactions(*)').eq('topic_id', topicId); const { data, error } = await query.order('created_at', { ascending: true }).range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addReaction(reactionData: { post_id: string; user_id: string; reaction_type: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_reactions').upsert({ ...reactionData, created_at: new Date().toISOString() }, { onConflict: 'post_id,user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addModerator(forumId: string, userId: string, permissions?: string[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forum_moderators').insert({ forum_id: forumId, user_id: userId, permissions: permissions || ['edit', 'delete', 'pin', 'lock'], added_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementTopicViews(topicId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('forum_topics').select('view_count').eq('id', topicId).single(); const { error } = await supabase.from('forum_topics').update({ view_count: (data?.view_count || 0) + 1 }).eq('id', topicId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
