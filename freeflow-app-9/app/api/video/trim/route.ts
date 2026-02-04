/**
 * Video Trim/Cut API
 *
 * Cut video segments, trim start/end, and extract clips
 * Supports single cuts and multi-segment extraction
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import {
  trimVideo,
  concatenateVideos,
  getVideoMetadata,
  checkFFmpegAvailability
} from '@/lib/video/ffmpeg-processor'
import { runtimeJoin, runtimeFilePath, basename, extname } from '@/lib/utils/runtime-path'
import fs from 'fs/promises'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('API-VideoTrim')

// Trim output directory
const TRIM_DIR = process.env.VIDEO_TRIM_DIR || '/tmp/video-trimmed'

interface TrimSegment {
  startTime: number    // Start time in seconds
  endTime?: number     // End time in seconds (optional if duration provided)
  duration?: number    // Duration in seconds (alternative to endTime)
}

interface TrimRequest {
  projectId: string
  videoPath?: string
  action: 'trim' | 'cut' | 'extract' | 'split'

  // For trim action (single cut)
  startTime?: number
  endTime?: number
  duration?: number

  // For extract action (multiple segments)
  segments?: TrimSegment[]

  // For split action (split at specific times)
  splitPoints?: number[]   // Array of times to split at

  // For cut action (remove a section)
  cutStart?: number        // Start of section to remove
  cutEnd?: number          // End of section to remove

  // Output options
  format?: 'mp4' | 'webm' | 'mov'
  quality?: 'copy' | 'low' | 'medium' | 'high'  // 'copy' = no re-encoding (fastest)
  fadeIn?: number          // Fade in duration in seconds
  fadeOut?: number         // Fade out duration in seconds
}

/**
 * POST /api/video/trim
 * Trim, cut, or extract video segments
 */
