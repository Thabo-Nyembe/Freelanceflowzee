import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-PaymentCreateIntent')

/**
 * Payment Intent Creation Endpoint
 * Used by the StripePayment component to create payment intents
 */

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'usd', metadata = {} } = body

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
        userId: user?.id || 'guest',
        createdAt: new Date().toISOString(),
      },
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
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })

  } catch (error) {
    logger.error('Payment intent creation failed', { error: error.message })

    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
