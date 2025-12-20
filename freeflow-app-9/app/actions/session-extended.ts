'use server'

/**
 * Extended Session Server Actions - Covers all Session-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getUserSessions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_sessions').select('*').eq('user_id', userId).order('last_active_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getActiveSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_sessions').select('*').eq('id', sessionId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSession(userId: string, input: { device_info?: any; ip_address?: string; user_agent?: string }) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const { data, error } = await supabase.from('user_sessions').insert({ user_id: userId, token, ...input, is_active: true, last_active_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSessionActivity(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_sessions').update({ last_active_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function invalidateSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function invalidateAllUserSessions(userId: string, exceptSessionId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('user_sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('user_id', userId).eq('is_active', true); if (exceptSessionId) query = query.neq('id', exceptSessionId); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSessionRecordings(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('session_recordings').select('*').eq('session_id', sessionId).order('started_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startSessionRecording(sessionId: string, input: { recording_type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('session_recordings').insert({ session_id: sessionId, ...input, status: 'recording', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function stopSessionRecording(recordingId: string, url?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('session_recordings').update({ status: 'completed', ended_at: new Date().toISOString(), recording_url: url }).eq('id', recordingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSessionRecording(recordingId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('session_recordings').delete().eq('id', recordingId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSessionEvents(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('session_events').select('*').eq('session_id', sessionId).order('timestamp', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logSessionEvent(sessionId: string, input: { event_type: string; event_data?: any; page_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('session_events').insert({ session_id: sessionId, ...input, timestamp: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSessionEventStats(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('session_events').select('event_type').eq('session_id', sessionId); if (error) throw error; const stats: Record<string, number> = {}; data?.forEach(e => { stats[e.event_type] = (stats[e.event_type] || 0) + 1; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
