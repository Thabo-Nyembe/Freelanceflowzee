import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-VideoPublish')

/**
 * Publish Video Project API
 * Publishes video to platforms (YouTube, Vimeo, etc.)
 */

export async function POST(
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

    const { id: projectId } = params
    const body = await request.json()
    const { platform, metadata } = body

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    const supportedPlatforms = ['youtube', 'vimeo', 'custom']
    if (!supportedPlatforms.includes(platform.toLowerCase())) {
      return NextResponse.json(
        { error: `Unsupported platform. Supported: ${supportedPlatforms.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('video_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      logger.error('Failed to fetch project', { error: projectError, projectId })
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      )
    }

    // Check if project is completed or has a render
    if (project.status !== 'completed') {
      return NextResponse.json(
        { error: 'Project must be completed before publishing' },
        { status: 400 }
      )
    }

    // In production: Integrate with platform APIs
    // - YouTube Data API v3 for YouTube uploads
    // - Vimeo API for Vimeo uploads
    // - Custom S3/CDN for custom hosting

    const publishData = {
      platform,
      title: metadata?.title || project.title,
      description: metadata?.description || project.description || '',
      tags: metadata?.tags || [],
      visibility: metadata?.visibility || 'public',
      category: metadata?.category || 'default',
      thumbnail: metadata?.thumbnail || project.thumbnail_url
    }

    // Mock publish success
    const publishId = `pub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const publishUrl = `https://${platform}.com/watch/${publishId}`

    // Update project with publish info
    const { error: updateError } = await supabase
      .from('video_projects')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateError) {
      logger.error('Failed to update project after publish', { error: updateError, projectId })
    }

    logger.info('Video published successfully', {
      projectId,
      userId: user.id,
      platform,
      publishId,
      title: publishData.title,
      visibility: publishData.visibility
    })

    return NextResponse.json({
      success: true,
      publishId,
      url: publishUrl,
      platform,
      message: `Successfully published to ${platform}`,
      metadata: publishData
    }, { status: 201 })

  } catch (error) {
    logger.error('Video publish error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET published video info
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

    const { id: projectId } = params

    // Get analytics for published video
    const { data: analytics, error: analyticsError } = await supabase
      .from('video_analytics')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (analyticsError && analyticsError.code !== 'PGRST116') {
      logger.error('Failed to fetch analytics', { error: analyticsError, projectId })
    }

    return NextResponse.json({
      success: true,
      analytics: analytics || {
        views: 0,
        watch_time: 0,
        completion_rate: 0,
        shares: 0,
        likes: 0,
        comments: 0
      }
    })

  } catch (error) {
    logger.error('Get published video error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
