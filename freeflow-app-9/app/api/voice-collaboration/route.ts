/**
 * Voice Collaboration API Routes
 *
 * REST endpoints for Voice Collaboration:
 * GET - List voice rooms, participants, recordings, stats
 * POST - Create voice room, participant, recording
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('voice-collaboration')

// ============================================================================
// DEMO MODE CONFIGURATION
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
  getVoiceRooms,
  createVoiceRoom,
  getVoiceParticipants,
  createVoiceParticipant,
  getVoiceRecordings,
  createVoiceRecording,
  getVoiceStats
} from '@/lib/voice-collaboration-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'rooms'
    const roomId = searchParams.get('room_id')
    const status = searchParams.get('status') as string | null
    const roomType = searchParams.get('room_type') as string | null
    const participantStatus = searchParams.get('participant_status') as string | null
    const isPublic = searchParams.get('is_public')

    switch (type) {
      case 'rooms': {
        const filters: any = {}
        if (status) filters.status = status
        if (roomType) filters.type = roomType
        const result = await getVoiceRooms(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'participants': {
        if (!roomId) {
          return NextResponse.json({ error: 'room_id required' }, { status: 400 })
        }
        const filters: any = {}
        if (participantStatus) filters.status = participantStatus
        const result = await getVoiceParticipants(
          roomId,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'recordings': {
        const filters: any = {}
        if (roomId) filters.room_id = roomId
        if (isPublic !== null) filters.is_public = isPublic === 'true'
        const result = await getVoiceRecordings(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getVoiceStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Voice Collaboration data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Voice Collaboration data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-room': {
        const result = await createVoiceRoom(user.id, {
          name: payload.name,
          description: payload.description,
          type: payload.type || 'public',
          status: payload.status || 'active',
          capacity: payload.capacity || 50,
          quality: payload.quality || 'high',
          is_locked: payload.is_locked || false,
          scheduled_time: payload.scheduled_time,
          recording_enabled: payload.recording_enabled ?? true,
          transcription_enabled: payload.transcription_enabled ?? false,
          spatial_audio_enabled: payload.spatial_audio_enabled ?? false,
          noise_cancellation_enabled: payload.noise_cancellation_enabled ?? true,
          echo_cancellation_enabled: payload.echo_cancellation_enabled ?? true,
          auto_gain_control_enabled: payload.auto_gain_control_enabled ?? true,
          category: payload.category,
          tags: payload.tags || []
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'join-room': {
        const result = await createVoiceParticipant(
          payload.room_id,
          user.id,
          {
            role: payload.role || 'listener',
            status: 'listening',
            is_muted: payload.is_muted ?? true,
            is_video_enabled: payload.is_video_enabled ?? false,
            device_type: payload.device_type,
            browser: payload.browser
          }
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-recording': {
        const result = await createVoiceRecording(
          payload.room_id,
          user.id,
          {
            title: payload.title,
            description: payload.description,
            file_path: payload.file_path,
            file_size_bytes: payload.file_size_bytes || 0,
            duration_seconds: payload.duration_seconds || 0,
            format: payload.format || 'mp3',
            quality: payload.quality || 'high',
            sample_rate: payload.sample_rate || 44100,
            bitrate: payload.bitrate || 128,
            channels: payload.channels || 2,
            status: payload.status || 'processing',
            is_public: payload.is_public ?? false
          }
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Voice Collaboration request', { error })
    return NextResponse.json(
      { error: 'Failed to process Voice Collaboration request' },
      { status: 500 }
    )
  }
}
