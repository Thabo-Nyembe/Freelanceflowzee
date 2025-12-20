'use server'

/**
 * Extended Reply Server Actions - Covers all Reply-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getReplies(parentId: string, parentType: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('replies').select('*').eq('parent_id', parentId).eq('parent_type', parentType).order('created_at', { ascending: true }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReply(replyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('replies').select('*').eq('id', replyId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReply(input: { user_id: string; parent_id: string; parent_type: string; content: string; reply_to_id?: string; mentions?: string[]; attachments?: any[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('replies').insert({ ...input, like_count: 0, is_edited: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReply(replyId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('replies').update({ content, is_edited: true, edited_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', replyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteReply(replyId: string) {
  try { const supabase = await createClient(); await supabase.from('replies').update({ reply_to_id: null }).eq('reply_to_id', replyId); const { error } = await supabase.from('replies').delete().eq('id', replyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function softDeleteReply(replyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('replies').update({ is_deleted: true, deleted_at: new Date().toISOString(), content: '[deleted]' }).eq('id', replyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNestedReplies(replyId: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('replies').select('*').eq('reply_to_id', replyId).order('created_at', { ascending: true }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReplyCount(parentId: string, parentType: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('replies').select('*', { count: 'exact', head: true }).eq('parent_id', parentId).eq('parent_type', parentType); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function likeReply(replyId: string) {
  try { const supabase = await createClient(); const { data: reply } = await supabase.from('replies').select('like_count').eq('id', replyId).single(); const { data, error } = await supabase.from('replies').update({ like_count: (reply?.like_count || 0) + 1 }).eq('id', replyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserReplies(userId: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('replies').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function pinReply(replyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('replies').update({ is_pinned: true, pinned_at: new Date().toISOString() }).eq('id', replyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpinReply(replyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('replies').update({ is_pinned: false, pinned_at: null }).eq('id', replyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
