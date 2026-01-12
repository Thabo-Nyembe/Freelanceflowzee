/**
 * Audio Studio Utilities
 * Helper functions and mock data for audio production system
 */

import {
  AudioProject,
  AudioFile,
  AudioPreset,
  AudioTemplate,
  AudioEffect,
  AudioFormat,
  AudioQuality,
  AudioStats,
  AudioLibrary
} from './audio-studio-types'

export const AUDIO_FORMATS: Array<{ id: AudioFormat; name: string; description: string; extension: string }> = [
  { id: 'mp3', name: 'MP3', description: 'Universal compatibility', extension: '.mp3' },
  { id: 'wav', name: 'WAV', description: 'Uncompressed audio', extension: '.wav' },
  { id: 'aac', name: 'AAC', description: 'High quality, small size', extension: '.aac' },
  { id: 'flac', name: 'FLAC', description: 'Lossless compression', extension: '.flac' },
  { id: 'ogg', name: 'OGG', description: 'Open source format', extension: '.ogg' },
  { id: 'm4a', name: 'M4A', description: 'Apple format', extension: '.m4a' }
]

export const QUALITY_PRESETS: Array<{ id: AudioQuality; name: string; bitRate: number; description: string }> = [
  { id: 'low', name: 'Low (128 kbps)', bitRate: 128, description: 'Good for voice, small file size' },
  { id: 'medium', name: 'Medium (192 kbps)', bitRate: 192, description: 'Good balance for most uses' },
  { id: 'high', name: 'High (320 kbps)', bitRate: 320, description: 'Professional quality' },
  { id: 'lossless', name: 'Lossless', bitRate: 1411, description: 'Studio quality, large files' }
]

export const AUDIO_EFFECT_PRESETS: AudioPreset[] = [
  {
    id: 'reverb-hall',
    name: 'Concert Hall',
    category: 'Reverb',
    effectType: 'reverb',
    parameters: { roomSize: 0.8, decay: 2.5, wetDry: 0.3 },
    description: 'Large hall reverb',
    isDefault: true
  },
  {
    id: 'reverb-room',
    name: 'Small Room',
    category: 'Reverb',
    effectType: 'reverb',
    parameters: { roomSize: 0.3, decay: 0.8, wetDry: 0.2 },
    description: 'Intimate room sound',
    isDefault: true
  },
  {
    id: 'delay-slap',
    name: 'Slapback Delay',
    category: 'Delay',
    effectType: 'delay',
    parameters: { time: 120, feedback: 0.2, wetDry: 0.3 },
    description: 'Classic slapback effect',
    isDefault: true
  },
  {
    id: 'comp-vocal',
    name: 'Vocal Compressor',
    category: 'Dynamics',
    effectType: 'compressor',
    parameters: { threshold: -18, ratio: 4, attack: 5, release: 50 },
    description: 'Smooth vocal compression',
    isDefault: true
  },
  {
    id: 'eq-voice',
    name: 'Voice Enhancement',
    category: 'EQ',
    effectType: 'eq',
    parameters: { low: -2, mid: 3, high: 2 },
    description: 'Enhance vocal clarity',
    isDefault: true
  }
]

export const AUDIO_TEMPLATES: AudioTemplate[] = [
  {
    id: 'podcast',
    name: 'Podcast Episode',
    description: 'Two-track setup for podcast recording',
    category: 'Podcast',
    tracks: [
      {
        name: 'Host',
        type: 'voice',
        volume: 0.8,
        pan: -0.2,
        muted: false,
        solo: false,
        effects: [],
        regions: [],
        color: '#3b82f6',
        order: 0
      },
      {
        name: 'Guest',
        type: 'voice',
        volume: 0.8,
        pan: 0.2,
        muted: false,
        solo: false,
        effects: [],
        regions: [],
        color: '#8b5cf6',
        order: 1
      },
      {
        name: 'Music',
        type: 'music',
        volume: 0.3,
        pan: 0,
        muted: false,
        solo: false,
        effects: [],
        regions: [],
        color: '#10b981',
        order: 2
      }
    ],
    tempo: 120,
    duration: 3600,
    thumbnail: '/templates/podcast.jpg',
    popularity: 95
  },
  {
    id: 'music-production',
    name: 'Music Production',
    description: 'Multi-track setup for music creation',
    category: 'Music',
    tracks: [
      {
        name: 'Drums',
        type: 'audio',
        volume: 0.7,
        pan: 0,
        muted: false,
        solo: false,
        effects: [],
        regions: [],
        color: '#ef4444',
        order: 0
      },
      {
        name: 'Bass',
        type: 'audio',
        volume: 0.6,
        pan: 0,
        muted: false,
        solo: false,
        effects: [],
        regions: [],
        color: '#f59e0b',
        order: 1
      },
      {
        name: 'Guitar',
        type: 'audio',
        volume: 0.5,
        pan: -0.3,
        muted: false,
        solo: false,
        effects: [],
        regions: [],
        color: '#3b82f6',
        order: 2
      },
      {
        name: 'Vocals',
        type: 'voice',
        volume: 0.8,
        pan: 0,
        muted: false,
        solo: false,
        effects: [],
        regions: [],
        color: '#8b5cf6',
        order: 3
      }
    ],
    tempo: 120,
    duration: 240,
    thumbnail: '/templates/music.jpg',
    popularity: 88
  },
  {
    id: 'voiceover',
    name: 'Voice Over',
    description: 'Professional voiceover recording',
    category: 'Voice',
    tracks: [
      {
        name: 'Voice',
        type: 'voice',
        volume: 0.8,
        pan: 0,
        muted: false,
        solo: false,
        effects: [],
        regions: [],
        color: '#3b82f6',
        order: 0
      }
    ],
    tempo: 120,
    duration: 600,
    thumbnail: '/templates/voiceover.jpg',
    popularity: 82
  }
]

