'use server'

/**
 * Extended Chats Server Actions
 * Tables: chats, chat_messages, chat_participants, chat_attachments
 */

import { createClient } from '@/lib/supabase/server'

export async function getChat(chatId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chats').select('*, chat_participants(*), chat_messages(*)').eq('id', chatId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createChat(chatData: { created_by: string; name?: string; type?: string; is_group?: boolean; participants: string[] }) {
  try { const supabase = await createClient(); const { data: chat, error } = await supabase.from('chats').insert({ created_by: chatData.created_by, name: chatData.name, type: chatData.type || 'direct', is_group: chatData.is_group || false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const participants = chatData.participants.map(userId => ({ chat_id: chat.id, user_id: userId, joined_at: new Date().toISOString() })); await supabase.from('chat_participants').insert(participants); return { success: true, data: chat } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function sendMessage(messageData: { chat_id: string; sender_id: string; content: string; type?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_messages').insert({ ...messageData, type: messageData.type || 'text', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('chats').update({ last_message_at: new Date().toISOString(), last_message: messageData.content.substring(0, 100) }).eq('id', messageData.chat_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMessages(chatId: string, options?: { limit?: number; before?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('chat_messages').select('*').eq('chat_id', chatId); if (options?.before) query = query.lt('created_at', options.before); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: (data || []).reverse() } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserChats(userId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); const { data: participantChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', userId); if (!participantChats?.length) return { success: true, data: [] }; let query = supabase.from('chats').select('*, chat_participants(*)').in('id', participantChats.map(p => p.chat_id)); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('last_message_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function markMessagesAsRead(chatId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('chat_messages').update({ read_at: new Date().toISOString() }).eq('chat_id', chatId).neq('sender_id', userId).is('read_at', null); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addParticipant(chatId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_participants').insert({ chat_id: chatId, user_id: userId, joined_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeParticipant(chatId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('chat_participants').delete().eq('chat_id', chatId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMessage(messageId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('chat_messages').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', messageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUnreadCount(userId: string) {
  try { const supabase = await createClient(); const { data: participantChats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', userId); if (!participantChats?.length) return { success: true, data: 0 }; const { count, error } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).in('chat_id', participantChats.map(p => p.chat_id)).neq('sender_id', userId).is('read_at', null); if (error) throw error; return { success: true, data: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: 0 } }
}
