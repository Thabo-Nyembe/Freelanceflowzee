import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

const logger = createFeatureLogger('tax-insights')

/**
 * GET /api/tax/insights
 * Get user's tax insights
 * Optional query params:
 *   - priority: filter by priority (urgent, high, medium, low)
 *   - unread: true to get only unread insights
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const priority = searchParams.get('priority')
    const unreadOnly = searchParams.get('unread') === 'true'

    // Build query
    let query = supabase
      .from('tax_insights')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Add optional filters
    if (priority) {
      query = query.eq('priority', priority)
    }

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: insights, error } = await query

    if (error) {
      logger.error('Tax insights fetch error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch tax insights' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: insights || [],
      count: insights?.length || 0
    })
  } catch (error) {
    logger.error('Tax insights GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tax/insights
 * Create a new tax insight (typically called by system/admin)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Validate required fields
    if (!body.insight_type || !body.title || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: insight_type, title, description' },
        { status: 400 }
      )
    }

    // Create insight
    const { data: insight, error } = await supabase
      .from('tax_insights')
      .insert({
        user_id: user.id,
        insight_type: body.insight_type,
        title: body.title,
        description: body.description,
        priority: body.priority || 'medium',
        action_required: body.action_required || false,
        action_link: body.action_link || null,
        metadata: body.metadata || null
      })
      .select()
      .single()

    if (error) {
      logger.error('Tax insight creation error', { error })
      return NextResponse.json(
        { error: 'Failed to create tax insight' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: insight
    })
  } catch (error) {
    logger.error('Tax insights POST error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
