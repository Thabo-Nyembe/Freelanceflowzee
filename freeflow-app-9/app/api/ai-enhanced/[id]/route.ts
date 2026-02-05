/**
 * AI Enhanced API - Single Resource Routes
 *
 * GET - Get single tool
 * PUT - Update tool, toggle favorite, increment usage, update performance
 * DELETE - Delete tool, bulk delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-enhanced')
import {
  getAIEnhancedTool,
  updateAIEnhancedTool,
  deleteAIEnhancedTool,
  toggleFavorite,
  incrementUsageCount,
  updateToolPerformance,
  bulkDeleteTools
} from '@/lib/ai-enhanced-queries'

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

    const result = await getAIEnhancedTool(id)
    return NextResponse.json({ data: result.data })
  } catch (error) {
    logger.error('AI Enhanced API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
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
        const result = await toggleFavorite(id, updates.is_favorite)
        return NextResponse.json({ data: result.data })
      }

      case 'increment-usage': {
        const result = await incrementUsageCount(id)
        return NextResponse.json({ data: result.data })
      }

      case 'update-performance': {
        const result = await updateToolPerformance(id, updates)
        return NextResponse.json({ data: result.data })
      }

      default: {
        const result = await updateAIEnhancedTool(id, updates)
        return NextResponse.json({ data: result.data })
      }
    }
  } catch (error) {
    logger.error('AI Enhanced API error', { error })
    return NextResponse.json(
      { error: 'Failed to update tool' },
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
    const ids = searchParams.get('ids')

    if (ids) {
      const idArray = ids.split(',')
      await bulkDeleteTools(idArray)
      return NextResponse.json({ success: true })
    }

    await deleteAIEnhancedTool(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('AI Enhanced API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete tool' },
      { status: 500 }
    )
  }
}
