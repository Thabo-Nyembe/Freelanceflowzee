/**
 * Audio Studio API Routes
 *
 * REST endpoints for Audio Studio:
 * GET - List projects, files, tracks, regions, effects, markers, recordings, exports, stats
 * POST - Create project, file, track, region, effect, marker, recording, export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('audio-studio')
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
  getAudioProjects,
  createAudioProject,
  getAudioFiles,
  createAudioFile,
  getAudioTracks,
  createAudioTrack,
  getAudioRegions,
  createAudioRegion,
  getAudioEffects,
  createAudioEffect,
  getAudioMarkers,
  createAudioMarker,
  getAudioRecordings,
  createAudioRecording,
  getAudioExports,
  createAudioExport,
  getAudioStats
} from '@/lib/audio-studio-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'projects'
    const isPublic = searchParams.get('is_public')
    const format = searchParams.get('format') as string | null
    const projectId = searchParams.get('project_id') || undefined
    const trackId = searchParams.get('track_id') || undefined
    const status = searchParams.get('status') as string | null

    switch (type) {
      case 'projects': {
        const { data, error } = await getAudioProjects(user.id, {
          is_public: isPublic ? isPublic === 'true' : undefined
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'files': {
        const { data, error } = await getAudioFiles(user.id, { format })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'tracks': {
        if (!projectId) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const { data, error } = await getAudioTracks(projectId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'regions': {
        if (!trackId) {
          return NextResponse.json({ error: 'track_id required' }, { status: 400 })
        }
        const { data, error } = await getAudioRegions(trackId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'effects': {
        if (!trackId) {
          return NextResponse.json({ error: 'track_id required' }, { status: 400 })
        }
        const { data, error } = await getAudioEffects(trackId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'markers': {
        if (!projectId) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const { data, error } = await getAudioMarkers(projectId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'recordings': {
        const { data, error } = await getAudioRecordings(user.id, {
          status,
          projectId
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'exports': {
        const { data, error } = await getAudioExports(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'stats': {
        const { data, error } = await getAudioStats(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Audio Studio data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Audio Studio data' },
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
      case 'create-project': {
        const { data, error } = await createAudioProject(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-file': {
        const { data, error } = await createAudioFile(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-track': {
        const { project_id, ...trackData } = payload
        if (!project_id) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const { data, error } = await createAudioTrack(project_id, trackData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-region': {
        const { track_id, ...regionData } = payload
        if (!track_id) {
          return NextResponse.json({ error: 'track_id required' }, { status: 400 })
        }
        const { data, error } = await createAudioRegion(track_id, regionData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-effect': {
        const { track_id, ...effectData } = payload
        if (!track_id) {
          return NextResponse.json({ error: 'track_id required' }, { status: 400 })
        }
        const { data, error } = await createAudioEffect(track_id, effectData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-marker': {
        const { project_id, ...markerData } = payload
        if (!project_id) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const { data, error } = await createAudioMarker(project_id, markerData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-recording': {
        const { data, error } = await createAudioRecording(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-export': {
        const { project_id, ...exportData } = payload
        if (!project_id) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const { data, error } = await createAudioExport(project_id, user.id, exportData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Audio Studio request', { error })
    return NextResponse.json(
      { error: 'Failed to process Audio Studio request' },
      { status: 500 }
    )
  }
}
