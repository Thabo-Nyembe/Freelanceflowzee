/**
 * AI Enhanced API Routes
 *
 * REST endpoints for AI Enhanced Tools:
 * GET - Tools, search, stats
 * POST - Create tools
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getAIEnhancedTools,
  createAIEnhancedTool,
  searchToolsByTags,
  getToolStatistics,
  getTopPerformingTools
} from '@/lib/ai-enhanced-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'tools'
    const toolType = searchParams.get('tool_type') as any
    const category = searchParams.get('category') as any
    const status = searchParams.get('status') as any
    const isFavorite = searchParams.get('is_favorite')
    const isPopular = searchParams.get('is_popular')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'tools': {
        const filters: any = {}
        if (toolType) filters.type = toolType
        if (category) filters.category = category
        if (status) filters.status = status
        if (isFavorite !== null) filters.is_favorite = isFavorite === 'true'
        if (isPopular !== null) filters.is_popular = isPopular === 'true'
        if (search) filters.search = search
        const result = await getAIEnhancedTools(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'search-by-tags': {
        if (!tags) {
          return NextResponse.json({ error: 'tags required' }, { status: 400 })
        }
        const tagArray = tags.split(',')
        const result = await searchToolsByTags(user.id, tagArray)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getToolStatistics(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'top-performing': {
        const result = await getTopPerformingTools(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Enhanced API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI Enhanced data' },
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
      case 'create-tool': {
        const result = await createAIEnhancedTool(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Enhanced API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI Enhanced request' },
      { status: 500 }
    )
  }
}
