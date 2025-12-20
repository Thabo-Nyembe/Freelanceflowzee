'use server'

/**
 * Extended Discussion Server Actions - Covers all Discussion-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getDiscussions(categoryId?: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('discussions').select('*').order('last_activity_at', { ascending: false }).limit(limit); if (categoryId) query = query.eq('category_id', categoryId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDiscussion(discussionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discussions').select('*').eq('id', discussionId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDiscussion(input: { author_id: string; title: string; content: string; category_id?: string; tags?: string[]; is_question?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discussions').insert({ ...input, status: 'open', view_count: 0, reply_count: 0, like_count: 0, last_activity_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDiscussion(discussionId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discussions').update({ ...updates, is_edited: true, edited_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', discussionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDiscussion(discussionId: string) {
  try { const supabase = await createClient(); await supabase.from('discussion_posts').delete().eq('discussion_id', discussionId); const { error } = await supabase.from('discussions').delete().eq('id', discussionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeDiscussion(discussionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discussions').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', discussionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function pinDiscussion(discussionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discussions').update({ is_pinned: true, pinned_at: new Date().toISOString() }).eq('id', discussionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function lockDiscussion(discussionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discussions').update({ is_locked: true, locked_at: new Date().toISOString() }).eq('id', discussionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementViewCount(discussionId: string) {
  try { const supabase = await createClient(); const { data: discussion } = await supabase.from('discussions').select('view_count').eq('id', discussionId).single(); const { data, error } = await supabase.from('discussions').update({ view_count: (discussion?.view_count || 0) + 1 }).eq('id', discussionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDiscussionPosts(discussionId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discussion_posts').select('*').eq('discussion_id', discussionId).order('created_at', { ascending: true }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDiscussionPost(discussionId: string, userId: string, content: string, replyToId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discussion_posts').insert({ discussion_id: discussionId, author_id: userId, content, reply_to_id: replyToId, like_count: 0 }).select().single(); if (error) throw error; const { data: discussion } = await supabase.from('discussions').select('reply_count').eq('id', discussionId).single(); await supabase.from('discussions').update({ reply_count: (discussion?.reply_count || 0) + 1, last_activity_at: new Date().toISOString() }).eq('id', discussionId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAsAnswer(postId: string, discussionId: string) {
  try { const supabase = await createClient(); await supabase.from('discussion_posts').update({ is_answer: false }).eq('discussion_id', discussionId); const { data, error } = await supabase.from('discussion_posts').update({ is_answer: true, marked_answer_at: new Date().toISOString() }).eq('id', postId).select().single(); if (error) throw error; await supabase.from('discussions').update({ status: 'answered', has_answer: true }).eq('id', discussionId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchDiscussions(query: string, categoryId?: string, limit = 20) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('discussions').select('*').or(`title.ilike.%${query}%,content.ilike.%${query}%`).order('last_activity_at', { ascending: false }).limit(limit); if (categoryId) dbQuery = dbQuery.eq('category_id', categoryId); const { data, error } = await dbQuery; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
