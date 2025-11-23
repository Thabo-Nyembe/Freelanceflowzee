import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-GuestPayment')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(request: NextRequest) {
  try {
    const {
      guestSessionId,
      email,
      name,
      feature,
      amount,
      paymentMethod,
      duration
    } = await request.json()

    // Validate required fields
    if (!guestSessionId || !email || !name || !feature || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Stripe customer for guest
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        guestSessionId,
        feature,
        duration,
        type: 'guest_payment'
      }
    })

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        guestSessionId,
        feature,
        duration,
        type: 'guest_feature_access',
        customerEmail: email,
        customerName: name
      },
      description: `KAZI ${feature} access for ${duration}`,
      receipt_email: email
    })

    // Store guest session in database or cache
    // This would typically be stored in your database
    const guestSession = {
      id: guestSessionId,
      email,
      name,
      feature,
      amount,
      duration,
      paymentIntentId: paymentIntent.id,
      stripeCustomerId: customer.id,
      status: 'pending',
      expiresAt: new Date(Date.now() + getExpirationTime(duration)),
      createdAt: new Date()
    }

    // TODO: Store in your database
    // await storeGuestSession(guestSession)

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      sessionId: guestSessionId,
      expiresAt: guestSession.expiresAt
    })

  } catch (error: any) {
    logger.error('Guest payment error', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined })
    return NextResponse.json(
      { error: error.message || 'Payment failed' },
      { status: 500 }
    )
  }
}

function getExpirationTime(duration: string): number {
  const durationMap: Record<string, number> = {
    '1 hour': 60 * 60 * 1000,
    '24 hours': 24 * 60 * 60 * 1000,
    '7 days': 7 * 24 * 60 * 60 * 1000,
    '1 month': 30 * 24 * 60 * 60 * 1000
  }

  return durationMap[duration] || durationMap['24 hours']
}

// Webhook handler for payment confirmation
export async function PUT(request: NextRequest) {
  try {
    const sig = request.headers.get('stripe-signature')
    const body = await request.text()

    if (!sig) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      if (paymentIntent.metadata.type === 'guest_feature_access') {
        // Grant feature access to guest user
        await grantGuestFeatureAccess({
          guestSessionId: paymentIntent.metadata.guestSessionId,
          feature: paymentIntent.metadata.feature,
          duration: paymentIntent.metadata.duration,
          email: paymentIntent.metadata.customerEmail,
          name: paymentIntent.metadata.customerName
        })

        // Send confirmation email
        await sendGuestAccessEmail({
          email: paymentIntent.metadata.customerEmail,
          name: paymentIntent.metadata.customerName,
          feature: paymentIntent.metadata.feature,
          duration: paymentIntent.metadata.duration,
          guestSessionId: paymentIntent.metadata.guestSessionId
        })
      }
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    logger.error('Webhook error', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined })
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

async function grantGuestFeatureAccess(data: {
  guestSessionId: string
  feature: string
  duration: string
  email: string
  name: string
}) {
  // TODO: Implement feature access granting logic
  // This would typically:
  // 1. Update guest session status to 'active'
  // 2. Set feature permissions
  // 3. Create access token
  // 4. Set expiration time

  logger.info('Granting guest feature access', { featureId: data.featureId, email: data.email, duration: data.duration })
}

async function sendGuestAccessEmail(data: {
  email: string
  name: string
  feature: string
  duration: string
  guestSessionId: string
}) {
  // TODO: Implement email sending logic
  // This would typically send:
  // 1. Confirmation of payment
  // 2. Access instructions
  // 3. Feature usage guide
  // 4. Expiration reminder

  logger.info('Sending guest access email', { email: data.email, featureId: data.featureId })
}