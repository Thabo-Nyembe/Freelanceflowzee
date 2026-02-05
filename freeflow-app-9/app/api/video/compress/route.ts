/**
 * Video Compression API
 *
 * Compress videos to reduce file size while maintaining quality
 * Supports target size specification and quality presets
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'
import {
  compressVideo,
  getVideoMetadata,
  checkFFmpegAvailability
} from '@/lib/video/ffmpeg-processor'
import { queueCompressJob, getJobStatus } from '@/lib/video/video-queue'
import { runtimeJoin, runtimeFilePath, basename, extname } from '@/lib/utils/runtime-path'
import fs from 'fs/promises'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-VideoCompress')

// Compression directory
const COMPRESS_DIR = process.env.VIDEO_COMPRESS_DIR || '/tmp/video-compressed'

// Compression presets
const COMPRESSION_PRESETS = {
  web: {
    targetSizeMB: null, // Will be calculated based on duration
    maxBitrate: '2M',
    description: 'Optimized for web streaming (720p, 2Mbps)'
  },
  mobile: {
    targetSizeMB: null,
    maxBitrate: '1M',
    description: 'Optimized for mobile devices (480p, 1Mbps)'
  },
  social: {
    targetSizeMB: 100, // Most social platforms have ~100MB limit
    description: 'Optimized for social media uploads (max 100MB)'
  },
  email: {
    targetSizeMB: 25, // Email attachment limit
    description: 'Small enough for email attachments (max 25MB)'
  },
  archive: {
    targetSizeMB: null,
    crf: 28, // Higher CRF = more compression
    description: 'Maximum compression for archival (smaller file, lower quality)'
  }
} as const

interface CompressRequest {
  projectId: string
  videoPath?: string
  targetSizeMB?: number          // Target file size in MB
  preset?: keyof typeof COMPRESSION_PRESETS
  quality?: 'low' | 'medium' | 'high'
  maxBitrate?: string            // e.g., '2M', '5M'
  resolution?: '480p' | '720p' | '1080p' | 'original'
  removeAudio?: boolean
  async?: boolean                // Queue job for background processing
}

/**
 * POST /api/video/compress
 * Compress a video file
 */
