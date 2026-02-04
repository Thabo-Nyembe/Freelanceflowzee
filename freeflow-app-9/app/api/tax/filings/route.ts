import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('tax-filings')

/**
 * GET /api/tax/filings
 * Get all tax filings for the current user
 */
// Demo user ID for demo mode
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

// Check if demo mode is enabled
function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const demoMode = isDemoMode(request)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Allow demo mode access
    const effectiveUserId = user?.id || (demoMode ? DEMO_USER_ID : null)

    if (!effectiveUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    let query = supabase
      .from('tax_filings')
      .select('*')
      .eq('user_id', effectiveUserId)
      .order('due_date', { ascending: true })

    if (year) {
      query = query.eq('tax_year', parseInt(year))
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: filings, error } = await query

    if (error) {
      logger.error('Error fetching tax filings', { error })
      return NextResponse.json({ error: 'Failed to fetch filings' }, { status: 500 })
    }

    return NextResponse.json({
      data: filings,
      count: filings?.length || 0
    })
  } catch (error) {
    logger.error('Tax filings GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/tax/filings
 * Create a new tax filing
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      filing_type,
      tax_year,
      quarter,
      due_date,
      form_type,
      jurisdiction,
      estimated_amount_owed,
      notes
    } = body

    // Validate required fields
    if (!filing_type || !tax_year || !due_date) {
      return NextResponse.json(
        { error: 'Missing required fields: filing_type, tax_year, due_date' },
        { status: 400 }
      )
    }

    // Create filing
    const { data: filing, error } = await supabase
      .from('tax_filings')
      .insert({
        user_id: user.id,
        filing_type,
        tax_year,
        quarter,
        due_date,
        form_type,
        jurisdiction,
        estimated_amount_owed,
        notes,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating tax filing', { error })
      return NextResponse.json({ error: 'Failed to create filing' }, { status: 500 })
    }

    return NextResponse.json({
      data: filing,
      message: 'Filing created successfully'
    }, { status: 201 })
  } catch (error) {
    logger.error('Tax filings POST error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
