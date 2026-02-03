import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-Share')

interface RouteContext {
  params: Promise<{ shareId: string }>
}

// GET - Get recording by share ID (public access)
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { shareId } = await context.params
    const supabase = await createClient()

    // Fetch recording by share_id
    const { data: recording, error } = await supabase
      .from('screen_recordings')
      .select(`
        id,
        title,
        description,
        duration,
        file_size,
        mime_type,
        resolution,
        recording_type,
        thumbnail_url,
        share_id,
        is_public,
        password,
        expires_at,
        transcript_text,
        created_at,
        user_id
      `)
      .eq('share_id', shareId)
      .single()

    if (error || !recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (recording.expires_at && new Date(recording.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This recording link has expired' },
        { status: 410 }
      )
    }

    // Check if password protected (don't return full data)
    const hasPassword = !!recording.password
    if (hasPassword) {
      const providedPassword = request.headers.get('X-Recording-Password')
      if (!providedPassword || providedPassword !== recording.password) {
        return NextResponse.json({
          success: true,
          requiresPassword: true,
          recording: {
            id: recording.id,
            title: recording.title,
            shareId: recording.share_id,
            hasPassword: true
          }
        })
      }
    }

    // Get viewer info for analytics
    const viewerIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // Record the view
    await supabase
      .from('screen_recording_views')
      .insert({
        recording_id: recording.id,
        viewer_id: user?.id || null,
        viewer_ip: viewerIp.substring(0, 45),
        viewer_user_agent: userAgent.substring(0, 500)
      })

    // Get view count
    const { count: viewCount } = await supabase
      .from('screen_recording_views')
      .select('*', { count: 'exact', head: true })
      .eq('recording_id', recording.id)

    // Get owner info
    const { data: owner } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', recording.user_id)
      .single()

    // Generate video URL
    const ext = recording.mime_type === 'video/webm' ? '.webm' :
                recording.mime_type === 'video/mp4' ? '.mp4' : '.mov'
    const videoUrl = `/uploads/recordings/recording-${shareId}${ext}`

    logger.info('Recording viewed', {
      recordingId: recording.id,
      shareId,
      viewerId: user?.id || 'anonymous'
    })

    return NextResponse.json({
      success: true,
      recording: {
        id: recording.id,
        title: recording.title,
        description: recording.description,
        duration: recording.duration,
        fileSize: recording.file_size,
        resolution: recording.resolution,
        recordingType: recording.recording_type,
        thumbnailUrl: recording.thumbnail_url,
        videoUrl,
        shareId: recording.share_id,
        transcript: recording.transcript_text,
        createdAt: recording.created_at,
        viewCount: viewCount || 0,
        owner: owner ? {
          name: owner.full_name,
          avatar: owner.avatar_url
        } : null
      }
    })

  } catch (error) {
    logger.error('Share view error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { error: 'Failed to load recording' },
      { status: 500 }
    )
  }
}
