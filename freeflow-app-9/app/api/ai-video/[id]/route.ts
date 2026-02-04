/**
 * AI Video Generation API - Single Resource Routes
 *
 * GET - Get single video, template, metadata, analytics, history
 * PUT - Update video, template, metadata, settings, analytics, progress, increment views/likes
 * DELETE - Delete video, bulk delete videos
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('ai-video')
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
  getGeneratedVideo,
  updateGeneratedVideo,
  deleteGeneratedVideo,
  updateVideoProgress,
  incrementVideoViews,
  incrementVideoLikes,
  bulkDeleteVideos,
  getVideoTemplate,
  updateVideoTemplate,
  incrementTemplateUsage,
  getVideoMetadata,
  updateVideoMetadata,
  getVideoAnalytics,
  updateVideoAnalytics,
  getVideoAnalyticsSummary,
  getGenerationHistory,
  getLatestGenerationStatus,
  updateGenerationSettings
} from '@/lib/ai-video-queries'

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
    const type = searchParams.get('type') || 'video'
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30

    switch (type) {
      case 'video': {
        const result = await getGeneratedVideo(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      case 'template': {
        const result = await getVideoTemplate(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      case 'metadata': {
        const result = await getVideoMetadata(id)
        return NextResponse.json({ data: result.data })
      }

      case 'analytics': {
        const result = await getVideoAnalytics(id, days)
        return NextResponse.json({ data: result.data })
      }

      case 'analytics-summary': {
        const result = await getVideoAnalyticsSummary(id)
        return NextResponse.json({ data: result.data })
      }

      case 'history': {
        const result = await getGenerationHistory(id)
        return NextResponse.json({ data: result.data })
      }

      case 'latest-status': {
        const result = await getLatestGenerationStatus(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Video API error', { error })
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
      case 'video': {
        if (action === 'update-progress') {
          const result = await updateVideoProgress(id, updates.status, updates.progress)
          return NextResponse.json({ data: result.data })
        } else if (action === 'increment-views') {
          const result = await incrementVideoViews(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'increment-likes') {
          const result = await incrementVideoLikes(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateGeneratedVideo(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'template': {
        if (action === 'increment-usage') {
          const result = await incrementTemplateUsage(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateVideoTemplate(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'metadata': {
        const result = await updateVideoMetadata(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'settings': {
        const result = await updateGenerationSettings(user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'analytics': {
        const result = await updateVideoAnalytics(id, updates.date, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Video API error', { error })
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
    const type = searchParams.get('type') || 'video'
    const ids = searchParams.get('ids')?.split(',').filter(Boolean)

    switch (type) {
      case 'video': {
        await deleteGeneratedVideo(id)
        return NextResponse.json({ success: true })
      }

      case 'bulk-videos': {
        if (ids && ids.length > 0) {
          await bulkDeleteVideos(ids)
          return NextResponse.json({ success: true })
        }
        return NextResponse.json({ error: 'ids required for bulk delete' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Video API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
