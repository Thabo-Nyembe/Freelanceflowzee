/**
 * AI Video Generation Types
 * World-class type definitions for AI-powered video generation
 */

export type VideoStyle =
  | 'cinematic'
  | 'professional'
  | 'casual'
  | 'animated'
  | 'explainer'
  | 'social-media'
  | 'advertisement'
  | 'documentary'
  | 'tutorial'
  | 'vlog'

export type VideoFormat =
  | 'landscape'      // 16:9
  | 'portrait'       // 9:16
  | 'square'         // 1:1
  | 'widescreen'     // 21:9
  | 'vertical-story' // 9:16 (optimized for stories)

export type VideoQuality = 'draft' | 'standard' | 'hd' | '4k'

export type VideoLength = 'short' | 'medium' | 'long' // 15s, 60s, 3min+

export type AIModel = 'runway-gen3' | 'pika-labs' | 'stable-video' | 'kazi-ai'

export type GenerationStatus =
  | 'idle'
  | 'analyzing'
  | 'generating'
  | 'rendering'
  | 'completed'
  | 'failed'

export interface VideoTemplate {
  id: string
  name: string
  description: string
  style: VideoStyle
  format: VideoFormat
  duration: number
  thumbnail: string
  premium: boolean
  tags: string[]
  features: string[]
  scenes: number
  musicIncluded: boolean
  voiceoverIncluded: boolean
}

export interface VideoGenerationRequest {
  id: string
  prompt: string
  style: VideoStyle
  format: VideoFormat
  quality: VideoQuality
  length: VideoLength
  aiModel: AIModel
  template?: string
  options: {
    includeMusic: boolean
    includeVoiceover: boolean
    includeCaptions: boolean
    backgroundColor?: string
    brand?: {
      logo?: string
      colors?: string[]
      fonts?: string[]
    }
  }
  createdAt: Date
}

export interface VideoScene {
  id: string
  prompt: string
  duration: number
  transition: 'fade' | 'slide' | 'zoom' | 'dissolve' | 'none'
  effects: string[]
  music?: {
    track: string
    volume: number
    fadeIn: boolean
    fadeOut: boolean
  }
  voiceover?: {
    text: string
    voice: string
    speed: number
  }
}

export interface GeneratedVideo {
  id: string
  requestId: string
  status: GenerationStatus
  progress: number
  videoUrl?: string
  thumbnailUrl?: string
  duration: number
  format: VideoFormat
  quality: VideoQuality
  fileSize?: number
  scenes: VideoScene[]
  metadata: {
    width: number
    height: number
    fps: number
    codec: string
    bitrate: string
  }
  analytics?: {
    views: number
    likes: number
    shares: number
  }
  createdAt: Date
  completedAt?: Date
  error?: string
}

export interface VideoExportOptions {
  format: 'mp4' | 'mov' | 'webm' | 'gif'
  quality: VideoQuality
  includeWatermark: boolean
  compression: 'none' | 'low' | 'medium' | 'high'
  customizations?: {
    trimStart?: number
    trimEnd?: number
    filters?: string[]
  }
}

export interface VideoAnalytics {
  videoId: string
  views: number
  watchTime: number
  averageWatchPercentage: number
  engagement: {
    likes: number
    comments: number
    shares: number
    downloads: number
  }
  demographics: {
    countries: Record<string, number>
    devices: Record<string, number>
    referrers: Record<string, number>
  }
  timeline: Array<{
    timestamp: Date
    views: number
    engagement: number
  }>
}

export interface AIPromptSuggestion {
  id: string
  category: string
  prompt: string
  style: VideoStyle
  estimatedDuration: number
  complexity: 'simple' | 'moderate' | 'complex'
  tags: string[]
}

export interface VoiceOption {
  id: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  accent: string
  style: 'professional' | 'casual' | 'energetic' | 'calm'
  sample: string
  premium: boolean
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  genre: string
  mood: string
  duration: number
  tempo: number
  preview: string
  premium: boolean
  tags: string[]
}
