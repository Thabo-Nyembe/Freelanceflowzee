/**
 * AI Video Generation API Routes
 *
 * REST endpoints for AI Video Generation:
 * GET - Videos, templates, analytics, history, stats, public/trending videos
 * POST - Create video, template, metadata, analytics, history
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-video')
import {
  getGeneratedVideos,
  createGeneratedVideo,
  searchVideosByTags,
  getPublicVideos,
  getVideoTemplates,
  createVideoTemplate,
  searchTemplatesByTags,
  createVideoMetadata,
  getOrCreateGenerationSettings,
  createVideoAnalytics,
  createGenerationHistory,
  getUserVideoStats,
  getTrendingVideos
} from '@/lib/ai-video-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'videos'
    const status = searchParams.get('status') as any
    const style = searchParams.get('style') as any
    const category = searchParams.get('category') as any
    const isPublic = searchParams.get('is_public')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const premium = searchParams.get('premium')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 7

    switch (type) {
      case 'videos': {
        if (tags && tags.length > 0) {
          const result = await searchVideosByTags(user.id, tags)
          return NextResponse.json({ data: result.data })
        }
        const filters: any = {}
        if (status) filters.status = status
        if (style) filters.style = style
        if (category) filters.category = category
        if (isPublic !== null) filters.is_public = isPublic === 'true'
        if (search) filters.search = search
        const result = await getGeneratedVideos(user.id, Object.keys(filters).length > 0 ? filters : undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'public-videos': {
        const result = await getPublicVideos(limit, category || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'trending': {
        const result = await getTrendingVideos(limit, days)
        return NextResponse.json({ data: result.data })
      }

      case 'templates': {
        if (tags && tags.length > 0) {
          const result = await searchTemplatesByTags(tags)
          return NextResponse.json({ data: result.data })
        }
        const filters: any = {}
        if (category) filters.category = category
        if (style) filters.style = style
        if (premium !== null) filters.premium = premium === 'true'
        const result = await getVideoTemplates(Object.keys(filters).length > 0 ? filters : undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'settings': {
        const result = await getOrCreateGenerationSettings(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getUserVideoStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Video API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch AI Video data' },
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
      case 'create-video': {
        const result = await createGeneratedVideo(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-template': {
        const result = await createVideoTemplate(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-metadata': {
        const result = await createVideoMetadata(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-analytics': {
        const result = await createVideoAnalytics(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-history': {
        const result = await createGenerationHistory(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Video API error', { error })
    return NextResponse.json(
      { error: 'Failed to process AI Video request' },
      { status: 500 }
    )
  }
}
