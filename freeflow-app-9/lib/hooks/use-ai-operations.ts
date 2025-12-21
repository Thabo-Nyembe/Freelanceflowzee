'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { EnhancedAIService } from '@/lib/ai/enhanced-ai-service'
import { toast } from '@/components/ui/use-toast'

const aiService = new EnhancedAIService()

interface TranscriptionData {
  text: string
  segments: { start: number; end: number; text: string }[]
  language: string
  confidence: number
  languages: string[]
}

interface ChapterData {
  chapters: { title: string; start: number; end: number; summary: string; keywords: string[] }[]
  totalDuration: number
}

interface AnalysisData {
  quality: {
    clarity: number
    engagement: number
    professionalism: number
    effectiveness: number
  }
  technicalScore: number
  contentScore: number
}

interface InsightData {
  topics: string[]
  targetAudience: string[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  actionItems: string[]
  estimatedWatchTime: number
}

interface AIData {
  transcription?: TranscriptionData
  chapters?: ChapterData
  analysis?: AnalysisData
  insights?: InsightData
}

export function useAIOperations() {
  const [isLoading, setIsLoading] = useState<any>(false)
  const [error, setError] = useState<string | null>(null)
  const [aiData, setAIData] = useState<AIData>({})
  const supabase = createClientComponentClient()

  // Realtime subscription for AI operations updates
  useEffect(() => {
    const channel = supabase
      .channel('ai-operations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_operations' },
        (payload) => {
          // Handle realtime AI operation updates
          if (payload.eventType === 'UPDATE' && payload.new) {
            const operation = payload.new as any
            if (operation.operation_type === 'transcription' && operation.result) {
              setAIData(prev => ({ ...prev, transcription: operation.result }))
            } else if (operation.operation_type === 'analysis' && operation.result) {
              setAIData(prev => ({ ...prev, analysis: operation.result }))
            } else if (operation.operation_type === 'chapters' && operation.result) {
              setAIData(prev => ({ ...prev, chapters: operation.result }))
            } else if (operation.operation_type === 'insights' && operation.result) {
              setAIData(prev => ({ ...prev, insights: operation.result }))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const transcribeVideo = useCallback(async (videoUrl: string, language = 'en') => {
    try {
      setIsLoading(true)
      setError(null)
      const transcription = await aiService.transcribeVideo(videoUrl, language)
      setAIData(prev => ({ ...prev, transcription }))
      return transcription
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to transcribe video'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const analyzeContent = useCallback(async (videoUrl: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const analysis = await aiService.analyzeVideoContent(videoUrl)
      setAIData(prev => ({ ...prev, analysis }))
      return analysis
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze video content'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateChapters = useCallback(async (videoUrl: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // First ensure we have a transcription
      const transcription = aiData.transcription || await transcribeVideo(videoUrl)
      
      const chapters = await aiService.generateChapters(videoUrl, transcription.text)
      setAIData(prev => ({ ...prev, chapters }))
      return chapters
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate chapters'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [aiData.transcription, transcribeVideo])

  const generateInsights = useCallback(async (videoUrl: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // First ensure we have analysis data
      const analysis = aiData.analysis || await analyzeContent(videoUrl)
      
      const insights = await aiService.generateInsights(videoUrl, analysis)
      setAIData(prev => ({ ...prev, insights }))
      return insights
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate insights'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [aiData.analysis, analyzeContent])

  const streamAIResponse = useCallback(async function* (
    provider: 'openai' | 'anthropic' | 'google',
    prompt: string
  ) {
    try {
      setError(null)
      yield* aiService.streamResponse(provider, prompt)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stream AI response'
      setError(message)
      throw err
    }
  }, [])

  return {
    transcribeVideo,
    analyzeContent,
    generateChapters,
    generateInsights,
    streamAIResponse,
    aiData,
    isLoading,
    error,
  }
} 