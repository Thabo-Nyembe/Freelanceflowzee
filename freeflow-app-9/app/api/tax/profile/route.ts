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

const logger = createFeatureLogger('tax-profile')

/**
 * GET /api/tax/profile
 * Get user's tax profile
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

    // Fetch user's tax profile
    const { data: profile, error } = await supabase
      .from('user_tax_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is OK
      logger.error('Tax profile fetch error', { error })
      return NextResponse.json({ error: 'Failed to fetch tax profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: profile || null
    })
  } catch (error) {
    logger.error('Tax profile GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tax/profile
 * Update user's tax profile
 */
export async function PUT(request: NextRequest) {
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
    if (!body.primary_country) {
      return NextResponse.json(
        { error: 'Primary country is required' },
        { status: 400 }
      )
    }

    // Check if profile exists
    const { data: existing } = await supabase
      .from('user_tax_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const profileData = {
      user_id: user.id,
      primary_country: body.primary_country,
      primary_state: body.primary_state || null,
      business_structure: body.business_structure || 'sole_proprietor',
      tax_id_number: body.tax_id_number || null,
      tax_filing_frequency: body.tax_filing_frequency || 'quarterly',
      estimated_annual_income: body.estimated_annual_income || 0,
      auto_calculate_tax: body.auto_calculate_tax !== false,
      updated_at: new Date().toISOString()
    }

    let result
    if (existing) {
      // Update existing profile
      result = await supabase
        .from('user_tax_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Create new profile
      result = await supabase
        .from('user_tax_profiles')
        .insert(profileData)
        .select()
        .single()
    }

    if (result.error) {
      logger.error('Tax profile update error', { error: result.error })
      return NextResponse.json(
        { error: 'Failed to update tax profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    logger.error('Tax profile PUT error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tax/profile
 * Create user's tax profile (alternative to PUT)
 */
export async function POST(request: NextRequest) {
  return PUT(request)
}
