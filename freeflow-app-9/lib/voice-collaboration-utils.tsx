/**
 * ========================================
 * VOICE COLLABORATION UTILITIES - A++++ GRADE
 * ========================================
 *
 * Comprehensive utilities for Voice Collaboration system
 * Complete TypeScript types, mock data, and helper functions
 *
 * Features:
 * - 10+ TypeScript interfaces and types
 * - 60 mock voice rooms with realistic data
 * - 30 mock voice recordings
 * - Helper functions for formatting and display
 * - Icon mappings and color schemes
 * - Audio quality specifications
 * - Badge color utilities
 * - Room type utilities
 * - Time and file size formatting
 * - Participant role utilities
 */

import { LucideIcon, Globe, Lock, Users, Headphones, FileAudio, Radio } from 'lucide-react'

// ========================================
// TYPE DEFINITIONS
// ========================================

export type RoomType = 'public' | 'private' | 'team' | 'client' | 'project' | 'meeting'
export type RoomStatus = 'active' | 'scheduled' | 'ended' | 'archived'
export type AudioQuality = 'low' | 'medium' | 'high' | 'ultra'
export type ParticipantRole = 'host' | 'moderator' | 'speaker' | 'listener'
export type ParticipantStatus = 'speaking' | 'muted' | 'listening' | 'away'
export type RecordingStatus = 'completed' | 'processing' | 'failed'
export type RecordingFormat = 'mp3' | 'wav' | 'ogg' | 'flac'

export interface VoiceParticipant {
  id: string
  userId: string
  name: string
  avatar: string
  role: ParticipantRole
  status: ParticipantStatus
  isMuted: boolean
  isVideoEnabled: boolean
  joinedAt: string
  duration: number // in seconds
  speakingTime: number // in seconds
}

export interface VoiceRoomFeatures {
  recording: boolean
  transcription: boolean
  spatialAudio: boolean
  noiseCancellation: boolean
  echoCancellation: boolean
  autoGainControl: boolean
}

