/**
 * Video Export API
 *
 * Production-ready video export endpoint with real FFmpeg processing
 * Supports multiple formats, quality presets, and background processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { queueExportJob, getJobStatus } from '@/lib/video/video-queue'
import { getVideoMetadata, checkFFmpegAvailability } from '@/lib/video/ffmpeg-processor'
import fs from 'fs/promises'

const logger = createFeatureLogger('API-VideoExport')

// Supported formats and their configurations
const SUPPORTED_FORMATS = ['mp4', 'webm', 'mov', 'avi', 'mkv'] as const
const QUALITY_PRESETS = ['low', 'medium', 'high', 'ultra'] as const
const RESOLUTION_PRESETS = ['720p', '1080p', '1440p', '4k', 'original'] as const

// Export directory
const EXPORT_DIR = process.env.VIDEO_EXPORT_DIR || '/tmp/video-exports'

interface ExportRequest {
  projectId: string
  projectName?: string
  format: typeof SUPPORTED_FORMATS[number]
  quality: typeof QUALITY_PRESETS[number]
  resolution: typeof RESOLUTION_PRESETS[number]
  fps?: number
  codec?: string
  audioCodec?: string
  audioBitrate?: string
  videoBitrate?: string
  twoPass?: boolean
  metadata?: {
    title?: string
    author?: string
    description?: string
    tags?: string[]
  }
}

/**
 * POST /api/video/export
 * Start a video export job
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json()

    // Validate required fields
    if (!body.projectId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: projectId' },
        { status: 400 }
      )
    }

    // Validate format
    if (!body.format || !SUPPORTED_FORMATS.includes(body.format)) {
      return NextResponse.json(
        { success: false, error: `Invalid format. Supported: ${SUPPORTED_FORMATS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate quality
    const quality = body.quality || 'high'
    if (!QUALITY_PRESETS.includes(quality)) {
      return NextResponse.json(
        { success: false, error: `Invalid quality. Supported: ${QUALITY_PRESETS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate resolution
    const resolution = body.resolution || '1080p'
    if (!RESOLUTION_PRESETS.includes(resolution)) {
      return NextResponse.json(
        { success: false, error: `Invalid resolution. Supported: ${RESOLUTION_PRESETS.join(', ')}` },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get project from database
    const { data: project, error: projectError } = await supabase
      .from('video_projects')
      .select('*')
      .eq('id', body.projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Check if source file exists
    const inputPath = project.file_path
    if (!inputPath) {
      return NextResponse.json(
        { success: false, error: 'No source video file found for this project' },
        { status: 400 }
      )
    }

    // Check FFmpeg availability
    const ffmpegAvailable = await checkFFmpegAvailability()
    if (!ffmpegAvailable) {
      logger.error('FFmpeg not available')
      return NextResponse.json(
        { success: false, error: 'Video processing service unavailable' },
        { status: 503 }
      )
    }

    // Ensure export directory exists
    await fs.mkdir(EXPORT_DIR, { recursive: true })

    // Get video metadata for duration estimation
    let estimatedDuration = 60 // Default 1 minute
    try {
      const metadata = await getVideoMetadata(inputPath)
      estimatedDuration = estimateExportTime(metadata.duration, body.format, quality, resolution)
    } catch (err) {
      logger.warn('Could not get video metadata', { error: err })
    }

    // Build export options
    const exportOptions = {
      format: body.format,
      quality,
      resolution,
      fps: body.fps,
      codec: body.codec,
      audioCodec: body.audioCodec,
      audioBitrate: body.audioBitrate,
      videoBitrate: body.videoBitrate,
      twoPass: body.twoPass
    }

    // Queue the export job
    const jobId = await queueExportJob(
      body.projectId,
      user.id,
      inputPath,
      EXPORT_DIR,
      exportOptions,
      {
        title: body.metadata?.title || body.projectName || project.title,
        author: body.metadata?.author || user.email,
        description: body.metadata?.description,
        tags: body.metadata?.tags
      }
    )

    // Update project status
    await supabase
      .from('video_projects')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', body.projectId)

    logger.info('Export job queued', {
      jobId,
      projectId: body.projectId,
      userId: user.id,
      format: body.format,
      quality,
      resolution
    })

    return NextResponse.json({
      success: true,
      jobId,
      status: 'queued',
      message: 'Export job queued successfully',
      estimatedDuration,
      config: {
        format: body.format,
        quality,
        resolution,
        fps: body.fps || 'auto'
      }
    })

  } catch (error) {
    logger.error('Export API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to queue export job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/export?jobId=xxx
 * Get export job status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    // If no jobId, return endpoint info
    if (!jobId) {
      const ffmpegAvailable = await checkFFmpegAvailability()

      return NextResponse.json({
        status: 'active',
        endpoint: '/api/video/export',
        version: '2.0.0',
        ffmpegAvailable,
        supportedFormats: SUPPORTED_FORMATS,
        qualityPresets: QUALITY_PRESETS,
        resolutionPresets: RESOLUTION_PRESETS,
        features: [
          'Multi-format export (MP4, WebM, MOV, AVI, MKV)',
          'Quality presets (low, medium, high, ultra)',
          'Resolution scaling (720p to 4K)',
          'Custom codec selection',
          'Audio configuration',
          'Background processing',
          'Progress tracking',
          'Automatic thumbnail generation'
        ]
      })
    }

    // Get job status
    const status = await getJobStatus(jobId)

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Build response
    const response: any = {
      success: true,
      jobId: status.jobId,
      type: status.type,
      status: status.status,
      progress: status.progress,
      currentStep: status.currentStep,
      createdAt: status.createdAt
    }

    if (status.startedAt) {
      response.startedAt = status.startedAt
    }

    if (status.status === 'completed') {
      response.completedAt = status.completedAt
      response.result = status.result
    }

    if (status.status === 'failed') {
      response.completedAt = status.completedAt
      response.error = status.error
    }

    return NextResponse.json(response)

  } catch (error) {
    logger.error('Export status API error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get export status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Estimate export time based on video properties
 */
function estimateExportTime(
  duration: number,
  format: string,
  quality: string,
  resolution: string
): number {
  // Base: 1x realtime for medium quality 1080p
  let multiplier = 1

  // Quality multiplier
  const qualityMultipliers: Record<string, number> = {
    low: 0.5,
    medium: 1,
    high: 1.5,
    ultra: 2.5
  }
  multiplier *= qualityMultipliers[quality] || 1

  // Resolution multiplier
  const resolutionMultipliers: Record<string, number> = {
    '720p': 0.7,
    '1080p': 1,
    '1440p': 1.5,
    '4k': 2.5,
    'original': 1
  }
  multiplier *= resolutionMultipliers[resolution] || 1

  // Format multiplier
  const formatMultipliers: Record<string, number> = {
    mp4: 1,
    webm: 1.5,  // VP9 is slower
    mov: 1,
    avi: 0.9,
    mkv: 1.2
  }
  multiplier *= formatMultipliers[format] || 1

  // Calculate estimated time in seconds
  const estimatedSeconds = Math.ceil(duration * multiplier)

  // Add overhead for startup/finalization (30 seconds)
  return estimatedSeconds + 30
}
