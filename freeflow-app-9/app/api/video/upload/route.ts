import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('API-VideoUpload')

/**
 * Video Upload API
 * Handles video file uploads and imports
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: MP4, WebM, MOV, AVI, MKV' },
        { status: 400 }
      )
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 500MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = path.extname(file.name)
    const safeFileName = `video-${timestamp}-${randomString}${fileExtension}`

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, safeFileName)

    await writeFile(filePath, buffer)

    // Get video metadata (in production, use ffprobe)
    const videoMetadata = await getVideoMetadata(filePath, file)

    // Create video record
    const videoRecord = {
      id: `vid-${timestamp}-${randomString}`,
      filename: safeFileName,
      originalName: file.name,
      url: `/uploads/videos/${safeFileName}`,
      type: file.type,
      size: file.size,
      duration: videoMetadata.duration,
      width: videoMetadata.width,
      height: videoMetadata.height,
      fps: videoMetadata.fps,
      bitrate: videoMetadata.bitrate,
      codec: videoMetadata.codec,
      uploadedAt: new Date().toISOString(),
      status: 'ready'
    }

    logger.info('Video uploaded successfully', {
      videoId: videoRecord.id,
      filename: videoRecord.filename,
      originalName: videoRecord.originalName,
      size: videoRecord.size,
      duration: videoRecord.duration,
      resolution: `${videoRecord.width}x${videoRecord.height}`,
      codec: videoRecord.codec
    })

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      video: videoRecord
    })

  } catch (error) {
    logger.error('Video upload error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}

// Helper function to get video metadata
async function getVideoMetadata(filePath: string, file: File): Promise<any> {
  // In production, use ffprobe to get real metadata:
  // const ffmpeg = require('fluent-ffmpeg')
  // return new Promise((resolve, reject) => {
  //   ffmpeg.ffprobe(filePath, (err, metadata) => {
  //     if (err) reject(err)
  //     resolve({
  //       duration: metadata.format.duration,
  //       width: metadata.streams[0].width,
  //       height: metadata.streams[0].height,
  //       fps: eval(metadata.streams[0].r_frame_rate),
  //       bitrate: metadata.format.bit_rate,
  //       codec: metadata.streams[0].codec_name
  //     })
  //   })
  // })

  // For now, return mock metadata
  return {
    duration: 30, // seconds
    width: 1920,
    height: 1080,
    fps: 30,
    bitrate: 5000000, // 5 Mbps
    codec: 'h264'
  }
}

// GET endpoint to list uploaded videos - fetches from database
export async function GET(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch videos from database
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Database error fetching videos', { error: error.message })
      // Return empty array if table doesn't exist yet
      return NextResponse.json({
        success: true,
        videos: [],
        count: 0
      })
    }

    return NextResponse.json({
      success: true,
      videos: videos || [],
      count: videos?.length || 0
    })

  } catch (error) {
    logger.error('Video list error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