export async function POST(request: NextRequest) {
  try {
    const body: TrimRequest = await request.json()

    // Validate required fields
    if (!body.projectId && !body.videoPath) {
      return NextResponse.json(
        { success: false, error: 'Either projectId or videoPath is required' },
        { status: 400 }
      )
    }

    if (!body.action) {
      return NextResponse.json(
        { success: false, error: 'Action is required (trim, cut, extract, split)' },
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

    // Ensure trim directory exists
    const projectTrimDir = runtimeJoin(TRIM_DIR, body.projectId || 'temp')
    await fs.mkdir(projectTrimDir, { recursive: true })

    const baseName = basename(inputPath, extname(inputPath))
    const format = body.format || 'mp4'
    let result: any

    switch (body.action) {
      case 'trim': {
        // Simple trim: extract a single segment
        if (body.startTime === undefined) {
          return NextResponse.json(
            { success: false, error: 'startTime is required for trim action' },
            { status: 400 }
          )
        }

        let duration = body.duration
        if (!duration && body.endTime !== undefined) {
          duration = body.endTime - body.startTime
        }
        if (!duration) {
          // Default: trim from startTime to end of video
          duration = metadata.duration - body.startTime
        }

        // Validate times
        if (body.startTime < 0 || body.startTime >= metadata.duration) {
          return NextResponse.json(
            { success: false, error: `startTime must be between 0 and ${metadata.duration.toFixed(2)}` },
            { status: 400 }
          )
        }

        if (duration <= 0) {
          return NextResponse.json(
            { success: false, error: 'Duration must be positive' },
            { status: 400 }
          )
        }

        const outputPath = runtimeFilePath(
          projectTrimDir,
          `${baseName}_trim_${body.startTime.toFixed(0)}-${(body.startTime + duration).toFixed(0)}_${Date.now()}`,
          format
        )

        logger.info('Trimming video', {
          projectId: body.projectId,
          startTime: body.startTime,
          duration
        })

        await trimVideo(inputPath, outputPath, body.startTime, duration)

        // Get output file stats
        const stats = await fs.stat(outputPath)
        const outputMetadata = await getVideoMetadata(outputPath)

        result = {
          action: 'trim',
          output: {
            path: outputPath,
            url: `/trimmed/${basename(projectTrimDir)}/${basename(outputPath)}`,
            size: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          },
          segment: {
            startTime: body.startTime,
            endTime: body.startTime + duration,
            duration
          },
          metadata: {
            duration: outputMetadata.duration,
            width: outputMetadata.width,
            height: outputMetadata.height
          }
        }

        logger.info('Video trim completed', {
          projectId: body.projectId,
          outputPath
        })
        break
      }

      case 'cut': {
        // Cut: Remove a section from the video
        if (body.cutStart === undefined || body.cutEnd === undefined) {
          return NextResponse.json(
            { success: false, error: 'cutStart and cutEnd are required for cut action' },
            { status: 400 }
          )
        }

        if (body.cutStart >= body.cutEnd) {
          return NextResponse.json(
            { success: false, error: 'cutEnd must be greater than cutStart' },
            { status: 400 }
          )
        }

        if (body.cutStart < 0 || body.cutEnd > metadata.duration) {
          return NextResponse.json(
            { success: false, error: `Cut times must be within video duration (0-${metadata.duration.toFixed(2)})` },
            { status: 400 }
          )
        }

        logger.info('Cutting video section', {
          projectId: body.projectId,
          cutStart: body.cutStart,
          cutEnd: body.cutEnd
        })

        // Create two segments: before and after the cut
        const tempParts: string[] = []

        // Part 1: From start to cutStart (if cutStart > 0)
        if (body.cutStart > 0) {
          const part1Path = runtimeJoin(projectTrimDir, `${baseName}_part1_${Date.now()}.${format}`)
          await trimVideo(inputPath, part1Path, 0, body.cutStart)
          tempParts.push(part1Path)
        }

        // Part 2: From cutEnd to end (if cutEnd < duration)
        if (body.cutEnd < metadata.duration) {
          const part2Path = runtimeJoin(projectTrimDir, `${baseName}_part2_${Date.now()}.${format}`)
          await trimVideo(inputPath, part2Path, body.cutEnd, metadata.duration - body.cutEnd)
          tempParts.push(part2Path)
        }

        if (tempParts.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Cut would remove entire video' },
            { status: 400 }
          )
        }

        // Concatenate remaining parts
        const outputPath = runtimeFilePath(
          projectTrimDir,
          `${baseName}_cut_${Date.now()}`,
          format
        )

        if (tempParts.length === 1) {
          // Only one part, just rename it
          await fs.rename(tempParts[0], outputPath)
        } else {
          // Concatenate parts
          await concatenateVideos(tempParts, outputPath)
          // Clean up temp parts
          for (const part of tempParts) {
            try {
              await fs.unlink(part)
            } catch {}
          }
        }

        // Get output file stats
        const stats = await fs.stat(outputPath)
        const outputMetadata = await getVideoMetadata(outputPath)
        const removedDuration = body.cutEnd - body.cutStart

        result = {
          action: 'cut',
          output: {
            path: outputPath,
            url: `/trimmed/${basename(projectTrimDir)}/${basename(outputPath)}`,
            size: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          },
          removed: {
            startTime: body.cutStart,
            endTime: body.cutEnd,
            duration: removedDuration
          },
          metadata: {
            originalDuration: metadata.duration,
            newDuration: outputMetadata.duration,
            removedDuration
          }
        }

        logger.info('Video cut completed', {
          projectId: body.projectId,
          removedDuration
        })
        break
      }

      case 'extract': {
        // Extract: Get multiple segments as separate files
        if (!body.segments || body.segments.length === 0) {
          return NextResponse.json(
            { success: false, error: 'segments array is required for extract action' },
            { status: 400 }
          )
        }

        logger.info('Extracting video segments', {
          projectId: body.projectId,
          segmentCount: body.segments.length
        })

        const extractedSegments: any[] = []

        for (let i = 0; i < body.segments.length; i++) {
          const segment = body.segments[i]
          let duration = segment.duration
          if (!duration && segment.endTime !== undefined) {
            duration = segment.endTime - segment.startTime
          }
          if (!duration) {
            duration = 10 // Default 10 second segments
          }

          // Validate
          if (segment.startTime < 0 || segment.startTime >= metadata.duration) {
            continue // Skip invalid segments
          }

          // Clamp duration to video end
          const maxDuration = metadata.duration - segment.startTime
          duration = Math.min(duration, maxDuration)

          const segmentPath = runtimeJoin(
            projectTrimDir,
            `${baseName}_segment_${i + 1}_${Date.now()}.${format}`
          )

          await trimVideo(inputPath, segmentPath, segment.startTime, duration)

          const stats = await fs.stat(segmentPath)
          const segmentMetadata = await getVideoMetadata(segmentPath)

          extractedSegments.push({
            index: i + 1,
            path: segmentPath,
            url: `/trimmed/${basename(projectTrimDir)}/${basename(segmentPath)}`,
            startTime: segment.startTime,
            endTime: segment.startTime + duration,
            duration: segmentMetadata.duration,
            size: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          })
        }

        result = {
          action: 'extract',
          segments: extractedSegments,
          totalSegments: extractedSegments.length,
          totalDuration: extractedSegments.reduce((sum, s) => sum + s.duration, 0)
        }

        logger.info('Video segments extracted', {
          projectId: body.projectId,
          count: extractedSegments.length
        })
        break
      }

      case 'split': {
        // Split: Divide video at specific points
        if (!body.splitPoints || body.splitPoints.length === 0) {
          return NextResponse.json(
            { success: false, error: 'splitPoints array is required for split action' },
            { status: 400 }
          )
        }

        // Sort and validate split points
        const validSplitPoints = body.splitPoints
          .filter(t => t > 0 && t < metadata.duration)
          .sort((a, b) => a - b)

        if (validSplitPoints.length === 0) {
          return NextResponse.json(
            { success: false, error: 'No valid split points within video duration' },
            { status: 400 }
          )
        }

        logger.info('Splitting video', {
          projectId: body.projectId,
          splitPoints: validSplitPoints
        })

        const splitSegments: any[] = []
        let prevTime = 0

        // Create segments
        for (let i = 0; i <= validSplitPoints.length; i++) {
          const startTime = prevTime
          const endTime = i < validSplitPoints.length
            ? validSplitPoints[i]
            : metadata.duration

          const duration = endTime - startTime
          if (duration <= 0) continue

          const segmentPath = runtimeJoin(
            projectTrimDir,
            `${baseName}_split_${i + 1}_${Date.now()}.${format}`
          )

          await trimVideo(inputPath, segmentPath, startTime, duration)

          const stats = await fs.stat(segmentPath)
          const segmentMetadata = await getVideoMetadata(segmentPath)

          splitSegments.push({
            index: i + 1,
            path: segmentPath,
            url: `/trimmed/${basename(projectTrimDir)}/${basename(segmentPath)}`,
            startTime,
            endTime,
            duration: segmentMetadata.duration,
            size: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          })

          prevTime = endTime
        }

        result = {
          action: 'split',
          splitPoints: validSplitPoints,
          segments: splitSegments,
          totalSegments: splitSegments.length
        }

        logger.info('Video split completed', {
          projectId: body.projectId,
          segments: splitSegments.length
        })
        break
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${body.action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      ...result,
      originalVideo: {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height
      }
    })

  } catch (error) {
    logger.error('Trim API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Video trim operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/trim
 * Get trim service info
 */
export async function GET() {
  const ffmpegAvailable = await checkFFmpegAvailability()

  return NextResponse.json({
    status: 'active',
    endpoint: '/api/video/trim',
    version: '1.0.0',
    ffmpegAvailable,
    actions: {
      trim: {
        description: 'Extract a single segment from the video',
        parameters: {
          startTime: 'required - start time in seconds',
          endTime: 'optional - end time in seconds',
          duration: 'optional - duration in seconds (alternative to endTime)'
        }
      },
      cut: {
        description: 'Remove a section from the video',
        parameters: {
          cutStart: 'required - start of section to remove',
          cutEnd: 'required - end of section to remove'
        }
      },
      extract: {
        description: 'Extract multiple segments as separate files',
        parameters: {
          segments: 'required - array of { startTime, endTime/duration }'
        }
      },
      split: {
        description: 'Divide video at specific time points',
        parameters: {
          splitPoints: 'required - array of times to split at'
        }
      }
    },
    usage: {
      trim: {
        method: 'POST',
        body: {
          projectId: 'required',
          action: 'trim',
          startTime: 10,
          duration: 30
        }
      },
      cut: {
        method: 'POST',
        body: {
          projectId: 'required',
          action: 'cut',
          cutStart: 30,
          cutEnd: 60
        }
      },
      extract: {
        method: 'POST',
        body: {
          projectId: 'required',
          action: 'extract',
          segments: [
            { startTime: 0, duration: 10 },
            { startTime: 30, duration: 15 },
            { startTime: 60, endTime: 90 }
          ]
        }
      },
      split: {
        method: 'POST',
        body: {
          projectId: 'required',
          action: 'split',
          splitPoints: [60, 120, 180]
        }
      }
    },
    options: {
      format: ['mp4', 'webm', 'mov'],
      quality: ['copy', 'low', 'medium', 'high'],
      fadeIn: 'duration in seconds',
      fadeOut: 'duration in seconds'
    }
  })
}
