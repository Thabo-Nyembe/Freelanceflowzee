'use server'

/**
 * Extended Voice Server Actions - Covers all 16 Voice-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getVoiceAnalytics(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_analytics').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVoiceClones(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_clones').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVoiceClone(userId: string, input: { name: string; sample_url: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_clones').insert({ user_id: userId, ...input, status: 'processing' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteVoiceClone(cloneId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('voice_clones').delete().eq('id', cloneId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceParticipantStats(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_participant_stats').select('*').eq('room_id', roomId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVoiceParticipants(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_participants').select('*').eq('room_id', roomId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function joinVoiceRoom(roomId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_participants').insert({ room_id: roomId, user_id: userId, joined_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function leaveVoiceRoom(roomId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('voice_participants').delete().eq('room_id', roomId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceProjects(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVoiceProject(userId: string, input: { name: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_projects').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceRecordings(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_recordings').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVoiceRecording(projectId: string, input: { name: string; url: string; duration?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_recordings').insert({ project_id: projectId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceRoomChat(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_chat').select('*').eq('room_id', roomId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendVoiceRoomMessage(roomId: string, userId: string, message: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_chat').insert({ room_id: roomId, user_id: userId, message }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceRoomFiles(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_files').select('*').eq('room_id', roomId).order('uploaded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function uploadVoiceRoomFile(roomId: string, userId: string, input: { name: string; url: string; type: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_files').insert({ room_id: roomId, uploaded_by: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceRoomInvites(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_invites').select('*').eq('room_id', roomId).eq('status', 'pending'); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVoiceRoomInvite(roomId: string, email: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_invites').insert({ room_id: roomId, email, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function respondToVoiceRoomInvite(inviteId: string, status: 'accepted' | 'declined') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_invites').update({ status }).eq('id', inviteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceRoomReactions(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_reactions').select('*').eq('room_id', roomId).order('created_at', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addVoiceRoomReaction(roomId: string, userId: string, reaction: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_reactions').insert({ room_id: roomId, user_id: userId, reaction }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceRoomSchedules(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_schedules').select('*').eq('user_id', userId).order('scheduled_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVoiceRoomSchedule(userId: string, input: { title: string; scheduled_at: string; duration?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_schedules').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceRoomSettings(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_settings').select('*').eq('room_id', roomId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateVoiceRoomSettings(roomId: string, settings: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_room_settings').upsert({ room_id: roomId, ...settings }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceRooms(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_rooms').select('*').eq('host_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVoiceRoom(userId: string, input: { name: string; is_private?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_rooms').insert({ host_id: userId, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endVoiceRoom(roomId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_rooms').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', roomId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceScripts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_scripts').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVoiceScript(userId: string, input: { title: string; content: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_scripts').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceSyntheses(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_syntheses').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVoiceSynthesis(userId: string, input: { text: string; voice_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_syntheses').insert({ user_id: userId, ...input, status: 'processing' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceTranscriptions(recordingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_transcriptions').select('*').eq('recording_id', recordingId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVoiceTranscription(recordingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_transcriptions').insert({ recording_id: recordingId, status: 'processing' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoices(userId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('voices').select('*').order('name', { ascending: true }); if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
