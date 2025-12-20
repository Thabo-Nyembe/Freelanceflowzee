'use server'

/**
 * Extended Streams Server Actions
 * Tables: streams, stream_sessions, stream_viewers, stream_chats, stream_recordings, stream_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getStream(streamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('streams').select('*, stream_sessions(*), stream_recordings(*)').eq('id', streamId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStream(streamData: { title: string; description?: string; streamer_id: string; stream_type?: string; category?: string; thumbnail_url?: string; is_private?: boolean; scheduled_start?: string; metadata?: any }) {
  try { const supabase = await createClient(); const streamKey = generateStreamKey(); const { data, error } = await supabase.from('streams').insert({ ...streamData, stream_key: streamKey, status: 'created', is_live: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateStreamKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = 'stream_'
  for (let i = 0; i < 24; i++) { key += chars.charAt(Math.floor(Math.random() * chars.length)) }
  return key
}

export async function updateStream(streamId: string, updates: Partial<{ title: string; description: string; category: string; thumbnail_url: string; is_private: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('streams').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', streamId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStream(streamId: string) {
  try { const supabase = await createClient(); await supabase.from('stream_chats').delete().eq('stream_id', streamId); await supabase.from('stream_viewers').delete().eq('stream_id', streamId); await supabase.from('stream_sessions').delete().eq('stream_id', streamId); const { error } = await supabase.from('streams').delete().eq('id', streamId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStreams(options?: { streamer_id?: string; category?: string; is_live?: boolean; stream_type?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('streams').select('*, users(*)'); if (options?.streamer_id) query = query.eq('streamer_id', options.streamer_id); if (options?.category) query = query.eq('category', options.category); if (options?.is_live !== undefined) query = query.eq('is_live', options.is_live); if (options?.stream_type) query = query.eq('stream_type', options.stream_type); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startStream(streamId: string) {
  try { const supabase = await createClient(); const { data: session, error: sessionError } = await supabase.from('stream_sessions').insert({ stream_id: streamId, started_at: new Date().toISOString(), status: 'live', created_at: new Date().toISOString() }).select().single(); if (sessionError) throw sessionError; await supabase.from('streams').update({ is_live: true, status: 'live', current_session_id: session.id, updated_at: new Date().toISOString() }).eq('id', streamId); return { success: true, data: session } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endStream(streamId: string, saveRecording: boolean = true) {
  try { const supabase = await createClient(); const { data: stream } = await supabase.from('streams').select('current_session_id').eq('id', streamId).single(); if (!stream?.current_session_id) return { success: false, error: 'No active session' }; await supabase.from('stream_sessions').update({ ended_at: new Date().toISOString(), status: 'ended', updated_at: new Date().toISOString() }).eq('id', stream.current_session_id); if (saveRecording) { await supabase.from('stream_recordings').insert({ stream_id: streamId, session_id: stream.current_session_id, status: 'processing', created_at: new Date().toISOString() }) } await supabase.from('streams').update({ is_live: false, status: 'offline', current_session_id: null, updated_at: new Date().toISOString() }).eq('id', streamId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function joinStream(streamId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stream_viewers').upsert({ stream_id: streamId, user_id: userId, joined_at: new Date().toISOString(), is_watching: true, updated_at: new Date().toISOString() }, { onConflict: 'stream_id,user_id' }).select().single(); if (error) throw error; await updateViewerCount(streamId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function leaveStream(streamId: string, userId: string) {
  try { const supabase = await createClient(); await supabase.from('stream_viewers').update({ is_watching: false, left_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('stream_id', streamId).eq('user_id', userId); await updateViewerCount(streamId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateViewerCount(streamId: string) {
  const supabase = await createClient()
  const { count } = await supabase.from('stream_viewers').select('*', { count: 'exact', head: true }).eq('stream_id', streamId).eq('is_watching', true)
  await supabase.from('streams').update({ viewer_count: count || 0, updated_at: new Date().toISOString() }).eq('id', streamId)
}

export async function sendChatMessage(streamId: string, userId: string, message: string, messageType: string = 'text') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stream_chats').insert({ stream_id: streamId, user_id: userId, message, message_type: messageType, sent_at: new Date().toISOString(), created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChatMessages(streamId: string, options?: { since?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('stream_chats').select('*, users(*)').eq('stream_id', streamId); if (options?.since) query = query.gt('sent_at', options.since); const { data, error } = await query.order('sent_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecordings(streamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stream_recordings').select('*').eq('stream_id', streamId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordAnalytics(streamId: string, analyticsData: { metric_type: string; metric_value: number; session_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stream_analytics').insert({ stream_id: streamId, ...analyticsData, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

