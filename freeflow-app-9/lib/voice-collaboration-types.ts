/**
 * Voice Collaboration Types
 * World-class type definitions for voice communication and collaboration
 */

export type VoiceRoomType =
  | 'public'
  | 'private'
  | 'team'
  | 'client'
  | 'project'
  | 'meeting'

export type VoiceQuality = 'low' | 'medium' | 'high' | 'ultra'

export type ParticipantStatus =
  | 'connected'
  | 'speaking'
  | 'muted'
  | 'away'
  | 'disconnected'

export type RecordingStatus =
  | 'idle'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'completed'
  | 'failed'

export type TranscriptionLanguage =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'ja'
  | 'zh'
  | 'ko'
  | 'ar'

export interface VoiceRoom {
  id: string
  name: string
  description: string
  type: VoiceRoomType
  capacity: number
  currentParticipants: number
  participants: VoiceParticipant[]
  host: string
  isLocked: boolean
  password?: string
  quality: VoiceQuality
  features: {
    recording: boolean
    transcription: boolean
    noiseC cancellation: boolean
    echoCancellation: boolean
    autoGainControl: boolean
    spatialAudio: boolean
  }
  metadata: {
    createdAt: Date
    createdBy: string
    projectId?: string
    tags: string[]
    category: string
  }
}

export interface VoiceParticipant {
  id: string
  userId: string
  name: string
  avatar?: string
  status: ParticipantStatus
  isMuted: boolean
  isSpeaking: boolean
  isHandRaised: boolean
  volume: number
  joinedAt: Date
  permissions: {
    canSpeak: boolean
    canRecord: boolean
    canMute: boolean
    canKick: boolean
  }
  audioSettings: {
    inputDevice: string
    outputDevice: string
    noiseSuppression: boolean
    echoCancellation: boolean
  }
}

export interface VoiceMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  type: 'voice-note' | 'announcement' | 'reaction'
  content: string
  audioUrl?: string
  duration?: number
  transcription?: string
  timestamp: Date
  reactions: Array<{
    userId: string
    emoji: string
    timestamp: Date
  }>
}

export interface VoiceRecording {
  id: string
  roomId: string
  title: string
  description?: string
  status: RecordingStatus
  audioUrl?: string
  duration: number
  fileSize?: number
  startTime: Date
  endTime?: Date
  recordedBy: string
  participants: string[]
  transcription?: VoiceTranscription
  chapters?: RecordingChapter[]
  metadata: {
    quality: VoiceQuality
    format: 'mp3' | 'wav' | 'ogg' | 'm4a'
    sampleRate: number
    bitrate: number
  }
}

export interface VoiceTranscription {
  id: string
  recordingId: string
  language: TranscriptionLanguage
  status: 'processing' | 'completed' | 'failed'
  accuracy: number
  segments: TranscriptionSegment[]
  summary?: string
  keywords?: string[]
  sentimentScore?: number
  createdAt: Date
  completedAt?: Date
}

export interface TranscriptionSegment {
  id: string
  text: string
  speaker: string
  startTime: number
  endTime: number
  confidence: number
  words: Array<{
    text: string
    startTime: number
    endTime: number
    confidence: number
  }>
}

export interface RecordingChapter {
  id: string
  title: string
  startTime: number
  endTime: number
  description?: string
  speakers: string[]
  thumbnail?: string
}

export interface VoiceSettings {
  inputDevice: string
  outputDevice: string
  quality: VoiceQuality
  noiseSuppression: boolean
  echoCancellation: boolean
  autoGainControl: boolean
  pushToTalk: boolean
  pushToTalkKey?: string
  volume: {
    input: number
    output: number
  }
  notifications: {
    userJoined: boolean
    userLeft: boolean
    userStartedSpeaking: boolean
    userMuted: boolean
  }
}

export interface VoiceActivity {
  userId: string
  userName: string
  roomId: string
  roomName: string
  action: 'joined' | 'left' | 'started-speaking' | 'stopped-speaking' | 'muted' | 'unmuted' | 'raised-hand'
  timestamp: Date
}

export interface VoiceInvite {
  id: string
  roomId: string
  roomName: string
  invitedBy: string
  invitedByName: string
  invitedUser: string
  message?: string
  expiresAt: Date
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: Date
}

export interface AudioDevice {
  deviceId: string
  label: string
  kind: 'audioinput' | 'audiooutput'
  groupId: string
}

export interface VoiceAnalytics {
  roomId: string
  totalSessions: number
  totalDuration: number
  averageDuration: number
  peakParticipants: number
  totalParticipants: number
  recordings: number
  transcriptions: number
  speakingTime: Record<string, number>
  mostActiveUsers: Array<{
    userId: string
    userName: string
    speakingTime: number
    sessions: number
  }>
  timelineData: Array<{
    timestamp: Date
    participants: number
    speaking: number
  }>
}
