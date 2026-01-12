/**
 * AR Collaboration API - Single Resource Routes
 *
 * GET - Get single session
 * PUT - Update session, participant, object, recording
 * DELETE - Delete session, object
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getSession,
  updateSession,
  updateSessionStatus,
  deleteSession,
  updateParticipantStatus,
  updateParticipantPosition,
  toggleParticipantMute,
  toggleParticipantVideo,
  updateARObject,
  updateARObjectTransform,
  toggleARObjectVisibility,
  toggleARObjectLock,
  deleteARObject,
  updateRecording,
  incrementRecordingViews
} from '@/lib/ar-collaboration-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'session'

    switch (type) {
      case 'session': {
        const result = await getSession(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AR Collaboration API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'session': {
        if (action === 'update-status') {
          const result = await updateSessionStatus(id, updates.status)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateSession(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'participant': {
        if (action === 'update-status') {
          const result = await updateParticipantStatus(id, updates.status)
          return NextResponse.json({ data: result.data })
        } else if (action === 'update-position') {
          const result = await updateParticipantPosition(id, {
            position_x: updates.position_x,
            position_y: updates.position_y,
            position_z: updates.position_z,
            rotation_x: updates.rotation_x,
            rotation_y: updates.rotation_y,
            rotation_z: updates.rotation_z
          })
          return NextResponse.json({ data: result.data })
        } else if (action === 'toggle-mute') {
          const result = await toggleParticipantMute(id, updates.is_muted)
          return NextResponse.json({ data: result.data })
        } else if (action === 'toggle-video') {
          const result = await toggleParticipantVideo(id, updates.is_video_enabled)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for participant' }, { status: 400 })
      }

      case 'object': {
        if (action === 'update-transform') {
          const result = await updateARObjectTransform(id, {
            position: updates.position,
            rotation: updates.rotation,
            scale: updates.scale
          })
          return NextResponse.json({ data: result.data })
        } else if (action === 'toggle-visibility') {
          const result = await toggleARObjectVisibility(id, updates.is_visible)
          return NextResponse.json({ data: result.data })
        } else if (action === 'toggle-lock') {
          const result = await toggleARObjectLock(id, updates.is_locked)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateARObject(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'recording': {
        if (action === 'increment-views') {
          const result = await incrementRecordingViews(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateRecording(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AR Collaboration API error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'session'

    switch (type) {
      case 'session': {
        await deleteSession(id)
        return NextResponse.json({ success: true })
      }

      case 'object': {
        await deleteARObject(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AR Collaboration API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
