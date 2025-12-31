import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: Request) {
  try {
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
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
