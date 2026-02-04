/**
 * AI Create API Routes
 *
 * REST endpoints for AI Create:
 * GET - List assets, generations, preferences, favorites, stats
 * POST - Create asset, generation, preferences, add favorite, compare models
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('ai-create')
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
  getAssets,
  createAsset,
  getFavorites,
  addFavorite,
  getGenerations,
  createGeneration,
  getPreferences,
  upsertPreferences,
  addRecentPrompt,
  getAssetStats,
  getGenerationStats,
  saveModelComparison,
  getModelComparisons
} from '@/lib/ai-create-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'assets'
    const creativeField = searchParams.get('creative_field') as string | null
    const assetType = searchParams.get('asset_type') as string | null
    const isFavorite = searchParams.get('is_favorite')
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') as string | null
    const limit = parseInt(searchParams.get('limit') || '20')

    switch (type) {
      case 'assets': {
        const { data, error } = await getAssets(user.id, {
          creative_field: creativeField,
          asset_type: assetType,
          is_favorite: isFavorite ? isFavorite === 'true' : undefined,
          search
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'favorites': {
        const { data, error } = await getFavorites(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'generations': {
        const { data, error } = await getGenerations(user.id, {
          status,
          creative_field: creativeField
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'preferences': {
        const { data, error } = await getPreferences(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'asset-stats': {
        const { data, error } = await getAssetStats(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'generation-stats': {
        const { data, error } = await getGenerationStats(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'model-comparisons': {
        const { data, error } = await getModelComparisons(user.id, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Create API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch AI Create data' },
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
      case 'create-asset': {
        const { data, error } = await createAsset(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-generation': {
        const { data, error } = await createGeneration(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'add-favorite': {
        const { asset_id } = payload
        if (!asset_id) {
          return NextResponse.json({ error: 'asset_id required' }, { status: 400 })
        }
        const { data, error } = await addFavorite(user.id, asset_id)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'upsert-preferences': {
        const { data, error } = await upsertPreferences(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'add-recent-prompt': {
        const { prompt } = payload
        if (!prompt) {
          return NextResponse.json({ error: 'prompt required' }, { status: 400 })
        }
        const { data, error } = await addRecentPrompt(user.id, prompt)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'save-model-comparison': {
        const { data, error } = await saveModelComparison(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Create API error', { error })
    return NextResponse.json(
      { error: 'Failed to process AI Create request' },
      { status: 500 }
    )
  }
}
