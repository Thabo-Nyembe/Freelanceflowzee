import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

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

    console.log('✅ Video uploaded successfully:', videoRecord)

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      video: videoRecord
    })

  } catch (error) {
    console.error('Video upload error:', error)
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

// GET endpoint to list uploaded videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'

    // In production: fetch from database
    // const videos = await db.videos.findMany({ where: { userId } })

    // Mock data for demo
    const mockVideos = [
      {
        id: 'vid-1',
        filename: 'intro-video.mp4',
        originalName: 'My Intro Video.mp4',
        url: '/uploads/videos/intro-video.mp4',
        type: 'video/mp4',
        size: 15728640, // 15MB
        duration: 30,
        width: 1920,
        height: 1080,
        fps: 30,
        bitrate: 5000000,
        codec: 'h264',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'ready'
      },
      {
        id: 'vid-2',
        filename: 'tutorial-part1.mp4',
        originalName: 'Tutorial Part 1.mp4',
        url: '/uploads/videos/tutorial-part1.mp4',
        type: 'video/mp4',
        size: 31457280, // 30MB
        duration: 60,
        width: 1920,
        height: 1080,
        fps: 30,
        bitrate: 4500000,
        codec: 'h264',
        uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'ready'
      }
    ]

    return NextResponse.json({
      success: true,
      videos: mockVideos,
      count: mockVideos.length
    })

  } catch (error) {
    console.error('Video list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
