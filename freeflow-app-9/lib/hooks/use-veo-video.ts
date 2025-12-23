'use client'

import { useState, useCallback } from 'react'
import { fal } from '@fal-ai/client'

// Configure fal.ai to use our proxy
fal.config({ proxyUrl: '/api/fal/proxy' })

export type VideoModel =
  | 'fal-ai/veo3'
  | 'fal-ai/veo3/fast'
  | 'fal-ai/veo2'
  | 'fal-ai/kling-video/v2.0/master'
  | 'fal-ai/kling-video/v1.6/pro'
  | 'fal-ai/minimax/video-01-live'
  | 'fal-ai/luma-dream-machine'
  | 'fal-ai/hunyuan-video'

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4'
export type VideoDuration = '4s' | '5s' | '6s' | '8s' | '10s'
export type VideoResolution = '480p' | '720p' | '1080p'

export type VideoStyle =
  | 'cinematic' | 'anime' | 'documentary'
  | 'commercial' | 'music-video' | 'vlog'
  | 'film-noir' | 'sci-fi' | 'fantasy'
  | 'horror' | 'romantic' | 'action'

export type CameraMovement =
  | 'static' | 'pan-left' | 'pan-right'
  | 'tilt-up' | 'tilt-down' | 'zoom-in'
  | 'zoom-out' | 'dolly-forward' | 'dolly-back'
  | 'orbit' | 'crane-up' | 'crane-down'
  | 'tracking-shot' | 'handheld' | 'fpv'

export interface GenerateVideoParams {
  prompt: string
  negativePrompt?: string
  model?: VideoModel
  aspectRatio?: AspectRatio
  duration?: VideoDuration
  resolution?: VideoResolution
  generateAudio?: boolean
  seed?: number
  style?: VideoStyle
  cameraMovement?: CameraMovement
  cameraIntensity?: number // 0-100
  enhancePrompt?: boolean
}

export interface ImageToVideoParams {
  prompt: string
  imageUrl: string
  model?: VideoModel
  duration?: VideoDuration
  motionStrength?: number // 0-100
  cameraMovement?: CameraMovement
}

export interface FramesToVideoParams {
  prompt: string
  startImageUrl: string
  endImageUrl: string
  duration?: VideoDuration
}

export interface ExtendVideoParams {
  prompt: string
  videoUrl: string
  duration?: VideoDuration
}

export interface GeneratedVideo {
  url: string
  contentType: string
  fileName?: string
  fileSize?: number
  duration?: number
}

export interface GenerationResult {
  video: GeneratedVideo
  seed?: number
  prompt: string
  timings?: {
    inference: number
  }
}

export interface GenerationProgress {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number
  logs?: string[]
  eta?: number
}

const stylePromptEnhancers: Record<VideoStyle, string> = {
  'cinematic': ', cinematic quality, film grain, anamorphic lens, dramatic lighting, 24fps, movie scene',
  'anime': ', anime style, Japanese animation, vibrant colors, dynamic motion, Studio Ghibli quality',
  'documentary': ', documentary style, natural lighting, realistic, raw footage, authentic',
  'commercial': ', commercial quality, professional lighting, polished, advertising style, product focused',
  'music-video': ', music video style, dynamic cuts, creative angles, high energy, artistic',
  'vlog': ', vlog style, natural, casual, authentic, handheld camera feel',
  'film-noir': ', film noir style, black and white, high contrast, shadows, mysterious, 1940s aesthetic',
  'sci-fi': ', science fiction, futuristic, neon lights, cyberpunk, advanced technology',
  'fantasy': ', fantasy style, magical, ethereal, mythical creatures, enchanted',
  'horror': ', horror style, dark atmosphere, tension, unsettling, atmospheric fog',
  'romantic': ', romantic mood, soft lighting, warm colors, intimate, emotional',
  'action': ', action scene, dynamic motion, intense, fast-paced, explosive'
}

