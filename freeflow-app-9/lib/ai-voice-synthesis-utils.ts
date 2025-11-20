/**
 * AI Voice Synthesis Utilities
 * Helper functions and mock data for voice generation
 */

import {
  Voice,
  VoiceGender,
  VoiceAge,
  VoiceCategory,
  VoiceSynthesisResult,
  VoiceSynthesisStats,
  SSMLTag,
  AudioFormat,
  AudioQuality
} from './ai-voice-synthesis-types'

export const VOICE_CATEGORIES: VoiceCategory[] = [
  { id: 'professional', name: 'Professional', description: 'Business and corporate voices', icon: '💼', voiceCount: 24 },
  { id: 'narrative', name: 'Narrative', description: 'Perfect for audiobooks and storytelling', icon: '📖', voiceCount: 18 },
  { id: 'conversational', name: 'Conversational', description: 'Natural dialogue and chatbots', icon: '💬', voiceCount: 32 },
  { id: 'educational', name: 'Educational', description: 'Clear and articulate for learning', icon: '🎓', voiceCount: 15 },
  { id: 'entertainment', name: 'Entertainment', description: 'Dynamic voices for media', icon: '🎭', voiceCount: 21 },
  { id: 'multilingual', name: 'Multilingual', description: 'Multiple language support', icon: '🌍', voiceCount: 45 }
]

export const MOCK_VOICES: Voice[] = [
  {
    id: 'voice-1',
    name: 'emma-professional',
    displayName: 'Emma',
    language: 'English',
    languageCode: 'en-US',
    gender: 'female',
    age: 'adult',
    accent: 'American',
    description: 'Professional and clear voice, perfect for business presentations',
    isPremium: false,
    popularity: 95,
    tags: ['professional', 'business', 'clear']
  },
  {
    id: 'voice-2',
    name: 'james-narrative',
    displayName: 'James',
    language: 'English',
    languageCode: 'en-GB',
    gender: 'male',
    age: 'adult',
    accent: 'British',
    description: 'Rich narrative voice ideal for audiobooks and storytelling',
    isPremium: true,
    popularity: 92,
    tags: ['narrative', 'storytelling', 'audiobook']
  },
  {
    id: 'voice-3',
    name: 'sophia-friendly',
    displayName: 'Sophia',
    language: 'English',
    languageCode: 'en-US',
    gender: 'female',
    age: 'young-adult',
    accent: 'American',
    description: 'Warm and friendly voice for conversational content',
    isPremium: false,
    isNew: true,
    popularity: 88,
    tags: ['friendly', 'conversational', 'warm']
  },
  {
    id: 'voice-4',
    name: 'david-authoritative',
    displayName: 'David',
    language: 'English',
    languageCode: 'en-US',
    gender: 'male',
    age: 'senior',
    accent: 'American',
    description: 'Deep authoritative voice for educational content',
    isPremium: true,
    popularity: 90,
    tags: ['authoritative', 'educational', 'deep']
  },
  {
    id: 'voice-5',
    name: 'maria-multilingual',
    displayName: 'Maria',
    language: 'Spanish',
    languageCode: 'es-ES',
    gender: 'female',
    age: 'adult',
    accent: 'Spanish',
    description: 'Natural Spanish voice with excellent pronunciation',
    isPremium: true,
    popularity: 85,
    tags: ['multilingual', 'spanish', 'natural']
  },
  {
    id: 'voice-6',
    name: 'thomas-calm',
    displayName: 'Thomas',
    language: 'English',
    languageCode: 'en-AU',
    gender: 'male',
    age: 'adult',
    accent: 'Australian',
    description: 'Calm and soothing voice for meditation and relaxation',
    isPremium: false,
    popularity: 82,
    tags: ['calm', 'soothing', 'relaxation']
  }
]

export const SSML_TAGS: SSMLTag[] = [
  {
    tag: 'break',
    description: 'Insert a pause in speech',
    example: '<break time="500ms"/>',
    attributes: [
      {
        name: 'time',
        description: 'Duration of pause',
        values: ['500ms', '1s', '2s']
      }
    ]
  },
  {
    tag: 'emphasis',
    description: 'Emphasize words',
    example: '<emphasis level="strong">important</emphasis>',
    attributes: [
      {
        name: 'level',
        description: 'Emphasis level',
        values: ['strong', 'moderate', 'reduced']
      }
    ]
  },
  {
    tag: 'prosody',
    description: 'Control pitch, rate, and volume',
    example: '<prosody rate="slow" pitch="+10%">text</prosody>',
    attributes: [
      {
        name: 'rate',
        description: 'Speaking rate',
        values: ['x-slow', 'slow', 'medium', 'fast', 'x-fast']
      },
      {
        name: 'pitch',
        description: 'Voice pitch',
        values: ['+10%', '-10%', 'high', 'low']
      }
    ]
  },
  {
    tag: 'say-as',
    description: 'Interpret text in specific ways',
    example: '<say-as interpret-as="number">123</say-as>',
    attributes: [
      {
        name: 'interpret-as',
        description: 'How to interpret text',
        values: ['number', 'ordinal', 'digits', 'date', 'time', 'telephone']
      }
    ]
  }
]

