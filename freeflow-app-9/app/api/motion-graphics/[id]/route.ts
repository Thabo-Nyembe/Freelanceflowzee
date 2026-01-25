/**
 * Motion Graphics API - Single Resource Routes
 *
 * PUT - Update project, layer, export status
 * DELETE - Delete project, layer, animation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('motion-graphics')
import {
  updateMotionProject,
  deleteMotionProject,
  updateMotionLayer,
  deleteMotionLayer,
  deleteMotionAnimation,
  updateExportStatus
} from '@/lib/motion-graphics-queries'

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
    const { type, ...updates } = body

    switch (type) {
      case 'project': {
        const { data, error } = await updateMotionProject(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'layer': {
        const { data, error } = await updateMotionLayer(id, updates)
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
        const { error } = await deleteMotionProject(id)
        if (error) throw error
        break
      }

      case 'layer': {
        const { error } = await deleteMotionLayer(id)
        if (error) throw error
        break
      }

      case 'animation': {
        const { error } = await deleteMotionAnimation(id)
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
