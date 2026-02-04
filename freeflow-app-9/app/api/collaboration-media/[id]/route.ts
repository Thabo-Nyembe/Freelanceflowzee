/**
 * Collaboration Media API - Single Resource Routes
 *
 * GET - Get single media, media shares
 * PUT - Update media, toggle favorite, increment view/download count
 * DELETE - Delete media, unshare media
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('collaboration-media')
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
  getMediaById,
  updateMedia,
  deleteMedia,
  toggleFavorite,
  incrementViewCount,
  incrementDownloadCount,
  getMediaShares,
  unshareMedia
} from '@/lib/collaboration-media-queries'

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
    const type = searchParams.get('type') || 'media'

    switch (type) {
      case 'media': {
        const result = await getMediaById(id, user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'shares': {
        const result = await getMediaShares(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch media', { error })
    return NextResponse.json(
      { error: 'Failed to fetch media' },
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
    const { action, ...updates } = body

    switch (action) {
      case 'toggle-favorite': {
        const result = await toggleFavorite(id, user.id, updates.is_favorite)
        return NextResponse.json({ data: result.data })
      }

      case 'increment-view': {
        const result = await incrementViewCount(id)
        return NextResponse.json({ success: result.success })
      }

      case 'increment-download': {
        const result = await incrementDownloadCount(id)
        return NextResponse.json({ success: result.success })
      }

      default: {
        const result = await updateMedia(id, user.id, updates)
        return NextResponse.json({ data: result.data })
      }
    }
  } catch (error) {
    logger.error('Failed to update media', { error })
    return NextResponse.json(
      { error: 'Failed to update media' },
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
    const type = searchParams.get('type') || 'media'
    const sharedWithUserId = searchParams.get('shared_with_user_id')

    switch (type) {
      case 'media': {
        const result = await deleteMedia(id, user.id)
        return NextResponse.json({ success: result.success })
      }

      case 'share': {
        if (!sharedWithUserId) {
          return NextResponse.json({ error: 'shared_with_user_id required' }, { status: 400 })
        }
        const result = await unshareMedia(id, sharedWithUserId)
        return NextResponse.json({ success: result.success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to delete media', { error })
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}
