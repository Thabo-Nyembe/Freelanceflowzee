/**
 * Audio Studio API - Single Resource Routes
 *
 * PUT - Update project, track, region, effect, recording status, export status
 * DELETE - Delete project, file, track, region, effect, marker, recording
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('audio-studio')
import {
  updateAudioProject,
  deleteAudioProject,
  deleteAudioFile,
  updateAudioTrack,
  deleteAudioTrack,
  toggleTrackMute,
  toggleTrackSolo,
  updateAudioRegion,
  deleteAudioRegion,
  updateAudioEffect,
  deleteAudioEffect,
  toggleEffect,
  deleteAudioMarker,
  updateRecordingStatus,
  deleteAudioRecording,
  updateExportStatus
} from '@/lib/audio-studio-queries'

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
      case 'project': {
        const { data, error } = await updateAudioProject(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'track': {
        if (action === 'toggle-mute') {
          const { data, error } = await toggleTrackMute(id, updates.is_muted)
          if (error) throw error
          return NextResponse.json({ data })
        } else if (action === 'toggle-solo') {
          const { data, error } = await toggleTrackSolo(id, updates.is_solo)
          if (error) throw error
          return NextResponse.json({ data })
        } else {
          const { data, error } = await updateAudioTrack(id, updates)
          if (error) throw error
          return NextResponse.json({ data })
        }
      }

      case 'region': {
        const { data, error } = await updateAudioRegion(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'effect': {
        if (action === 'toggle') {
          const { data, error } = await toggleEffect(id, updates.is_enabled)
          if (error) throw error
          return NextResponse.json({ data })
        } else {
          const { data, error } = await updateAudioEffect(id, updates)
          if (error) throw error
          return NextResponse.json({ data })
        }
      }

      case 'recording': {
        const { data, error } = await updateRecordingStatus(id, updates.status, updates.url)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'export': {
        const { data, error } = await updateExportStatus(id, updates.status, updates.file_url, updates.error_message)
        if (error) throw error
        return NextResponse.json({ data })
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
    const type = searchParams.get('type') || 'project'

    switch (type) {
      case 'project': {
        const { error } = await deleteAudioProject(id)
        if (error) throw error
        break
      }

      case 'file': {
        const { error } = await deleteAudioFile(id)
        if (error) throw error
        break
      }

      case 'track': {
        const { error } = await deleteAudioTrack(id)
        if (error) throw error
        break
      }

      case 'region': {
        const { error } = await deleteAudioRegion(id)
        if (error) throw error
        break
      }

      case 'effect': {
        const { error } = await deleteAudioEffect(id)
        if (error) throw error
        break
      }

      case 'marker': {
        const { error } = await deleteAudioMarker(id)
        if (error) throw error
        break
      }

      case 'recording': {
        const { error } = await deleteAudioRecording(id)
        if (error) throw error
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete resource', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
