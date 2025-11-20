/**
 * Audio Studio Types
 * Complete type system for professional audio editing and production
 */

export type AudioFormat = 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg' | 'm4a'

export type AudioQuality = 'low' | 'medium' | 'high' | 'lossless'

export type AudioEffect =
  | 'reverb'
  | 'delay'
  | 'chorus'
  | 'distortion'
  | 'compressor'
  | 'eq'
  | 'limiter'
  | 'noise-gate'
  | 'pitch-shift'
  | 'time-stretch'
  | 'normalize'
  | 'fade'

export type TrackType = 'audio' | 'music' | 'voice' | 'sfx' | 'midi'

export interface AudioFile {
  id: string
  name: string
  url: string
  format: AudioFormat
  duration: number
  size: number
  sampleRate: number
  bitRate: number
  channels: number
  waveform?: number[]
  createdAt: Date
  uploadedBy: string
}

export interface AudioTrack {
  id: string
  name: string
  type: TrackType
  audioFile?: AudioFile
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  effects: AudioEffectInstance[]
  regions: AudioRegion[]
  color: string
  order: number
}

export interface AudioRegion {
  id: string
  trackId: string
  start: number
  end: number
  audioFileId: string
  offset: number
  fadeIn: number
  fadeOut: number
  volume: number
  locked: boolean
}

export interface AudioEffectInstance {
  id: string
  type: AudioEffect
  enabled: boolean
  parameters: Record<string, number>
  preset?: string
}

export interface AudioProject {
  id: string
  name: string
  description?: string
  tracks: AudioTrack[]
  tempo: number
  duration: number
  sampleRate: number
  format: AudioFormat
  quality: AudioQuality
  createdAt: Date
  updatedAt: Date
  createdBy: string
  thumbnail?: string
  tags?: string[]
}

export interface AudioRecording {
  id: string
  name: string
  url?: string
  duration: number
  status: 'recording' | 'paused' | 'stopped' | 'processing' | 'completed'
  format: AudioFormat
  quality: AudioQuality
  deviceId?: string
  createdAt: Date
  waveform?: number[]
}

export interface AudioDevice {
  id: string
  label: string
  kind: 'audioinput' | 'audiooutput'
  isDefault: boolean
}

export interface AudioExportSettings {
  format: AudioFormat
  quality: AudioQuality
  sampleRate: number
  bitRate: number
  normalize: boolean
  includeMetadata: boolean
  splitByMarkers: boolean
}

export interface AudioMixer {
  masterVolume: number
  tracks: Array<{
    trackId: string
    volume: number
    pan: number
    muted: boolean
    solo: boolean
  }>
}

export interface AudioMarker {
  id: string
  projectId: string
  time: number
  label: string
  color: string
  type: 'marker' | 'region-start' | 'region-end'
}

export interface AudioAnalysis {
  projectId: string
  duration: number
  peaks: number[]
  rms: number
  truePeak: number
  loudness: {
    integrated: number
    range: number
    shortTerm: number
    momentary: number
  }
  spectralData?: {
    frequencies: number[]
    magnitudes: number[]
  }
}

export interface AudioPreset {
  id: string
  name: string
  category: string
  effectType: AudioEffect
  parameters: Record<string, number>
  description?: string
  isDefault: boolean
}

export interface VoiceRecordingSession {
  id: string
  name: string
  status: 'idle' | 'recording' | 'paused'
  recordings: AudioRecording[]
  takes: number
  bestTakeId?: string
  createdAt: Date
}

export interface AudioLibrary {
  id: string
  name: string
  files: AudioFile[]
  category: 'music' | 'sfx' | 'voice' | 'loops' | 'samples'
  tags: string[]
  isPublic: boolean
  createdBy: string
}

export interface AudioTemplate {
  id: string
  name: string
  description: string
  category: string
  tracks: Omit<AudioTrack, 'id'>[]
  tempo: number
  duration: number
  thumbnail: string
  popularity: number
}

export interface AudioCollaboration {
  projectId: string
  collaborators: Array<{
    userId: string
    name: string
    role: 'owner' | 'editor' | 'viewer'
    lastActive: Date
  }>
  comments: Array<{
    id: string
    userId: string
    userName: string
    time: number
    text: string
    createdAt: Date
  }>
}

export interface AudioStats {
  totalProjects: number
  totalRecordings: number
  totalDuration: number
  storageUsed: number
  storageLimit: number
  exportCount: number
  collaborators: number
}
