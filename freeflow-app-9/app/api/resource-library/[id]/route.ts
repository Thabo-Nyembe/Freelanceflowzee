/**
 * Resource Library API - Single Resource Routes
 *
 * GET - Get single resource, category, collection
 * PUT - Update resource, collection, comment
 * DELETE - Delete resource, collection, comment, bookmark, remove from collection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('resource-library')
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
  getResourceById,
  getResourceBySlug,
  updateResource,
  deleteResource,
  getCategoryById,
  updateComment,
  deleteComment,
  removeBookmark,
  removeResourceFromCollection,
  getResourceDownloadStats
} from '@/lib/resource-library-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'resource'
    const bySlug = searchParams.get('by_slug') === 'true'

    switch (type) {
      case 'resource': {
        const data = bySlug ? await getResourceBySlug(id) : await getResourceById(id)
        if (!data) {
          return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'category': {
        const data = await getCategoryById(id)
        if (!data) {
          return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'download-stats': {
        const data = await getResourceDownloadStats(id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Resource Library API error', { error })
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
    const { type, ...updates } = body

    switch (type) {
      case 'resource': {
        const data = await updateResource(id, updates)
        return NextResponse.json({ data })
      }

      case 'comment': {
        const data = await updateComment(id, updates.content)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Resource Library API error', { error })
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
    const type = searchParams.get('type') || 'resource'
    const collectionId = searchParams.get('collection_id')

    switch (type) {
      case 'resource': {
        await deleteResource(id)
        return NextResponse.json({ success: true })
      }

      case 'comment': {
        await deleteComment(id)
        return NextResponse.json({ success: true })
      }

      case 'bookmark': {
        // id here is resource_id
        await removeBookmark(id, user.id)
        return NextResponse.json({ success: true })
      }

      case 'collection-item': {
        if (!collectionId) {
          return NextResponse.json({ error: 'collection_id required' }, { status: 400 })
        }
        // id here is resource_id
        await removeResourceFromCollection(collectionId, id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Resource Library API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