export const MOCK_AUDIO_PROJECTS: AudioProject[] = [
  {
    id: 'proj-1',
    name: 'Podcast Episode 15',
    description: 'Interview with industry expert',
    tracks: [],
    tempo: 120,
    duration: 2847,
    sampleRate: 48000,
    format: 'mp3',
    quality: 'high',
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 3600000),
    createdBy: 'user-1',
    tags: ['podcast', 'interview']
  },
  {
    id: 'proj-2',
    name: 'Product Demo Audio',
    description: 'Background music for product video',
    tracks: [],
    tempo: 128,
    duration: 180,
    sampleRate: 44100,
    format: 'wav',
    quality: 'lossless',
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 7200000),
    createdBy: 'user-1',
    tags: ['commercial', 'music']
  }
]

export const MOCK_AUDIO_FILES: AudioFile[] = [
  {
    id: 'file-1',
    name: 'intro-music.mp3',
    url: '/audio/intro.mp3',
    format: 'mp3',
    duration: 45,
    size: 1024000,
    sampleRate: 44100,
    bitRate: 192,
    channels: 2,
    createdAt: new Date(Date.now() - 86400000 * 3),
    uploadedBy: 'user-1'
  },
  {
    id: 'file-2',
    name: 'voice-recording.wav',
    url: '/audio/voice.wav',
    format: 'wav',
    duration: 180,
    size: 15360000,
    sampleRate: 48000,
    bitRate: 1411,
    channels: 1,
    createdAt: new Date(Date.now() - 86400000 * 1),
    uploadedBy: 'user-1'
  }
]

export const MOCK_AUDIO_LIBRARIES: AudioLibrary[] = [
  {
    id: 'lib-1',
    name: 'Sound Effects',
    files: [],
    category: 'sfx',
    tags: ['impact', 'transition', 'ambient'],
    isPublic: true,
    createdBy: 'user-1'
  },
  {
    id: 'lib-2',
    name: 'Music Loops',
    files: [],
    category: 'loops',
    tags: ['electronic', 'drums', 'bass'],
    isPublic: false,
    createdBy: 'user-1'
  }
]

export const MOCK_AUDIO_STATS: AudioStats = {
  totalProjects: 15,
  totalRecordings: 42,
  totalDuration: 18450,
  storageUsed: 2457600000,
  storageLimit: 10737418240,
  exportCount: 28,
  collaborators: 5
}

// Helper Functions
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function formatBitRate(kbps: number): string {
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`
  }
  return `${kbps} kbps`
}

export function formatSampleRate(hz: number): string {
  if (hz >= 1000) {
    return `${(hz / 1000).toFixed(1)} kHz`
  }
  return `${hz} Hz`
}

export function calculateStoragePercentage(used: number, limit: number): number {
  return Math.round((used / limit) * 100)
}

export function estimateExportTime(duration: number, quality: AudioQuality): number {
  const baseTimePerSecond = 0.1 // seconds
  const qualityMultiplier = {
    low: 1,
    medium: 1.5,
    high: 2,
    lossless: 3
  }

  return Math.ceil(duration * baseTimePerSecond * qualityMultiplier[quality])
}

export function generateWaveform(audioData: number[], samples: number = 100): number[] {
  const blockSize = Math.floor(audioData.length / samples)
  const waveform: number[] = []

  for (let i = 0; i < samples; i++) {
    const start = i * blockSize
    const end = start + blockSize
    const slice = audioData.slice(start, end)

    const peak = Math.max(...slice.map(Math.abs))
    waveform.push(peak)
  }

  return waveform
}

export function getEffectIcon(effect: AudioEffect): string {
  const icons: Record<AudioEffect, string> = {
    reverb: '🎵',
    delay: '⏱️',
    chorus: '🌊',
    distortion: '⚡',
    compressor: '🔧',
    eq: '🎚️',
    limiter: '📊',
    'noise-gate': '🚪',
    'pitch-shift': '🎼',
    'time-stretch': '⏩',
    normalize: '📏',
    fade: '🌅'
  }

  return icons[effect] || '🎵'
}

export function getTrackColor(type: string): string {
  const colors: Record<string, string> = {
    audio: '#3b82f6',
    music: '#10b981',
    voice: '#8b5cf6',
    sfx: '#f59e0b',
    midi: '#ef4444'
  }

  return colors[type] || '#6b7280'
}

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024 // 100 MB
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/mp4']

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds 100 MB limit` }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not supported. Use MP3, WAV, AAC, FLAC, OGG, or M4A` }
  }

  return { valid: true }
}

export function calculatePeakLevel(samples: number[]): number {
  return Math.max(...samples.map(Math.abs))
}

export function calculateRMSLevel(samples: number[]): number {
  const sumSquares = samples.reduce((sum, sample) => sum + sample * sample, 0)
  return Math.sqrt(sumSquares / samples.length)
}

export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20)
}

export function linearToDb(linear: number): number {
  return 20 * Math.log10(linear)
}

export function panToBalance(pan: number): { left: number; right: number } {
  // pan ranges from -1 (left) to 1 (right)
  const left = pan <= 0 ? 1 : 1 - pan
  const right = pan >= 0 ? 1 : 1 + pan

  return { left, right }
}
