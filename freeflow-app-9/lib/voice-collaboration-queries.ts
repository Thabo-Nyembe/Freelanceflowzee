/**
 * Voice Collaboration Query Library
 * CRUD operations for voice rooms, participants, recordings, transcriptions, and analytics
 */

import { createClient } from '@/lib/supabase/client'

// Types
export type VoiceRoomType = 'public' | 'private' | 'team' | 'client' | 'project' | 'meeting'
export type VoiceRoomStatus = 'active' | 'scheduled' | 'ended' | 'archived'
export type VoiceAudioQuality = 'low' | 'medium' | 'high' | 'ultra'
export type VoiceParticipantRole = 'host' | 'moderator' | 'speaker' | 'listener'
export type VoiceParticipantStatus = 'speaking' | 'muted' | 'listening' | 'away'
export type VoiceRecordingStatus = 'processing' | 'completed' | 'failed'
export type VoiceRecordingFormat = 'mp3' | 'wav' | 'ogg' | 'flac'

export interface VoiceRoom {
  id: string
  user_id: string
  name: string
  description?: string
  type: VoiceRoomType
  status: VoiceRoomStatus
  host_id: string
  capacity: number
  current_participants: number
  quality: VoiceAudioQuality
  is_locked: boolean
  password_hash?: string
  scheduled_time?: string
  start_time?: string
  end_time?: string
  duration_seconds?: number
  is_recording: boolean
  recording_enabled: boolean
  transcription_enabled: boolean
  spatial_audio_enabled: boolean
  noise_cancellation_enabled: boolean
  echo_cancellation_enabled: boolean
  auto_gain_control_enabled: boolean
  category?: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface VoiceParticipant {
  id: string
  room_id: string
  user_id: string
  role: VoiceParticipantRole
  status: VoiceParticipantStatus
  is_muted: boolean
  is_video_enabled: boolean
  joined_at: string
  left_at?: string
  duration_seconds: number
  speaking_time_seconds: number
  connection_quality?: string
  last_seen_at: string
  device_type?: string
  browser?: string
  created_at: string
  updated_at: string
}

export interface VoiceRecording {
  id: string
  room_id: string
  user_id: string
  title: string
  description?: string
  file_path: string
  file_size_bytes: number
  duration_seconds: number
  format: VoiceRecordingFormat
  quality: VoiceAudioQuality
  sample_rate: number
  bitrate: number
  channels: number
  status: VoiceRecordingStatus
  processing_started_at?: string
  processing_completed_at?: string
  error_message?: string
  has_transcription: boolean
  download_count: number
  play_count: number
  is_public: boolean
  created_at: string
  updated_at: string
}

// ROOMS
export async function getVoiceRooms(userId: string, filters?: { status?: VoiceRoomStatus; type?: VoiceRoomType }) {
  const supabase = createClient()
  let query = supabase.from('voice_rooms').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.type) query = query.eq('type', filters.type)
  return await query
}

export async function getVoiceRoom(roomId: string) {
  const supabase = createClient()
  return await supabase.from('voice_rooms').select('*').eq('id', roomId).single()
}

export async function createVoiceRoom(userId: string, room: Partial<VoiceRoom>) {
  const supabase = createClient()
  return await supabase.from('voice_rooms').insert({ user_id: userId, host_id: userId, ...room }).select().single()
}

export async function updateVoiceRoom(roomId: string, updates: Partial<VoiceRoom>) {
  const supabase = createClient()
  return await supabase.from('voice_rooms').update(updates).eq('id', roomId).select().single()
}

export async function updateVoiceRoomStatus(roomId: string, status: VoiceRoomStatus) {
  const supabase = createClient()
  return await supabase.from('voice_rooms').update({ status }).eq('id', roomId).select().single()
}

export async function deleteVoiceRoom(roomId: string) {
  const supabase = createClient()
  return await supabase.from('voice_rooms').delete().eq('id', roomId)
}

// PARTICIPANTS
export async function getVoiceParticipants(roomId: string, filters?: { status?: VoiceParticipantStatus }) {
  const supabase = createClient()
  let query = supabase.from('voice_participants').select('*').eq('room_id', roomId).order('joined_at')
  if (filters?.status) query = query.eq('status', filters.status)
  return await query
}

export async function createVoiceParticipant(roomId: string, userId: string, participant: Partial<VoiceParticipant>) {
  const supabase = createClient()
  return await supabase.from('voice_participants').insert({ room_id: roomId, user_id: userId, ...participant }).select().single()
}

export async function updateVoiceParticipant(participantId: string, updates: Partial<VoiceParticipant>) {
  const supabase = createClient()
  return await supabase.from('voice_participants').update(updates).eq('id', participantId).select().single()
}

export async function updateParticipantStatus(participantId: string, status: VoiceParticipantStatus) {
  const supabase = createClient()
  return await supabase.from('voice_participants').update({ status }).eq('id', participantId).select().single()
}

export async function toggleParticipantMute(participantId: string, is_muted: boolean) {
  const supabase = createClient()
  return await supabase.from('voice_participants').update({ is_muted }).eq('id', participantId).select().single()
}

export async function leaveVoiceRoom(participantId: string) {
  const supabase = createClient()
  return await supabase.from('voice_participants').update({ left_at: new Date().toISOString() }).eq('id', participantId).select().single()
}

// RECORDINGS
export async function getVoiceRecordings(userId: string, filters?: { room_id?: string; is_public?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('voice_recordings').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.room_id) query = query.eq('room_id', filters.room_id)
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)
  return await query
}

export async function createVoiceRecording(roomId: string, userId: string, recording: Partial<VoiceRecording>) {
  const supabase = createClient()
  return await supabase.from('voice_recordings').insert({ room_id: roomId, user_id: userId, ...recording }).select().single()
}

export async function updateVoiceRecording(recordingId: string, updates: Partial<VoiceRecording>) {
  const supabase = createClient()
  return await supabase.from('voice_recordings').update(updates).eq('id', recordingId).select().single()
}

export async function incrementPlayCount(recordingId: string) {
  const supabase = createClient()
  return await supabase.rpc('increment', { row_id: recordingId, column_name: 'play_count' })
}

export async function incrementDownloadCount(recordingId: string) {
  const supabase = createClient()
  return await supabase.rpc('increment', { row_id: recordingId, column_name: 'download_count' })
}

// STATISTICS
export async function getVoiceStats(userId: string) {
  const supabase = createClient()
  const [roomsResult, activeResult, recordingsResult] = await Promise.all([
    supabase.from('voice_rooms').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('voice_rooms').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
    supabase.from('voice_recordings').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  ])

  return {
    data: {
      total_rooms: roomsResult.count || 0,
      active_rooms: activeResult.count || 0,
      total_recordings: recordingsResult.count || 0
    },
    error: roomsResult.error || activeResult.error || recordingsResult.error
  }
}
