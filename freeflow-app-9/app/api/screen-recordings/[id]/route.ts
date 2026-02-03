import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-ScreenRecording')

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET - Get a single recording by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch recording
    const { data: recording, error } = await supabase
      .from('screen_recordings')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      )
    }

    // Check access - owner or public
    const isOwner = user && recording.user_id === user.id
    const isPublic = recording.is_public

    if (!isOwner && !isPublic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get view count
    const { count: viewCount } = await supabase
      .from('screen_recording_views')
      .select('*', { count: 'exact', head: true })
      .eq('recording_id', id)

    // Get comments count
    const { count: commentCount } = await supabase
      .from('screen_recording_comments')
      .select('*', { count: 'exact', head: true })
      .eq('recording_id', id)

    return NextResponse.json({
      success: true,
      recording: {
        id: recording.id,
        title: recording.title,
        description: recording.description,
        duration: recording.duration,
        fileSize: recording.file_size,
        mimeType: recording.mime_type,
        resolution: recording.resolution,
        recordingType: recording.recording_type,
        thumbnailUrl: recording.thumbnail_url,
        shareId: recording.share_id,
        shareUrl: recording.share_url,
        isPublic: recording.is_public,
        hasPassword: !!recording.password,
        expiresAt: recording.expires_at,
        transcriptEnabled: recording.transcript_enabled,
        transcriptStatus: recording.transcript_status,
        transcriptText: recording.transcript_text,
        createdAt: recording.created_at,
        updatedAt: recording.updated_at,
        viewCount: viewCount || 0,
        commentCount: commentCount || 0,
        isOwner
      }
    })

  } catch (error) {
    logger.error('Get recording error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { error: 'Failed to fetch recording' },
      { status: 500 }
    )
  }
}

// PATCH - Update recording metadata
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check ownership
    const { data: existing } = await supabase
      .from('screen_recordings')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Recording not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const allowedFields = ['title', 'description', 'is_public', 'password', 'expires_at', 'transcript_enabled']
    const updates: Record<string, any> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data: recording, error } = await supabase
      .from('screen_recordings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Update recording error', { error: error.message })
      return NextResponse.json(
        { error: 'Failed to update recording' },
        { status: 500 }
      )
    }

    logger.info('Recording updated', { recordingId: id, userId: user.id })

    return NextResponse.json({
      success: true,
      recording: {
        id: recording.id,
        title: recording.title,
        description: recording.description,
        isPublic: recording.is_public,
        expiresAt: recording.expires_at,
        updatedAt: recording.updated_at
      }
    })

  } catch (error) {
    logger.error('Update recording error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { error: 'Failed to update recording' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a recording
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check ownership and get file info
    const { data: recording } = await supabase
      .from('screen_recordings')
      .select('user_id, share_id, mime_type')
      .eq('id', id)
      .single()

    if (!recording || recording.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Recording not found or access denied' },
        { status: 404 }
      )
    }

    // Delete from database (will cascade to views, comments, reactions)
    const { error } = await supabase
      .from('screen_recordings')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Delete recording error', { error: error.message })
      return NextResponse.json(
        { error: 'Failed to delete recording' },
        { status: 500 }
      )
    }

    // Try to delete the file (non-blocking)
    try {
      const ext = recording.mime_type === 'video/webm' ? '.webm' :
                  recording.mime_type === 'video/mp4' ? '.mp4' : '.mov'
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'recordings', `recording-${recording.share_id}${ext}`)
      await unlink(filePath)
    } catch {
      // File might not exist, that's okay
    }

    logger.info('Recording deleted', { recordingId: id, userId: user.id })

    return NextResponse.json({
      success: true,
      message: 'Recording deleted'
    })

  } catch (error) {
    logger.error('Delete recording error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { error: 'Failed to delete recording' },
      { status: 500 }
    )
  }
}
