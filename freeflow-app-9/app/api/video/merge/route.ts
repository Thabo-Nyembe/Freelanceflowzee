/**
 * Video Merge/Concatenate API
 *
 * Merge multiple videos into one, add transitions, and overlay content
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'
import {
  concatenateVideos,
  getVideoMetadata,
  checkFFmpegAvailability,
  addWatermark
} from '@/lib/video/ffmpeg-processor'
import { runtimeJoin, runtimeFilePath } from '@/lib/utils/runtime-path'
import fs from 'fs/promises'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-VideoMerge')

// Merge output directory
const MERGE_DIR = process.env.VIDEO_MERGE_DIR || '/tmp/video-merged'

interface VideoSource {
  projectId?: string     // Get video from project
  path?: string          // Direct path to video
  url?: string           // URL to download video from
  startTime?: number     // Optional: trim start
  endTime?: number       // Optional: trim end
  volume?: number        // Audio volume multiplier (0-2, default 1)
}

interface MergeRequest {
  action: 'concatenate' | 'overlay' | 'watermark' | 'picture-in-picture'

  // Source videos
  videos?: VideoSource[]           // For concatenate
  mainVideo?: VideoSource          // For overlay/pip
  overlayVideo?: VideoSource       // For overlay/pip

  // Output options
  outputFormat?: 'mp4' | 'webm' | 'mov'
  quality?: 'low' | 'medium' | 'high'
  resolution?: '720p' | '1080p' | '4k' | 'match-first'

  // Concatenate options
  transition?: 'none' | 'fade' | 'dissolve' | 'wipe'
  transitionDuration?: number      // Duration in seconds

  // Watermark options
  watermarkPath?: string
  watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  watermarkOpacity?: number        // 0-1
  watermarkScale?: number          // Scale factor (e.g., 0.2 = 20% of video width)

  // Picture-in-picture options
  pipPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  pipScale?: number                // Scale of PIP video (e.g., 0.25 = 25%)
  pipStartTime?: number            // When to start showing PIP
  pipDuration?: number             // How long to show PIP

  // Metadata
  outputProjectId?: string         // Save to this project
  outputName?: string
}

/**
 * POST /api/video/merge
 * Merge, concatenate, or overlay videos
 */
