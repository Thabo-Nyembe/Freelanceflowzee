'use server'

/**
 * Extended Topics Server Actions
 * Tables: topics, topic_posts, topic_followers, topic_moderators, topic_tags, topic_statistics
 */

import { createClient } from '@/lib/supabase/server'

export async function getTopic(topicId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('topics').select('*, topic_tags(*), topic_moderators(*, users(*)), topic_statistics(*)').eq('id', topicId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTopic(topicData: { name: string; slug: string; description?: string; category?: string; parent_id?: string; icon_url?: string; cover_url?: string; created_by: string; is_private?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('topics').select('id').eq('slug', topicData.slug).single(); if (existing) return { success: false, error: 'Slug already exists' }; const { data: topic, error: topicError } = await supabase.from('topics').insert({ ...topicData, is_private: topicData.is_private ?? false, status: 'active', post_count: 0, follower_count: 0, created_at: new Date().toISOString() }).select().single(); if (topicError) throw topicError; await supabase.from('topic_moderators').insert({ topic_id: topic.id, user_id: topicData.created_by, role: 'owner', added_at: new Date().toISOString(), created_at: new Date().toISOString() }); await supabase.from('topic_statistics').insert({ topic_id: topic.id, post_count: 0, follower_count: 0, view_count: 0, created_at: new Date().toISOString() }); return { success: true, data: topic } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTopic(topicId: string, updates: Partial<{ name: string; description: string; category: string; icon_url: string; cover_url: string; is_private: boolean; status: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('topics').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', topicId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTopic(topicId: string) {
  try { const supabase = await createClient(); await supabase.from('topic_posts').delete().eq('topic_id', topicId); await supabase.from('topic_followers').delete().eq('topic_id', topicId); await supabase.from('topic_moderators').delete().eq('topic_id', topicId); await supabase.from('topic_tags').delete().eq('topic_id', topicId); await supabase.from('topic_statistics').delete().eq('topic_id', topicId); const { error } = await supabase.from('topics').delete().eq('id', topicId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTopics(options?: { category?: string; parent_id?: string | null; status?: string; is_private?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('topics').select('*, topic_statistics(*)'); if (options?.category) query = query.eq('category', options.category); if (options?.parent_id !== undefined) { if (options.parent_id === null) query = query.is('parent_id', null); else query = query.eq('parent_id', options.parent_id) } if (options?.status) query = query.eq('status', options.status); if (options?.is_private !== undefined) query = query.eq('is_private', options.is_private); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPost(topicId: string, postData: { title?: string; content: string; author_id: string; post_type?: string; is_pinned?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('topic_posts').insert({ topic_id: topicId, ...postData, post_type: postData.post_type || 'discussion', is_pinned: postData.is_pinned ?? false, view_count: 0, reply_count: 0, like_count: 0, created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; await updatePostCount(topicId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updatePostCount(topicId: string) {
  const supabase = await createClient()
  const { count } = await supabase.from('topic_posts').select('*', { count: 'exact', head: true }).eq('topic_id', topicId)
  await supabase.from('topics').update({ post_count: count || 0, updated_at: new Date().toISOString() }).eq('id', topicId)
  await supabase.from('topic_statistics').update({ post_count: count || 0, updated_at: new Date().toISOString() }).eq('topic_id', topicId)
}

export async function getPosts(topicId: string, options?: { post_type?: string; author_id?: string; is_pinned?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('topic_posts').select('*, users(*)').eq('topic_id', topicId); if (options?.post_type) query = query.eq('post_type', options.post_type); if (options?.author_id) query = query.eq('author_id', options.author_id); if (options?.is_pinned !== undefined) query = query.eq('is_pinned', options.is_pinned); if (options?.search) query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`); const { data, error } = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function followTopic(topicId: string, userId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('topic_followers').select('id').eq('topic_id', topicId).eq('user_id', userId).single(); if (existing) return { success: false, error: 'Already following' }; const { data, error } = await supabase.from('topic_followers').insert({ topic_id: topicId, user_id: userId, followed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await updateFollowerCount(topicId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unfollowTopic(topicId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('topic_followers').delete().eq('topic_id', topicId).eq('user_id', userId); if (error) throw error; await updateFollowerCount(topicId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateFollowerCount(topicId: string) {
  const supabase = await createClient()
  const { count } = await supabase.from('topic_followers').select('*', { count: 'exact', head: true }).eq('topic_id', topicId)
  await supabase.from('topics').update({ follower_count: count || 0, updated_at: new Date().toISOString() }).eq('id', topicId)
  await supabase.from('topic_statistics').update({ follower_count: count || 0, updated_at: new Date().toISOString() }).eq('topic_id', topicId)
}

export async function getFollowers(topicId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('topic_followers').select('*, users(*)').eq('topic_id', topicId).order('followed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addModerator(topicId: string, userId: string, role: string = 'moderator', addedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('topic_moderators').insert({ topic_id: topicId, user_id: userId, role, added_by: addedBy, added_at: new Date().toISOString(), created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeModerator(topicId: string, userId: string) {
  try { const supabase = await createClient(); const { data: mod } = await supabase.from('topic_moderators').select('role').eq('topic_id', topicId).eq('user_id', userId).single(); if (mod?.role === 'owner') return { success: false, error: 'Cannot remove topic owner' }; const { error } = await supabase.from('topic_moderators').delete().eq('topic_id', topicId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModerators(topicId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('topic_moderators').select('*, users(*)').eq('topic_id', topicId).order('added_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTag(topicId: string, tag: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('topic_tags').insert({ topic_id: topicId, tag, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeTag(topicId: string, tag: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('topic_tags').delete().eq('topic_id', topicId).eq('tag', tag); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserFollowedTopics(userId: string, options?: { category?: string; limit?: number }) {
  try { const supabase = await createClient(); const { data: follows } = await supabase.from('topic_followers').select('topic_id').eq('user_id', userId); if (!follows || follows.length === 0) return { success: true, data: [] }; const topicIds = follows.map(f => f.topic_id); let query = supabase.from('topics').select('*, topic_statistics(*)').in('id', topicIds); if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPopularTopics(options?: { category?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('topics').select('*, topic_statistics(*)').eq('status', 'active').eq('is_private', false); if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('follower_count', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordView(topicId: string) {
  try { const supabase = await createClient(); await supabase.from('topic_statistics').update({ view_count: supabase.rpc('increment_count', { row_id: topicId, count_column: 'view_count' }), updated_at: new Date().toISOString() }).eq('topic_id', topicId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
