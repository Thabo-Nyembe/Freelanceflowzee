'use server'

/**
 * Extended Comment Server Actions - Covers all Comment-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getComments(resourceType: string, resourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').select('*').eq('resource_type', resourceType).eq('resource_id', resourceId).is('parent_id', null).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getComment(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').select('*').eq('id', commentId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createComment(userId: string, input: { resource_type: string; resource_id: string; content: string; parent_id?: string; mentions?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateComment(commentId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').update({ content, is_edited: true, edited_at: new Date().toISOString() }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteComment(commentId: string, softDelete = true) {
  try { const supabase = await createClient(); if (softDelete) { const { data, error } = await supabase.from('comments').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data }; } else { const { error } = await supabase.from('comments').delete().eq('id', commentId); if (error) throw error; return { success: true }; } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommentReplies(parentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').select('*').eq('parent_id', parentId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function replyToComment(userId: string, parentId: string, content: string) {
  try { const supabase = await createClient(); const { data: parent, error: parentError } = await supabase.from('comments').select('resource_type, resource_id').eq('id', parentId).single(); if (parentError) throw parentError; const { data, error } = await supabase.from('comments').insert({ user_id: userId, parent_id: parentId, resource_type: parent.resource_type, resource_id: parent.resource_id, content }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function likeComment(commentId: string, userId: string) {
  try { const supabase = await createClient(); const { data: comment, error: commentError } = await supabase.from('comments').select('likes').eq('id', commentId).single(); if (commentError) throw commentError; const likes = comment?.likes || []; if (!likes.includes(userId)) likes.push(userId); const { data, error } = await supabase.from('comments').update({ likes, like_count: likes.length }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unlikeComment(commentId: string, userId: string) {
  try { const supabase = await createClient(); const { data: comment, error: commentError } = await supabase.from('comments').select('likes').eq('id', commentId).single(); if (commentError) throw commentError; const likes = (comment?.likes || []).filter((id: string) => id !== userId); const { data, error } = await supabase.from('comments').update({ likes, like_count: likes.length }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function pinComment(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').update({ is_pinned: true, pinned_at: new Date().toISOString() }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpinComment(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').update({ is_pinned: false, pinned_at: null }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommentCount(resourceType: string, resourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').select('id').eq('resource_type', resourceType).eq('resource_id', resourceId).is('is_deleted', false); if (error) throw error; return { success: true, data: { count: data?.length || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reportComment(commentId: string, userId: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('comments').update({ is_reported: true, reported_by: userId, reported_at: new Date().toISOString(), report_reason: reason }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
