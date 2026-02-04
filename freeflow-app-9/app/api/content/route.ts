import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('content-api')

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
    logger.error('Content API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
