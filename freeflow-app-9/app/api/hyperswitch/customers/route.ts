/**
 * Hyperswitch Customers API
 *
 * Manage payment customers across multiple processors
 *
 * POST /api/hyperswitch/customers - Create customer
 * GET /api/hyperswitch/customers - Get customer details
 * PUT /api/hyperswitch/customers - Update customer
 * DELETE /api/hyperswitch/customers - Delete customer
 */

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

const logger = createFeatureLogger('hyperswitch-api')

/**
 * Create a new customer
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
    const { email, name, phone, description, metadata } = body

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('payment_customers')
      .select('hyperswitch_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingCustomer?.hyperswitch_customer_id) {
      return NextResponse.json(
        { error: 'Customer already exists', customer_id: existingCustomer.hyperswitch_customer_id },
        { status: 409 }
      )
    }

    // Get user details if not provided
    const { data: userData } = await supabase
      .from('users')
      .select('email, name, phone')
      .eq('id', user.id)
      .single()

    // Create customer in Hyperswitch
    const { customer_id } = await hyperswitchPayment.createCustomer({
      email: email || userData?.email || user.email!,
      name: name || userData?.name,
      phone: phone || userData?.phone,
      description,
      metadata: {
        ...metadata,
        user_id: user.id,
        platform: 'freeflow',
      },
    })

    // Store customer record
    await supabase.from('payment_customers').insert({
      user_id: user.id,
      hyperswitch_customer_id: customer_id,
      email: email || userData?.email || user.email,
      name: name || userData?.name,
      phone: phone || userData?.phone,
      metadata: {
        ...metadata,
        user_id: user.id,
      },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      customer: {
        customer_id,
        email: email || userData?.email,
        name: name || userData?.name,
      },
    }, { status: 201 })
  } catch (error) {
    logger.error('Create customer error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create customer' },
      { status: 500 }
    )
  }
}

/**
 * Get customer details
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
    const customerId = searchParams.get('id')
    const includePaymentMethods = searchParams.get('payment_methods') === 'true'

    // Get customer from database
    const { data: customerRecord } = await supabase
      .from('payment_customers')
      .select('*')
      .eq('user_id', customerId || user.id)
      .single()

    if (!customerRecord) {
      return NextResponse.json({
        success: true,
        customer: null,
        message: 'Customer not found. Create one first.',
      })
    }

    // Get customer details from Hyperswitch
    const customer = await hyperswitchPayment.getCustomer(customerRecord.hyperswitch_customer_id)

    let paymentMethods = null
    if (includePaymentMethods) {
      const methods = await hyperswitchPayment.listPaymentMethods(customerRecord.hyperswitch_customer_id)
      paymentMethods = methods.payment_methods
    }

    // Get saved payment methods from database
    const { data: savedMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('customer_id', customerRecord.hyperswitch_customer_id)
      .eq('is_default', true)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
        local_id: customerRecord.id,
        user_id: customerRecord.user_id,
      },
      payment_methods: paymentMethods,
      saved_methods: savedMethods,
    })
  } catch (error) {
    logger.error('Get customer error', { error })
    return NextResponse.json(
      { error: 'Failed to get customer' },
      { status: 500 }
    )
  }
}

/**
 * Update customer
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
    const { email, name, phone, description, metadata, default_payment_method_id } = body

    // Get customer from database
    const { data: customerRecord } = await supabase
      .from('payment_customers')
      .select('hyperswitch_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!customerRecord) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Update customer in Hyperswitch
    const customer = await hyperswitchPayment.updateCustomer(customerRecord.hyperswitch_customer_id, {
      email,
      name,
      phone,
      description,
      metadata: {
        ...metadata,
        user_id: user.id,
      },
    })

    // Update local record
    await supabase
      .from('payment_customers')
      .update({
        email: email || undefined,
        name: name || undefined,
        phone: phone || undefined,
        metadata: {
          ...metadata,
          user_id: user.id,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    // Update default payment method if provided
    if (default_payment_method_id) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('customer_id', customerRecord.hyperswitch_customer_id)

      await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', default_payment_method_id)
        .eq('customer_id', customerRecord.hyperswitch_customer_id)
    }

    return NextResponse.json({
      success: true,
      customer,
    })
  } catch (error) {
    logger.error('Update customer error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update customer' },
      { status: 500 }
    )
  }
}

/**
 * Delete customer
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
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

    // Get customer from database
    const { data: customerRecord } = await supabase
      .from('payment_customers')
      .select('hyperswitch_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!customerRecord) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check for active payments
    const { count: activePayments } = await supabase
      .from('payment_intents')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerRecord.hyperswitch_customer_id)
      .in('status', ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing'])

    if (activePayments && activePayments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with active payments' },
        { status: 400 }
      )
    }

    // Delete customer in Hyperswitch
    await hyperswitchPayment.deleteCustomer(customerRecord.hyperswitch_customer_id)

    // Delete local records
    await supabase
      .from('payment_methods')
      .delete()
      .eq('customer_id', customerRecord.hyperswitch_customer_id)

    await supabase
      .from('payment_customers')
      .delete()
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      message: 'Customer deleted',
    })
  } catch (error) {
    logger.error('Delete customer error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