export async function POST(request: NextRequest) {
  try {
    const body: MergeRequest = await request.json()

    // Validate required fields
    if (!body.action) {
      return NextResponse.json(
        { success: false, error: 'Action is required (concatenate, overlay, watermark, picture-in-picture)' },
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

    // Ensure merge directory exists
    const userMergeDir = runtimeJoin(MERGE_DIR, user.id)
    await fs.mkdir(userMergeDir, { recursive: true })

    const format = body.outputFormat || 'mp4'
    const outputName = body.outputName || `merged_${Date.now()}`
    let result: any

    switch (body.action) {
      case 'concatenate': {
        // Concatenate multiple videos into one
        if (!body.videos || body.videos.length < 2) {
          return NextResponse.json(
            { success: false, error: 'At least 2 videos are required for concatenation' },
            { status: 400 }
          )
        }

        logger.info('Concatenating videos', {
          userId: user.id,
          videoCount: body.videos.length
        })

        // Resolve video paths
        const videoPaths: string[] = []
        const videoInfos: any[] = []

        for (const video of body.videos) {
          let videoPath: string | undefined

          if (video.projectId) {
            // Get from project
            const { data: project } = await supabase
              .from('video_projects')
              .select('file_path, title')
              .eq('id', video.projectId)
              .eq('user_id', user.id)
              .single()

            if (project?.file_path) {
              videoPath = project.file_path
              videoInfos.push({
                projectId: video.projectId,
                title: project.title
              })
            }
          } else if (video.path) {
            videoPath = video.path
            videoInfos.push({ path: video.path })
          }

          if (videoPath) {
            // Validate video exists and get metadata
            try {
              const metadata = await getVideoMetadata(videoPath)
              videoPaths.push(videoPath)
              videoInfos[videoInfos.length - 1].duration = metadata.duration
              videoInfos[videoInfos.length - 1].resolution = `${metadata.width}x${metadata.height}`
            } catch (err) {
              logger.warn('Could not read video', { path: videoPath })
            }
          }
        }

        if (videoPaths.length < 2) {
          return NextResponse.json(
            { success: false, error: 'Could not find at least 2 valid videos to concatenate' },
            { status: 400 }
          )
        }

        const outputPath = runtimeFilePath(userMergeDir, outputName, format)

        // Concatenate videos
        await concatenateVideos(videoPaths, outputPath, {
          format,
          transition: body.transition,
          transitionDuration: body.transitionDuration
        })

        // Get output metadata
        const outputStats = await fs.stat(outputPath)
        const outputMetadata = await getVideoMetadata(outputPath)

        // Save as new project if requested
        if (body.outputProjectId) {
          await supabase
            .from('video_projects')
            .update({
              file_path: outputPath,
              duration: outputMetadata.duration,
              file_size: outputStats.size,
              updated_at: new Date().toISOString()
            })
            .eq('id', body.outputProjectId)
            .eq('user_id', user.id)
        }

        result = {
          action: 'concatenate',
          sourceVideos: videoInfos,
          output: {
            path: outputPath,
            url: `/merged/${user.id}/${path.basename(outputPath)}`,
            size: outputStats.size,
            sizeMB: (outputStats.size / (1024 * 1024)).toFixed(2)
          },
          metadata: {
            duration: outputMetadata.duration,
            width: outputMetadata.width,
            height: outputMetadata.height,
            fps: outputMetadata.fps
          },
          options: {
            transition: body.transition || 'none',
            transitionDuration: body.transitionDuration
          }
        }

        logger.info('Videos concatenated', {
          userId: user.id,
          outputPath,
          videoCount: videoPaths.length
        })
        break
      }

      case 'watermark': {
        // Add watermark to video
        if (!body.mainVideo) {
          return NextResponse.json(
            { success: false, error: 'mainVideo is required for watermark action' },
            { status: 400 }
          )
        }

        if (!body.watermarkPath) {
          return NextResponse.json(
            { success: false, error: 'watermarkPath is required for watermark action' },
            { status: 400 }
          )
        }

        // Resolve main video path
        let mainVideoPath: string | undefined

        if (body.mainVideo.projectId) {
          const { data: project } = await supabase
            .from('video_projects')
            .select('file_path')
            .eq('id', body.mainVideo.projectId)
            .eq('user_id', user.id)
            .single()

          mainVideoPath = project?.file_path
        } else {
          mainVideoPath = body.mainVideo.path
        }

        if (!mainVideoPath) {
          return NextResponse.json(
            { success: false, error: 'Could not find main video' },
            { status: 400 }
          )
        }

        logger.info('Adding watermark', {
          userId: user.id,
          mainVideo: mainVideoPath,
          position: body.watermarkPosition
        })

        const outputPath = runtimeFilePath(userMergeDir, `${outputName}_watermarked`, format)

        // Map position string to FFmpeg position
        const positionMap: Record<string, 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'> = {
          'top-left': 'top-left',
          'top-right': 'top-right',
          'bottom-left': 'bottom-left',
          'bottom-right': 'bottom-right',
          'center': 'center'
        }

        await addWatermark(
          mainVideoPath,
          outputPath,
          body.watermarkPath,
          positionMap[body.watermarkPosition || 'bottom-right'],
          body.watermarkOpacity || 0.8
        )

        // Get output metadata
        const outputStats = await fs.stat(outputPath)
        const outputMetadata = await getVideoMetadata(outputPath)

        result = {
          action: 'watermark',
          output: {
            path: outputPath,
            url: `/merged/${user.id}/${path.basename(outputPath)}`,
            size: outputStats.size,
            sizeMB: (outputStats.size / (1024 * 1024)).toFixed(2)
          },
          metadata: {
            duration: outputMetadata.duration,
            width: outputMetadata.width,
            height: outputMetadata.height
          },
          options: {
            position: body.watermarkPosition || 'bottom-right',
            opacity: body.watermarkOpacity || 0.8
          }
        }

        logger.info('Watermark added', {
          userId: user.id,
          outputPath
        })
        break
      }

      case 'overlay':
      case 'picture-in-picture': {
        // Picture-in-picture overlay
        if (!body.mainVideo || !body.overlayVideo) {
          return NextResponse.json(
            { success: false, error: 'mainVideo and overlayVideo are required for picture-in-picture' },
            { status: 400 }
          )
        }

        // Resolve video paths
        let mainVideoPath: string | undefined
        let overlayVideoPath: string | undefined

        if (body.mainVideo.projectId) {
          const { data: project } = await supabase
            .from('video_projects')
            .select('file_path')
            .eq('id', body.mainVideo.projectId)
            .eq('user_id', user.id)
            .single()
          mainVideoPath = project?.file_path
        } else {
          mainVideoPath = body.mainVideo.path
        }

        if (body.overlayVideo.projectId) {
          const { data: project } = await supabase
            .from('video_projects')
            .select('file_path')
            .eq('id', body.overlayVideo.projectId)
            .eq('user_id', user.id)
            .single()
          overlayVideoPath = project?.file_path
        } else {
          overlayVideoPath = body.overlayVideo.path
        }

        if (!mainVideoPath || !overlayVideoPath) {
          return NextResponse.json(
            { success: false, error: 'Could not find source videos' },
            { status: 400 }
          )
        }

        logger.info('Creating picture-in-picture', {
          userId: user.id,
          mainVideo: mainVideoPath,
          overlayVideo: overlayVideoPath,
          position: body.pipPosition
        })

        // Get metadata for positioning
        const mainMetadata = await getVideoMetadata(mainVideoPath)
        const overlayMetadata = await getVideoMetadata(overlayVideoPath)

        // Calculate PIP dimensions and position
        const pipScale = body.pipScale || 0.25
        const pipWidth = Math.round(mainMetadata.width * pipScale)
        const pipHeight = Math.round(mainMetadata.height * pipScale)
        const padding = 20 // Padding from edges

        let overlayX: number
        let overlayY: number

        switch (body.pipPosition || 'bottom-right') {
          case 'top-left':
            overlayX = padding
            overlayY = padding
            break
          case 'top-right':
            overlayX = mainMetadata.width - pipWidth - padding
            overlayY = padding
            break
          case 'bottom-left':
            overlayX = padding
            overlayY = mainMetadata.height - pipHeight - padding
            break
          case 'bottom-right':
          default:
            overlayX = mainMetadata.width - pipWidth - padding
            overlayY = mainMetadata.height - pipHeight - padding
        }

        const outputPath = runtimeFilePath(userMergeDir, `${outputName}_pip`, format)

        // Use FFmpeg to create PIP effect
        const ffmpeg = (await import('fluent-ffmpeg')).default

        // Try to find FFmpeg path
        try {
          const installer = await import('@ffmpeg-installer/ffmpeg')
          ffmpeg.setFfmpegPath(installer.path)
        } catch {
          // Fall back to system FFmpeg
          const { execSync } = await import('child_process')
          try {
            const systemPath = execSync('which ffmpeg').toString().trim()
            ffmpeg.setFfmpegPath(systemPath)
          } catch {
            // Hope FFmpeg is in PATH
          }
        }

        await new Promise<void>((resolve, reject) => {
          const command = ffmpeg()
            .input(mainVideoPath!)
            .input(overlayVideoPath!)

          // Build filter complex for PIP
          const enableExpr = body.pipStartTime !== undefined
            ? `enable='between(t,${body.pipStartTime},${body.pipStartTime + (body.pipDuration || overlayMetadata.duration)})'`
            : ''

          const filterComplex = `[1:v]scale=${pipWidth}:${pipHeight}[pip];[0:v][pip]overlay=${overlayX}:${overlayY}${enableExpr ? ':' + enableExpr : ''}`

          command
            .complexFilter(filterComplex)
            .outputOptions([
              '-map 0:a?',
              '-c:v libx264',
              '-preset fast',
              '-crf 22'
            ])
            .output(outputPath)
            .on('error', reject)
            .on('end', () => resolve())
            .run()
        })

        // Get output metadata
        const outputStats = await fs.stat(outputPath)
        const outputMetadataResult = await getVideoMetadata(outputPath)

        result = {
          action: 'picture-in-picture',
          output: {
            path: outputPath,
            url: `/merged/${user.id}/${path.basename(outputPath)}`,
            size: outputStats.size,
            sizeMB: (outputStats.size / (1024 * 1024)).toFixed(2)
          },
          metadata: {
            duration: outputMetadataResult.duration,
            width: outputMetadataResult.width,
            height: outputMetadataResult.height
          },
          pip: {
            position: body.pipPosition || 'bottom-right',
            scale: pipScale,
            dimensions: `${pipWidth}x${pipHeight}`,
            startTime: body.pipStartTime,
            duration: body.pipDuration
          }
        }

        logger.info('Picture-in-picture created', {
          userId: user.id,
          outputPath
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
      ...result
    })

  } catch (error) {
    logger.error('Merge API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Video merge operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/merge
 * Get merge service info
 */
export async function GET() {
  const ffmpegAvailable = await checkFFmpegAvailability()

  return NextResponse.json({
    status: 'active',
    endpoint: '/api/video/merge',
    version: '1.0.0',
    ffmpegAvailable,
    actions: {
      concatenate: {
        description: 'Join multiple videos end-to-end',
        features: [
          'Multiple input videos',
          'Optional transitions (fade, dissolve, wipe)',
          'Automatic resolution matching'
        ]
      },
      watermark: {
        description: 'Add image watermark/logo to video',
        features: [
          'Position selection (corners or center)',
          'Opacity control',
          'Scale adjustment'
        ]
      },
      'picture-in-picture': {
        description: 'Overlay video in corner of main video',
        features: [
          'Position selection',
          'Scale control',
          'Timed appearance (start time, duration)'
        ]
      }
    },
    usage: {
      concatenate: {
        method: 'POST',
        body: {
          action: 'concatenate',
          videos: [
            { projectId: 'project-uuid-1' },
            { projectId: 'project-uuid-2' },
            { path: '/path/to/video.mp4' }
          ],
          transition: 'fade',
          transitionDuration: 0.5,
          outputFormat: 'mp4'
        }
      },
      watermark: {
        method: 'POST',
        body: {
          action: 'watermark',
          mainVideo: { projectId: 'project-uuid' },
          watermarkPath: '/path/to/logo.png',
          watermarkPosition: 'bottom-right',
          watermarkOpacity: 0.8
        }
      },
      'picture-in-picture': {
        method: 'POST',
        body: {
          action: 'picture-in-picture',
          mainVideo: { projectId: 'main-project-uuid' },
          overlayVideo: { projectId: 'overlay-project-uuid' },
          pipPosition: 'bottom-right',
          pipScale: 0.25,
          pipStartTime: 10,
          pipDuration: 30
        }
      }
    },
    options: {
      outputFormat: ['mp4', 'webm', 'mov'],
      quality: ['low', 'medium', 'high'],
      transitions: ['none', 'fade', 'dissolve', 'wipe'],
      watermarkPositions: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
      pipPositions: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    }
  })
}
