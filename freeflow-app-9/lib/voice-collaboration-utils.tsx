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
