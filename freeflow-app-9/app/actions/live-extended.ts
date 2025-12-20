'use server'

/**
 * Extended Live Server Actions
 * Tables: live_streams, live_viewers, live_chat, live_events, live_recordings, live_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getLiveStream(streamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('live_streams').select('*, live_viewers(count), live_chat(*)').eq('id', streamId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLiveStream(streamData: { title: string; description?: string; user_id: string; scheduled_at?: string; is_private?: boolean; category?: string; thumbnail_url?: string }) {
  try { const supabase = await createClient(); const streamKey = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`; const { data, error } = await supabase.from('live_streams').insert({ ...streamData, stream_key: streamKey, status: 'scheduled', viewer_count: 0, peak_viewers: 0, is_private: streamData.is_private ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLiveStream(streamId: string, updates: Partial<{ title: string; description: string; category: string; thumbnail_url: string; is_private: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('live_streams').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', streamId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startLiveStream(streamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('live_streams').update({ status: 'live', started_at: new Date().toISOString() }).eq('id', streamId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endLiveStream(streamId: string) {
  try { const supabase = await createClient(); const { data: stream } = await supabase.from('live_streams').select('started_at').eq('id', streamId).single(); const duration = stream?.started_at ? Math.floor((Date.now() - new Date(stream.started_at).getTime()) / 1000) : 0; const { data, error } = await supabase.from('live_streams').update({ status: 'ended', ended_at: new Date().toISOString(), duration_seconds: duration }).eq('id', streamId).select().single(); if (error) throw error; await supabase.from('live_viewers').update({ left_at: new Date().toISOString() }).eq('stream_id', streamId).is('left_at', null); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLiveStreams(options?: { user_id?: string; status?: string; category?: string; is_private?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('live_streams').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.category) query = query.eq('category', options.category); if (options?.is_private !== undefined) query = query.eq('is_private', options.is_private); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function joinStream(streamId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('live_viewers').insert({ stream_id: streamId, user_id: userId, joined_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: stream } = await supabase.from('live_streams').select('viewer_count, peak_viewers').eq('id', streamId).single(); const newCount = (stream?.viewer_count || 0) + 1; await supabase.from('live_streams').update({ viewer_count: newCount, peak_viewers: Math.max(stream?.peak_viewers || 0, newCount) }).eq('id', streamId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function leaveStream(streamId: string, viewerId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('live_viewers').update({ left_at: new Date().toISOString() }).eq('id', viewerId); if (error) throw error; const { data: stream } = await supabase.from('live_streams').select('viewer_count').eq('id', streamId).single(); await supabase.from('live_streams').update({ viewer_count: Math.max(0, (stream?.viewer_count || 1) - 1) }).eq('id', streamId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function sendChatMessage(messageData: { stream_id: string; user_id: string; message: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('live_chat').insert({ ...messageData, type: messageData.type || 'message', sent_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChatMessages(streamId: string, options?: { limit?: number; after?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('live_chat').select('*').eq('stream_id', streamId); if (options?.after) query = query.gt('sent_at', options.after); const { data, error } = await query.order('sent_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStreamViewers(streamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('live_viewers').select('*').eq('stream_id', streamId).is('left_at', null).order('joined_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStreamRecording(recordingData: { stream_id: string; url: string; duration_seconds: number; size_bytes?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('live_recordings').insert({ ...recordingData, status: 'available', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStreamRecordings(streamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('live_recordings').select('*').eq('stream_id', streamId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStreamAnalytics(streamId: string) {
  try { const supabase = await createClient(); const { data: stream } = await supabase.from('live_streams').select('viewer_count, peak_viewers, duration_seconds, started_at, ended_at').eq('id', streamId).single(); const { data: viewers } = await supabase.from('live_viewers').select('joined_at, left_at').eq('stream_id', streamId); const { data: messages } = await supabase.from('live_chat').select('id').eq('stream_id', streamId); return { success: true, data: { currentViewers: stream?.viewer_count || 0, peakViewers: stream?.peak_viewers || 0, totalViewers: viewers?.length || 0, chatMessages: messages?.length || 0, duration: stream?.duration_seconds || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
