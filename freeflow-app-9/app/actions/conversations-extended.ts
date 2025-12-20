'use server'

/**
 * Extended Conversations Server Actions
 * Tables: conversations, conversation_messages, conversation_participants, conversation_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getConversation(conversationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversations').select('*, conversation_participants(*), conversation_messages(*)').eq('id', conversationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createConversation(conversationData: { created_by: string; title?: string; type?: string; participants: string[]; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data: conv, error } = await supabase.from('conversations').insert({ created_by: conversationData.created_by, title: conversationData.title, type: conversationData.type || 'direct', metadata: conversationData.metadata, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const participants = conversationData.participants.map(userId => ({ conversation_id: conv.id, user_id: userId, joined_at: new Date().toISOString() })); await supabase.from('conversation_participants').insert(participants); return { success: true, data: conv } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function sendConversationMessage(messageData: { conversation_id: string; sender_id: string; content: string; type?: string; attachments?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversation_messages').insert({ ...messageData, type: messageData.type || 'text', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('conversations').update({ last_message_at: new Date().toISOString(), last_message: messageData.content.substring(0, 100) }).eq('id', messageData.conversation_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConversationMessages(conversationId: string, options?: { limit?: number; before?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('conversation_messages').select('*').eq('conversation_id', conversationId); if (options?.before) query = query.lt('created_at', options.before); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: (data || []).reverse() } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserConversations(userId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); const { data: participantConvs } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', userId); if (!participantConvs?.length) return { success: true, data: [] }; let query = supabase.from('conversations').select('*, conversation_participants(*)').in('id', participantConvs.map(p => p.conversation_id)); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('last_message_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function archiveConversation(conversationId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversation_participants').update({ is_archived: true, archived_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function muteConversation(conversationId: string, userId: string, muteUntil?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversation_participants').update({ is_muted: true, muted_until: muteUntil }).eq('conversation_id', conversationId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addParticipantToConversation(conversationId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversation_participants').insert({ conversation_id: conversationId, user_id: userId, joined_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function leaveConversation(conversationId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('conversation_participants').update({ left_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
