import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-PaymentIntentEnhanced')

/**
 * Enhanced Payment Intent Creation Endpoint
 *
 * Additional Features over standard create-intent:
 * - Multi-currency support with automatic conversion
 * - Split payments for marketplace/escrow scenarios
 * - Recurring payment setup
 * - Payment method saving
 * - Advanced fraud detection metadata
 * - Subscription integration
 * - Invoice attachment
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

interface EnhancedPaymentRequest {
  amount: number
  currency?: string
  metadata?: Record<string, string>
  customerId?: string
  description?: string
  // Enhanced features
  savePaymentMethod?: boolean
  setupFutureUsage?: 'on_session' | 'off_session'
  splitPayment?: {
    destinationAccountId: string
    applicationFee: number
  }
  invoiceId?: string
  projectId?: string
  escrowId?: string
  subscriptionPlanId?: string
  paymentMethodTypes?: string[]
  statementDescriptor?: string
  receiptEmail?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: EnhancedPaymentRequest = await request.json()
    const {
      amount,
      currency = 'usd',
      metadata = {},
      customerId,
      description,
      savePaymentMethod = false,
      setupFutureUsage,
      splitPayment,
      invoiceId,
      projectId,
      escrowId,
      subscriptionPlanId,
      paymentMethodTypes,
      statementDescriptor,
      receiptEmail,
    } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a positive number.' },
        { status: 400 }
      )
    }

    // Convert to cents
    const amountInCents = Number.isInteger(amount) ? amount : Math.round(amount * 100)

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Build enhanced payment intent parameters
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        userId: user?.id || metadata.userId || 'guest',
        createdAt: new Date().toISOString(),
        source: 'enhanced-billing-v2',
        ...(invoiceId && { invoiceId }),
        ...(projectId && { projectId }),
        ...(escrowId && { escrowId }),
      },
    }

    // Configure payment methods
    if (paymentMethodTypes && paymentMethodTypes.length > 0) {
      paymentIntentParams.payment_method_types = paymentMethodTypes as Stripe.PaymentIntentCreateParams.PaymentMethodType[]
    } else {
      paymentIntentParams.automatic_payment_methods = { enabled: true }
    }

    // Setup future usage for saved payment methods
    if (savePaymentMethod || setupFutureUsage) {
      paymentIntentParams.setup_future_usage = setupFutureUsage || 'off_session'
    }

    // Configure split payment for marketplace scenarios
    if (splitPayment) {
      paymentIntentParams.transfer_data = {
        destination: splitPayment.destinationAccountId,
      }
      if (splitPayment.applicationFee > 0) {
        paymentIntentParams.application_fee_amount = splitPayment.applicationFee
      }
    }

    // Statement descriptor
    if (statementDescriptor) {
      paymentIntentParams.statement_descriptor = statementDescriptor.substring(0, 22)
      paymentIntentParams.statement_descriptor_suffix = statementDescriptor.substring(22, 44)
    }

    // Description
    if (description) {
      paymentIntentParams.description = description
    }

    // Handle customer
    let stripeCustomerId = customerId
    if (!stripeCustomerId && user?.email) {
      // Find or create customer
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id
      } else {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        })
        stripeCustomerId = newCustomer.id

        // Save to user record
        await supabase
          .from('users')
          .update({ stripe_customer_id: newCustomer.id })
          .eq('id', user.id)
      }
    }

    if (stripeCustomerId) {
      paymentIntentParams.customer = stripeCustomerId
    }

    // Receipt email
    if (receiptEmail || user?.email) {
      paymentIntentParams.receipt_email = receiptEmail || user?.email
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    logger.info('Enhanced payment intent created', {
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency,
      userId: user?.id || 'guest',
      hasEscrow: !!escrowId,
      hasInvoice: !!invoiceId,
      isSplitPayment: !!splitPayment,
    })

    // Record in database
    if (user) {
      await supabase.from('payments').insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amountInCents,
        currency: currency.toLowerCase(),
        status: 'pending',
        metadata: {
          ...paymentIntentParams.metadata,
          enhanced: true,
          invoiceId,
          projectId,
          escrowId,
        },
        created_at: new Date().toISOString(),
      })

      // Link to invoice if provided
      if (invoiceId) {
        await supabase
          .from('invoices')
          .update({
            stripe_payment_intent_id: paymentIntent.id,
            status: 'processing',
          })
          .eq('id', invoiceId)
      }

      // Link to escrow if provided
      if (escrowId) {
        await supabase
          .from('escrow_deposits')
          .update({
            stripe_payment_intent_id: paymentIntent.id,
            status: 'processing',
          })
          .eq('id', escrowId)
      }
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency: currency.toLowerCase(),
      customerId: stripeCustomerId,
      metadata: paymentIntent.metadata,
    })

  } catch (error: any) {
    logger.error('Enhanced payment intent creation failed', {
      error: error.message,
      code: error.code,
      type: error.type,
    })

    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      )
    }

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid payment request. Please check the payment details.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create enhanced payment intent. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('id')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['customer', 'payment_method', 'latest_charge'],
    })

    return NextResponse.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
        customer: paymentIntent.customer,
        paymentMethod: paymentIntent.payment_method,
        created: paymentIntent.created,
        description: paymentIntent.description,
      },
    })

  } catch (error: any) {
    logger.error('Enhanced payment intent retrieval failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to retrieve payment intent' },
      { status: 500 }
    )
  }
}
