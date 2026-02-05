/**
 * Stripe Webhook Handler for File Payments
 *
 * POST /api/files/payment/webhook
 *
 * Handles Stripe webhook events for file payment completion
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { handlePaymentWebhook } from '@/lib/payments/file-payment'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, DEMO_USER_ID } from '@/lib/demo-auth'

const logger = createSimpleLogger('payment-webhook')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Webhook signature verification failed', { error: errorMessage })
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      )
    }

    // Handle the event
    const processed = await handlePaymentWebhook(event)

    if (processed) {
      return NextResponse.json({ received: true, processed: true })
    }

    // Event not handled, but acknowledged
    return NextResponse.json({ received: true, processed: false })
  } catch (error: unknown) {
    logger.error('Webhook processing error', { error })
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
