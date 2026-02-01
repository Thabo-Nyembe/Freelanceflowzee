/**
 * Knowledge Base API Routes
 *
 * REST endpoints for Knowledge Base:
 * GET - List categories, articles, videos, FAQs, stats
 * POST - Create category, article, video, FAQ, feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('knowledge-base')
import {
  getCategories,
  createCategory,
  getArticles,
  createArticle,
  getVideoTutorials,
  createVideoTutorial,
  getFAQs,
  createFAQ,
  getBookmarks,
  createBookmark,
  getSuggestedTopics,
  createSuggestedTopic,
  searchKnowledgeBase,
  getKnowledgeBaseStats,
  submitArticleFeedback,
  submitVideoFeedback
} from '@/lib/knowledge-base-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'articles'
    const categoryId = searchParams.get('category_id') || undefined
    const status = searchParams.get('status') as string | null
    const difficulty = searchParams.get('difficulty') as string | null
    const isFeatured = searchParams.get('is_featured')
    const isPopular = searchParams.get('is_popular')
    const tags = searchParams.get('tags')?.split(',') || undefined
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    switch (type) {
      case 'categories': {
        const parentId = searchParams.get('parent_id')
        const isVisible = searchParams.get('is_visible')
        const data = await getCategories({
          parent_id: parentId || undefined,
          is_visible: isVisible ? isVisible === 'true' : undefined,
          is_featured: isFeatured ? isFeatured === 'true' : undefined
        })
        return NextResponse.json({ data })
      }

      case 'articles': {
        const data = await getArticles({
          category_id: categoryId,
          status,
          difficulty_level: difficulty,
          is_featured: isFeatured ? isFeatured === 'true' : undefined,
          is_popular: isPopular ? isPopular === 'true' : undefined,
          tags,
          search,
          limit,
          offset
        })
        return NextResponse.json({ data })
      }

      case 'videos': {
        const data = await getVideoTutorials({
          category_id: categoryId,
          status,
          difficulty_level: difficulty,
          is_featured: isFeatured ? isFeatured === 'true' : undefined,
          tags,
          limit
        })
        return NextResponse.json({ data })
      }

      case 'faqs': {
        const data = await getFAQs({
          category_id: categoryId,
          is_featured: isFeatured ? isFeatured === 'true' : undefined,
          tags,
          limit
        })
        return NextResponse.json({ data })
      }

      case 'bookmarks': {
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const folder = searchParams.get('folder') || undefined
        const bookmarkType = searchParams.get('bookmark_type') as 'article' | 'video' | undefined
        const data = await getBookmarks({ folder, type: bookmarkType })
        return NextResponse.json({ data })
      }

      case 'suggestions': {
        const suggestionStatus = searchParams.get('suggestion_status') as string | null
        const data = await getSuggestedTopics({
          status: suggestionStatus,
          limit
        })
        return NextResponse.json({ data })
      }

      case 'search': {
        if (!search) {
          return NextResponse.json({ error: 'Search term required' }, { status: 400 })
        }
        const data = await searchKnowledgeBase(search)
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getKnowledgeBaseStats()
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch knowledge base data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base data' },
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
      case 'create-category': {
        const data = await createCategory(payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-article': {
        const data = await createArticle(payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-video': {
        const data = await createVideoTutorial(payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-faq': {
        const data = await createFAQ(payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-bookmark': {
        const data = await createBookmark(payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'suggest-topic': {
        const data = await createSuggestedTopic(payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'article-feedback': {
        await submitArticleFeedback(payload)
        return NextResponse.json({ success: true }, { status: 201 })
      }

      case 'video-feedback': {
        await submitVideoFeedback(payload)
        return NextResponse.json({ success: true }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process knowledge base request', { error })
    return NextResponse.json(
      { error: 'Failed to process knowledge base request' },
      { status: 500 }
    )
  }
}
