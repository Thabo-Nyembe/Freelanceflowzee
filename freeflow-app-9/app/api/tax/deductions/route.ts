import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('tax-deductions')

/**
 * GET /api/tax/deductions
 * Get user's tax deductions
 * Optional query params:
 *   - year: tax year (defaults to current year)
 *   - category: filter by category
 *   - status: pending, approved, rejected
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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('tax_deductions')
      .select('*')
      .eq('user_id', user.id)
      .eq('tax_year', year)
      .order('expense_date', { ascending: false })

    // Add optional filters
    if (category) {
      query = query.eq('category', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: deductions, error } = await query

    if (error) {
      logger.error('Tax deductions fetch error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch tax deductions' },
        { status: 500 }
      )
    }

    // Calculate totals
    const total = deductions?.reduce((sum, d) => sum + parseFloat(d.deductible_amount.toString()), 0) || 0
    const approved = deductions?.filter(d => d.is_approved)
      .reduce((sum, d) => sum + parseFloat(d.deductible_amount.toString()), 0) || 0

    return NextResponse.json({
      success: true,
      data: deductions || [],
      summary: {
        count: deductions?.length || 0,
        total_deductions: total,
        approved_deductions: approved,
        pending_deductions: total - approved
      }
    })
  } catch (error) {
    logger.error('Tax deductions GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tax/deductions
 * Create a new tax deduction
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
    if (!body.category || !body.description || !body.expense_amount || !body.expense_date) {
      return NextResponse.json(
        { error: 'Missing required fields: category, description, expense_amount, expense_date' },
        { status: 400 }
      )
    }

    // Calculate deductible amount
    const deductionPercentage = body.deduction_percentage || 100
    const deductibleAmount = (parseFloat(body.expense_amount) * deductionPercentage) / 100

    // Determine tax year from expense date
    const expenseDate = new Date(body.expense_date)
    const taxYear = expenseDate.getFullYear()

    // Create deduction
    const { data: deduction, error } = await supabase
      .from('tax_deductions')
      .insert({
        user_id: user.id,
        expense_id: body.expense_id || null,
        category: body.category,
        subcategory: body.subcategory || null,
        description: body.description,
        expense_amount: body.expense_amount,
        deduction_percentage: deductionPercentage,
        deductible_amount: deductibleAmount,
        expense_date: body.expense_date,
        tax_year: taxYear,
        ai_suggested: body.ai_suggested || false,
        ai_confidence: body.ai_confidence || null,
        status: body.status || 'pending',
        is_approved: body.is_approved || false,
        notes: body.notes || null,
        receipt_url: body.receipt_url || null
      })
      .select()
      .single()

    if (error) {
      logger.error('Tax deduction creation error', { error })
      return NextResponse.json(
        { error: 'Failed to create tax deduction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deduction
    })
  } catch (error) {
    logger.error('Tax deductions POST error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
