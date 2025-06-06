import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize enhanced Stripe with latest API version
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build'
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      amount,
      currency = 'usd',
      description,
      customer_email,
      customer_name,
      save_payment_method = false,
      payment_method_types = ['card', 'apple_pay', 'google_pay'],
      subscription_price_id,
      setup_future_usage,
    } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    let customerId: string | undefined

    // Create or retrieve customer if email provided
    if (customer_email) {
      const existingCustomers = await stripe.customers.list({
        email: customer_email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id
      } else {
        const customer = await stripe.customers.create({
          email: customer_email,
          name: customer_name,
          metadata: {
            created_via: 'freeflowzee-enhanced',
            created_at: new Date().toISOString(),
          },
        })
        customerId = customer.id
      }
    }

    // Handle subscription vs one-time payment
    if (subscription_price_id) {
      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId!,
        items: [{ price: subscription_price_id }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          description: description || 'FreeflowZee Subscription',
          created_via: 'freeflowzee-enhanced',
        },
      })

      const invoice = subscription.latest_invoice as Stripe.Invoice
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

      return NextResponse.json({
        success: true,
        client_secret: paymentIntent.client_secret,
        subscription_id: subscription.id,
        customer_id: customerId,
        publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      })
    } else {
      // Create enhanced payment intent for one-time payment
      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount,
        currency: currency.toLowerCase(),
        payment_method_types,
        metadata: {
          description: description || 'FreeflowZee Payment',
          customer_email: customer_email || '',
          created_via: 'freeflowzee-enhanced',
          created_at: new Date().toISOString(),
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always',
        },
      }

      // Add customer if available
      if (customerId) {
        paymentIntentData.customer = customerId
      }

      // Set up future usage if requested
      if (save_payment_method || setup_future_usage) {
        paymentIntentData.setup_future_usage = setup_future_usage || 'off_session'
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentData)

      return NextResponse.json({
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        customer_id: customerId,
        publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      })
    }
  } catch (error) {
    console.error('Enhanced payment intent creation failed:', error)
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Payment intent creation failed',
        success: false,
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Test Stripe connection
    await stripe.balance.retrieve()
    
    return NextResponse.json({
      success: true,
      message: 'Enhanced payment API is operational',
      features: [
        'Apple Pay',
        'Google Pay', 
        'Card payments',
        'Subscriptions',
        'Customer management',
        'Payment method saving',
      ],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Stripe connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Update payment intent (for customer updates, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { payment_intent_id, updates } = body

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    const updatedPaymentIntent = await stripe.paymentIntents.update(
      payment_intent_id,
      updates
    )

    return NextResponse.json({
      success: true,
      payment_intent: updatedPaymentIntent,
    })
  } catch (error) {
    console.error('Payment intent update failed:', error)
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Payment intent update failed',
        success: false,
      },
      { status: 500 }
    )
  }
} 