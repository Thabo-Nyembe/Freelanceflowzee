import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with latest API version
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// Stripe client initialization function
const getStripe = () => {
  if (!stripeSecretKey) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-05-28.basil',
    typescript: true,
  })
}

export async function GET() {
  try {
    // Test Stripe connection
    const stripe = await getStripe()
    
    // Health check and connection test
    const testConnection = await stripe.paymentIntents.list({ limit: 1 })
    
    return new Response(JSON.stringify({
      status: 'healthy',
      message: 'Payment system operational',
      stripeConnected: !!testConnection
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Payment system health check failed:', error)
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Payment system health check failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    if (!stripeSecretKey) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Stripe is not configured properly' 
        },
        { status: 503 }
      )
    }

    const stripe = await getStripe()
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
        { 
          success: false,
          error: 'Valid amount is required' 
        },
        { status: 400 }
      )
    }

    let customerId: string | undefined

    // Create or retrieve customer if email provided
    if (customer_email) {
      try {
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
      } catch (error) {
        console.error('Customer creation/retrieval failed:', error)
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to process customer information' 
          },
          { status: 500 }
        )
      }
    }

    // Handle subscription vs one-time payment
    if (subscription_price_id) {
      try {
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

        return NextResponse.json({
          success: true,
          client_secret: (subscription.latest_invoice as Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent })?.payment_intent?.client_secret,
          subscription_id: subscription.id,
          customer_id: customerId,
          publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        })
      } catch (error) {
        console.error('Subscription creation failed:', error)
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to create subscription' 
          },
          { status: 500 }
        )
      }
    }

    try {
      // Create enhanced payment intent for one-time payment
      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount,
        currency: currency.toLowerCase(),
        metadata: {
          description: description || 'FreeflowZee Payment',
          customer_email: customer_email || '','
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
    } catch (error) {
      console.error('Payment intent creation failed:', error)
      return NextResponse.json(
        { 
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create payment intent' 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Request processing failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid request format' 
      },
      { status: 400 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const stripe = await getStripe()
    const body = await request.json()
    const { payment_intent_id, ...updateData } = body

    if (!payment_intent_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment intent ID is required'
        },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.update(
      payment_intent_id,
      updateData
    )

    return NextResponse.json({
      success: true,
      payment_intent: paymentIntent,
    })
  } catch (error) {
    console.error('Payment intent update failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update payment intent'
      },
      { status: 500 }
    )
  }
} 