import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('content')

// Route configuration for optimization
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds

// Simple logging without heavy imports
const log = (level: string, message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    logger.info(`[${level}] content-api:`, message, data || '')
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    const response: Record<string, unknown> = {}

    // Fetch marketing content
    if (type === 'all' || type === 'marketing') {
      let query = supabase
        .from('marketing_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(limit)

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (!error) {
        response.marketing = data
      } else {
        // Return empty array instead of failing
        logger.warn('marketing_content fetch error:', error.message)
        response.marketing = []
      }
    }

    // Fetch business metrics
    if (type === 'all' || type === 'metrics') {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .order('display_order', { ascending: true })
        .limit(limit)

      if (!error) {
        response.metrics = data
      } else {
        logger.warn('business_metrics fetch error:', error.message)
        response.metrics = []
      }
    }

    // Fetch platform stats
    if (type === 'all' || type === 'stats') {
      const { data, error } = await supabase
        .from('platform_stats')
        .select('*')
        .limit(limit)

      if (!error) {
        response.stats = data
      } else {
        logger.warn('platform_stats fetch error:', error.message)
        response.stats = []
      }
    }

    // Always return 200 with data (even if empty)
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    logger.error('Content API critical error:', error)
    // Return empty response instead of 500 error
    return NextResponse.json(
      {
        marketing: [],
        metrics: [],
        stats: [],
        error: 'Content temporarily unavailable'
      },
      { status: 200 }
    )
  }
}
