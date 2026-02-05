/**
 * Collaboration Media API Routes
 *
 * REST endpoints for Collaboration Media:
 * GET - Media files, shared media, stats
 * POST - Create media, share media
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('collaboration-media')
import {
  getMedia,
  createMedia,
  getSharedMedia,
  shareMedia,
  getMediaStats
} from '@/lib/collaboration-media-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'media'
    const mediaType = searchParams.get('media_type') as string | null
    const isFavorite = searchParams.get('is_favorite')
    const tags = searchParams.get('tags')
    const search = searchParams.get('search')

    switch (type) {
      case 'media': {
        const filters: any = {}
        if (mediaType) filters.media_type = mediaType
        if (isFavorite !== null) filters.is_favorite = isFavorite === 'true'
        if (tags) filters.tags = tags.split(',')
        if (search) filters.search = search
        const result = await getMedia(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'shared': {
        const result = await getSharedMedia(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getMediaStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Collaboration Media data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Collaboration Media data' },
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
      case 'create-media': {
        const result = await createMedia(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'share-media': {
        const result = await shareMedia(payload.media_id, payload.shared_with_user_id, user.id)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Collaboration Media request', { error })
    return NextResponse.json(
      { error: 'Failed to process Collaboration Media request' },
      { status: 500 }
    )
  }
}
