/**
 * Remotion Video Rendering Service
 *
 * Server-side video rendering with Remotion
 * Supports local rendering and AWS Lambda for production
 */

import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

// ============================================================================
// Types
// ============================================================================

export interface RenderJobConfig {
  compositionId: string
  inputProps: Record<string, unknown>
  outputFormat?: 'mp4' | 'webm' | 'gif'
  quality?: number // 1-100
  fps?: number
  width?: number
  height?: number
  durationInFrames?: number
  codec?: 'h264' | 'h265' | 'vp8' | 'vp9' | 'prores' | 'gif'
  crf?: number // Constant rate factor (0-51, lower = better quality)
  audioBitrate?: string
  videoBitrate?: string
}

export interface RenderJob {
  id: string
  userId: string
  status: 'pending' | 'bundling' | 'rendering' | 'encoding' | 'completed' | 'failed'
  progress: number
  config: RenderJobConfig
  outputPath?: string
  outputUrl?: string
  error?: string
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  metadata?: {
    duration?: number
    fileSize?: number
    resolution?: string
  }
}

export interface RenderProgress {
  jobId: string
  stage: 'bundling' | 'rendering' | 'encoding'
  progress: number
  framesRendered?: number
  totalFrames?: number
  timeRemaining?: number
}

export type ProgressCallback = (progress: RenderProgress) => void

// ============================================================================
// Configuration
// ============================================================================

const OUTPUT_DIR = process.env.REMOTION_OUTPUT_DIR || '/tmp/remotion-renders'
const BUNDLE_DIR = process.env.REMOTION_BUNDLE_DIR || '/tmp/remotion-bundles'
const COMPOSITIONS_PATH = path.join(process.cwd(), 'lib/remotion/compositions.tsx')

// Default render settings
const DEFAULT_RENDER_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  codec: 'h264' as const,
  crf: 18,
  outputFormat: 'mp4' as const,
}

// ============================================================================
// Render Job Store (In-memory, replace with database in production)
// ============================================================================

const renderJobs = new Map<string, RenderJob>()

// ============================================================================
// Remotion Service Class
// ============================================================================

export class RemotionService {
  private bundled = false
  private bundlePath: string | null = null

  /**
   * Initialize the service and bundle compositions
   */
  async initialize(): Promise<void> {
    if (this.bundled) return

    try {
      // Ensure directories exist
      await fs.mkdir(OUTPUT_DIR, { recursive: true })
      await fs.mkdir(BUNDLE_DIR, { recursive: true })

      console.log('[Remotion] Bundling compositions...')

      this.bundlePath = await bundle({
        entryPoint: COMPOSITIONS_PATH,
        outDir: BUNDLE_DIR,
      })

      this.bundled = true
      console.log('[Remotion] Bundle complete:', this.bundlePath)
    } catch (error) {
      console.error('[Remotion] Bundle failed:', error)
      throw error
    }
  }

  /**
   * Create a new render job
   */
  async createRenderJob(
    userId: string,
    config: RenderJobConfig
  ): Promise<RenderJob> {
    const job: RenderJob = {
      id: uuidv4(),
      userId,
      status: 'pending',
      progress: 0,
      config: {
        ...DEFAULT_RENDER_CONFIG,
        ...config,
      },
      createdAt: new Date(),
    }

    renderJobs.set(job.id, job)
    return job
  }

  /**
   * Get render job by ID
   */
  getJob(jobId: string): RenderJob | undefined {
    return renderJobs.get(jobId)
  }

