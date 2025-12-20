'use server'

/**
 * Extended Meeting Server Actions
 * Tables: meetings, meeting_participants, meeting_recordings, meeting_notes
 */

import { createClient } from '@/lib/supabase/server'

export async function getMeeting(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meetings').select('*, meeting_participants(*)').eq('id', meetingId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMeeting(meetingData: { user_id: string; title: string; description?: string; start_time: string; end_time: string; location?: string; meeting_url?: string; type?: string; participants?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meetings').insert({ user_id: meetingData.user_id, title: meetingData.title, description: meetingData.description, start_time: meetingData.start_time, end_time: meetingData.end_time, location: meetingData.location, meeting_url: meetingData.meeting_url, type: meetingData.type || 'video', status: 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (data && meetingData.participants) { await supabase.from('meeting_participants').insert(meetingData.participants.map(p => ({ meeting_id: data.id, user_id: p, status: 'invited' }))); } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMeeting(meetingId: string, updates: Partial<{ title: string; description: string; start_time: string; end_time: string; location: string; meeting_url: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meetings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', meetingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMeeting(meetingId: string) {
  try { const supabase = await createClient(); await supabase.from('meeting_participants').delete().eq('meeting_id', meetingId); const { error } = await supabase.from('meetings').delete().eq('id', meetingId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMeetings(options?: { user_id?: string; status?: string; date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('meetings').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.date_from) query = query.gte('start_time', options.date_from); if (options?.date_to) query = query.lte('start_time', options.date_to); const { data, error } = await query.order('start_time', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMeetingParticipants(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_participants').select('*').eq('meeting_id', meetingId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startMeeting(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meetings').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', meetingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endMeeting(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meetings').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', meetingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMeetingNotes(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_notes').select('*').eq('meeting_id', meetingId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
