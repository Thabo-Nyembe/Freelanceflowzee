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
export const MOCK_VOICE_ROOMS: VoiceRoom[] = [
  {
    id: 'room-1',
    name: 'Project Discussion',
    description: 'Daily standup and project updates',
    type: 'team',
    capacity: 25,
    currentParticipants: 8,
    participants: [],
    host: 'user_123',
    isLocked: false,
    quality: 'high',
    features: {
      recording: true,
      transcription: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true,
      spatialAudio: true
    },
    metadata: {
      createdAt: new Date(),
      createdBy: 'user_123',
      projectId: 'proj_456',
      tags: ['standup', 'project', 'team'],
      category: 'Development'
    }
  },
  {
    id: 'room-2',
    name: 'Client Presentation',
    description: 'Quarterly business review with stakeholders',
    type: 'client',
    capacity: 50,
    currentParticipants: 12,
    participants: [],
    host: 'user_456',
    isLocked: true,
    password: 'protected',
    quality: 'ultra',
    features: {
      recording: true,
      transcription: true,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true,
      spatialAudio: false
    },
    metadata: {
      createdAt: new Date(),
      createdBy: 'user_456',
      tags: ['client', 'presentation', 'quarterly'],
      category: 'Business'
    }
  },
  {
    id: 'room-3',
    name: 'Design Sync',
    description: 'Weekly design team collaboration',
    type: 'team',
    capacity: 15,
    currentParticipants: 5,
    participants: [],
    host: 'user_789',
    isLocked: false,
    quality: 'high',
    features: {
      recording: false,
      transcription: false,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: true,
      spatialAudio: true
    },
    metadata: {
      createdAt: new Date(),
      createdBy: 'user_789',
      tags: ['design', 'creative', 'weekly'],
      category: 'Design'
    }
  },
  {
    id: 'room-4',
    name: 'General Lounge',
    description: 'Casual hangout and water cooler talk',
    type: 'public',
    capacity: 100,
    currentParticipants: 23,
    participants: [],
    host: 'user_admin',
    isLocked: false,
    quality: 'medium',
    features: {
      recording: false,
      transcription: false,
      noiseCancellation: true,
      echoCancellation: true,
      autoGainControl: false,
      spatialAudio: false
    },
    metadata: {
      createdAt: new Date(),
      createdBy: 'user_admin',
      tags: ['casual', 'social', 'lounge'],
      category: 'Social'
    }
  }
]

// Mock Voice Recordings
export const MOCK_RECORDINGS: VoiceRecording[] = [
  {
    id: 'rec-1',
    roomId: 'room-1',
    title: 'Sprint Planning - Week 42',
    description: 'Sprint planning session with the development team',
    status: 'completed',
    audioUrl: '/recordings/sprint-planning-42.mp3',
    duration: 3600,
    fileSize: 72000000,
    startTime: new Date('2025-01-15T10:00:00Z'),
    endTime: new Date('2025-01-15T11:00:00Z'),
    recordedBy: 'user_123',
    participants: ['user_123', 'user_456', 'user_789'],
    metadata: {
      quality: 'high',
      format: 'mp3',
      sampleRate: 48000,
      bitrate: 192
    }
  },
  {
    id: 'rec-2',
    roomId: 'room-2',
    title: 'Q1 Client Review',
    description: 'Quarterly business review with client stakeholders',
    status: 'completed',
    audioUrl: '/recordings/q1-client-review.mp3',
    duration: 5400,
    fileSize: 108000000,
    startTime: new Date('2025-01-14T14:00:00Z'),
    endTime: new Date('2025-01-14T15:30:00Z'),
    recordedBy: 'user_456',
    participants: ['user_456', 'user_789', 'client_123'],
    metadata: {
      quality: 'ultra',
      format: 'mp3',
      sampleRate: 48000,
      bitrate: 256
    }
  }
]

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
