import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-VideoProject')

/**
 * Video Project API - Single Project Operations
 * GET, PATCH, DELETE operations for a specific project
 */

// GET a specific video project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    const { data: project, error } = await supabase
      .from('video_projects')
      .select(`
        *,
        video_assets(*),
        timeline_clips(*, video_assets(*)),
        render_jobs(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      logger.error('Failed to fetch video project', { error, projectId: id })
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      project
    })

  } catch (error) {
    logger.error('Video project fetch error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update a video project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()

    // Only allow certain fields to be updated
    const allowedFields = [
      'title',
      'description',
      'status',
      'thumbnail_url',
      'duration',
      'resolution',
      'fps',
      'last_saved'
    ]

    const updates: Record<string, any> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updates.updated_at = new Date().toISOString()

    const { data: project, error } = await supabase
      .from('video_projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      logger.error('Failed to update video project', { error, projectId: id, updates })
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      )
    }

    logger.info('Video project updated', {
      projectId: project.id,
      userId: user.id,
      updatedFields: Object.keys(updates)
    })

    return NextResponse.json({
      success: true,
      project
    })

  } catch (error) {
    logger.error('Video project update error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE a video project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Delete related data first (cascade delete)
    await supabase.from('video_assets').delete().eq('project_id', id)
    await supabase.from('timeline_clips').delete().eq('project_id', id)
    await supabase.from('render_jobs').delete().eq('project_id', id)
    await supabase.from('video_shares').delete().eq('project_id', id)
    await supabase.from('video_analytics').delete().eq('project_id', id)

    const { error } = await supabase
      .from('video_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete video project', { error, projectId: id })
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      )
    }

    logger.info('Video project deleted', { projectId: id, userId: user.id })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })

  } catch (error) {
    logger.error('Video project deletion error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
