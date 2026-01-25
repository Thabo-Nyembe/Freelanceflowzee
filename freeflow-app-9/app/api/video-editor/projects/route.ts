/**
 * Video Editor Projects API
 *
 * Manage video editor projects (save/load/list)
 *
 * POST /api/video-editor/projects - Create new project
 * GET /api/video-editor/projects - List projects
 * PUT /api/video-editor/projects - Update project (via query param ?id=)
 * DELETE /api/video-editor/projects - Delete project (via query param ?id=)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('video-editor-projects-api')

/**
 * Create new video editor project
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      width,
      height,
      fps,
      duration,
      tracks,
      mediaPool,
      settings
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    // Create project
    const { data: project, error: createError } = await supabase
      .from('video_editor_projects')
      .insert({
        user_id: user.id,
        name,
        width: width || 1920,
        height: height || 1080,
        fps: fps || 30,
        duration: duration || 0,
        tracks: tracks || [],
        media_pool: mediaPool || [],
        settings: settings || {
          outputFormat: 'mp4',
          quality: 'high',
          resolution: '1080p',
          fps: 30,
          audioCodec: 'aac',
          audioBitrate: 192,
          videoCodec: 'h264',
          preset: 'medium',
          crf: 18
        }
      })
      .select()
      .single()

    if (createError) {
      logger.error('Create project error', { error: createError })
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        width: project.width,
        height: project.height,
        fps: project.fps,
        duration: project.duration,
        tracks: project.tracks,
        mediaPool: project.media_pool,
        settings: project.settings
      }
    }, { status: 201 })
  } catch (error) {
    logger.error('Create project error', { error })
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

/**
 * List video editor projects
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get single project by ID
    if (projectId) {
      const { data: project, error: fetchError } = await supabase
        .from('video_editor_projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        project: {
          id: project.id,
          name: project.name,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          width: project.width,
          height: project.height,
          fps: project.fps,
          duration: project.duration,
          tracks: project.tracks,
          mediaPool: project.media_pool,
          settings: project.settings
        }
      })
    }

    // Get total count
    const { count } = await supabase
      .from('video_editor_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get projects list
    const { data: projects, error: listError } = await supabase
      .from('video_editor_projects')
      .select('id, name, width, height, fps, duration, created_at, updated_at, thumbnail_url')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (listError) {
      logger.error('List projects error', { error: listError })
      return NextResponse.json(
        { error: 'Failed to list projects' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        width: p.width,
        height: p.height,
        fps: p.fps,
        duration: p.duration,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        thumbnailUrl: p.thumbnail_url
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    logger.error('List projects error', { error })
    return NextResponse.json(
      { error: 'Failed to list projects' },
      { status: 500 }
    )
  }
}

/**
 * Update video editor project
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      width,
      height,
      fps,
      duration,
      tracks,
      mediaPool,
      settings,
      thumbnailUrl
    } = body

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (name !== undefined) updates.name = name
    if (width !== undefined) updates.width = width
    if (height !== undefined) updates.height = height
    if (fps !== undefined) updates.fps = fps
    if (duration !== undefined) updates.duration = duration
    if (tracks !== undefined) updates.tracks = tracks
    if (mediaPool !== undefined) updates.media_pool = mediaPool
    if (settings !== undefined) updates.settings = settings
    if (thumbnailUrl !== undefined) updates.thumbnail_url = thumbnailUrl

    // Update project
    const { data: project, error: updateError } = await supabase
      .from('video_editor_projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Update project error', { error: updateError })
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      )
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        width: project.width,
        height: project.height,
        fps: project.fps,
        duration: project.duration,
        tracks: project.tracks,
        mediaPool: project.media_pool,
        settings: project.settings
      }
    })
  } catch (error) {
    logger.error('Update project error', { error })
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

/**
 * Delete video editor project
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Delete project
    const { error: deleteError } = await supabase
      .from('video_editor_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (deleteError) {
      logger.error('Delete project error', { error: deleteError })
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted'
    })
  } catch (error) {
    logger.error('Delete project error', { error })
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
