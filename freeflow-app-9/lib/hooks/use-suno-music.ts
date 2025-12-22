'use client'

import { useState, useCallback, useRef } from 'react'

export type SunoModel = 'V3' | 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5'

export type MusicStyle =
  | 'pop' | 'rock' | 'electronic' | 'hip-hop' | 'jazz'
  | 'classical' | 'r&b' | 'country' | 'folk' | 'metal'
  | 'ambient' | 'lo-fi' | 'cinematic' | 'reggae' | 'blues'

export type MusicMood =
  | 'happy' | 'sad' | 'energetic' | 'calm' | 'epic'
  | 'romantic' | 'dark' | 'uplifting' | 'mysterious' | 'nostalgic'

export interface GenerateMusicParams {
  prompt: string
  model?: SunoModel
  customMode?: boolean
  style?: string
  title?: string
  instrumental?: boolean
  negativeTags?: string
  lyrics?: string
}

export interface GenerateLyricsParams {
  prompt: string
}

export interface ExtendMusicParams {
  audioId: string
  prompt?: string
  style?: string
  continueAt?: number // timestamp in seconds
  model?: SunoModel
}

export interface VocalSeparationParams {
  audioUrl: string
}

export interface GeneratedTrack {
  id: string
  title: string
  audioUrl: string
  imageUrl?: string
  duration?: number
  style?: string
  lyrics?: string
  prompt: string
  model: string
  createdAt: string
}

export interface GeneratedLyrics {
  text: string
  title?: string
}

export interface SeparatedVocals {
  vocalsUrl: string
  instrumentalUrl: string
}

export interface GenerationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  message?: string
}

export function useSunoMusic() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState<GenerationStatus | null>(null)
  const [currentTrack, setCurrentTrack] = useState<GeneratedTrack | null>(null)
  const [tracks, setTracks] = useState<GeneratedTrack[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [lyrics, setLyrics] = useState<GeneratedLyrics | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const pollStatus = useCallback(async (taskId: string): Promise<GeneratedTrack[] | null> => {
    return new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 120 // 10 minutes max

      pollingRef.current = setInterval(async () => {
        attempts++
        if (attempts > maxAttempts) {
          stopPolling()
          reject(new Error('Generation timed out'))
          return
        }

        try {
          const response = await fetch(`/api/suno?taskId=${taskId}`)
          const data = await response.json()

          if (data.data?.status === 'completed' || data.data?.status === 'SUCCESS') {
            stopPolling()
            const generatedTracks: GeneratedTrack[] = (data.data?.response?.sunoData || []).map((track: any) => ({
              id: track.id,
              title: track.title || 'Untitled',
              audioUrl: track.audio_url,
              imageUrl: track.image_url,
              duration: track.duration,
              style: track.tags,
              lyrics: track.lyric,
              prompt: track.prompt,
              model: track.model_name,
              createdAt: track.created_at
            }))
            resolve(generatedTracks)
          } else if (data.data?.status === 'failed' || data.data?.status === 'FAILED') {
            stopPolling()
            reject(new Error(data.data?.failReason || 'Generation failed'))
          } else {
            setStatus({
              status: 'processing',
              progress: Math.min(90, attempts * 1.5),
              message: data.data?.status || 'Processing...'
            })
          }
        } catch (err) {
          console.error('Polling error:', err)
        }
      }, 5000) // Poll every 5 seconds
    })
  }, [stopPolling])

  const generateMusic = useCallback(async (params: GenerateMusicParams): Promise<GeneratedTrack[] | null> => {
    setIsGenerating(true)
    setError(null)
    setStatus({ status: 'pending', message: 'Starting generation...' })

    try {
      const response = await fetch('/api/suno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          ...params,
          model: params.model || 'V4'
        })
      })

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.message || 'Generation failed')
      }

      setStatus({ status: 'processing', progress: 10, message: 'Queued for generation...' })

      const taskId = data.data?.taskId
      if (!taskId) {
        throw new Error('No task ID received')
      }

      const generatedTracks = await pollStatus(taskId)

      if (generatedTracks && generatedTracks.length > 0) {
        setCurrentTrack(generatedTracks[0])
        setTracks(prev => [...generatedTracks, ...prev].slice(0, 100))
        setStatus({ status: 'completed', progress: 100, message: 'Generation complete!' })
      }

      return generatedTracks
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Generation failed')
      setError(error)
      setStatus({ status: 'failed', message: error.message })
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [pollStatus])

  const generateLyrics = useCallback(async (params: GenerateLyricsParams): Promise<GeneratedLyrics | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/suno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-lyrics',
          prompt: params.prompt
        })
      })

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.message || 'Lyrics generation failed')
      }

      const taskId = data.data?.taskId
      if (!taskId) {
        throw new Error('No task ID received')
      }

      // Poll for lyrics completion
      const result = await new Promise<GeneratedLyrics>((resolve, reject) => {
        const poll = setInterval(async () => {
          const statusRes = await fetch(`/api/suno?taskId=${taskId}`)
          const statusData = await statusRes.json()

          if (statusData.data?.status === 'completed') {
            clearInterval(poll)
            resolve({
              text: statusData.data?.response?.text || '',
              title: statusData.data?.response?.title
            })
          } else if (statusData.data?.status === 'failed') {
            clearInterval(poll)
            reject(new Error('Lyrics generation failed'))
          }
        }, 2000)
      })

      setLyrics(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Lyrics generation failed')
      setError(error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const extendMusic = useCallback(async (params: ExtendMusicParams): Promise<GeneratedTrack[] | null> => {
    setIsGenerating(true)
    setError(null)
    setStatus({ status: 'pending', message: 'Extending track...' })

    try {
      const response = await fetch('/api/suno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extend',
          ...params,
          model: params.model || 'V4'
        })
      })

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.message || 'Extension failed')
      }

      const taskId = data.data?.taskId
      if (!taskId) {
        throw new Error('No task ID received')
      }

      const extendedTracks = await pollStatus(taskId)

      if (extendedTracks && extendedTracks.length > 0) {
        setCurrentTrack(extendedTracks[0])
        setTracks(prev => [...extendedTracks, ...prev].slice(0, 100))
        setStatus({ status: 'completed', progress: 100, message: 'Extension complete!' })
      }

      return extendedTracks
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Extension failed')
      setError(error)
      setStatus({ status: 'failed', message: error.message })
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [pollStatus])

  const separateVocals = useCallback(async (params: VocalSeparationParams): Promise<SeparatedVocals | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/suno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vocal-separation',
          audioUrl: params.audioUrl
        })
      })

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.message || 'Vocal separation failed')
      }

      const taskId = data.data?.taskId
      if (!taskId) {
        throw new Error('No task ID received')
      }

      // Poll for separation completion
      const result = await new Promise<SeparatedVocals>((resolve, reject) => {
        const poll = setInterval(async () => {
          const statusRes = await fetch(`/api/suno?taskId=${taskId}`)
          const statusData = await statusRes.json()

          if (statusData.data?.status === 'completed') {
            clearInterval(poll)
            resolve({
              vocalsUrl: statusData.data?.response?.vocals_url || '',
              instrumentalUrl: statusData.data?.response?.instrumental_url || ''
            })
          } else if (statusData.data?.status === 'failed') {
            clearInterval(poll)
            reject(new Error('Vocal separation failed'))
          }
        }, 3000)
      })

      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Vocal separation failed')
      setError(error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const reset = useCallback(() => {
    stopPolling()
    setCurrentTrack(null)
    setError(null)
    setStatus(null)
    setLyrics(null)
  }, [stopPolling])

  const clearTracks = useCallback(() => {
    setTracks([])
  }, [])

  return {
    // State
    isGenerating,
    status,
    currentTrack,
    tracks,
    error,
    lyrics,

    // Actions
    generateMusic,
    generateLyrics,
    extendMusic,
    separateVocals,
    reset,
    clearTracks,
    stopPolling
  }
}

