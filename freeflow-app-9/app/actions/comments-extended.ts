'use server'

/**
 * Extended Comments Server Actions
 * Tables: comments, comment_replies, comment_reactions, comment_mentions
 */

import { createClient } from '@/lib/supabase/server'

export async function getComment(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').select('*, comment_replies(*), comment_reactions(*)').eq('id', commentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createComment(commentData: { user_id: string; target_type: string; target_id: string; content: string; parent_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').insert({ ...commentData, is_edited: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateComment(commentId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').update({ content, is_edited: true, edited_at: new Date().toISOString() }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteComment(commentId: string) {
  try { const supabase = await createClient(); await supabase.from('comment_replies').delete().eq('parent_id', commentId); await supabase.from('comment_reactions').delete().eq('comment_id', commentId); const { error } = await supabase.from('comments').delete().eq('id', commentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComments(targetType: string, targetId: string, options?: { parent_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('comments').select('*, comment_reactions(*)').eq('target_type', targetType).eq('target_id', targetId); if (options?.parent_id) query = query.eq('parent_id', options.parent_id); else query = query.is('parent_id', null); const { data, error } = await query.order('created_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addReaction(commentId: string, userId: string, reactionType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comment_reactions').upsert({ comment_id: commentId, user_id: userId, reaction_type: reactionType, created_at: new Date().toISOString() }, { onConflict: 'comment_id,user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeReaction(commentId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('comment_reactions').delete().eq('comment_id', commentId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addReply(replyData: { parent_id: string; user_id: string; content: string }) {
  try { const supabase = await createClient(); const { data: parent } = await supabase.from('comments').select('target_type, target_id').eq('id', replyData.parent_id).single(); if (!parent) throw new Error('Parent comment not found'); const { data, error } = await supabase.from('comments').insert({ ...replyData, target_type: parent.target_type, target_id: parent.target_id, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommentCount(targetType: string, targetId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('target_type', targetType).eq('target_id', targetId); if (error) throw error; return { success: true, data: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: 0 } }
}

export async function getUserComments(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
