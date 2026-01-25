/**
 * AR Collaboration API Routes
 *
 * REST endpoints for AR Collaboration:
 * GET - List sessions, participants, objects, interactions, recordings, stats
 * POST - Create session, participant, object, interaction, recording
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ar-collaboration')
import {
  getSessions,
  createSession,
  getParticipants,
  createParticipant,
  getARObjects,
  createARObject,
  getInteractions,
  createInteraction,
  getRecordings,
  createRecording,
  getARStats
} from '@/lib/ar-collaboration-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'sessions'
    const sessionId = searchParams.get('session_id')
    const status = searchParams.get('status') as any
    const environment = searchParams.get('environment') as any
    const participantStatus = searchParams.get('participant_status') as any
    const objectType = searchParams.get('object_type') as any
    const interactionType = searchParams.get('interaction_type') as any
    const isVisible = searchParams.get('is_visible')
    const isPublic = searchParams.get('is_public')
    const search = searchParams.get('search')

    switch (type) {
      case 'sessions': {
        const filters: any = {}
        if (status) filters.status = status
        if (environment) filters.environment = environment
        if (search) filters.search = search
        const result = await getSessions(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'participants': {
        if (!sessionId) {
          return NextResponse.json({ error: 'session_id required' }, { status: 400 })
        }
        const filters: any = {}
        if (participantStatus) filters.status = participantStatus
        const result = await getParticipants(
          sessionId,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'objects': {
        if (!sessionId) {
          return NextResponse.json({ error: 'session_id required' }, { status: 400 })
        }
        const filters: any = {}
        if (objectType) filters.type = objectType
        if (isVisible !== null) filters.is_visible = isVisible === 'true'
        const result = await getARObjects(
          sessionId,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'interactions': {
        if (!sessionId) {
          return NextResponse.json({ error: 'session_id required' }, { status: 400 })
        }
        const filters: any = {}
        if (interactionType) filters.type = interactionType
        const result = await getInteractions(
          sessionId,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'recordings': {
        const filters: any = {}
        if (sessionId) filters.session_id = sessionId
        if (isPublic !== null) filters.is_public = isPublic === 'true'
        const result = await getRecordings(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getARStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch AR Collaboration data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch AR Collaboration data' },
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
      case 'create-session': {
        const result = await createSession(user.id, {
          name: payload.name,
          description: payload.description,
          host_name: payload.host_name || user.email || 'Host',
          environment: payload.environment || 'office',
          max_participants: payload.max_participants || 10,
          scheduled_time: payload.scheduled_time,
          is_locked: payload.is_locked || false,
          password: payload.password,
          tags: payload.tags || [],
          features: payload.features || {},
          settings: payload.settings || {}
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'join-session': {
        const result = await createParticipant(
          payload.session_id,
          user.id,
          {
            name: payload.name || user.email || 'Participant',
            avatar: payload.avatar,
            device: payload.device || 'webxr',
            position_x: payload.position_x || 0,
            position_y: payload.position_y || 0,
            position_z: payload.position_z || 0
          }
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-object': {
        const result = await createARObject(
          payload.session_id,
          user.id,
          {
            type: payload.type,
            name: payload.name,
            position_x: payload.position_x || 0,
            position_y: payload.position_y || 0,
            position_z: payload.position_z || 0,
            rotation_x: payload.rotation_x || 0,
            rotation_y: payload.rotation_y || 0,
            rotation_z: payload.rotation_z || 0,
            scale_x: payload.scale_x || 1,
            scale_y: payload.scale_y || 1,
            scale_z: payload.scale_z || 1,
            color: payload.color || '#ffffff',
            model_url: payload.model_url,
            texture_url: payload.texture_url,
            data: payload.data || {}
          }
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-interaction': {
        const result = await createInteraction(
          payload.session_id,
          user.id,
          {
            object_id: payload.object_id,
            type: payload.type,
            position_x: payload.position_x,
            position_y: payload.position_y,
            position_z: payload.position_z,
            data: payload.data || {},
            duration: payload.duration
          }
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-recording': {
        const result = await createRecording(
          payload.session_id,
          user.id,
          {
            name: payload.name,
            duration: payload.duration || 0,
            file_url: payload.file_url,
            file_size: payload.file_size || 0,
            format: payload.format || 'mp4',
            quality: payload.quality || 'high',
            thumbnail_url: payload.thumbnail_url,
            is_public: payload.is_public ?? false
          }
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process AR Collaboration request', { error })
    return NextResponse.json(
      { error: 'Failed to process AR Collaboration request' },
      { status: 500 }
    )
  }
}