// Style presets for quick music generation
export const musicPresets = {
  genres: [
    { value: 'pop', label: 'Pop', description: 'Catchy, mainstream sound' },
    { value: 'electronic', label: 'Electronic', description: 'EDM, synth-driven' },
    { value: 'hip-hop', label: 'Hip-Hop', description: 'Beats and rhythms' },
    { value: 'rock', label: 'Rock', description: 'Guitar-driven energy' },
    { value: 'jazz', label: 'Jazz', description: 'Smooth, improvisational' },
    { value: 'classical', label: 'Classical', description: 'Orchestral, timeless' },
    { value: 'lo-fi', label: 'Lo-Fi', description: 'Chill, relaxed vibes' },
    { value: 'cinematic', label: 'Cinematic', description: 'Epic, film score' },
    { value: 'ambient', label: 'Ambient', description: 'Atmospheric, ethereal' },
    { value: 'r&b', label: 'R&B', description: 'Soulful, groovy' }
  ],
  moods: [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'energetic', label: 'Energetic', emoji: '⚡' },
    { value: 'calm', label: 'Calm', emoji: '🧘' },
    { value: 'epic', label: 'Epic', emoji: '🎬' },
    { value: 'romantic', label: 'Romantic', emoji: '💕' },
    { value: 'dark', label: 'Dark', emoji: '🌙' },
    { value: 'uplifting', label: 'Uplifting', emoji: '🌟' }
  ],
  models: [
    { value: 'V5', label: 'Suno V5', description: 'Latest & Best', badge: 'New' },
    { value: 'V4_5PLUS', label: 'V4.5 Plus', description: 'Premium quality' },
    { value: 'V4_5', label: 'V4.5', description: 'Enhanced fidelity' },
    { value: 'V4', label: 'V4', description: 'Fast & reliable' },
    { value: 'V3_5', label: 'V3.5', description: 'Classic sound' }
  ]
}

// Prompt templates for different use cases
export const promptTemplates = {
  commercial: 'Create an upbeat {genre} track perfect for advertisements, energetic and memorable',
  podcast: 'Create a {mood} {genre} intro/outro music for a podcast, professional and engaging',
  gaming: 'Create epic {genre} background music for a video game, immersive and dynamic',
  meditation: 'Create calming {genre} music for meditation, peaceful and serene',
  workout: 'Create high-energy {genre} music for workouts, motivating and intense',
  celebration: 'Create festive {genre} music for celebrations, joyful and exciting'
}