const cameraPromptEnhancers: Record<CameraMovement, string> = {
  'static': ', static camera, locked off shot',
  'pan-left': ', camera panning left, smooth pan',
  'pan-right': ', camera panning right, smooth pan',
  'tilt-up': ', camera tilting upward, reveal shot',
  'tilt-down': ', camera tilting downward',
  'zoom-in': ', slow zoom in, push in',
  'zoom-out': ', slow zoom out, pull back',
  'dolly-forward': ', dolly shot moving forward, tracking in',
  'dolly-back': ', dolly shot moving backward, tracking out',
  'orbit': ', orbiting camera, 360 rotation around subject',
  'crane-up': ', crane shot rising up, ascending',
  'crane-down': ', crane shot descending, lowering',
  'tracking-shot': ', tracking shot, following the subject',
  'handheld': ', handheld camera, natural shake, documentary feel',
  'fpv': ', first person view, POV shot, immersive'
}

export function useVeoVideo() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [history, setHistory] = useState<GenerationResult[]>([])

  const generateVideo = useCallback(async (params: GenerateVideoParams): Promise<GenerationResult | null> => {
    setIsGenerating(true)
    setError(null)
    setProgress({ status: 'queued' })

    try {
      // Enhance prompt with style and camera movement
      let enhancedPrompt = params.prompt
      if (params.style && params.enhancePrompt !== false) {
        enhancedPrompt += stylePromptEnhancers[params.style]
      }
      if (params.cameraMovement && params.cameraMovement !== 'static') {
        enhancedPrompt += cameraPromptEnhancers[params.cameraMovement]
      }

      const model = params.model || 'fal-ai/veo3'

      setProgress({ status: 'processing', progress: 10 })

      // Build input based on model
      const input: Record<string, unknown> = {
        prompt: enhancedPrompt,
        aspect_ratio: params.aspectRatio || '16:9',
        duration: params.duration || '8s',
      }

      // Veo 3 specific parameters
      if (model.includes('veo3')) {
        input.resolution = params.resolution || '720p'
        input.generate_audio = params.generateAudio !== false
        if (params.negativePrompt) {
          input.negative_prompt = params.negativePrompt
        }
        if (params.seed) {
          input.seed = params.seed
        }
      }

      // Kling specific parameters
      if (model.includes('kling')) {
        input.negative_prompt = params.negativePrompt || 'blurry, low quality, distorted'
      }

      const response = await fal.subscribe(model, {
        input,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            setProgress({
              status: 'processing',
              progress: 50,
              logs: update.logs?.map(l => l.message)
            })
          }
        }
      })

      setProgress({ status: 'completed', progress: 100 })

      const videoData = (response.data as any)?.video || response.data
      const generationResult: GenerationResult = {
        video: {
          url: videoData?.url || videoData,
          contentType: videoData?.content_type || 'video/mp4',
          fileName: videoData?.file_name,
          fileSize: videoData?.file_size
        },
        seed: (response.data as any)?.seed,
        prompt: enhancedPrompt,
        timings: (response.data as any)?.timings
      }

      setResult(generationResult)
      setHistory(prev => [generationResult, ...prev].slice(0, 30))

      return generationResult
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Video generation failed')
      setError(error)
      setProgress({ status: 'failed' })
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const imageToVideo = useCallback(async (params: ImageToVideoParams): Promise<GenerationResult | null> => {
    setIsGenerating(true)
    setError(null)
    setProgress({ status: 'queued' })

    try {
      setProgress({ status: 'processing', progress: 20 })

      const model = params.model || 'fal-ai/veo2'

      const input: Record<string, unknown> = {
        prompt: params.prompt,
        image_url: params.imageUrl,
      }

      if (params.duration) {
        input.duration = params.duration
      }

      const response = await fal.subscribe(model, {
        input,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            setProgress({ status: 'processing', progress: 60 })
          }
        }
      })

      setProgress({ status: 'completed', progress: 100 })

      const videoData = (response.data as any)?.video || response.data
      const result: GenerationResult = {
        video: {
          url: videoData?.url || videoData,
          contentType: videoData?.content_type || 'video/mp4',
          fileName: videoData?.file_name,
          fileSize: videoData?.file_size
        },
        seed: (response.data as any)?.seed,
        prompt: params.prompt
      }

      setResult(result)
      setHistory(prev => [result, ...prev].slice(0, 30))

      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Image to video failed')
      setError(error)
      setProgress({ status: 'failed' })
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const framesToVideo = useCallback(async (params: FramesToVideoParams): Promise<GenerationResult | null> => {
    setIsGenerating(true)
    setError(null)
    setProgress({ status: 'queued' })

    try {
      setProgress({ status: 'processing', progress: 20 })

      const response = await fal.subscribe('fal-ai/veo3', {
        input: {
          prompt: params.prompt,
          first_frame_image: params.startImageUrl,
          last_frame_image: params.endImageUrl,
          duration: params.duration || '6s'
        },
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            setProgress({ status: 'processing', progress: 60 })
          }
        }
      })

      setProgress({ status: 'completed', progress: 100 })

      const videoData = (response.data as any)?.video || response.data
      const result: GenerationResult = {
        video: {
          url: videoData?.url || videoData,
          contentType: videoData?.content_type || 'video/mp4'
        },
        prompt: params.prompt
      }

      setResult(result)
      setHistory(prev => [result, ...prev].slice(0, 30))

      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Frames to video failed')
      setError(error)
      setProgress({ status: 'failed' })
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const extendVideo = useCallback(async (params: ExtendVideoParams): Promise<GenerationResult | null> => {
    setIsGenerating(true)
    setError(null)
    setProgress({ status: 'queued' })

    try {
      setProgress({ status: 'processing', progress: 20 })

      const response = await fal.subscribe('fal-ai/veo3', {
        input: {
          prompt: params.prompt,
          video_url: params.videoUrl,
          duration: params.duration || '8s'
        },
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            setProgress({ status: 'processing', progress: 60 })
          }
        }
      })

      setProgress({ status: 'completed', progress: 100 })

      const videoData = (response.data as any)?.video || response.data
      const result: GenerationResult = {
        video: {
          url: videoData?.url || videoData,
          contentType: videoData?.content_type || 'video/mp4'
        },
        prompt: params.prompt
      }

      setResult(result)
      setHistory(prev => [result, ...prev].slice(0, 30))

      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Video extension failed')
      setError(error)
      setProgress({ status: 'failed' })
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setProgress(null)
  }, [])

  return {
    // State
    isGenerating,
    progress,
    result,
    error,
    history,

    // Actions
    generateVideo,
    imageToVideo,
    framesToVideo,
    extendVideo,
    clearHistory,
    reset
  }
}

// Video presets and templates
export const videoPresets = {
  styles: [
    { id: 'cinematic', label: 'Cinematic', icon: '🎬', description: 'Hollywood-quality film look' },
    { id: 'anime', label: 'Anime', icon: '🎌', description: 'Japanese animation style' },
    { id: 'documentary', label: 'Documentary', icon: '📹', description: 'Natural and authentic' },
    { id: 'commercial', label: 'Commercial', icon: '📺', description: 'Professional advertising' },
    { id: 'music-video', label: 'Music Video', icon: '🎵', description: 'Dynamic and artistic' },
    { id: 'vlog', label: 'Vlog', icon: '📱', description: 'Casual and personal' },
    { id: 'film-noir', label: 'Film Noir', icon: '🖤', description: 'Classic B&W mystery' },
    { id: 'sci-fi', label: 'Sci-Fi', icon: '🚀', description: 'Futuristic and tech' },
    { id: 'fantasy', label: 'Fantasy', icon: '🧙', description: 'Magical and mystical' },
    { id: 'horror', label: 'Horror', icon: '👻', description: 'Dark and unsettling' },
    { id: 'romantic', label: 'Romantic', icon: '💕', description: 'Warm and emotional' },
    { id: 'action', label: 'Action', icon: '💥', description: 'Fast and intense' }
  ],
  cameraMovements: [
    { id: 'static', label: 'Static', icon: '📷', description: 'Fixed camera position' },
    { id: 'pan-left', label: 'Pan Left', icon: '⬅️', description: 'Horizontal sweep left' },
    { id: 'pan-right', label: 'Pan Right', icon: '➡️', description: 'Horizontal sweep right' },
    { id: 'tilt-up', label: 'Tilt Up', icon: '⬆️', description: 'Vertical tilt upward' },
    { id: 'tilt-down', label: 'Tilt Down', icon: '⬇️', description: 'Vertical tilt down' },
    { id: 'zoom-in', label: 'Zoom In', icon: '🔍', description: 'Push into subject' },
    { id: 'zoom-out', label: 'Zoom Out', icon: '🔎', description: 'Pull back from subject' },
    { id: 'dolly-forward', label: 'Dolly In', icon: '🎥', description: 'Move camera forward' },
    { id: 'dolly-back', label: 'Dolly Out', icon: '📽️', description: 'Move camera backward' },
    { id: 'orbit', label: 'Orbit', icon: '🔄', description: '360° around subject' },
    { id: 'crane-up', label: 'Crane Up', icon: '🏗️', description: 'Rise up dramatically' },
    { id: 'tracking-shot', label: 'Tracking', icon: '🎞️', description: 'Follow the subject' },
    { id: 'handheld', label: 'Handheld', icon: '✋', description: 'Natural shake effect' },
    { id: 'fpv', label: 'FPV/POV', icon: '👁️', description: 'First person view' }
  ],
  promptTemplates: {
    cinematic: [
      'Epic aerial shot of a vast mountain range at golden hour, sweeping camera movement',
      'Intimate close-up portrait with shallow depth of field, warm backlight',
      'Dramatic slow-motion action sequence with debris particles'
    ],
    product: [
      'Sleek product reveal with dramatic lighting on dark background',
      'Lifestyle product shot in modern minimalist interior',
      '360-degree rotating product showcase with reflections'
    ],
    nature: [
      'Timelapse of clouds rolling over a serene lake at sunset',
      'Macro shot of a dewdrop on a flower petal, morning light',
      'Wildlife documentary style shot of animals in their habitat'
    ],
    urban: [
      'Hyperlapse through busy city streets at night with neon lights',
      'Aerial drone shot of city skyline transitioning from day to night',
      'Street-level tracking shot through a vibrant market'
    ],
    creative: [
      'Abstract fluid art in motion, iridescent colors morphing',
      'Surreal dreamscape with floating objects and impossible geometry',
      'Particle explosion in slow motion with vibrant color palette'
    ]
  },
  models: [
    { id: 'fal-ai/veo3', label: 'Veo 3', badge: 'Best', tier: 'premium', description: 'Google\'s best - native audio, 1080p' },
    { id: 'fal-ai/veo3/fast', label: 'Veo 3 Fast', badge: 'Fast', tier: 'pro', description: 'Faster generation, lower cost' },
    { id: 'fal-ai/veo2', label: 'Veo 2', badge: '', tier: 'pro', description: 'Image-to-video specialist' },
    { id: 'fal-ai/kling-video/v2.0/master', label: 'Kling 2.0', badge: 'Motion', tier: 'premium', description: 'Best motion fluidity' },
    { id: 'fal-ai/minimax/video-01-live', label: 'MiniMax', badge: 'Quick', tier: 'free', description: 'Fast generation, good quality' },
    { id: 'fal-ai/luma-dream-machine', label: 'Luma Dream', badge: 'Art', tier: 'pro', description: 'Artistic and surreal' },
    { id: 'fal-ai/hunyuan-video', label: 'Hunyuan', badge: '', tier: 'free', description: 'Open source option' }
  ]
}
