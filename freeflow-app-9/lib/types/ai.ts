import { HighlightSegment } from '@/lib/ai/highlight-detection-service'

export interface TranscriptSegment {
  start: number
  end: number
  text: string
}

export interface VideoTranscriptionData {
  segments: TranscriptSegment[]
  languages: string[]
  confidence: number
}

export interface Chapter {
  title: string
  start: number
  end: number
  summary: string
  keywords: string[]
}

export interface SmartChaptersData {
  chapters: Chapter[]
  totalDuration: number
}

export interface VideoAnalysisData {
  engagement: number
  clarity: number
  pacing: number
  tags: string[]
  recommendations: string[]
  volume: number
  noiseLevel: number
  contentQuality: number
  effectiveness: number
  audioLevel: number
  recordingDuration: number
  videoUrl: string
  highlights?: HighlightSegment[]
  transcription?: string
  chapters?: {
    title: string
    startTime: number
    endTime: number
  }[]
  analysis?: {
    clarity: number
    engagement: number
    professionalism: number
    effectiveness: number
  }
  insights?: VideoInsightData
}

export interface VideoInsight {
  type: 'sentiment' | 'audio_quality' | 'speech_clarity' | 'background_noise' | 'pacing' | 'content_quality' | 'engagement'
  score: number
  message: string
  timestamp: number
  metrics?: {
    clarity: number
    engagement: number
    professionalism: number
    effectiveness: number
  }
}

export interface VideoInsightData {
  overall: {
    clarity: number
    engagement: number
    professionalism: number
    effectiveness: number
  }
  timeline: VideoInsight[]
  summary: string
  recommendations: string[]
}

export interface AnalysisData extends VideoAnalysisData {
  // Additional fields specific to real-time analysis
  audioQuality: number
  backgroundNoise: number
  speechClarity: number
  currentInsight: string
}

export interface AIVideoData {
  transcription: VideoTranscriptionData
  chapters: SmartChaptersData
  analysis: VideoAnalysisData
  insights: VideoInsightData
  realtimeInsights?: unknown[]
} 