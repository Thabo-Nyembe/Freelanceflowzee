/**
 * AI Voice Synthesis Types
 * Complete type system for AI-powered voice generation
 */

export type VoiceGender = 'male' | 'female' | 'neutral'
export type VoiceAge = 'child' | 'young-adult' | 'adult' | 'senior'
export type VoiceStyle = 'professional' | 'casual' | 'energetic' | 'calm' | 'dramatic' | 'friendly' | 'authoritative'
export type VoiceEmotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'calm' | 'serious' | 'empathetic'
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'flac'
export type AudioQuality = 'low' | 'medium' | 'high' | 'ultra'

export interface Voice {
  id: string
  name: string
  displayName: string
  language: string
  languageCode: string
  gender: VoiceGender
  age: VoiceAge
  accent?: string
  description: string
  previewUrl?: string
  isPremium: boolean
  isNew?: boolean
  popularity: number
  tags: string[]
}

export interface VoiceSynthesisRequest {
  text: string
  voiceId: string
  style?: VoiceStyle
  emotion?: VoiceEmotion
  speed: number // 0.5 to 2.0
  pitch: number // 0.5 to 2.0
  volume: number // 0 to 100
  format: AudioFormat
  quality: AudioQuality
  addPauses?: boolean
  pronunciationGuide?: Record<string, string>
}

export interface VoiceSynthesisResult {
  id: string
  audioUrl: string
  duration: number
  format: AudioFormat
  quality: AudioQuality
  fileSize: number
  text: string
  voiceId: string
  synthesizedAt: Date
  processingTime: number
  characterCount: number
  cost: number
}

export interface VoiceCloneRequest {
  name: string
  audioSamples: File[]
  description?: string
  language: string
}

export interface VoiceClone {
  id: string
  name: string
  description?: string
  language: string
  createdAt: Date
  sampleCount: number
  status: 'training' | 'ready' | 'failed'
  progress: number
}

export interface SpeechToSpeechRequest {
  audioFile: File
  targetVoiceId: string
  preserveEmotion: boolean
  preservePacing: boolean
}

export interface PronunciationGuide {
  word: string
  ipa: string
  phonetic: string
  example: string
}

export interface VoiceSynthesisProject {
  id: string
  name: string
  description?: string
  scripts: VoiceScript[]
  createdAt: Date
  updatedAt: Date
  totalDuration: number
  status: 'draft' | 'processing' | 'completed'
}

export interface VoiceScript {
  id: string
  text: string
  voiceId: string
  settings: Partial<VoiceSynthesisRequest>
  order: number
  duration?: number
  audioUrl?: string
}

export interface VoiceSynthesisStats {
  totalSyntheses: number
  totalCharacters: number
  totalDuration: number
  totalCost: number
  favoriteVoices: string[]
  recentSyntheses: VoiceSynthesisResult[]
  monthlyUsage: {
    month: string
    characters: number
    cost: number
  }[]
}

export interface VoiceCategory {
  id: string
  name: string
  description: string
  icon: string
  voiceCount: number
}

export interface SSMLTag {
  tag: string
  description: string
  example: string
  attributes?: {
    name: string
    description: string
    values?: string[]
  }[]
}
