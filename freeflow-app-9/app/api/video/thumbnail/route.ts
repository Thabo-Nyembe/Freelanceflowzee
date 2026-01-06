/**
 * Video Thumbnail API
 *
 * Generate thumbnails from video files using FFmpeg
 * Supports static thumbnails and animated previews
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import {
  generateThumbnails,
  generateAnimatedThumbnail,
  getVideoMetadata,
  checkFFmpegAvailability
} from '@/lib/video/ffmpeg-processor'
import { runtimeJoin, runtimeFilePath, basename } from '@/lib/utils/runtime-path'
import fs from 'fs/promises'

const logger = createFeatureLogger('API-VideoThumbnail')

// Thumbnail directory
const THUMBNAIL_DIR = process.env.VIDEO_THUMBNAIL_DIR || '/tmp/video-thumbnails'

interface ThumbnailRequest {
  projectId: string
  videoPath?: string
  type?: 'static' | 'animated'
  timestamps?: number[]      // For static thumbnails (in seconds)
  startTime?: number         // For animated thumbnail
  duration?: number          // For animated thumbnail
  width?: number
  height?: number
  format?: 'jpg' | 'png' | 'webp' | 'gif'
  count?: number             // Auto-generate this many thumbnails
}

/**
 * POST /api/video/thumbnail
 * Generate thumbnails from a video
 */
export async function POST(request: NextRequest) {
  try {
    const body: ThumbnailRequest = await request.json()

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

    // If projectId provided, get video path from project
    if (body.projectId) {
      const { data: project, error: projectError } = await supabase
        .from('video_projects')
        .select('file_path, title')
        .eq('id', body.projectId)
        .eq('user_id', user.id)
        .single()

      if (projectError || !project) {
        return NextResponse.json(
          { success: false, error: 'Project not found or access denied' },
          { status: 404 }
        )
      }

      if (!project.file_path) {
        return NextResponse.json(
          { success: false, error: 'No video file found for this project' },
          { status: 400 }
        )
      }

      inputPath = project.file_path
    }

    if (!inputPath) {
      return NextResponse.json(
        { success: false, error: 'No video path available' },
        { status: 400 }
      )
    }

    // Ensure thumbnail directory exists
    const projectThumbnailDir = runtimeJoin(THUMBNAIL_DIR, body.projectId || 'temp')
    await fs.mkdir(projectThumbnailDir, { recursive: true })

    // Get video metadata to determine duration
    let videoMetadata
    try {
      videoMetadata = await getVideoMetadata(inputPath)
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Failed to read video file' },
        { status: 400 }
      )
    }

    const type = body.type || 'static'
    let result: any

    if (type === 'animated') {
      // Generate animated thumbnail (GIF or WebP)
      const startTime = body.startTime ?? 1
      const duration = body.duration ?? 3
      const format = body.format === 'gif' ? 'gif' : 'webp'
      const outputPath = runtimeFilePath(
        projectThumbnailDir,
        `animated_${Date.now()}`,
        format
      )

      const animatedPath = await generateAnimatedThumbnail(inputPath, outputPath, {
        startTime,
        duration,
        width: body.width || 480,
        fps: 10,
        format
      })

      // Get file size
      const stats = await fs.stat(animatedPath)

      result = {
        type: 'animated',
        path: animatedPath,
        url: `/thumbnails/${basename(projectThumbnailDir)}/${basename(animatedPath)}`,
        format,
        startTime,
        duration,
        width: body.width || 480,
        fileSize: stats.size
      }

      logger.info('Animated thumbnail generated', {
        projectId: body.projectId,
        format,
        duration
      })

    } else {
      // Generate static thumbnails
      let timestamps = body.timestamps

      // If no timestamps specified, auto-generate based on count
      if (!timestamps || timestamps.length === 0) {
        const count = body.count || 3
        timestamps = []

        // Generate evenly distributed timestamps
        for (let i = 0; i < count; i++) {
          // Avoid first and last 10% of video
          const position = 0.1 + (0.8 * i / (count - 1 || 1))
          timestamps.push(Math.floor(videoMetadata.duration * position))
        }
      }

      // Ensure timestamps are within video duration
      timestamps = timestamps.filter(t => t >= 0 && t < videoMetadata.duration)

      if (timestamps.length === 0) {
        timestamps = [1] // Default to 1 second if all invalid
      }

      const format = body.format || 'jpg'

      const thumbnailPaths = await generateThumbnails(inputPath, projectThumbnailDir, {
        timestamps,
        width: body.width || 640,
        height: body.height,
        format: format === 'gif' ? 'jpg' : format // GIF not supported for static
      })

      // Get file sizes and build result
      const thumbnails = await Promise.all(
        thumbnailPaths.map(async (thumbPath, index) => {
          const stats = await fs.stat(thumbPath)
          return {
            path: thumbPath,
            url: `/thumbnails/${basename(projectThumbnailDir)}/${basename(thumbPath)}`,
            timestamp: timestamps[index],
            fileSize: stats.size
          }
        })
      )

      result = {
        type: 'static',
        thumbnails,
        count: thumbnails.length,
        format,
        width: body.width || 640
      }

      // Update project with first thumbnail if projectId provided
      if (body.projectId && thumbnails.length > 0) {
        await supabase
          .from('video_projects')
          .update({
            thumbnail_path: thumbnails[0].path,
            updated_at: new Date().toISOString()
          })
          .eq('id', body.projectId)
      }

      logger.info('Static thumbnails generated', {
        projectId: body.projectId,
        count: thumbnails.length,
        format
      })
    }

    return NextResponse.json({
      success: true,
      ...result,
      videoMetadata: {
        duration: videoMetadata.duration,
        width: videoMetadata.width,
        height: videoMetadata.height,
        fps: videoMetadata.fps
      }
    })

  } catch (error) {
    logger.error('Thumbnail API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate thumbnails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/thumbnail
 * Get thumbnail service info
 */
export async function GET() {
  const ffmpegAvailable = await checkFFmpegAvailability()

  return NextResponse.json({
    status: 'active',
    endpoint: '/api/video/thumbnail',
    version: '1.0.0',
    ffmpegAvailable,
    features: {
      static: {
        description: 'Generate static thumbnail images at specific timestamps',
        supportedFormats: ['jpg', 'png', 'webp'],
        maxWidth: 1920,
        autoGenerate: 'Specify count to auto-generate evenly distributed thumbnails'
      },
      animated: {
        description: 'Generate animated preview thumbnails',
        supportedFormats: ['gif', 'webp'],
        maxDuration: 10,
        defaultFps: 10
      }
    },
    usage: {
      static: {
        method: 'POST',
        body: {
          projectId: 'required',
          type: 'static',
          timestamps: [1, 5, 10],
          width: 640,
          format: 'jpg'
        }
      },
      animated: {
        method: 'POST',
        body: {
          projectId: 'required',
          type: 'animated',
          startTime: 1,
          duration: 3,
          width: 480,
          format: 'webp'
        }
      },
      autoGenerate: {
        method: 'POST',
        body: {
          projectId: 'required',
          type: 'static',
          count: 5,
          width: 640
        }
      }
    }
  })
}
