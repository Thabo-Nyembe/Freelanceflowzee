'use server'

/**
 * Extended Stream Server Actions - Covers all Stream-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getStreams(userId?: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('streams').select('*').order('created_at', { ascending: false }).limit(limit); if (userId) query = query.eq('user_id', userId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStream(userId: string, title: string, description?: string, streamType = 'live') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('streams').insert({ user_id: userId, title, description, stream_type: streamType, status: 'pending', viewer_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startStream(streamId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('streams').update({ status: 'live', started_at: new Date().toISOString() }).eq('id', streamId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endStream(streamId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('streams').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', streamId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateViewerCount(streamId: string, increment = 1) {
  try { const supabase = await createClient(); const { data: stream } = await supabase.from('streams').select('viewer_count').eq('id', streamId).single(); const newCount = Math.max(0, (stream?.viewer_count || 0) + increment); const { data, error } = await supabase.from('streams').update({ viewer_count: newCount }).eq('id', streamId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStreamById(streamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('streams').select('*').eq('id', streamId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLiveStreams(limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('streams').select('*').eq('status', 'live').order('viewer_count', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addStreamChat(streamId: string, userId: string, message: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stream_chats').insert({ stream_id: streamId, user_id: userId, message }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStreamChats(streamId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stream_chats').select('*').eq('stream_id', streamId).order('created_at', { ascending: true }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteStream(streamId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('streams').delete().eq('id', streamId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
