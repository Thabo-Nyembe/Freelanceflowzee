'use server'

/**
 * Extended Thread Server Actions - Covers all Thread-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getThreads(channelId?: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('threads').select('*').order('last_activity_at', { ascending: false }).limit(limit); if (channelId) query = query.eq('channel_id', channelId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getThread(threadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('threads').select('*').eq('id', threadId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createThread(input: { channel_id?: string; parent_id?: string; parent_type?: string; creator_id: string; title?: string; initial_message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('threads').insert({ ...input, status: 'open', message_count: 0, participant_count: 1, last_activity_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('thread_participants').insert({ thread_id: data.id, user_id: input.creator_id, role: 'creator' }); if (input.initial_message) { await supabase.from('thread_messages').insert({ thread_id: data.id, user_id: input.creator_id, content: input.initial_message }); await supabase.from('threads').update({ message_count: 1 }).eq('id', data.id); } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateThread(threadId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('threads').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', threadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeThread(threadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('threads').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', threadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reopenThread(threadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('threads').update({ status: 'open', closed_at: null }).eq('id', threadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteThread(threadId: string) {
  try { const supabase = await createClient(); await supabase.from('thread_messages').delete().eq('thread_id', threadId); await supabase.from('thread_participants').delete().eq('thread_id', threadId); const { error } = await supabase.from('threads').delete().eq('id', threadId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getThreadMessages(threadId: string, limit = 100, offset = 0) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('thread_messages').select('*').eq('thread_id', threadId).order('created_at', { ascending: true }).range(offset, offset + limit - 1); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addThreadMessage(threadId: string, userId: string, content: string, attachments?: any[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('thread_messages').insert({ thread_id: threadId, user_id: userId, content, attachments }).select().single(); if (error) throw error; const { data: thread } = await supabase.from('threads').select('message_count').eq('id', threadId).single(); await supabase.from('threads').update({ message_count: (thread?.message_count || 0) + 1, last_activity_at: new Date().toISOString() }).eq('id', threadId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getThreadParticipants(threadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('thread_participants').select('*').eq('thread_id', threadId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addThreadParticipant(threadId: string, userId: string, role = 'participant') {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('thread_participants').select('id').eq('thread_id', threadId).eq('user_id', userId).single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('thread_participants').insert({ thread_id: threadId, user_id: userId, role }).select().single(); if (error) throw error; const { data: thread } = await supabase.from('threads').select('participant_count').eq('id', threadId).single(); await supabase.from('threads').update({ participant_count: (thread?.participant_count || 0) + 1 }).eq('id', threadId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeThreadParticipant(threadId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('thread_participants').delete().eq('thread_id', threadId).eq('user_id', userId); if (error) throw error; const { data: thread } = await supabase.from('threads').select('participant_count').eq('id', threadId).single(); await supabase.from('threads').update({ participant_count: Math.max(0, (thread?.participant_count || 1) - 1) }).eq('id', threadId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
