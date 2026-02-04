/**
 * Tax Refunds API
 *
 * Create and manage tax refunds
 *
 * POST /api/tax/refunds - Create refund
 * GET /api/tax/refunds - List refunds
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taxService } from '@/lib/tax/tax-service'
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

const logger = createFeatureLogger('tax-api')

/**
 * Create tax refund
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      originalTransactionId,
      refundTransactionId,
      refundDate,
      amount,
      taxAmount,
      shippingAmount,
      originAddress,
      destinationAddress,
      provider
    } = body

    // Validate required fields
    if (!originalTransactionId || !refundTransactionId || !amount || taxAmount === undefined) {
      return NextResponse.json(
        { error: 'originalTransactionId, refundTransactionId, amount, and taxAmount are required' },
        { status: 400 }
      )
    }

    // Verify original transaction exists and belongs to user
    const { data: original } = await supabase
      .from('tax_calculations')
      .select('id, origin_country, origin_state, origin_postal_code, origin_city, destination_country, destination_state, destination_postal_code, destination_city')
      .eq('user_id', user.id)
      .eq('transaction_id', originalTransactionId)
      .single()

    if (!original) {
      return NextResponse.json(
        { error: 'Original transaction not found' },
        { status: 404 }
      )
    }

    // Use original addresses if not provided
    const finalOriginAddress = originAddress || {
      country: original.origin_country,
      state: original.origin_state,
      postal_code: original.origin_postal_code,
      city: original.origin_city
    }

    const finalDestinationAddress = destinationAddress || {
      country: original.destination_country,
      state: original.destination_state,
      postal_code: original.destination_postal_code,
      city: original.destination_city
    }

    // Create refund
    const result = await taxService.createRefund({
      userId: user.id,
      originalTransactionId,
      refundTransactionId,
      refundDate: new Date(refundDate || Date.now()),
      amount: Math.round(amount),
      taxAmount: Math.round(taxAmount),
      shippingAmount: shippingAmount ? Math.round(shippingAmount) : undefined,
      originAddress: finalOriginAddress,
      destinationAddress: finalDestinationAddress,
      provider
    })

    return NextResponse.json({
      success: true,
      refund: result
    }, { status: 201 })
  } catch (error) {
    logger.error('Create refund error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create refund' },
      { status: 500 }
    )
  }
}

/**
 * List tax refunds
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('tax_refunds')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('refund_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (year) {
      query = query
        .gte('refund_date', `${year}-01-01`)
        .lte('refund_date', `${year}-12-31`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: refunds, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      refunds: refunds || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    logger.error('List refunds error', { error })
    return NextResponse.json(
      { error: 'Failed to list refunds' },
      { status: 500 }
    )
  }
}