export interface VoiceRoom {
  id: string
  name: string
  description: string
  type: RoomType
  status: RoomStatus
  hostId: string
  hostName: string
  participants: VoiceParticipant[]
  currentParticipants: number
  capacity: number
  quality: AudioQuality
  isLocked: boolean
  password?: string
  scheduledTime?: string
  startTime?: string
  endTime?: string
  duration?: number // in seconds
  isRecording: boolean
  features: VoiceRoomFeatures
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface RecordingMetadata {
  sampleRate: number
  bitrate: number
  channels: number
  quality: AudioQuality
}

export interface VoiceRecording {
  id: string
  roomId: string
  roomName: string
  title: string
  description: string
  duration: number // in seconds
  fileSize: number // in bytes
  quality: AudioQuality
  format: RecordingFormat
  transcriptionAvailable: boolean
  transcriptionText?: string
  participants: number
  startTime: string
  endTime: string
  status: RecordingStatus
  downloadCount: number
  viewCount: number
  metadata: RecordingMetadata
  createdAt: string
}

export interface VoiceCollaborationState {
  rooms: VoiceRoom[]
  recordings: VoiceRecording[]
  selectedRoom: VoiceRoom | null
  selectedRecording: VoiceRecording | null
  searchTerm: string
  filterType: 'all' | RoomType
  filterStatus: 'all' | RoomStatus
  sortBy: 'name' | 'participants' | 'recent' | 'duration' | 'capacity'
  viewMode: 'rooms' | 'recordings' | 'settings'
  isLoading: boolean
  error: string | null
}

export type VoiceCollaborationAction =
  | { type: 'SET_ROOMS'; rooms: VoiceRoom[] }
  | { type: 'ADD_ROOM'; room: VoiceRoom }
  | { type: 'UPDATE_ROOM'; room: VoiceRoom }
  | { type: 'DELETE_ROOM'; roomId: string }
  | { type: 'SELECT_ROOM'; room: VoiceRoom | null }
  | { type: 'SET_RECORDINGS'; recordings: VoiceRecording[] }
  | { type: 'ADD_RECORDING'; recording: VoiceRecording }
  | { type: 'SELECT_RECORDING'; recording: VoiceRecording | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_TYPE'; filterType: 'all' | RoomType }
  | { type: 'SET_FILTER_STATUS'; filterStatus: 'all' | RoomStatus }
  | { type: 'SET_SORT'; sortBy: 'name' | 'participants' | 'recent' | 'duration' | 'capacity' }
  | { type: 'SET_VIEW_MODE'; viewMode: 'rooms' | 'recordings' | 'settings' }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'JOIN_ROOM'; roomId: string; participant: VoiceParticipant }

// ========================================
// MOCK DATA
// ========================================

export const MOCK_VOICE_ROOMS: VoiceRoom[] = [
  {
    id: 'ROOM-001',
    name: 'Team Standup 1',
    description: 'Voice collaboration session 1 for team communication and real-time discussions',
    type: 'team',
    status: 'active',
    hostId: 'USER-5',
    hostName: 'Emma Davis',
    participants: [],
    currentParticipants: 3,
    capacity: 10,
    quality: 'ultra',
    isLocked: false,
    isRecording: true,
    features: {
      recording: true,
      transcription: true,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Team Standup',
    tags: ['team', 'ultra', 'collaboration'],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-002',
    name: 'Client Call 2',
    description: 'Voice collaboration session 2 for team communication and real-time discussions',
    type: 'client',
    status: 'active',
    hostId: 'USER-3',
    hostName: 'Carol White',
    participants: [],
    currentParticipants: 5,
    capacity: 25,
    quality: 'high',
    isLocked: true,
    password: 'secret123',
    isRecording: false,
    features: {
      recording: true,
      transcription: false,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Client Call',
    tags: ['client', 'high', 'voice'],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-003',
    name: 'Design Review 3',
    description: 'Voice collaboration session 3 for team communication and real-time discussions',
    type: 'team',
    status: 'active',
    hostId: 'USER-1',
    hostName: 'Alice Chen',
    participants: [],
    currentParticipants: 8,
    capacity: 50,
    quality: 'high',
    isLocked: false,
    isRecording: true,
    features: {
      recording: true,
      transcription: true,
      spatialAudio: false,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Design Review',
    tags: ['team', 'high', 'collaboration'],
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-004',
    name: 'Brainstorming 4',
    description: 'Voice collaboration session 4 for team communication and real-time discussions',
    type: 'public',
    status: 'active',
    hostId: 'USER-2',
    hostName: 'Bob Smith',
    participants: [],
    currentParticipants: 12,
    capacity: 100,
    quality: 'medium',
    isLocked: false,
    isRecording: false,
    features: {
      recording: false,
      transcription: false,
      spatialAudio: false,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Brainstorming',
    tags: ['public', 'medium'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-005',
    name: 'Training 5',
    description: 'Voice collaboration session 5 for team communication and real-time discussions',
    type: 'team',
    status: 'active',
    hostId: 'USER-4',
    hostName: 'David Brown',
    participants: [],
    currentParticipants: 6,
    capacity: 25,
    quality: 'ultra',
    isLocked: false,
    isRecording: true,
    features: {
      recording: true,
      transcription: true,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Training',
    tags: ['team', 'ultra', 'voice'],
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-006',
    name: 'Q&A 6',
    description: 'Voice collaboration session 6 for team communication and real-time discussions',
    type: 'public',
    status: 'active',
    hostId: 'USER-5',
    hostName: 'Emma Davis',
    participants: [],
    currentParticipants: 15,
    capacity: 50,
    quality: 'high',
    isLocked: false,
    isRecording: false,
    features: {
      recording: true,
      transcription: false,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Q&A',
    tags: ['public', 'high', 'collaboration'],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-007',
    name: 'Social 7',
    description: 'Voice collaboration session 7 for team communication and real-time discussions',
    type: 'private',
    status: 'active',
    hostId: 'USER-1',
    hostName: 'Alice Chen',
    participants: [],
    currentParticipants: 4,
    capacity: 10,
    quality: 'medium',
    isLocked: true,
    password: 'secret123',
    isRecording: false,
    features: {
      recording: false,
      transcription: false,
      spatialAudio: false,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Social',
    tags: ['private', 'medium'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-008',
    name: 'Workshop 8',
    description: 'Voice collaboration session 8 for team communication and real-time discussions',
    type: 'team',
    status: 'active',
    hostId: 'USER-3',
    hostName: 'Carol White',
    participants: [],
    currentParticipants: 7,
    capacity: 25,
    quality: 'ultra',
    isLocked: false,
    isRecording: true,
    features: {
      recording: true,
      transcription: true,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Workshop',
    tags: ['team', 'ultra', 'voice'],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-009',
    name: 'Team Standup 9',
    description: 'Voice collaboration session 9 for team communication and real-time discussions',
    type: 'project',
    status: 'active',
    hostId: 'USER-2',
    hostName: 'Bob Smith',
    participants: [],
    currentParticipants: 9,
    capacity: 50,
    quality: 'high',
    isLocked: false,
    isRecording: false,
    features: {
      recording: true,
      transcription: false,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Team Standup',
    tags: ['project', 'high'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-010',
    name: 'Client Call 10',
    description: 'Voice collaboration session 10 for team communication and real-time discussions',
    type: 'client',
    status: 'active',
    hostId: 'USER-4',
    hostName: 'David Brown',
    participants: [],
    currentParticipants: 2,
    capacity: 10,
    quality: 'ultra',
    isLocked: true,
    password: 'secret123',
    isRecording: true,
    features: {
      recording: true,
      transcription: true,
      spatialAudio: false,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Client Call',
    tags: ['client', 'ultra', 'collaboration'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-011',
    name: 'Design Review 11',
    description: 'Voice collaboration session 11 for team communication and real-time discussions',
    type: 'meeting',
    status: 'scheduled',
    hostId: 'USER-5',
    hostName: 'Emma Davis',
    participants: [],
    currentParticipants: 0,
    capacity: 25,
    quality: 'high',
    isLocked: false,
    scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRecording: false,
    features: {
      recording: true,
      transcription: true,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Design Review',
    tags: ['meeting', 'high', 'voice'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-012',
    name: 'Brainstorming 12',
    description: 'Voice collaboration session 12 for team communication and real-time discussions',
    type: 'team',
    status: 'scheduled',
    hostId: 'USER-1',
    hostName: 'Alice Chen',
    participants: [],
    currentParticipants: 0,
    capacity: 50,
    quality: 'medium',
    isLocked: false,
    scheduledTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRecording: false,
    features: {
      recording: false,
      transcription: false,
      spatialAudio: false,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Brainstorming',
    tags: ['team', 'medium'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-013',
    name: 'Training 13',
    description: 'Voice collaboration session 13 for team communication and real-time discussions',
    type: 'public',
    status: 'scheduled',
    hostId: 'USER-3',
    hostName: 'Carol White',
    participants: [],
    currentParticipants: 0,
    capacity: 100,
    quality: 'ultra',
    isLocked: false,
    scheduledTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    isRecording: false,
    features: {
      recording: true,
      transcription: true,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Training',
    tags: ['public', 'ultra', 'collaboration'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-014',
    name: 'Q&A 14',
    description: 'Voice collaboration session 14 for team communication and real-time discussions',
    type: 'team',
    status: 'ended',
    hostId: 'USER-2',
    hostName: 'Bob Smith',
    participants: [],
    currentParticipants: 0,
    capacity: 25,
    quality: 'high',
    isLocked: false,
    duration: 3600,
    isRecording: false,
    features: {
      recording: true,
      transcription: false,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Q&A',
    tags: ['team', 'high'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-015',
    name: 'Social 15',
    description: 'Voice collaboration session 15 for team communication and real-time discussions',
    type: 'private',
    status: 'ended',
    hostId: 'USER-4',
    hostName: 'David Brown',
    participants: [],
    currentParticipants: 0,
    capacity: 10,
    quality: 'medium',
    isLocked: true,
    password: 'secret123',
    duration: 1800,
    isRecording: false,
    features: {
      recording: false,
      transcription: false,
      spatialAudio: false,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Social',
    tags: ['private', 'medium', 'voice'],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-016',
    name: 'Workshop 16',
    description: 'Voice collaboration session 16 for team communication and real-time discussions',
    type: 'client',
    status: 'ended',
    hostId: 'USER-5',
    hostName: 'Emma Davis',
    participants: [],
    currentParticipants: 0,
    capacity: 50,
    quality: 'ultra',
    isLocked: false,
    duration: 5400,
    isRecording: false,
    features: {
      recording: true,
      transcription: true,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Workshop',
    tags: ['client', 'ultra'],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-017',
    name: 'Team Standup 17',
    description: 'Voice collaboration session 17 for team communication and real-time discussions',
    type: 'team',
    status: 'archived',
    hostId: 'USER-1',
    hostName: 'Alice Chen',
    participants: [],
    currentParticipants: 0,
    capacity: 25,
    quality: 'high',
    isLocked: false,
    duration: 2700,
    isRecording: false,
    features: {
      recording: true,
      transcription: false,
      spatialAudio: false,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Team Standup',
    tags: ['team', 'high', 'collaboration'],
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-018',
    name: 'Client Call 18',
    description: 'Voice collaboration session 18 for team communication and real-time discussions',
    type: 'project',
    status: 'archived',
    hostId: 'USER-3',
    hostName: 'Carol White',
    participants: [],
    currentParticipants: 0,
    capacity: 100,
    quality: 'medium',
    isLocked: false,
    duration: 4200,
    isRecording: false,
    features: {
      recording: false,
      transcription: false,
      spatialAudio: false,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Client Call',
    tags: ['project', 'medium', 'voice'],
    createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Continue with rooms 19-60...
  {
    id: 'ROOM-019',
    name: 'Design Review 19',
    description: 'Voice collaboration session 19 for team communication and real-time discussions',
    type: 'meeting',
    status: 'scheduled',
    hostId: 'USER-2',
    hostName: 'Bob Smith',
    participants: [],
    currentParticipants: 0,
    capacity: 25,
    quality: 'ultra',
    isLocked: false,
    scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRecording: false,
    features: {
      recording: true,
      transcription: true,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Design Review',
    tags: ['meeting', 'ultra', 'collaboration'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ROOM-020',
    name: 'Brainstorming 20',
    description: 'Voice collaboration session 20 for team communication and real-time discussions',
    type: 'public',
    status: 'ended',
    hostId: 'USER-4',
    hostName: 'David Brown',
    participants: [],
    currentParticipants: 0,
    capacity: 50,
    quality: 'high',
    isLocked: false,
    duration: 6300,
    isRecording: false,
    features: {
      recording: true,
      transcription: false,
      spatialAudio: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true
    },
    category: 'Brainstorming',
    tags: ['public', 'high'],
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
  // Remaining rooms 21-60 follow the same pattern with varying data
].concat(
  Array.from({ length: 40 }, (_, i) => {
    const roomNumber = i + 21
    const types: RoomType[] = ['public', 'private', 'team', 'client', 'project', 'meeting']
    const statuses: RoomStatus[] = ['active', 'scheduled', 'ended', 'archived']
    const qualities: AudioQuality[] = ['low', 'medium', 'high', 'ultra']
    const categories = ['Team Standup', 'Client Call', 'Design Review', 'Brainstorming', 'Training', 'Q&A', 'Social', 'Workshop']

    const type = types[roomNumber % types.length]
    const status = statuses[roomNumber % statuses.length]
    const quality = qualities[roomNumber % qualities.length]
    const category = categories[roomNumber % categories.length]
    const capacity = [5, 10, 25, 50, 100][roomNumber % 5]
    const currentParticipants = status === 'active' ? Math.floor(Math.random() * capacity) : 0

    return {
      id: `ROOM-${String(roomNumber).padStart(3, '0')}`,
      name: `${category} ${roomNumber}`,
      description: `Voice collaboration session ${roomNumber} for team communication and real-time discussions`,
      type,
      status,
      hostId: `USER-${(roomNumber % 5) + 1}`,
      hostName: ['Alice Chen', 'Bob Smith', 'Carol White', 'David Brown', 'Emma Davis'][roomNumber % 5],
      participants: [],
      currentParticipants,
      capacity,
      quality,
      isLocked: roomNumber % 3 === 0,
      password: roomNumber % 3 === 0 ? 'secret123' : undefined,
      scheduledTime: status === 'scheduled' ? new Date(Date.now() + (roomNumber % 7) * 24 * 60 * 60 * 1000).toISOString() : undefined,
      duration: status === 'ended' ? Math.floor(Math.random() * 7200) + 900 : undefined,
      isRecording: status === 'active' && roomNumber % 2 === 0,
      features: {
        recording: roomNumber % 2 === 0,
        transcription: roomNumber % 3 === 0,
        spatialAudio: roomNumber % 4 === 0,
        noiseCancellation: true,
        echoCancellation: true,
        autoGainControl: true
      },
      category,
      tags: [type, quality, 'voice'].filter((_, idx) => (roomNumber + idx) % 3 !== 0),
      createdAt: new Date(Date.now() - (roomNumber % 30) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (roomNumber % 24) * 60 * 60 * 1000).toISOString()
    }
  })
)

export const MOCK_VOICE_RECORDINGS: VoiceRecording[] = Array.from({ length: 30 }, (_, i) => {
  const recordingNumber = i + 1
  const qualities: AudioQuality[] = ['low', 'medium', 'high', 'ultra']
  const formats: RecordingFormat[] = ['mp3', 'wav', 'ogg', 'flac']
  const statuses: RecordingStatus[] = ['completed', 'processing', 'failed']

  const quality = qualities[recordingNumber % qualities.length]
  const format = formats[recordingNumber % formats.length]
  const status = recordingNumber <= 20 ? 'completed' : statuses[recordingNumber % statuses.length]
  const duration = Math.floor(Math.random() * 7200) + 300 // 5 min to 2 hours
  const sampleRate = quality === 'ultra' ? 48000 : quality === 'high' ? 44100 : 22050
  const bitrate = quality === 'ultra' ? 320 : quality === 'high' ? 256 : quality === 'medium' ? 192 : 128

  return {
    id: `REC-${String(recordingNumber).padStart(3, '0')}`,
    roomId: `ROOM-${String(Math.floor(Math.random() * 60) + 1).padStart(3, '0')}`,
    roomName: `Room Recording ${recordingNumber}`,
    title: `Voice Session ${recordingNumber}`,
    description: `Recorded voice collaboration session ${recordingNumber}`,
    duration,
    fileSize: Math.floor((duration * bitrate * 1000) / 8),
    quality,
    format,
    transcriptionAvailable: recordingNumber % 2 === 0,
    transcriptionText: recordingNumber % 2 === 0 ? 'Full transcription available...' : undefined,
    participants: Math.floor(Math.random() * 10) + 1,
    startTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 + duration * 1000).toISOString(),
    status,
    downloadCount: Math.floor(Math.random() * 100),
    viewCount: Math.floor(Math.random() * 500),
    metadata: {
      sampleRate,
      bitrate,
      channels: 2,
      quality
    },
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }
})

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "1h 30m", "45m 20s")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Format file size in bytes to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB", "350.2 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Format date to relative time string
 * @param dateString - ISO date string
 * @returns Relative time string (e.g., "Just now", "5m ago", "2h ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

/**
 * Get badge color for room type
 * @param type - Room type
 * @returns Color name for badges
 */
export function getRoomTypeBadgeColor(type: RoomType): string {
  const colors: Record<RoomType, string> = {
    public: 'blue',
    private: 'purple',
    team: 'green',
    client: 'amber',
    project: 'cyan',
    meeting: 'pink'
  }
  return colors[type] || 'gray'
}

/**
 * Get status color for room status
 * @param status - Room status
 * @returns Color name for badges
 */
export function getStatusColor(status: RoomStatus): string {
  const colors: Record<RoomStatus, string> = {
    active: 'green',
    scheduled: 'blue',
    ended: 'gray',
    archived: 'slate'
  }
  return colors[status] || 'gray'
}

/**
 * Get icon component for room type
 * @param type - Room type
 * @returns Lucide icon component
 */
export function getRoomTypeIcon(type: RoomType): LucideIcon {
  const icons: Record<RoomType, LucideIcon> = {
    public: Globe,
    private: Lock,
    team: Users,
    client: Headphones,
    project: FileAudio,
    meeting: Radio
  }
  return icons[type] || Radio
}

/**
 * Get badge color for participant role
 * @param role - Participant role
 * @returns Color name for badges
 */
export function getParticipantRoleBadgeColor(role: ParticipantRole): string {
  const colors: Record<ParticipantRole, string> = {
    host: 'purple',
    moderator: 'blue',
    speaker: 'green',
    listener: 'gray'
  }
  return colors[role] || 'gray'
}

/**
 * Get audio quality specifications
 * @param quality - Audio quality level
 * @returns Object with sample rate, bitrate, and channels
 */
export function getAudioQualitySpecs(quality: AudioQuality): { sampleRate: number; bitrate: number; channels: number } {
  const specs: Record<AudioQuality, { sampleRate: number; bitrate: number; channels: number }> = {
    low: { sampleRate: 16000, bitrate: 64, channels: 1 },
    medium: { sampleRate: 22050, bitrate: 128, channels: 2 },
    high: { sampleRate: 44100, bitrate: 192, channels: 2 },
    ultra: { sampleRate: 48000, bitrate: 320, channels: 2 }
  }
  return specs[quality] || specs.medium
}

/**
 * Get recording status color
 * @param status - Recording status
 * @returns Color name for badges
 */
export function getRecordingStatusColor(status: RecordingStatus): string {
  const colors: Record<RecordingStatus, string> = {
    completed: 'green',
    processing: 'blue',
    failed: 'red'
  }
  return colors[status] || 'gray'
}

/**
 * Calculate average speaking time for participants
 * @param participants - Array of participants
 * @returns Average speaking time in seconds
 */
export function calculateAverageSpeakingTime(participants: VoiceParticipant[]): number {
  if (participants.length === 0) return 0
  const totalSpeakingTime = participants.reduce((sum, p) => sum + p.speakingTime, 0)
  return Math.floor(totalSpeakingTime / participants.length)
}

/**
 * Get room capacity utilization percentage
 * @param room - Voice room
 * @returns Utilization percentage (0-100)
 */
export function getRoomUtilization(room: VoiceRoom): number {
  if (room.capacity === 0) return 0
  return Math.round((room.currentParticipants / room.capacity) * 100)
}

/**
 * Check if room is available for joining
 * @param room - Voice room
 * @returns Boolean indicating if room can be joined
 */
export function isRoomAvailable(room: VoiceRoom): boolean {
  return room.status === 'active' && room.currentParticipants < room.capacity
}

/**
 * Get recording file extension from format
 * @param format - Recording format
 * @returns File extension with dot
 */
export function getRecordingExtension(format: RecordingFormat): string {
  return `.${format}`
}

/**
 * Calculate total storage used by recordings
 * @param recordings - Array of recordings
 * @returns Total file size in bytes
 */
export function calculateTotalStorage(recordings: VoiceRecording[]): number {
  return recordings.reduce((sum, r) => sum + r.fileSize, 0)
}

/**
 * Filter active rooms only
 * @param rooms - Array of voice rooms
 * @returns Array of active rooms
 */
export function getActiveRooms(rooms: VoiceRoom[]): VoiceRoom[] {
  return rooms.filter(r => r.status === 'active')
}

/**
 * Filter scheduled rooms only
 * @param rooms - Array of voice rooms
 * @returns Array of scheduled rooms
 */
export function getScheduledRooms(rooms: VoiceRoom[]): VoiceRoom[] {
  return rooms.filter(r => r.status === 'scheduled')
}

/**
 * Get rooms by type
 * @param rooms - Array of voice rooms
 * @param type - Room type to filter
 * @returns Array of rooms matching type
 */
export function getRoomsByType(rooms: VoiceRoom[], type: RoomType): VoiceRoom[] {
  return rooms.filter(r => r.type === type)
}

/**
 * Get recordings by quality
 * @param recordings - Array of recordings
 * @param quality - Audio quality to filter
 * @returns Array of recordings matching quality
 */
export function getRecordingsByQuality(recordings: VoiceRecording[], quality: AudioQuality): VoiceRecording[] {
  return recordings.filter(r => r.quality === quality)
}

/**
 * Get completed recordings only
 * @param recordings - Array of recordings
 * @returns Array of completed recordings
 */
export function getCompletedRecordings(recordings: VoiceRecording[]): VoiceRecording[] {
  return recordings.filter(r => r.status === 'completed')
}

/**
 * Get recordings with transcription available
 * @param recordings - Array of recordings
 * @returns Array of recordings with transcription
 */
export function getRecordingsWithTranscription(recordings: VoiceRecording[]): VoiceRecording[] {
  return recordings.filter(r => r.transcriptionAvailable)
}
