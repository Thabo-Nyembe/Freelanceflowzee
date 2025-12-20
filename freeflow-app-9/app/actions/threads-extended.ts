'use server'

/**
 * Extended Threads Server Actions
 * Tables: threads, thread_messages, thread_participants, thread_reactions, thread_attachments, thread_reads
 */

import { createClient } from '@/lib/supabase/server'

export async function getThread(threadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('threads').select('*, thread_participants(*, users(*)), thread_messages(*, users(*))').eq('id', threadId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createThread(threadData: { title?: string; thread_type: string; context_type?: string; context_id?: string; created_by: string; participants?: string[]; is_private?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data: thread, error: threadError } = await supabase.from('threads').insert({ ...threadData, is_private: threadData.is_private ?? true, message_count: 0, status: 'active', created_at: new Date().toISOString() }).select().single(); if (threadError) throw threadError; const participants = [...new Set([threadData.created_by, ...(threadData.participants || [])])]; for (const userId of participants) { await supabase.from('thread_participants').insert({ thread_id: thread.id, user_id: userId, role: userId === threadData.created_by ? 'owner' : 'member', joined_at: new Date().toISOString(), created_at: new Date().toISOString() }) } return { success: true, data: thread } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateThread(threadId: string, updates: Partial<{ title: string; status: string; is_private: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('threads').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', threadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteThread(threadId: string) {
  try { const supabase = await createClient(); await supabase.from('thread_messages').delete().eq('thread_id', threadId); await supabase.from('thread_participants').delete().eq('thread_id', threadId); await supabase.from('thread_reactions').delete().eq('thread_id', threadId); await supabase.from('thread_attachments').delete().eq('thread_id', threadId); await supabase.from('thread_reads').delete().eq('thread_id', threadId); const { error } = await supabase.from('threads').delete().eq('id', threadId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getThreads(options?: { thread_type?: string; context_type?: string; context_id?: string; created_by?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('threads').select('*, thread_participants(count)'); if (options?.thread_type) query = query.eq('thread_type', options.thread_type); if (options?.context_type) query = query.eq('context_type', options.context_type); if (options?.context_id) query = query.eq('context_id', options.context_id); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendMessage(threadId: string, messageData: { content: string; sender_id: string; message_type?: string; reply_to_id?: string; attachments?: any[] }) {
  try { const supabase = await createClient(); const { data: message, error } = await supabase.from('thread_messages').insert({ thread_id: threadId, content: messageData.content, sender_id: messageData.sender_id, message_type: messageData.message_type || 'text', reply_to_id: messageData.reply_to_id, sent_at: new Date().toISOString(), created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; await supabase.from('threads').update({ message_count: supabase.rpc('increment_count', { row_id: threadId, count_column: 'message_count' }), last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', threadId); if (messageData.attachments && messageData.attachments.length > 0) { const attachments = messageData.attachments.map(a => ({ thread_id: threadId, message_id: message.id, ...a, uploaded_by: messageData.sender_id, created_at: new Date().toISOString() })); await supabase.from('thread_attachments').insert(attachments) } return { success: true, data: message } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMessages(threadId: string, options?: { before_id?: string; after_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('thread_messages').select('*, users(*), thread_reactions(*)').eq('thread_id', threadId); if (options?.before_id) query = query.lt('id', options.before_id); if (options?.after_id) query = query.gt('id', options.after_id); const { data, error } = await query.order('sent_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: (data || []).reverse() } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function editMessage(messageId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('thread_messages').update({ content, is_edited: true, edited_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', messageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMessage(messageId: string) {
  try { const supabase = await createClient(); const { data: message } = await supabase.from('thread_messages').select('thread_id').eq('id', messageId).single(); await supabase.from('thread_reactions').delete().eq('message_id', messageId); await supabase.from('thread_attachments').delete().eq('message_id', messageId); const { error } = await supabase.from('thread_messages').delete().eq('id', messageId); if (error) throw error; if (message?.thread_id) { await supabase.rpc('decrement_count', { row_id: message.thread_id, table_name: 'threads', count_column: 'message_count' }) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addParticipant(threadId: string, userId: string, role: string = 'member', addedBy?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('thread_participants').select('id').eq('thread_id', threadId).eq('user_id', userId).single(); if (existing) return { success: false, error: 'User is already a participant' }; const { data, error } = await supabase.from('thread_participants').insert({ thread_id: threadId, user_id: userId, role, added_by: addedBy, joined_at: new Date().toISOString(), created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeParticipant(threadId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('thread_participants').delete().eq('thread_id', threadId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addReaction(messageId: string, userId: string, emoji: string) {
  try { const supabase = await createClient(); const { data: message } = await supabase.from('thread_messages').select('thread_id').eq('id', messageId).single(); const { data, error } = await supabase.from('thread_reactions').upsert({ thread_id: message?.thread_id, message_id: messageId, user_id: userId, emoji, created_at: new Date().toISOString() }, { onConflict: 'message_id,user_id,emoji' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeReaction(messageId: string, userId: string, emoji: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('thread_reactions').delete().eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAsRead(threadId: string, userId: string, messageId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('thread_reads').upsert({ thread_id: threadId, user_id: userId, last_read_message_id: messageId, read_at: new Date().toISOString() }, { onConflict: 'thread_id,user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserThreads(userId: string, options?: { thread_type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); const { data: participations } = await supabase.from('thread_participants').select('thread_id').eq('user_id', userId); if (!participations || participations.length === 0) return { success: true, data: [] }; const threadIds = participations.map(p => p.thread_id); let query = supabase.from('threads').select('*, thread_participants(*, users(*))').in('id', threadIds); if (options?.thread_type) query = query.eq('thread_type', options.thread_type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('last_message_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
