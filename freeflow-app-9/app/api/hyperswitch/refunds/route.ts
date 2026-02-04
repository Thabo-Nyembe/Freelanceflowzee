/**
 * Hyperswitch Refunds API
 *
 * Manage payment refunds with multi-processor support
 *
 * POST /api/hyperswitch/refunds - Create refund
 * GET /api/hyperswitch/refunds - List refunds
 * GET /api/hyperswitch/refunds?id=xxx - Get refund details
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processRefund } from '@/lib/payments/hyperswitch'
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

const logger = createSimpleLogger('hyperswitch-api')

/**
 * Create a new refund
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
    const { payment_id, amount, reason, metadata } = body

    if (!payment_id) {
      return NextResponse.json(
        { error: 'payment_id is required' },
        { status: 400 }
      )
    }

    // Verify payment exists and user has permission
    const { data: paymentRecord } = await supabase
      .from('payment_intents')
      .select('user_id, amount, status, currency')
      .eq('id', payment_id)
      .single()

    if (!paymentRecord) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Check if user owns the payment or is admin
    if (paymentRecord.user_id !== user.id) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'owner'])
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Validate payment status
    if (!['succeeded', 'partially_captured'].includes(paymentRecord.status)) {
      return NextResponse.json(
        { error: 'Payment must be succeeded or partially captured to refund' },
        { status: 400 }
      )
    }

    // Validate refund amount
    if (amount && amount > paymentRecord.amount) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed payment amount' },
        { status: 400 }
      )
    }

    // Check existing refunds
    const { data: existingRefunds } = await supabase
      .from('payment_refunds')
      .select('amount')
      .eq('payment_id', payment_id)
      .in('status', ['pending', 'succeeded'])

    const totalRefunded = existingRefunds?.reduce((sum, r) => sum + r.amount, 0) || 0
    const maxRefundable = paymentRecord.amount - totalRefunded

    if (amount && amount > maxRefundable) {
      return NextResponse.json(
        { error: `Maximum refundable amount is ${maxRefundable}` },
        { status: 400 }
      )
    }

    // Process refund
    const refund = await processRefund(payment_id, amount || maxRefundable, reason)

    // Store refund record
    await supabase.from('payment_refunds').insert({
      id: refund.refund_id,
      payment_id,
      user_id: user.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      metadata: {
        ...metadata,
        created_by: user.id,
      },
      connector: refund.connector,
      created_at: new Date().toISOString(),
    })

    // Update payment status if fully refunded
    const newTotalRefunded = totalRefunded + refund.amount
    if (newTotalRefunded >= paymentRecord.amount) {
      await supabase
        .from('payment_intents')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('id', payment_id)
    } else if (newTotalRefunded > 0) {
      await supabase
        .from('payment_intents')
        .update({ status: 'partially_refunded', updated_at: new Date().toISOString() })
        .eq('id', payment_id)
    }

    return NextResponse.json({
      success: true,
      refund: {
        refund_id: refund.refund_id,
        payment_id: refund.payment_id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        connector: refund.connector,
      },
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
 * Get refund details or list refunds
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
    const refundId = searchParams.get('id')
    const paymentId = searchParams.get('payment_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (refundId) {
      // Get specific refund from Hyperswitch
      const refund = await hyperswitchPayment.getRefund(refundId)

      // Verify ownership
      const { data: refundRecord } = await supabase
        .from('payment_refunds')
        .select('user_id')
        .eq('id', refundId)
        .single()

      if (!refundRecord) {
        return NextResponse.json(
          { error: 'Refund not found' },
          { status: 404 }
        )
      }

      // Check permission
      if (refundRecord.user_id !== user.id) {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'owner'])
          .single()

        if (!membership) {
          return NextResponse.json(
            { error: 'Refund not found' },
            { status: 404 }
          )
        }
      }

      return NextResponse.json({
        success: true,
        refund,
      })
    }

    // List refunds
    let query = supabase
      .from('payment_refunds')
      .select(`
        *,
        payment:payment_intents(amount, currency, description)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (paymentId) {
      query = query.eq('payment_id', paymentId)
    }

    const { data: refunds, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      refunds,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    logger.error('Get refunds error', { error })
    return NextResponse.json(
      { error: 'Failed to get refunds' },
      { status: 500 }
    )
  }
}

/**
 * Update refund (e.g., sync status)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
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
    const { refund_id } = body

    if (!refund_id) {
      return NextResponse.json(
        { error: 'refund_id is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: refundRecord } = await supabase
      .from('payment_refunds')
      .select('user_id')
      .eq('id', refund_id)
      .single()

    if (!refundRecord || refundRecord.user_id !== user.id) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'owner'])
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'Refund not found' },
          { status: 404 }
        )
      }
    }

    // Get latest status from Hyperswitch
    const refund = await hyperswitchPayment.getRefund(refund_id)

    // Update local record
    await supabase
      .from('payment_refunds')
      .update({
        status: refund.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', refund_id)

    return NextResponse.json({
      success: true,
      refund,
    })
  } catch (error) {
    logger.error('Update refund error', { error })
    return NextResponse.json(
      { error: 'Failed to update refund' },
      { status: 500 }
    )
  }
}
