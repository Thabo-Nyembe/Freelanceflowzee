'use server'

/**
 * Extended UPF (Universal Pinpoint Feedback) Server Actions - Covers all 9 UPF-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getUPFAnalytics(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_analytics').select('*').eq('project_id', projectId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUPFAnalytics(projectId: string, analytics: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_analytics').upsert({ project_id: projectId, ...analytics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUPFAttachments(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_attachments').select('*').eq('comment_id', commentId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addUPFAttachment(commentId: string, input: { file_url: string; file_name: string; file_type: string; file_size: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_attachments').insert({ comment_id: commentId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUPFAttachment(attachmentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('upf_attachments').delete().eq('id', attachmentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUPFCommentAssignments(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_comment_assignments').select('*').eq('comment_id', commentId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignUPFComment(commentId: string, assignedTo: string, assignedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_comment_assignments').insert({ comment_id: commentId, assigned_to: assignedTo, assigned_by: assignedBy }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unassignUPFComment(commentId: string, assignedTo: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('upf_comment_assignments').delete().eq('comment_id', commentId).eq('assigned_to', assignedTo); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUPFCommentAttachments(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_comment_attachments').select('*').eq('comment_id', commentId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addUPFCommentAttachment(commentId: string, input: { file_url: string; file_name: string; file_type: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_comment_attachments').insert({ comment_id: commentId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUPFCommentReactions(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_comment_reactions').select('*').eq('comment_id', commentId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleUPFCommentReaction(commentId: string, userId: string, reaction: string) {
  try {
    const supabase = await createClient()
    const { data: existing } = await supabase.from('upf_comment_reactions').select('id').eq('comment_id', commentId).eq('user_id', userId).eq('reaction', reaction).single()
    if (existing) {
      await supabase.from('upf_comment_reactions').delete().eq('id', existing.id)
      return { success: true, added: false }
    } else {
      await supabase.from('upf_comment_reactions').insert({ comment_id: commentId, user_id: userId, reaction })
      return { success: true, added: true }
    }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUPFComments(projectId: string, status?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('upf_comments').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createUPFComment(projectId: string, userId: string, input: { content: string; position: any; media_id?: string; parent_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_comments').insert({ project_id: projectId, user_id: userId, ...input, status: 'open' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUPFComment(commentId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_comments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveUPFComment(commentId: string, resolvedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_comments').update({ status: 'resolved', resolved_by: resolvedBy, resolved_at: new Date().toISOString() }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUPFComment(commentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('upf_comments').delete().eq('id', commentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUPFMediaFiles(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_media_files').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function uploadUPFMediaFile(projectId: string, uploadedBy: string, input: { file_url: string; file_name: string; file_type: string; file_size: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_media_files').insert({ project_id: projectId, uploaded_by: uploadedBy, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUPFMediaFile(mediaId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('upf_media_files').delete().eq('id', mediaId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUPFReactions(mediaId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_reactions').select('*').eq('media_id', mediaId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleUPFReaction(mediaId: string, userId: string, reaction: string) {
  try {
    const supabase = await createClient()
    const { data: existing } = await supabase.from('upf_reactions').select('id').eq('media_id', mediaId).eq('user_id', userId).eq('reaction', reaction).single()
    if (existing) {
      await supabase.from('upf_reactions').delete().eq('id', existing.id)
      return { success: true, added: false }
    } else {
      await supabase.from('upf_reactions').insert({ media_id: mediaId, user_id: userId, reaction })
      return { success: true, added: true }
    }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUPFVoiceNotes(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_voice_notes').select('*').eq('comment_id', commentId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addUPFVoiceNote(commentId: string, userId: string, input: { audio_url: string; duration: number; transcript?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upf_voice_notes').insert({ comment_id: commentId, user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUPFVoiceNote(voiceNoteId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('upf_voice_notes').delete().eq('id', voiceNoteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
