'use server'

/**
 * Extended Messages Server Actions - Covers all Message-related tables
 * Tables: messages, message_attachments, message_embeddings, message_mentions, message_reactions, message_read_receipts, message_threads
 */

import { createClient } from '@/lib/supabase/server'

export async function getMessage(messageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('messages').select('*, message_attachments(*), message_mentions(*), message_reactions(*)').eq('id', messageId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMessage(messageData: { sender_id: string; recipient_id?: string; channel_id?: string; thread_id?: string; content: string; type?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('messages').insert({ ...messageData, type: messageData.type || 'text', is_edited: false, is_deleted: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMessage(messageId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('messages').update({ content, is_edited: true, edited_at: new Date().toISOString() }).eq('id', messageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMessage(messageId: string, softDelete?: boolean) {
  try { const supabase = await createClient(); if (softDelete) { const { data, error } = await supabase.from('messages').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', messageId).select().single(); if (error) throw error; return { success: true, data }; } else { const { error } = await supabase.from('messages').delete().eq('id', messageId); if (error) throw error; return { success: true }; } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMessages(options: { channelId?: string; threadId?: string; senderId?: string; recipientId?: string; before?: string; after?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('messages').select('*, message_attachments(*), message_reactions(count)').eq('is_deleted', false); if (options.channelId) query = query.eq('channel_id', options.channelId); if (options.threadId) query = query.eq('thread_id', options.threadId); if (options.senderId) query = query.eq('sender_id', options.senderId); if (options.recipientId) query = query.eq('recipient_id', options.recipientId); if (options.before) query = query.lt('created_at', options.before); if (options.after) query = query.gt('created_at', options.after); const { data, error } = await query.order('created_at', { ascending: false }).limit(options.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDirectMessages(userId1: string, userId2: string, options?: { limit?: number; before?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('messages').select('*, message_attachments(*)').or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`).eq('is_deleted', false); if (options?.before) query = query.lt('created_at', options.before); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMessageAttachment(attachmentData: { message_id: string; file_id: string; file_name: string; file_type: string; file_size: number; file_url: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_attachments').insert({ ...attachmentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMessageAttachments(messageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_attachments').select('*').eq('message_id', messageId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMessageMention(mentionData: { message_id: string; user_id: string; mention_type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_mentions').insert({ ...mentionData, mention_type: mentionData.mention_type || 'user', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMessageMentions(userId: string, options?: { isRead?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('message_mentions').select('*, messages(*, sender:users!sender_id(id, name, avatar_url))').eq('user_id', userId); if (options?.isRead !== undefined) query = query.eq('is_read', options.isRead); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMessageReaction(reactionData: { message_id: string; user_id: string; emoji: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_reactions').insert({ ...reactionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeMessageReaction(messageId: string, userId: string, emoji: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('message_reactions').delete().eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMessageReactions(messageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_reactions').select('*, users(id, name, avatar_url)').eq('message_id', messageId).order('created_at', { ascending: true }); if (error) throw error; const grouped: Record<string, { emoji: string; count: number; users: any[] }> = {}; data?.forEach(r => { if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [] }; grouped[r.emoji].count++; grouped[r.emoji].users.push(r.users); }); return { success: true, data: Object.values(grouped) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function markMessageRead(messageId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_read_receipts').upsert({ message_id: messageId, user_id: userId, read_at: new Date().toISOString() }, { onConflict: 'message_id,user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMessageReadReceipts(messageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_read_receipts').select('*, users(id, name, avatar_url)').eq('message_id', messageId).order('read_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMessageThread(threadData: { parent_message_id: string; channel_id?: string; title?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_threads').insert({ ...threadData, message_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMessageThread(threadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('message_threads').select('*, messages(*, sender:users!sender_id(id, name, avatar_url))').eq('id', threadId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getThreadMessages(threadId: string, options?: { limit?: number; before?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('messages').select('*, message_attachments(*), sender:users!sender_id(id, name, avatar_url)').eq('thread_id', threadId).eq('is_deleted', false); if (options?.before) query = query.lt('created_at', options.before); const { data, error } = await query.order('created_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function searchMessages(query: string, options?: { channelId?: string; senderId?: string; limit?: number }) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('messages').select('*, sender:users!sender_id(id, name, avatar_url)').textSearch('content', query).eq('is_deleted', false); if (options?.channelId) dbQuery = dbQuery.eq('channel_id', options.channelId); if (options?.senderId) dbQuery = dbQuery.eq('sender_id', options.senderId); const { data, error } = await dbQuery.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