export const MOCK_RECENT_SYNTHESES: VoiceSynthesisResult[] = [
  {
    id: 'synth-1',
    audioUrl: '/audio/synthesis-1.mp3',
    duration: 45.2,
    format: 'mp3',
    quality: 'high',
    fileSize: 1048576,
    text: 'Welcome to our AI voice synthesis platform. Experience natural-sounding voices...',
    voiceId: 'voice-1',
    synthesizedAt: new Date(Date.now() - 3600000),
    processingTime: 2.3,
    characterCount: 156,
    cost: 0.15
  },
  {
    id: 'synth-2',
    audioUrl: '/audio/synthesis-2.mp3',
    duration: 120.5,
    format: 'wav',
    quality: 'ultra',
    fileSize: 5242880,
    text: 'In a world where technology meets creativity, AI voice synthesis opens new possibilities...',
    voiceId: 'voice-2',
    synthesizedAt: new Date(Date.now() - 7200000),
    processingTime: 5.8,
    characterCount: 487,
    cost: 0.48
  }
]

export const MOCK_VOICE_STATS: VoiceSynthesisStats = {
  totalSyntheses: 234,
  totalCharacters: 45678,
  totalDuration: 3420.5,
  totalCost: 45.67,
  favoriteVoices: ['voice-1', 'voice-2', 'voice-3'],
  recentSyntheses: MOCK_RECENT_SYNTHESES,
  monthlyUsage: [
    { month: 'Jan', characters: 8500, cost: 8.50 },
    { month: 'Feb', characters: 12300, cost: 12.30 },
    { month: 'Mar', characters: 15400, cost: 15.40 },
    { month: 'Apr', characters: 9478, cost: 9.48 }
  ]
}

// Helper Functions
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function estimateProcessingTime(characterCount: number): number {
  // Rough estimate: 50 characters per second
  return Math.ceil(characterCount / 50)
}

export function estimateDuration(characterCount: number, speed: number = 1.0): number {
  // Average speaking rate: 150 words per minute = 750 characters per minute
  const baseMinutes = characterCount / 750
  return (baseMinutes * 60) / speed
}

export function calculateCost(characterCount: number, isPremiumVoice: boolean = false): number {
  // $0.001 per character for standard, $0.002 for premium
  const rate = isPremiumVoice ? 0.002 : 0.001
  return characterCount * rate
}

export function getVoiceIcon(gender: VoiceGender): string {
  const icons: Record<VoiceGender, string> = {
    male: '👨',
    female: '👩',
    neutral: '🧑'
  }
  return icons[gender]
}

export function getAgeLabel(age: VoiceAge): string {
  const labels: Record<VoiceAge, string> = {
    child: 'Child',
    'young-adult': 'Young Adult',
    adult: 'Adult',
    senior: 'Senior'
  }
  return labels[age]
}

export function filterVoices(
  voices: Voice[],
  filters: {
    gender?: VoiceGender
    language?: string
    isPremium?: boolean
    search?: string
  }
): Voice[] {
  return voices.filter(voice => {
    if (filters.gender && voice.gender !== filters.gender) return false
    if (filters.language && voice.languageCode !== filters.language) return false
    if (filters.isPremium !== undefined && voice.isPremium !== filters.isPremium) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        voice.displayName.toLowerCase().includes(search) ||
        voice.description.toLowerCase().includes(search) ||
        voice.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }
    return true
  })
}

export function sortVoices(voices: Voice[], sortBy: 'popularity' | 'name' | 'newest'): Voice[] {
  const sorted = [...voices]

  switch (sortBy) {
    case 'popularity':
      return sorted.sort((a, b) => b.popularity - a.popularity)
    case 'name':
      return sorted.sort((a, b) => a.displayName.localeCompare(b.displayName))
    case 'newest':
      return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    default:
      return sorted
  }
}

export function getFormatInfo(format: AudioFormat): { name: string; description: string } {
  const formats = {
    mp3: { name: 'MP3', description: 'Compressed, widely compatible' },
    wav: { name: 'WAV', description: 'Uncompressed, high quality' },
    ogg: { name: 'OGG', description: 'Open format, good quality' },
    flac: { name: 'FLAC', description: 'Lossless compression' }
  }
  return formats[format]
}

export function getQualityInfo(quality: AudioQuality): { name: string; bitrate: string } {
  const qualities = {
    low: { name: 'Low', bitrate: '64 kbps' },
    medium: { name: 'Medium', bitrate: '128 kbps' },
    high: { name: 'High', bitrate: '192 kbps' },
    ultra: { name: 'Ultra', bitrate: '320 kbps' }
  }
  return qualities[quality]
}

export function validateText(text: string): { isValid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'Text cannot be empty' }
  }

  if (text.length > 10000) {
    return { isValid: false, error: 'Text exceeds 10,000 character limit' }
  }

  return { isValid: true }
}

export function highlightSSML(text: string): string {
  // Simple SSML syntax highlighting
  return text
    .replace(/(<[^>]+>)/g, '<span class="text-blue-500">$1</span>')
    .replace(/(&[^;]+;)/g, '<span class="text-green-500">$1</span>')
}

export function generateSSMLTemplate(text: string, voiceSettings: any): string {
  return `<speak>
  <prosody rate="${voiceSettings.speed || 1.0}" pitch="${voiceSettings.pitch || 1.0}">
    ${text}
  </prosody>
</speak>`
}