export async function POST(request: NextRequest) {
  try {
    const body: CompressRequest = await request.json()

    // Validate required fields
    if (!body.projectId && !body.videoPath) {
      return NextResponse.json(
        { success: false, error: 'Either projectId or videoPath is required' },
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

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    let inputPath = body.videoPath
    let project: any = null

    // If projectId provided, get video path from project
    if (body.projectId) {
      const { data: projectData, error: projectError } = await supabase
        .from('video_projects')
        .select('*')
        .eq('id', body.projectId)
        .eq('user_id', user.id)
        .single()

      if (projectError || !projectData) {
        return NextResponse.json(
          { success: false, error: 'Project not found or access denied' },
          { status: 404 }
        )
      }

      project = projectData
      inputPath = project.file_path
    }

    if (!inputPath) {
      return NextResponse.json(
        { success: false, error: 'No video path available' },
        { status: 400 }
      )
    }

    // Ensure compression directory exists
    const projectCompressDir = runtimeJoin(COMPRESS_DIR, body.projectId || 'temp')
    await fs.mkdir(projectCompressDir, { recursive: true })

    // Get video metadata
    let metadata
    try {
      metadata = await getVideoMetadata(inputPath)
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Failed to read video file' },
        { status: 400 }
      )
    }

    // Calculate target size
    let targetSizeMB = body.targetSizeMB

    if (body.preset && COMPRESSION_PRESETS[body.preset]) {
      const preset = COMPRESSION_PRESETS[body.preset]
      if (preset.targetSizeMB) {
        targetSizeMB = preset.targetSizeMB
      } else if (!targetSizeMB) {
        // Calculate based on duration and max bitrate
        const bitrateMbps = parseFloat(body.maxBitrate || preset.maxBitrate || '2M')
        targetSizeMB = Math.ceil((metadata.duration * bitrateMbps) / 8) // Convert to MB
      }
    }

    if (!targetSizeMB) {
      // Default: reduce to 50% of original size
      const originalSizeMB = metadata.size / (1024 * 1024)
      targetSizeMB = Math.ceil(originalSizeMB * 0.5)
    }

    // Build output path
    const baseName = basename(inputPath, extname(inputPath))
    const outputPath = runtimeFilePath(
      projectCompressDir,
      `${baseName}_compressed_${Date.now()}`,
      'mp4'
    )

    logger.info('Starting video compression', {
      projectId: body.projectId,
      inputPath,
      targetSizeMB,
      preset: body.preset
    })

    // Check if async processing requested
    if (body.async) {
      // Queue job for background processing
      const jobId = await queueCompressJob(
        body.projectId || 'temp',
        user.id,
        inputPath,
        outputPath,
        targetSizeMB
      )

      return NextResponse.json({
        success: true,
        async: true,
        jobId,
        status: 'queued',
        message: 'Compression job queued successfully',
        config: {
          targetSizeMB,
          preset: body.preset,
          estimatedDuration: Math.ceil(metadata.duration * 0.5) // Rough estimate
        }
      })
    }

    // Synchronous compression with progress tracking
    let lastProgress = 0
    const progressUpdates: number[] = []

    const compressedPath = await compressVideo(
      inputPath,
      outputPath,
      targetSizeMB,
      (progress) => {
        if (progress - lastProgress >= 10) {
          progressUpdates.push(progress)
          lastProgress = progress
        }
      }
    )

    // Get compressed file stats
    const compressedStats = await fs.stat(compressedPath)
    const originalSizeMB = metadata.size / (1024 * 1024)
    const compressedSizeMB = compressedStats.size / (1024 * 1024)
    const compressionRatio = ((1 - compressedSizeMB / originalSizeMB) * 100).toFixed(1)

    // Get compressed video metadata
    const compressedMetadata = await getVideoMetadata(compressedPath)

    // Update project with compressed version info
    if (body.projectId) {
      await supabase
        .from('video_projects')
        .update({
          compressed_path: compressedPath,
          compressed_size: compressedStats.size,
          compression_ratio: parseFloat(compressionRatio),
          updated_at: new Date().toISOString()
        })
        .eq('id', body.projectId)
    }

    logger.info('Video compression completed', {
      projectId: body.projectId,
      originalSizeMB: originalSizeMB.toFixed(2),
      compressedSizeMB: compressedSizeMB.toFixed(2),
      compressionRatio: `${compressionRatio}%`
    })

    return NextResponse.json({
      success: true,
      async: false,
      output: {
        path: compressedPath,
        url: `/compressed/${basename(projectCompressDir)}/${basename(compressedPath)}`,
        size: compressedStats.size,
        sizeMB: compressedSizeMB.toFixed(2)
      },
      comparison: {
        originalSizeMB: originalSizeMB.toFixed(2),
        compressedSizeMB: compressedSizeMB.toFixed(2),
        savedMB: (originalSizeMB - compressedSizeMB).toFixed(2),
        compressionRatio: `${compressionRatio}%`
      },
      metadata: {
        duration: compressedMetadata.duration,
        width: compressedMetadata.width,
        height: compressedMetadata.height,
        fps: compressedMetadata.fps,
        codec: compressedMetadata.codec
      },
      config: {
        targetSizeMB,
        preset: body.preset
      }
    })

  } catch (error) {
    logger.error('Compression API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Video compression failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/compress
 * Get compression service info or job status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    // If jobId provided, get job status
    if (jobId) {
      const status = await getJobStatus(jobId)

      if (!status) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        ...status
      })
    }

    // Return service info
    const ffmpegAvailable = await checkFFmpegAvailability()

    return NextResponse.json({
      status: 'active',
      endpoint: '/api/video/compress',
      version: '1.0.0',
      ffmpegAvailable,
      presets: Object.entries(COMPRESSION_PRESETS).map(([key, value]) => ({
        name: key,
        ...value
      })),
      features: [
        'Target size compression',
        'Preset-based compression (web, mobile, social, email, archive)',
        'Quality preservation with smart bitrate calculation',
        'Background processing with progress tracking',
        'Automatic metadata extraction'
      ],
      usage: {
        targetSize: {
          method: 'POST',
          body: {
            projectId: 'required',
            targetSizeMB: 50,
            async: 'optional (default: false)'
          }
        },
        preset: {
          method: 'POST',
          body: {
            projectId: 'required',
            preset: 'web | mobile | social | email | archive'
          }
        },
        custom: {
          method: 'POST',
          body: {
            projectId: 'required',
            maxBitrate: '2M',
            resolution: '720p | 1080p | original',
            removeAudio: false
          }
        }
      },
      limits: {
        maxInputSizeGB: 10,
        minTargetSizeMB: 1,
        supportedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm']
      }
    })
  } catch (error) {
    logger.error('Compression info API error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get compression service info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
