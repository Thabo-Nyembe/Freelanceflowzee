import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('API-PaymentIntent')

/**
 * Production Stripe Payment Intent Creation Endpoint
 *
 * Features:
 * - Creates Stripe payment intents with proper metadata
 * - Supports both authenticated and guest payments
 * - Validates amounts and currency
 * - Records payment intent in database
 * - Returns client secret for frontend Stripe Elements
 */

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'usd', metadata = {}, customerId, description } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a positive number.' },
        { status: 400 }
      )
    }

    // Ensure amount is in cents (smallest currency unit)
    const amountInCents = Number.isInteger(amount) ? amount : Math.round(amount * 100)

    // Get user from session if available
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Build payment intent parameters
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        userId: user?.id || metadata.userId || 'guest',
        createdAt: new Date().toISOString(),
        source: 'billing-v2',
      },
    }

    // Add customer if provided or create one for authenticated users
    if (customerId) {
      paymentIntentParams.customer = customerId
    } else if (user?.email) {
      // Try to find existing customer or create new one
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        paymentIntentParams.customer = existingCustomers.data[0].id
      } else {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        })
        paymentIntentParams.customer = newCustomer.id

        // Update user record with Stripe customer ID
        await supabase
          .from('users')
          .update({ stripe_customer_id: newCustomer.id })
          .eq('id', user.id)
      }
    }

    // Add description if provided
    if (description) {
      paymentIntentParams.description = description
    }

    // Add receipt email for authenticated users
    if (user?.email) {
      paymentIntentParams.receipt_email = user.email
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    logger.info('Payment intent created', {
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency,
      userId: user?.id || 'guest',
    })

    // Record payment intent in database
    if (user) {
      await supabase.from('payments').insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amountInCents,
        currency: currency.toLowerCase(),
        status: 'pending',
        metadata: paymentIntentParams.metadata,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency: currency.toLowerCase(),
    })

  } catch (error) {
    logger.error('Payment intent creation failed', {
      error: error.message,
      code: error.code,
      type: error.type,
    })

    // Handle specific Stripe errors
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
      { error: 'Failed to create payment intent. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for checking payment intent status
 */
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

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    })

  } catch (error) {
    logger.error('Payment intent retrieval failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to retrieve payment intent' },
      { status: 500 }
    )
  }
}
