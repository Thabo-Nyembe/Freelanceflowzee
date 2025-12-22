'use client'

import { useState, useCallback } from 'react'
import { fal } from '@fal-ai/client'

// Configure fal.ai to use our proxy
fal.config({ proxyUrl: '/api/fal/proxy' })

export type ImageModel =
  | 'fal-ai/nano-banana'
  | 'fal-ai/nano-banana-pro'
  | 'fal-ai/flux/dev'
  | 'fal-ai/flux-pro'
  | 'fal-ai/stable-diffusion-xl'

export type ImageSize =
  | 'square_hd' | 'square'
  | 'portrait_4_3' | 'portrait_16_9'
  | 'landscape_4_3' | 'landscape_16_9'

export type ImageStyle =
  | 'photorealistic' | 'anime' | '3d-render'
  | 'digital-art' | 'oil-painting' | 'watercolor'
  | 'sketch' | 'cinematic' | 'fantasy'

export interface GenerateImageParams {
  prompt: string
  negativePrompt?: string
  model?: ImageModel
  imageSize?: ImageSize
  numImages?: number
  guidanceScale?: number
  numInferenceSteps?: number
  seed?: number
  style?: ImageStyle
  enhancePrompt?: boolean
}

export interface EditImageParams {
  prompt: string
  imageUrl: string
  model?: 'fal-ai/nano-banana/edit'
  strength?: number // 0-1, how much to change the image
}

export interface GeneratedImage {
  url: string
  width: number
  height: number
  contentType: string
}

export interface GenerationResult {
  images: GeneratedImage[]
  seed: number
  prompt: string
  timings?: {
    inference: number
  }
}

export interface GenerationProgress {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number
  logs?: string[]
}

const stylePromptEnhancers: Record<ImageStyle, string> = {
  'photorealistic': ', photorealistic, ultra detailed, 8k, high resolution, professional photography',
  'anime': ', anime style, vibrant colors, cel shaded, Studio Ghibli inspired',
  '3d-render': ', 3D render, octane render, unreal engine 5, detailed textures',
  'digital-art': ', digital art, concept art, artstation, trending',
  'oil-painting': ', oil painting style, classical art, brush strokes, museum quality',
  'watercolor': ', watercolor painting, soft edges, flowing colors, artistic',
  'sketch': ', pencil sketch, hand drawn, detailed linework, artistic',
  'cinematic': ', cinematic lighting, movie scene, dramatic, high production value',
  'fantasy': ', fantasy art, magical, ethereal, mystical atmosphere'
}

export function useNanoBanana() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [history, setHistory] = useState<GenerationResult[]>([])

  const generateImage = useCallback(async (params: GenerateImageParams): Promise<GenerationResult | null> => {
    setIsGenerating(true)
    setError(null)
    setProgress({ status: 'queued' })

    try {
      // Enhance prompt with style if specified
      let enhancedPrompt = params.prompt
      if (params.style && params.enhancePrompt !== false) {
        enhancedPrompt += stylePromptEnhancers[params.style]
      }

      const model = params.model || 'fal-ai/nano-banana'

      setProgress({ status: 'processing', progress: 10 })

      const response = await fal.subscribe(model, {
        input: {
          prompt: enhancedPrompt,
          negative_prompt: params.negativePrompt || 'blurry, low quality, distorted, deformed',
          image_size: params.imageSize || 'landscape_16_9',
          num_images: params.numImages || 1,
          guidance_scale: params.guidanceScale || 7.5,
          num_inference_steps: params.numInferenceSteps || 28,
          seed: params.seed,
          enable_safety_checker: true
        },
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

      const generationResult: GenerationResult = {
        images: response.data?.images || [],
        seed: response.data?.seed || 0,
        prompt: enhancedPrompt,
        timings: response.data?.timings
      }

      setResult(generationResult)
      setHistory(prev => [generationResult, ...prev].slice(0, 50)) // Keep last 50

      return generationResult
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Generation failed')
      setError(error)
      setProgress({ status: 'failed' })
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const editImage = useCallback(async (params: EditImageParams): Promise<GenerationResult | null> => {
    setIsGenerating(true)
    setError(null)
    setProgress({ status: 'queued' })

    try {
      setProgress({ status: 'processing', progress: 20 })

      const response = await fal.subscribe('fal-ai/nano-banana/edit', {
        input: {
          prompt: params.prompt,
          image_urls: [params.imageUrl],
          strength: params.strength || 0.75
        },
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            setProgress({ status: 'processing', progress: 60 })
          }
        }
      })

      setProgress({ status: 'completed', progress: 100 })

      const responseImages = (response.data as any)?.images || []
      const editResult: GenerationResult = {
        images: responseImages.map((img: any) => ({
          url: img.url || img,
          width: img.width || 0,
          height: img.height || 0,
          contentType: img.content_type || 'image/png'
        })),
        seed: (response.data as any)?.seed || 0,
        prompt: params.prompt
      }

      setResult(editResult)
      setHistory(prev => [editResult, ...prev].slice(0, 50))

      return editResult
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Edit failed')
      setError(error)
      setProgress({ status: 'failed' })
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const generateVariations = useCallback(async (
    imageUrl: string,
    count: number = 4
  ): Promise<GenerationResult | null> => {
    return editImage({
      prompt: 'Create a variation of this image while maintaining the same style and subject',
      imageUrl,
      strength: 0.3
    })
  }, [editImage])

  const upscale = useCallback(async (imageUrl: string): Promise<GenerationResult | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fal.subscribe('fal-ai/real-esrgan', {
        input: {
          image_url: imageUrl,
          scale: 4
        }
      })

      const upscaleResult: GenerationResult = {
        images: response.data?.images || [],
        seed: 0,
        prompt: 'upscaled'
      }

      setResult(upscaleResult)
      return upscaleResult
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upscale failed')
      setError(error)
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
    generateImage,
    editImage,
    generateVariations,
    upscale,
    clearHistory,
    reset
  }
}

// Preset prompts for quick generation
export const imagePresets = {
  portraits: [
    'Professional headshot portrait with studio lighting',
    'Artistic portrait with dramatic shadows',
    'Ethereal fantasy portrait with magical elements'
  ],
  landscapes: [
    'Breathtaking mountain landscape at sunset',
    'Serene ocean view with dramatic clouds',
    'Mystical forest with rays of light'
  ],
  products: [
    'Premium product photography with clean background',
    'Lifestyle product shot in modern setting',
    'Minimalist product display with soft shadows'
  ],
  abstract: [
    'Colorful abstract digital art composition',
    'Geometric abstract patterns with depth',
    'Flowing organic abstract shapes'
  ],
  architectural: [
    'Modern architecture with dramatic angles',
    'Interior design with warm lighting',
    'Futuristic building concept'
  ]
}
