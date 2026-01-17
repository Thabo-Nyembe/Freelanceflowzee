/**
 * Voice Collaboration Utilities
 * Helpers, mock data, and utilities for voice communication
 */

import {
  VoiceRoom,
  VoiceParticipant,
  VoiceRecording,
  VoiceQuality,
  VoiceRoomType,
  ParticipantStatus
} from './voice-collaboration-types'

// Mock Voice Rooms
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const MOCK_VOICE_ROOMS: VoiceRoom[] = []

// Mock Voice Recordings
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const MOCK_RECORDINGS: VoiceRecording[] = []

// Voice Quality Presets
export const VOICE_QUALITY_PRESETS = {
  low: {
    label: 'Low (Data Saver)',
    bitrate: 32,
    sampleRate: 16000,
    description: 'Optimized for slow connections'
  },
  medium: {
    label: 'Medium (Balanced)',
    bitrate: 64,
    sampleRate: 24000,
    description: 'Good quality with moderate bandwidth'
  },
  high: {
    label: 'High (Recommended)',
    bitrate: 128,
    sampleRate: 48000,
    description: 'Crystal clear voice quality'
  },
  ultra: {
    label: 'Ultra (Studio)',
    bitrate: 256,
    sampleRate: 48000,
    description: 'Professional recording quality'
  }
} as const

// Push-to-Talk Keys
export const PUSH_TO_TALK_KEYS = [
  { value: 'Space', label: 'Space Bar' },
  { value: 'Control', label: 'Ctrl' },
  { value: 'Alt', label: 'Alt' },
  { value: 'Shift', label: 'Shift' },
  { value: 'CapsLock', label: 'Caps Lock' },
  { value: 'Tab', label: 'Tab' },
  { value: 'KeyV', label: 'V' },
  { value: 'KeyT', label: 'T' }
]

// Room Categories
export const ROOM_CATEGORIES = [
  { value: 'Development', icon: 'Code', color: 'blue' },
  { value: 'Design', icon: 'Palette', color: 'purple' },
  { value: 'Business', icon: 'Briefcase', color: 'green' },
  { value: 'Marketing', icon: 'Megaphone', color: 'orange' },
  { value: 'Social', icon: 'Users', color: 'pink' },
  { value: 'Support', icon: 'Headphones', color: 'cyan' },
  { value: 'Other', icon: 'MoreHorizontal', color: 'gray' }
]

/**
 * Format duration in seconds to readable time
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Format duration to short form
 */
export function formatDurationShort(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}h`
  } else {
    return `${minutes}m`
  }
}

/**
 * Format file size in bytes to readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

/**
 * Calculate audio quality score
 */
export function calculateQualityScore(quality: VoiceQuality): number {
  const scores = {
    low: 25,
    medium: 50,
    high: 75,
    ultra: 100
  }
  return scores[quality]
}

/**
 * Get participant status color
 */
export function getStatusColor(status: ParticipantStatus): string {
  const colors = {
    connected: 'green',
    speaking: 'blue',
    muted: 'gray',
    away: 'yellow',
    disconnected: 'red'
  }
  return colors[status]
}

/**
 * Get room type badge color
 */
export function getRoomTypeBadgeColor(type: VoiceRoomType): string {
  const colors = {
    public: 'blue',
    private: 'purple',
    team: 'green',
    client: 'orange',
    project: 'cyan',
    meeting: 'pink'
  }
  return colors[type]
}

/**
 * Calculate estimated recording size
 */
export function estimateRecordingSize(
  durationSeconds: number,
  quality: VoiceQuality
): number {
  const bitrates = {
    low: 32,
    medium: 64,
    high: 128,
    ultra: 256
  }

  const bitrate = bitrates[quality]
  const bytesPerSecond = (bitrate * 1000) / 8
  return Math.round(durationSeconds * bytesPerSecond)
}

/**
 * Generate participant avatar color
 */
export function getParticipantColor(userId: string): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316'  // orange
  ]

  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Check if user can perform action
 */
export function canPerformAction(
  participant: VoiceParticipant,
  action: 'speak' | 'record' | 'mute' | 'kick'
): boolean {
  const permissions = {
    speak: participant.permissions.canSpeak,
    record: participant.permissions.canRecord,
    mute: participant.permissions.canMute,
    kick: participant.permissions.canKick
  }

  return permissions[action]
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

/**
 * Validate room capacity
 */
export function isRoomFull(room: VoiceRoom): boolean {
  return room.currentParticipants >= room.capacity
}

/**
 * Get room availability status
 */
export function getRoomAvailability(room: VoiceRoom): {
  available: boolean
  reason?: string
} {
  if (room.isLocked) {
    return { available: false, reason: 'Room is locked' }
  }

  if (isRoomFull(room)) {
    return { available: false, reason: 'Room is full' }
  }

  return { available: true }
}

/**
 * Calculate speaking percentage
 */
export function calculateSpeakingPercentage(
  speakingTime: number,
  totalTime: number
): number {
  if (totalTime === 0) return 0
  return Math.round((speakingTime / totalTime) * 100)
}

/**
 * Generate mock audio waveform data
 */
export function generateWaveformData(segments: number = 50): number[] {
  return Array.from({ length: segments }, () => Math.random() * 100)
}
