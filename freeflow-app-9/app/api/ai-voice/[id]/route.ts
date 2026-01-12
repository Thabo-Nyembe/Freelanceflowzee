/**
 * AI Voice Synthesis API - Single Resource Routes
 *
 * GET - Get single voice, synthesis, clone, project, script
 * PUT - Update voice, synthesis, clone, project, script, reorder scripts
 * DELETE - Delete voice, synthesis, clone, project, script, bulk operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getVoice,
  updateVoice,
  deleteVoice,
  bulkDeleteVoices,
  getVoiceSynthesis,
  updateVoiceSynthesis,
  deleteVoiceSynthesis,
  toggleSynthesisFavorite,
  bulkDeleteSyntheses,
  getVoiceClone,
  updateVoiceClone,
  deleteVoiceClone,
  updateCloneProgress,
  getVoiceProject,
  updateVoiceProject,
  deleteVoiceProject,
  bulkDeleteProjects,
  getVoiceScript,
  updateVoiceScript,
  deleteVoiceScript,
  reorderVoiceScripts
} from '@/lib/ai-voice-queries'

export async function GET(
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
    const type = searchParams.get('type') || 'voice'

    switch (type) {
      case 'voice': {
        const result = await getVoice(id)
        return NextResponse.json({ data: result.data })
      }

      case 'synthesis': {
        const result = await getVoiceSynthesis(id)
        return NextResponse.json({ data: result.data })
      }

      case 'clone': {
        const result = await getVoiceClone(id)
        return NextResponse.json({ data: result.data })
      }

      case 'project': {
        const result = await getVoiceProject(id)
        return NextResponse.json({ data: result.data })
      }

      case 'script': {
        const result = await getVoiceScript(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Voice API error:', error)
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
      case 'voice': {
        const result = await updateVoice(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'synthesis': {
        if (action === 'toggle-favorite') {
          const result = await toggleSynthesisFavorite(id, updates.is_favorite)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateVoiceSynthesis(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'clone': {
        if (action === 'update-progress') {
          const result = await updateCloneProgress(id, updates.progress, updates.status)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateVoiceClone(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'project': {
        const result = await updateVoiceProject(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'script': {
        if (action === 'reorder') {
          const result = await reorderVoiceScripts(id, updates.script_orders)
          return NextResponse.json({ success: !result.error, error: result.error })
        } else {
          const result = await updateVoiceScript(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Voice API error:', error)
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
    const type = searchParams.get('type') || 'voice'
    const ids = searchParams.get('ids')

    switch (type) {
      case 'voice': {
        await deleteVoice(id)
        return NextResponse.json({ success: true })
      }

      case 'voices-bulk': {
        if (!ids) {
          return NextResponse.json({ error: 'ids required for bulk delete' }, { status: 400 })
        }
        const idArray = ids.split(',')
        await bulkDeleteVoices(idArray)
        return NextResponse.json({ success: true })
      }

      case 'synthesis': {
        await deleteVoiceSynthesis(id)
        return NextResponse.json({ success: true })
      }

      case 'syntheses-bulk': {
        if (!ids) {
          return NextResponse.json({ error: 'ids required for bulk delete' }, { status: 400 })
        }
        const idArray = ids.split(',')
        await bulkDeleteSyntheses(idArray)
        return NextResponse.json({ success: true })
      }

      case 'clone': {
        await deleteVoiceClone(id)
        return NextResponse.json({ success: true })
      }

      case 'project': {
        await deleteVoiceProject(id)
        return NextResponse.json({ success: true })
      }

      case 'projects-bulk': {
        if (!ids) {
          return NextResponse.json({ error: 'ids required for bulk delete' }, { status: 400 })
        }
        const idArray = ids.split(',')
        await bulkDeleteProjects(idArray)
        return NextResponse.json({ success: true })
      }

      case 'script': {
        await deleteVoiceScript(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Voice API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
