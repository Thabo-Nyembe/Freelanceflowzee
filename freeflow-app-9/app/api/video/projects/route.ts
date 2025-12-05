import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-VideoProjects')

/**
 * Video Projects API
 * CRUD operations for video projects
 */

// GET all video projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: projects, error } = await supabase
      .from('video_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch video projects', { error, userId: user.id })
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    logger.info('Video projects fetched', { userId: user.id, count: projects?.length || 0 })

    return NextResponse.json({
      success: true,
      projects: projects || [],
      count: projects?.length || 0
    })

  } catch (error) {
    logger.error('Video projects API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create a new video project
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, resolution, fps, template } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const { data: project, error } = await supabase
      .from('video_projects')
      .insert({
        user_id: user.id,
        title,
        description: description || '',
        status: 'draft',
        resolution: resolution || '1920x1080',
        fps: fps || 30,
        duration: 0,
        template: template || null
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create video project', { error, userId: user.id, title })
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    logger.info('Video project created', {
      projectId: project.id,
      userId: user.id,
      title: project.title
    })

    return NextResponse.json({
      success: true,
      project
    }, { status: 201 })

  } catch (error) {
    logger.error('Video project creation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
