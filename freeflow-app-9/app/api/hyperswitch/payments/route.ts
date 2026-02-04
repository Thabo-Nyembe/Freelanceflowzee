/**
 * Hyperswitch Payments API
 *
 * Multi-processor payment orchestration with smart routing and failover
 *
 * POST /api/hyperswitch/payments - Create payment intent
 * GET /api/hyperswitch/payments - List payments
 * GET /api/hyperswitch/payments?id=xxx - Get payment details
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type PaymentIntent } from '@/lib/payments/hyperswitch'
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

const logger = createFeatureLogger('hyperswitch-api')

/**
 * Create a new payment intent
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
      amount,
      currency = 'USD',
      description,
      metadata,
      capture_method = 'automatic',
      payment_method_types,
      customer_id,
      setup_future_usage,
      off_session,
      confirm,
      payment_method,
      return_url,
      billing,
      shipping,
    } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    // Get or create Hyperswitch customer ID
    let hyperswitchCustomerId = customer_id

    if (!hyperswitchCustomerId) {
      // Check if user has a Hyperswitch customer ID stored
      const { data: customerRecord } = await supabase
        .from('payment_customers')
        .select('hyperswitch_customer_id')
        .eq('user_id', user.id)
        .single()

      if (customerRecord?.hyperswitch_customer_id) {
        hyperswitchCustomerId = customerRecord.hyperswitch_customer_id
      } else {
        // Get user details for customer creation
        const { data: userData } = await supabase
          .from('users')
          .select('email, name, phone')
          .eq('id', user.id)
          .single()

        // Create Hyperswitch customer
        const { customer_id: newCustomerId } = await hyperswitchPayment.createCustomer({
          email: userData?.email || user.email!,
          name: userData?.name,
          phone: userData?.phone,
          metadata: { user_id: user.id },
        })

        hyperswitchCustomerId = newCustomerId

        // Store the customer ID
        await supabase.from('payment_customers').upsert({
          user_id: user.id,
          hyperswitch_customer_id: newCustomerId,
          email: userData?.email || user.email,
          name: userData?.name,
          created_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      }
    }

    // Create payment intent
    const paymentIntent = await hyperswitchPayment.createPaymentIntent({
      amount,
      currency,
      description,
      capture_method,
      customer_id: hyperswitchCustomerId,
      metadata: {
        ...metadata,
        user_id: user.id,
        platform: 'freeflow',
      },
      payment_method_types,
      setup_future_usage,
      confirm,
      off_session,
      payment_method,
      return_url,
      billing,
      shipping,
    })

    // Store payment record
    await supabase.from('payment_intents').insert({
      id: paymentIntent.payment_id,
      user_id: user.id,
      customer_id: hyperswitchCustomerId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      description,
      metadata: paymentIntent.metadata,
      client_secret: paymentIntent.client_secret,
      capture_method,
      connector: paymentIntent.connector,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      payment: {
        payment_id: paymentIntent.payment_id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        client_secret: paymentIntent.client_secret,
        payment_method_types: paymentIntent.payment_method_types,
        next_action: paymentIntent.next_action,
        connector: paymentIntent.connector,
      },
    }, { status: 201 })
  } catch (error) {
    logger.error('Create payment intent error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment' },
      { status: 500 }
    )
  }
}

/**
 * Get payment details or list payments
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
    const paymentId = searchParams.get('id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (paymentId) {
      // Get specific payment
      const payment = await hyperswitchPayment.getPaymentIntent(paymentId)

      // Verify ownership
      const { data: paymentRecord } = await supabase
        .from('payment_intents')
        .select('user_id')
        .eq('id', paymentId)
        .single()

      if (paymentRecord?.user_id !== user.id) {
        // Check if user is admin
        const { data: membership } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'owner'])
          .single()

        if (!membership) {
          return NextResponse.json(
            { error: 'Payment not found' },
            { status: 404 }
          )
        }
      }

      return NextResponse.json({
        success: true,
        payment,
      })
    }

    // List user's payments
    let query = supabase
      .from('payment_intents')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: payments, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        total: count,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    logger.error('Get payments error', { error })
    return NextResponse.json(
      { error: 'Failed to get payments' },
      { status: 500 }
    )
  }
}

/**
 * Update/confirm payment
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
    const { payment_id, action, payment_method, return_url, amount } = body

    if (!payment_id) {
      return NextResponse.json(
        { error: 'payment_id is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: paymentRecord } = await supabase
      .from('payment_intents')
      .select('user_id, status')
      .eq('id', payment_id)
      .single()

    if (!paymentRecord || paymentRecord.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    let updatedPayment: PaymentIntent

    switch (action) {
      case 'confirm':
        updatedPayment = await hyperswitchPayment.confirmPaymentIntent(payment_id, {
          payment_method,
          return_url,
        })
        break

      case 'capture':
        updatedPayment = await hyperswitchPayment.capturePayment(payment_id, amount)
        break

      case 'cancel':
        updatedPayment = await hyperswitchPayment.cancelPayment(payment_id)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: confirm, capture, or cancel' },
          { status: 400 }
        )
    }

    // Update local record
    await supabase
      .from('payment_intents')
      .update({
        status: updatedPayment.status,
        connector: updatedPayment.connector,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment_id)

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    })
  } catch (error) {
    logger.error('Update payment error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update payment' },
      { status: 500 }
    )
  }
}
