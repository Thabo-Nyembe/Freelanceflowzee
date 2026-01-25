/**
 * AI Create API - Single Resource Routes
 *
 * GET - Get single asset
 * PUT - Update asset, generation status, toggle favorite
 * DELETE - Delete asset, generation, favorite, model comparison
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'
import {
  getAsset,
  updateAsset,
  deleteAsset,
  incrementDownloadCount,
  incrementViewCount,
  toggleFavorite,
  removeFavorite,
  updateGenerationStatus,
  deleteGeneration,
  deleteModelComparison
} from '@/lib/ai-create-queries'

const logger = createFeatureLogger('AICreateAPI')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'asset'

    if (type === 'asset') {
      const { data, error } = await getAsset(id)
      if (error) throw error

      if (!data) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
      }

      // Log view
      await incrementViewCount(id).catch((err) => logger.warn('Failed to increment view count', { assetId: id, error: err }))

      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('AI Create API error:', error)
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
      case 'asset': {
        if (action === 'download') {
          const { data, error } = await incrementDownloadCount(id)
          if (error) throw error
          return NextResponse.json({ data })
        } else if (action === 'view') {
          const { data, error } = await incrementViewCount(id)
          if (error) throw error
          return NextResponse.json({ data })
        } else if (action === 'toggle-favorite') {
          const { data, removed, error } = await toggleFavorite(user.id, id)
          if (error) throw error
          return NextResponse.json({ data, removed })
        } else {
          const { data, error } = await updateAsset(id, updates)
          if (error) throw error
          return NextResponse.json({ data })
        }
      }

      case 'generation': {
        const { data, error } = await updateGenerationStatus(id, updates)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Create API error:', error)
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
    const type = searchParams.get('type') || 'asset'

    switch (type) {
      case 'asset': {
        const { error } = await deleteAsset(id)
        if (error) throw error
        break
      }

      case 'generation': {
        const { error } = await deleteGeneration(id)
        if (error) throw error
        break
      }

      case 'favorite': {
        const { error } = await removeFavorite(user.id, id)
        if (error) throw error
        break
      }

      case 'model-comparison': {
        const { error } = await deleteModelComparison(id)
        if (error) throw error
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('AI Create API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
