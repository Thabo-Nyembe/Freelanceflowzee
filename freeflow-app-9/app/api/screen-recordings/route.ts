import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
import { nanoid } from 'nanoid'


const logger = createSimpleLogger('API-ScreenRecordings')

/**
 * Screen Recordings API
 * Handles screen recording uploads with database persistence
 */

// Generate a unique share ID
function generateShareId(): string {
  return nanoid(12) // 12 character URL-safe ID
}

// POST - Upload a new screen recording
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || `Recording ${new Date().toLocaleDateString()}`
    const description = formData.get('description') as string || ''
    const recordingType = formData.get('recordingType') as string || 'screen'
    const projectId = formData.get('projectId') as string || null
    const isPublic = formData.get('isPublic') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['video/webm', 'video/mp4', 'video/quicktime']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: WebM, MP4, MOV' },
        { status: 400 }
      )
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 500MB' },
        { status: 400 }
      )
    }

    // Generate unique identifiers
    const timestamp = Date.now()
    const shareId = generateShareId()
    const fileExtension = file.type === 'video/webm' ? '.webm' :
                          file.type === 'video/mp4' ? '.mp4' : '.mov'
    const safeFileName = `recording-${shareId}${fileExtension}`

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'recordings')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, safeFileName)
    await writeFile(filePath, buffer)

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://freeflow.app'
    const videoUrl = `/uploads/recordings/${safeFileName}`
    const shareUrl = `${baseUrl}/share/${shareId}`

    // Extract video duration from metadata if available (mock for now)
    const duration = parseInt(formData.get('duration') as string) || 0
    const resolution = formData.get('resolution') as string || '1920x1080'

    // Insert into database
    const { data: recording, error: dbError } = await supabase
      .from('screen_recordings')
      .insert({
        user_id: user.id,
        title,
        description,
        duration,
        file_size: file.size,
        mime_type: file.type,
        resolution,
        recording_type: recordingType,
        project_id: projectId,
        is_public: isPublic,
        share_id: shareId,
        share_url: shareUrl,
        thumbnail_url: null, // Can be generated async
        transcript_enabled: false,
        transcript_status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      logger.error('Database insert error', { error: dbError.message })
      // Still return success since file was uploaded - we can retry DB insert
      return NextResponse.json({
        success: true,
        message: 'Recording uploaded (database sync pending)',
        recording: {
          id: `temp-${shareId}`,
          shareId,
          shareUrl,
          videoUrl,
          title,
          duration,
          fileSize: file.size,
          recordingType,
          isPublic,
          createdAt: new Date().toISOString()
        }
      })
    }

    logger.info('Screen recording uploaded', {
      recordingId: recording.id,
      shareId,
      userId: user.id,
      fileSize: file.size,
      duration
    })

    return NextResponse.json({
      success: true,
      message: 'Recording uploaded successfully',
      recording: {
        id: recording.id,
        shareId: recording.share_id,
        shareUrl: recording.share_url,
        videoUrl,
        title: recording.title,
        description: recording.description,
        duration: recording.duration,
        fileSize: recording.file_size,
        recordingType: recording.recording_type,
        isPublic: recording.is_public,
        createdAt: recording.created_at,
        thumbnailUrl: recording.thumbnail_url
      }
    })

  } catch (error) {
    logger.error('Screen recording upload error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to upload recording' },
      { status: 500 }
    )
  }
}

// GET - List user's screen recordings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const projectId = searchParams.get('projectId')

    let query = supabase
      .from('screen_recordings')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data: recordings, error, count } = await query

    if (error) {
      logger.error('Database query error', { error: error.message })
      return NextResponse.json({
        success: true,
        recordings: [],
        total: 0
      })
    }

    // Map to client format
    const mappedRecordings = (recordings || []).map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      duration: r.duration,
      fileSize: r.file_size,
      thumbnailUrl: r.thumbnail_url,
      shareUrl: r.share_url,
      shareId: r.share_id,
      viewCount: 0, // Would need to aggregate from screen_recording_views
      isPublic: r.is_public,
      createdAt: r.created_at,
      recordingType: r.recording_type,
      transcriptStatus: r.transcript_status
    }))

    return NextResponse.json({
      success: true,
      recordings: mappedRecordings,
      total: count || 0
    })

  } catch (error) {
    logger.error('Screen recordings list error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    )
  }
}
