'use server'

/**
 * Extended Chat Server Actions - Covers all Chat-related tables
 * Tables: chat_rooms, chat_messages, chat_participants, chat_attachments
 */

import { createClient } from '@/lib/supabase/server'

export async function getChatRoom(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_rooms').select('*, chat_participants(*), chat_messages(*, chat_attachments(*))').eq('id', roomId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createChatRoom(roomData: { name?: string; type: 'direct' | 'group' | 'channel'; created_by: string; description?: string; is_private?: boolean; avatar_url?: string; settings?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_rooms').insert({ ...roomData, is_private: roomData.is_private ?? false, is_archived: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('chat_participants').insert({ room_id: data.id, user_id: roomData.created_by, role: 'admin', joined_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateChatRoom(roomId: string, updates: Partial<{ name: string; description: string; avatar_url: string; is_private: boolean; settings: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_rooms').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', roomId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteChatRoom(roomId: string) {
  try { const supabase = await createClient(); await supabase.from('chat_attachments').delete().in('message_id', supabase.from('chat_messages').select('id').eq('room_id', roomId)); await supabase.from('chat_messages').delete().eq('room_id', roomId); await supabase.from('chat_participants').delete().eq('room_id', roomId); const { error } = await supabase.from('chat_rooms').delete().eq('id', roomId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function archiveChatRoom(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_rooms').update({ is_archived: true, archived_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', roomId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserChatRooms(userId: string, options?: { type?: string; includeArchived?: boolean }) {
  try { const supabase = await createClient(); const { data: participations } = await supabase.from('chat_participants').select('room_id').eq('user_id', userId); if (!participations || participations.length === 0) return { success: true, data: [] }; const roomIds = participations.map(p => p.room_id); let query = supabase.from('chat_rooms').select('*, chat_participants(*)').in('id', roomIds); if (options?.type) query = query.eq('type', options.type); if (!options?.includeArchived) query = query.eq('is_archived', false); const { data, error } = await query.order('updated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendMessage(messageData: { room_id: string; sender_id: string; content: string; message_type?: string; reply_to_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_messages').insert({ ...messageData, message_type: messageData.message_type || 'text', is_edited: false, is_deleted: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('chat_rooms').update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', messageData.room_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function editMessage(messageId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_messages').update({ content, is_edited: true, edited_at: new Date().toISOString() }).eq('id', messageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMessage(messageId: string, hardDelete: boolean = false) {
  try { const supabase = await createClient(); if (hardDelete) { await supabase.from('chat_attachments').delete().eq('message_id', messageId); const { error } = await supabase.from('chat_messages').delete().eq('id', messageId); if (error) throw error } else { const { error } = await supabase.from('chat_messages').update({ is_deleted: true, content: '[Message deleted]', deleted_at: new Date().toISOString() }).eq('id', messageId); if (error) throw error } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChatMessages(roomId: string, options?: { limit?: number; before?: string; after?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('chat_messages').select('*, chat_attachments(*)').eq('room_id', roomId); if (options?.before) query = query.lt('created_at', options.before); if (options?.after) query = query.gt('created_at', options.after); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: (data || []).reverse() } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addChatParticipant(participantData: { room_id: string; user_id: string; role?: string; added_by?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('chat_participants').select('id').eq('room_id', participantData.room_id).eq('user_id', participantData.user_id).single(); if (existing) return { success: false, error: 'User already in room' }; const { data, error } = await supabase.from('chat_participants').insert({ ...participantData, role: participantData.role || 'member', joined_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeChatParticipant(roomId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('chat_participants').delete().eq('room_id', roomId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateParticipantRole(roomId: string, userId: string, role: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_participants').update({ role, updated_at: new Date().toISOString() }).eq('room_id', roomId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChatParticipants(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_participants').select('*').eq('room_id', roomId).order('joined_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addChatAttachment(attachmentData: { message_id: string; file_name: string; file_type: string; file_size: number; file_url: string; thumbnail_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_attachments').insert({ ...attachmentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markMessagesAsRead(roomId: string, userId: string, lastReadMessageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_participants').update({ last_read_message_id: lastReadMessageId, last_read_at: new Date().toISOString() }).eq('room_id', roomId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUnreadCount(userId: string) {
  try { const supabase = await createClient(); const { data: participations } = await supabase.from('chat_participants').select('room_id, last_read_at').eq('user_id', userId); if (!participations) return { success: true, data: { total: 0, byRoom: {} } }; let total = 0; const byRoom: Record<string, number> = {}; for (const p of participations) { const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('room_id', p.room_id).neq('sender_id', userId).gt('created_at', p.last_read_at || '1970-01-01'); const unread = count || 0; total += unread; byRoom[p.room_id] = unread } return { success: true, data: { total, byRoom } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchMessages(roomId: string, query: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('chat_messages').select('*, chat_attachments(*)').eq('room_id', roomId).ilike('content', `%${query}%`).eq('is_deleted', false).order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOrCreateDirectChat(userId1: string, userId2: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('chat_rooms').select('*, chat_participants(*)').eq('type', 'direct').then(async res => { if (!res.data) return { data: null }; const directRoom = res.data.find(room => { const participants = room.chat_participants?.map((p: any) => p.user_id) || []; return participants.includes(userId1) && participants.includes(userId2) && participants.length === 2 }); return { data: directRoom } }); if (existing) return { success: true, data: existing, isNew: false }; const { data: room } = await supabase.from('chat_rooms').insert({ type: 'direct', created_by: userId1, is_private: true, created_at: new Date().toISOString() }).select().single(); if (!room) return { success: false, error: 'Failed to create room' }; await supabase.from('chat_participants').insert([{ room_id: room.id, user_id: userId1, role: 'member', joined_at: new Date().toISOString() }, { room_id: room.id, user_id: userId2, role: 'member', joined_at: new Date().toISOString() }]); return { success: true, data: room, isNew: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
