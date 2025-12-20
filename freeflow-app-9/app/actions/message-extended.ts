'use server'

/**
 * Extended Message Server Actions - Covers all Message-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMessages(conversationId: string, limit = 50, offset = 0) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('sent_at', { ascending: true }).range(offset, offset + limit - 1); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMessage(messageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('messages').select('*').eq('id', messageId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function sendMessage(conversationId: string, senderId: string, input: { content: string; message_type?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: senderId, ...input, sent_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('conversations').update({ last_message_at: new Date().toISOString(), last_message_preview: input.content.substring(0, 100) }).eq('id', conversationId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMessage(messageId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('messages').update({ content, is_edited: true, edited_at: new Date().toISOString() }).eq('id', messageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMessage(messageId: string, softDelete = true) {
  try { const supabase = await createClient(); if (softDelete) { const { data, error } = await supabase.from('messages').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', messageId).select().single(); if (error) throw error; return { success: true, data }; } else { const { error } = await supabase.from('messages').delete().eq('id', messageId); if (error) throw error; return { success: true }; } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markMessageAsRead(messageId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('messages').update({ read_by: supabase.sql`array_append(read_by, ${userId})`, read_at: new Date().toISOString() }).eq('id', messageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMessageAttachments(messageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_attachments').select('*').eq('message_id', messageId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMessageAttachment(messageId: string, input: { filename: string; file_url: string; file_size: number; mime_type: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_attachments').insert({ message_id: messageId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMessageAttachment(attachmentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('message_attachments').delete().eq('id', attachmentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchMessages(conversationId: string, query: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).ilike('content', `%${query}%`).order('sent_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUnreadMessageCount(conversationId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('messages').select('id').eq('conversation_id', conversationId).not('read_by', 'cs', `{${userId}}`).neq('sender_id', userId); if (error) throw error; return { success: true, data: { count: data?.length || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reactToMessage(messageId: string, userId: string, reaction: string) {
  try { const supabase = await createClient(); const { data: message, error: msgError } = await supabase.from('messages').select('reactions').eq('id', messageId).single(); if (msgError) throw msgError; const reactions = message?.reactions || {}; if (!reactions[reaction]) reactions[reaction] = []; if (!reactions[reaction].includes(userId)) reactions[reaction].push(userId); const { data, error } = await supabase.from('messages').update({ reactions }).eq('id', messageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
