'use server'

/**
 * Extended Meetings Server Actions - Covers all Meeting-related tables
 * Tables: meetings, meeting_analytics, meeting_chat_messages, meeting_participants, meeting_polls, meeting_recordings, meeting_stats
 */

import { createClient } from '@/lib/supabase/server'

export async function getMeeting(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meetings').select('*').eq('id', meetingId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMeeting(meetingData: { title: string; description?: string; host_id: string; scheduled_at: string; duration_minutes?: number; type?: string; password?: string; settings?: Record<string, any> }) {
  try { const supabase = await createClient(); const meetingCode = Math.random().toString(36).substring(2, 10).toUpperCase(); const { data, error } = await supabase.from('meetings').insert({ ...meetingData, meeting_code: meetingCode, type: meetingData.type || 'video', status: 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { ...data, meetingCode } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMeeting(meetingId: string, updates: Partial<{ title: string; description: string; scheduled_at: string; duration_minutes: number; status: string; settings: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meetings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', meetingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startMeeting(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meetings').update({ status: 'in_progress', started_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', meetingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endMeeting(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meetings').update({ status: 'ended', ended_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', meetingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMeeting(meetingId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('meetings').delete().eq('id', meetingId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMeetings(options?: { hostId?: string; status?: string; type?: string; startDate?: string; endDate?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('meetings').select('*'); if (options?.hostId) query = query.eq('host_id', options.hostId); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); if (options?.startDate) query = query.gte('scheduled_at', options.startDate); if (options?.endDate) query = query.lte('scheduled_at', options.endDate); const { data, error } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMeetingByCode(meetingCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meetings').select('*').eq('meeting_code', meetingCode).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addMeetingParticipant(participantData: { meeting_id: string; user_id: string; role?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_participants').insert({ ...participantData, role: participantData.role || 'attendee', status: 'joined', joined_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMeetingParticipant(meetingId: string, userId: string, updates: Partial<{ status: string; role: string; left_at: string; is_muted: boolean; is_video_on: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_participants').update({ ...updates, updated_at: new Date().toISOString() }).eq('meeting_id', meetingId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMeetingParticipants(meetingId: string, options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('meeting_participants').select('*, users(id, name, email, avatar_url)').eq('meeting_id', meetingId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('joined_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendMeetingChatMessage(messageData: { meeting_id: string; user_id: string; content: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_chat_messages').insert({ ...messageData, type: messageData.type || 'text', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMeetingChatMessages(meetingId: string, options?: { limit?: number; after?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('meeting_chat_messages').select('*, users(id, name, avatar_url)').eq('meeting_id', meetingId); if (options?.after) query = query.gt('created_at', options.after); const { data, error } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMeetingPoll(pollData: { meeting_id: string; question: string; options: string[]; is_anonymous?: boolean; allow_multiple?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_polls').insert({ ...pollData, is_anonymous: pollData.is_anonymous ?? false, allow_multiple: pollData.allow_multiple ?? false, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function voteMeetingPoll(pollId: string, userId: string, selectedOptions: number[]) {
  try { const supabase = await createClient(); const { data: poll } = await supabase.from('meeting_polls').select('votes').eq('id', pollId).single(); const votes = poll?.votes || {}; votes[userId] = selectedOptions; const { data, error } = await supabase.from('meeting_polls').update({ votes, updated_at: new Date().toISOString() }).eq('id', pollId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeMeetingPoll(pollId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_polls').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', pollId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMeetingPolls(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_polls').select('*').eq('meeting_id', meetingId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMeetingRecording(recordingData: { meeting_id: string; file_url: string; file_size?: number; duration_seconds?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_recordings').insert({ ...recordingData, status: 'processing', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMeetingRecording(recordingId: string, updates: Partial<{ status: string; file_url: string; file_size: number; duration_seconds: number; transcript_url: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_recordings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', recordingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMeetingRecordings(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_recordings').select('*').eq('meeting_id', meetingId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordMeetingAnalytics(analyticsData: { meeting_id: string; peak_participants: number; total_duration_minutes: number; avg_duration_per_participant: number; chat_message_count: number; poll_count: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_analytics').insert({ ...analyticsData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMeetingAnalytics(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('meeting_analytics').select('*').eq('meeting_id', meetingId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMeetingStats(hostId: string, options?: { startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('meeting_stats').select('*').eq('host_id', hostId); if (options?.startDate) query = query.gte('period_start', options.startDate); if (options?.endDate) query = query.lte('period_end', options.endDate); const { data, error } = await query.order('period_start', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
