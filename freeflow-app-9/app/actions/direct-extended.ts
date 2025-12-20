'use server'

/**
 * Extended Direct Server Actions
 * Tables: direct_messages, direct_conversations, direct_message_reactions, direct_message_reads
 */

import { createClient } from '@/lib/supabase/server'

export async function getDirectConversation(conversationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('direct_conversations').select('*, direct_messages(*)').eq('id', conversationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDirectConversation(participants: string[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('direct_conversations').insert({ participants, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOrCreateDirectConversation(userId1: string, userId2: string) {
  try { const supabase = await createClient(); const participants = [userId1, userId2].sort(); const { data: existing } = await supabase.from('direct_conversations').select('*').contains('participants', participants).single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('direct_conversations').insert({ participants, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserConversations(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('direct_conversations').select('*').contains('participants', [userId]).order('last_message_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendDirectMessage(messageData: { conversation_id: string; sender_id: string; content: string; type?: string; attachments?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('direct_messages').insert({ ...messageData, type: messageData.type || 'text', sent_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('direct_conversations').update({ last_message_at: new Date().toISOString(), last_message_preview: messageData.content.substring(0, 100) }).eq('id', messageData.conversation_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDirectMessages(conversationId: string, options?: { before?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('direct_messages').select('*').eq('conversation_id', conversationId); if (options?.before) query = query.lt('sent_at', options.before); const { data, error } = await query.order('sent_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data?.reverse() || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteDirectMessage(messageId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('direct_messages').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', messageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addMessageReaction(reactionData: { message_id: string; user_id: string; emoji: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('direct_message_reactions').insert({ ...reactionData, reacted_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markMessagesRead(conversationId: string, userId: string, lastReadMessageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('direct_message_reads').upsert({ conversation_id: conversationId, user_id: userId, last_read_message_id: lastReadMessageId, read_at: new Date().toISOString() }, { onConflict: 'conversation_id,user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUnreadCount(userId: string) {
  try { const supabase = await createClient(); const { data: conversations } = await supabase.from('direct_conversations').select('id').contains('participants', [userId]); if (!conversations?.length) return { success: true, data: 0 }; const { data: reads } = await supabase.from('direct_message_reads').select('conversation_id, last_read_message_id').eq('user_id', userId); const readMap = new Map(reads?.map(r => [r.conversation_id, r.last_read_message_id]) || []); let totalUnread = 0; for (const conv of conversations) { const lastRead = readMap.get(conv.id); let query = supabase.from('direct_messages').select('*', { count: 'exact', head: true }).eq('conversation_id', conv.id).neq('sender_id', userId); if (lastRead) query = query.gt('id', lastRead); const { count } = await query; totalUnread += count || 0 }; return { success: true, data: totalUnread } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: 0 } }
}
