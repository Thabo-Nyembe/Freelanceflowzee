/**
 * Voice Collaboration API - Single Resource Routes
 *
 * GET - Get single voice room
 * PUT - Update voice room, participant, recording
 * DELETE - Delete voice room
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('voice-collaboration')
import {

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
  getVoiceRoom,
  updateVoiceRoom,
  updateVoiceRoomStatus,
  deleteVoiceRoom,
  updateVoiceParticipant,
  updateParticipantStatus,
  toggleParticipantMute,
  leaveVoiceRoom,
  updateVoiceRecording,
  incrementPlayCount,
  incrementDownloadCount
} from '@/lib/voice-collaboration-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'room'

    switch (type) {
      case 'room': {
        const result = await getVoiceRoom(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Voice room not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch resource', { error })
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
      case 'room': {
        if (action === 'update-status') {
          const result = await updateVoiceRoomStatus(id, updates.status)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateVoiceRoom(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'participant': {
        if (action === 'update-status') {
          const result = await updateParticipantStatus(id, updates.status)
          return NextResponse.json({ data: result.data })
        } else if (action === 'toggle-mute') {
          const result = await toggleParticipantMute(id, updates.is_muted)
          return NextResponse.json({ data: result.data })
        } else if (action === 'leave') {
          const result = await leaveVoiceRoom(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateVoiceParticipant(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'recording': {
        if (action === 'increment-play') {
          const result = await incrementPlayCount(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'increment-download') {
          const result = await incrementDownloadCount(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateVoiceRecording(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to update resource', { error })
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
    const type = searchParams.get('type') || 'room'

    switch (type) {
      case 'room': {
        await deleteVoiceRoom(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to delete resource', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