  /**
   * Get all jobs for a user
   */
  getUserJobs(userId: string): RenderJob[] {
    return Array.from(renderJobs.values())
      .filter((job) => job.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Start rendering a job
   */
  async renderJob(
    jobId: string,
    onProgress?: ProgressCallback
  ): Promise<RenderJob> {
    const job = renderJobs.get(jobId)
    if (!job) {
      throw new Error(`Job not found: ${jobId}`)
    }

    // Ensure bundled
    await this.initialize()
    if (!this.bundlePath) {
      throw new Error('Bundle not ready')
    }

    try {
      job.status = 'bundling'
      job.startedAt = new Date()
      job.progress = 5
      onProgress?.({ jobId, stage: 'bundling', progress: 5 })

      // Get composition
      const composition = await selectComposition({
        serveUrl: this.bundlePath,
        id: job.config.compositionId,
        inputProps: job.config.inputProps,
      })

      // Override composition settings if provided
      const finalComposition = {
        ...composition,
        fps: job.config.fps || composition.fps,
        width: job.config.width || composition.width,
        height: job.config.height || composition.height,
        durationInFrames: job.config.durationInFrames || composition.durationInFrames,
      }

      job.status = 'rendering'
      job.progress = 10
      onProgress?.({ jobId, stage: 'rendering', progress: 10 })

      // Determine output path
      const extension = job.config.outputFormat || 'mp4'
      const outputPath = path.join(OUTPUT_DIR, `${jobId}.${extension}`)

      // Render the video
      await renderMedia({
        composition: finalComposition,
        serveUrl: this.bundlePath,
        codec: job.config.codec || 'h264',
        outputLocation: outputPath,
        inputProps: job.config.inputProps,
        crf: job.config.crf,
        audioBitrate: job.config.audioBitrate,
        videoBitrate: job.config.videoBitrate,
        onProgress: ({ progress, renderedFrames, encodedFrames }) => {
          const overallProgress = 10 + Math.round(progress * 85)
          job.progress = overallProgress

          onProgress?.({
            jobId,
            stage: encodedFrames > 0 ? 'encoding' : 'rendering',
            progress: overallProgress,
            framesRendered: renderedFrames,
            totalFrames: finalComposition.durationInFrames,
          })
        },
      })

      // Get file stats
      const stats = await fs.stat(outputPath)

      job.status = 'completed'
      job.progress = 100
      job.completedAt = new Date()
      job.outputPath = outputPath
      job.metadata = {
        duration: finalComposition.durationInFrames / finalComposition.fps,
        fileSize: stats.size,
        resolution: `${finalComposition.width}x${finalComposition.height}`,
      }

      onProgress?.({ jobId, stage: 'encoding', progress: 100 })

      return job
    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.completedAt = new Date()
      throw error
    }
  }

  /**
   * Cancel a running job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = renderJobs.get(jobId)
    if (!job) return

    if (job.status === 'rendering' || job.status === 'bundling') {
      job.status = 'failed'
      job.error = 'Cancelled by user'
      job.completedAt = new Date()
    }

    // TODO: Actually cancel the render process if running
  }

  /**
   * Delete a job and its output file
   */
  async deleteJob(jobId: string): Promise<void> {
    const job = renderJobs.get(jobId)
    if (!job) return

    if (job.outputPath) {
      try {
        await fs.unlink(job.outputPath)
      } catch {
        // File might not exist
      }
    }

    renderJobs.delete(jobId)
  }

  /**
   * Get the output file as a buffer
   */
  async getOutputBuffer(jobId: string): Promise<Buffer | null> {
    const job = renderJobs.get(jobId)
    if (!job || !job.outputPath) return null

    try {
      return await fs.readFile(job.outputPath)
    } catch {
      return null
    }
  }

  /**
   * List available compositions
   */
  async listCompositions(): Promise<string[]> {
    // These match the exports in compositions.tsx
    return [
      'TextSlide',
      'ImageSlide',
      'LogoReveal',
      'SocialProof',
      'CallToAction',
      'ProductShowcase',
      'Countdown',
      'ProgressBar',
      'IntroOutroVideo',
      'SlideshowVideo',
      'PromoVideo',
    ]
  }

  /**
   * Get composition preview props (for documentation/preview)
   */
  getCompositionPreviewProps(compositionId: string): Record<string, unknown> {
    const previewProps: Record<string, Record<string, unknown>> = {
      TextSlide: {
        title: 'Welcome to FreeFlow',
        subtitle: 'The future of freelancing',
        backgroundColor: '#1a1a2e',
        animation: 'slide',
      },
      ImageSlide: {
        src: '/api/placeholder/1920/1080',
        title: 'Beautiful Imagery',
        animation: 'kenBurns',
      },
      LogoReveal: {
        logoSrc: '/logo.svg',
        backgroundColor: '#000',
        animation: 'scale',
      },
      SocialProof: {
        testimonial: 'FreeFlow transformed my freelance business!',
        author: 'Jane Doe',
        authorTitle: 'Freelance Designer',
        backgroundColor: '#f8f9fa',
      },
      CallToAction: {
        headline: 'Start Your Free Trial',
        subheadline: 'No credit card required',
        buttonText: 'Get Started',
        backgroundColor: '#6366f1',
      },
      ProductShowcase: {
        productImage: '/api/placeholder/800/800',
        productName: 'FreeFlow Pro',
        features: ['Unlimited Projects', 'Advanced Analytics', '24/7 Support'],
        price: '$29/month',
      },
      Countdown: {
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Launch Coming Soon',
        backgroundColor: '#1a1a2e',
      },
      ProgressBar: {
        progress: 75,
        label: 'Project Progress',
        color: '#6366f1',
      },
      IntroOutroVideo: {
        logoSrc: '/logo.svg',
        title: 'Welcome to FreeFlow',
        subtitle: 'Your Freelance Partner',
        backgroundColor: '#1a1a2e',
      },
      SlideshowVideo: {
        slides: [
          { type: 'text', content: { title: 'Slide 1' }, duration: 3 },
          { type: 'text', content: { title: 'Slide 2' }, duration: 3 },
        ],
      },
      PromoVideo: {
        logoSrc: '/logo.svg',
        headline: 'Grow Your Freelance Business',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        cta: { headline: 'Get Started Today', buttonText: 'Sign Up Free' },
      },
    }

    return previewProps[compositionId] || {}
  }

  /**
   * Get recommended settings for a composition
   */
  getRecommendedSettings(compositionId: string): Partial<RenderJobConfig> {
    // Different compositions might have different optimal settings
    const settings: Record<string, Partial<RenderJobConfig>> = {
      // Social media optimized
      TextSlide: { width: 1080, height: 1920, fps: 30, durationInFrames: 90 },
      ImageSlide: { width: 1080, height: 1920, fps: 30, durationInFrames: 150 },

      // Landscape (YouTube, etc.)
      LogoReveal: { width: 1920, height: 1080, fps: 30, durationInFrames: 90 },
      SocialProof: { width: 1920, height: 1080, fps: 30, durationInFrames: 150 },
      CallToAction: { width: 1920, height: 1080, fps: 30, durationInFrames: 120 },
      ProductShowcase: { width: 1920, height: 1080, fps: 30, durationInFrames: 180 },

      // Multi-scene compositions
      IntroOutroVideo: { width: 1920, height: 1080, fps: 30, durationInFrames: 150 },
      SlideshowVideo: { width: 1920, height: 1080, fps: 30 },
      PromoVideo: { width: 1920, height: 1080, fps: 30, durationInFrames: 480 },

      // Special
      Countdown: { width: 1920, height: 1080, fps: 30, durationInFrames: 300 },
      ProgressBar: { width: 1920, height: 1080, fps: 30, durationInFrames: 90 },
    }

    return settings[compositionId] || {}
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const remotionService = new RemotionService()

// ============================================================================
// Quick Render Functions
// ============================================================================

/**
 * Quick render a text slide
 */
export async function renderTextSlide(
  userId: string,
  props: {
    title: string
    subtitle?: string
    backgroundColor?: string
    animation?: 'fade' | 'slide' | 'scale' | 'typewriter'
  },
  options?: Partial<RenderJobConfig>
): Promise<RenderJob> {
  const job = await remotionService.createRenderJob(userId, {
    compositionId: 'TextSlide',
    inputProps: props,
    ...remotionService.getRecommendedSettings('TextSlide'),
    ...options,
  })

  return remotionService.renderJob(job.id)
}

/**
 * Quick render a logo reveal
 */
export async function renderLogoReveal(
  userId: string,
  props: {
    logoSrc: string
    backgroundColor?: string
    animation?: 'fade' | 'scale' | 'rotate' | 'glitch'
  },
  options?: Partial<RenderJobConfig>
): Promise<RenderJob> {
  const job = await remotionService.createRenderJob(userId, {
    compositionId: 'LogoReveal',
    inputProps: props,
    ...remotionService.getRecommendedSettings('LogoReveal'),
    ...options,
  })

  return remotionService.renderJob(job.id)
}

/**
 * Quick render a promo video
 */
export async function renderPromoVideo(
  userId: string,
  props: {
    logoSrc: string
    headline: string
    features: string[]
    testimonial?: { quote: string; author: string; title?: string }
    cta: { headline: string; buttonText: string }
  },
  options?: Partial<RenderJobConfig>
): Promise<RenderJob> {
  const job = await remotionService.createRenderJob(userId, {
    compositionId: 'PromoVideo',
    inputProps: props,
    ...remotionService.getRecommendedSettings('PromoVideo'),
    ...options,
  })

  return remotionService.renderJob(job.id)
}

/**
 * Quick render a slideshow
 */
export async function renderSlideshow(
  userId: string,
  slides: Array<{
    type: 'text' | 'image'
    content: Record<string, unknown>
    duration: number
  }>,
  options?: Partial<RenderJobConfig>
): Promise<RenderJob> {
  // Calculate total duration
  const totalDuration = slides.reduce((acc, slide) => acc + slide.duration, 0)
  const fps = options?.fps || 30

  const job = await remotionService.createRenderJob(userId, {
    compositionId: 'SlideshowVideo',
    inputProps: { slides },
    durationInFrames: totalDuration * fps,
    ...remotionService.getRecommendedSettings('SlideshowVideo'),
    ...options,
  })

  return remotionService.renderJob(job.id)
}
