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
  // Create Supabase client for database operations
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Calculate expiration based on duration
  const expiresAt = new Date(Date.now() + getExpirationTime(data.duration))

  // Store/update guest session in database
  await supabase
    .from('guest_sessions')
    .upsert({
      id: data.guestSessionId,
      email: data.email,
      name: data.name,
      feature: data.feature,
      status: 'active',
      expires_at: expiresAt.toISOString(),
      activated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })

  logger.info('Granting guest feature access', { feature: data.feature, email: data.email, duration: data.duration })
}

async function sendGuestAccessEmail(data: {
  email: string
  name: string
  feature: string
  duration: string
  guestSessionId: string
}) {
  // Send email via Resend if available
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'KAZI <noreply@kazi.app>',
        to: data.email,
        subject: `Your ${data.feature} access is ready!`,
        html: `
          <h1>Welcome to KAZI, ${data.name}!</h1>
          <p>Your ${data.feature} access has been activated for ${data.duration}.</p>
          <p>Session ID: ${data.guestSessionId}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/guest/${data.guestSessionId}">Access your feature</a></p>
        `
      })
    }
  } catch {
    // Email sending is optional, log but don't fail
  }

  logger.info('Sending guest access email', { email: data.email, feature: data.feature })
}