/**
 * Audio Studio Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type AudioFormat = 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg' | 'm4a'
export type AudioQuality = 'low' | 'medium' | 'high' | 'lossless'
export type AudioEffect = 'reverb' | 'delay' | 'chorus' | 'distortion' | 'compressor' | 'eq' | 'limiter' | 'noise-gate' | 'pitch-shift' | 'time-stretch' | 'normalize' | 'fade'
export type TrackType = 'audio' | 'music' | 'voice' | 'sfx' | 'midi'
export type RecordingStatus = 'recording' | 'paused' | 'stopped' | 'processing' | 'completed'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AudioProject {
  id: string
  user_id: string
  name: string
  description?: string
  tempo: number
  duration: number
  sample_rate: number
  format: AudioFormat
  quality: AudioQuality
  thumbnail_url?: string
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface AudioFile {
  id: string
  user_id: string
  name: string
  url: string
  format: AudioFormat
  duration: number
  file_size: number
  sample_rate: number
  bit_rate: number
  channels: number
  waveform: number[]
  created_at: string
  updated_at: string
}

export interface AudioTrack {
  id: string
  project_id: string
  name: string
  type: TrackType
  audio_file_id?: string
  volume: number
  pan: number
  is_muted: boolean
  is_solo: boolean
  color: string
  track_order: number
  created_at: string
  updated_at: string
}

export interface AudioRegion {
  id: string
  track_id: string
  audio_file_id: string
  start_time: number
  end_time: number
  file_offset: number
  fade_in: number
  fade_out: number
  volume: number
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface AudioEffectInstance {
  id: string
  track_id: string
  type: AudioEffect
  is_enabled: boolean
  parameters: Record<string, any>
  preset_name?: string
  effect_order: number
  created_at: string
  updated_at: string
}

export interface AudioMarker {
  id: string
  project_id: string
  time: number
  label: string
  color: string
  created_at: string
  updated_at: string
}

export interface AudioRecording {
  id: string
  user_id: string
  project_id?: string
  name: string
  url?: string
  duration: number
  status: RecordingStatus
  format: AudioFormat
  quality: AudioQuality
  device_id?: string
  waveform: number[]
  created_at: string
  updated_at: string
}

export interface AudioExport {
  id: string
  project_id: string
  user_id: string
  format: AudioFormat
  quality: AudioQuality
  sample_rate: number
  bit_rate: number
  status: ExportStatus
  file_url?: string
  file_size?: number
  normalize: boolean
  include_metadata: boolean
  error_message?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// PROJECTS
export async function getAudioProjects(userId: string, filters?: { is_public?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('audio_projects').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)
  return await query
}

export async function createAudioProject(userId: string, project: Partial<AudioProject>) {
  const supabase = createClient()
  return await supabase.from('audio_projects').insert({ user_id: userId, ...project }).select().single()
}

export async function updateAudioProject(projectId: string, updates: Partial<AudioProject>) {
  const supabase = createClient()
  return await supabase.from('audio_projects').update(updates).eq('id', projectId).select().single()
}

export async function deleteAudioProject(projectId: string) {
  const supabase = createClient()
  return await supabase.from('audio_projects').delete().eq('id', projectId)
}

// FILES
export async function getAudioFiles(userId: string, filters?: { format?: AudioFormat }) {
  const supabase = createClient()
  let query = supabase.from('audio_files').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.format) query = query.eq('format', filters.format)
  return await query
}

export async function createAudioFile(userId: string, file: Partial<AudioFile>) {
  const supabase = createClient()
  return await supabase.from('audio_files').insert({ user_id: userId, ...file }).select().single()
}

export async function deleteAudioFile(fileId: string) {
  const supabase = createClient()
  return await supabase.from('audio_files').delete().eq('id', fileId)
}

// TRACKS
export async function getAudioTracks(projectId: string) {
  const supabase = createClient()
  return await supabase.from('audio_tracks').select('*').eq('project_id', projectId).order('track_order')
}

export async function createAudioTrack(projectId: string, track: Partial<AudioTrack>) {
  const supabase = createClient()
  return await supabase.from('audio_tracks').insert({ project_id: projectId, ...track }).select().single()
}

export async function updateAudioTrack(trackId: string, updates: Partial<AudioTrack>) {
  const supabase = createClient()
  return await supabase.from('audio_tracks').update(updates).eq('id', trackId).select().single()
}

export async function deleteAudioTrack(trackId: string) {
  const supabase = createClient()
  return await supabase.from('audio_tracks').delete().eq('id', trackId)
}

export async function toggleTrackMute(trackId: string, is_muted: boolean) {
  const supabase = createClient()
  return await supabase.from('audio_tracks').update({ is_muted }).eq('id', trackId).select().single()
}

export async function toggleTrackSolo(trackId: string, is_solo: boolean) {
  const supabase = createClient()
  return await supabase.from('audio_tracks').update({ is_solo }).eq('id', trackId).select().single()
}

// REGIONS
export async function getAudioRegions(trackId: string) {
  const supabase = createClient()
  return await supabase.from('audio_regions').select('*').eq('track_id', trackId).order('start_time')
}

export async function createAudioRegion(trackId: string, region: Partial<AudioRegion>) {
  const supabase = createClient()
  return await supabase.from('audio_regions').insert({ track_id: trackId, ...region }).select().single()
}

export async function updateAudioRegion(regionId: string, updates: Partial<AudioRegion>) {
  const supabase = createClient()
  return await supabase.from('audio_regions').update(updates).eq('id', regionId).select().single()
}

export async function deleteAudioRegion(regionId: string) {
  const supabase = createClient()
  return await supabase.from('audio_regions').delete().eq('id', regionId)
}

// EFFECTS
export async function getAudioEffects(trackId: string) {
  const supabase = createClient()
  return await supabase.from('audio_effects').select('*').eq('track_id', trackId).order('effect_order')
}

export async function createAudioEffect(trackId: string, effect: Partial<AudioEffectInstance>) {
  const supabase = createClient()
  return await supabase.from('audio_effects').insert({ track_id: trackId, ...effect }).select().single()
}

export async function updateAudioEffect(effectId: string, updates: Partial<AudioEffectInstance>) {
  const supabase = createClient()
  return await supabase.from('audio_effects').update(updates).eq('id', effectId).select().single()
}

export async function deleteAudioEffect(effectId: string) {
  const supabase = createClient()
  return await supabase.from('audio_effects').delete().eq('id', effectId)
}

export async function toggleEffect(effectId: string, is_enabled: boolean) {
  const supabase = createClient()
  return await supabase.from('audio_effects').update({ is_enabled }).eq('id', effectId).select().single()
}

// MARKERS
export async function getAudioMarkers(projectId: string) {
  const supabase = createClient()
  return await supabase.from('audio_markers').select('*').eq('project_id', projectId).order('time')
}

export async function createAudioMarker(projectId: string, marker: Partial<AudioMarker>) {
  const supabase = createClient()
  return await supabase.from('audio_markers').insert({ project_id: projectId, ...marker }).select().single()
}

export async function deleteAudioMarker(markerId: string) {
  const supabase = createClient()
  return await supabase.from('audio_markers').delete().eq('id', markerId)
}

// RECORDINGS
export async function getAudioRecordings(userId: string, filters?: { status?: RecordingStatus; projectId?: string }) {
  const supabase = createClient()
  let query = supabase.from('audio_recordings').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.projectId) query = query.eq('project_id', filters.projectId)
  return await query
}

export async function createAudioRecording(userId: string, recording: Partial<AudioRecording>) {
  const supabase = createClient()
  return await supabase.from('audio_recordings').insert({ user_id: userId, ...recording }).select().single()
}

export async function updateRecordingStatus(recordingId: string, status: RecordingStatus, url?: string) {
  const supabase = createClient()
  const updates: any = { status }
  if (url) updates.url = url
  return await supabase.from('audio_recordings').update(updates).eq('id', recordingId).select().single()
}

export async function deleteAudioRecording(recordingId: string) {
  const supabase = createClient()
  return await supabase.from('audio_recordings').delete().eq('id', recordingId)
}

// EXPORTS
export async function getAudioExports(userId: string) {
  const supabase = createClient()
  return await supabase.from('audio_exports').select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function createAudioExport(projectId: string, userId: string, exportData: Partial<AudioExport>) {
  const supabase = createClient()
  return await supabase.from('audio_exports').insert({ project_id: projectId, user_id: userId, ...exportData }).select().single()
}

export async function updateExportStatus(exportId: string, status: ExportStatus, fileUrl?: string, error?: string) {
  const supabase = createClient()
  const updates: any = { status }
  if (fileUrl) updates.file_url = fileUrl
  if (error) updates.error_message = error
  return await supabase.from('audio_exports').update(updates).eq('id', exportId).select().single()
}

// STATS
export async function getAudioStats(userId: string) {
  const supabase = createClient()
  const [projectsResult, recordingsResult, exportsResult, filesResult] = await Promise.all([
    supabase.from('audio_projects').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('audio_recordings').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('audio_exports').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
    supabase.from('audio_files').select('file_size').eq('user_id', userId)
  ])

  const totalStorage = filesResult.data?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0

  return {
    data: {
      total_projects: projectsResult.count || 0,
      total_recordings: recordingsResult.count || 0,
      total_exports: exportsResult.count || 0,
      storage_used: totalStorage
    },
    error: projectsResult.error || recordingsResult.error || exportsResult.error || filesResult.error
  }
}
