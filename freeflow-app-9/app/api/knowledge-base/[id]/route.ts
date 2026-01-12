/**
 * Knowledge Base API - Single Resource Routes
 *
 * GET - Get single article, video, category
 * PUT - Update article, video, category, FAQ
 * DELETE - Delete article, video, category, FAQ, bookmark
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getCategory,
  updateCategory,
  deleteCategory,
  getArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  getVideoTutorial,
  updateVideoTutorial,
  updateFAQ,
  deleteFAQ,
  deleteBookmark,
  voteForSuggestedTopic,
  logArticleView,
  logVideoView,
  getRelatedArticles
} from '@/lib/knowledge-base-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'article'

    let data

    switch (type) {
      case 'category':
        data = await getCategory(id)
        break

      case 'article':
        data = await getArticle(id)
        // Log view if article found
        if (data) {
          await logArticleView(id).catch(() => {})
        }
        break

      case 'video':
        data = await getVideoTutorial(id)
        if (data) {
          await logVideoView(id).catch(() => {})
        }
        break

      case 'related':
        const limit = parseInt(searchParams.get('limit') || '5')
        data = await getRelatedArticles(id, limit)
        return NextResponse.json({ data })

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: `${type} not found` }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Knowledge Base API error:', error)
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
      case 'category':
        await updateCategory(id, updates)
        break

      case 'article':
        if (action === 'publish') {
          await publishArticle(id)
        } else {
          await updateArticle(id, updates)
        }
        break

      case 'video':
        await updateVideoTutorial(id, updates)
        break

      case 'faq':
        await updateFAQ(id, updates)
        break

      case 'suggestion':
        if (action === 'vote') {
          await voteForSuggestedTopic(id)
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Knowledge Base API error:', error)
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
    const type = searchParams.get('type') || 'article'

    switch (type) {
      case 'category':
        await deleteCategory(id)
        break

      case 'article':
        await deleteArticle(id)
        break

      case 'faq':
        await deleteFAQ(id)
        break

      case 'bookmark':
        await deleteBookmark(id)
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Knowledge Base API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
