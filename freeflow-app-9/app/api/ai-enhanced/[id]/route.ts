/**
 * AI Enhanced API - Single Resource Routes
 *
 * GET - Get single tool
 * PUT - Update tool, toggle favorite, increment usage, update performance
 * DELETE - Delete tool, bulk delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-enhanced')
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
