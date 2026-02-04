import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
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

const logger = createFeatureLogger('stripe-webhooks')

/**
 * Production Stripe Webhook Handler
 *
 * Handles Stripe webhook events securely with:
 * - Signature verification
 * - Idempotency (prevents duplicate processing)
 * - Database updates
 * - Comprehensive logging
 * - Error handling
 *
 * Supported Events:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.paid
 * - invoice.payment_failed
 * - checkout.session.completed
 */

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

// Webhook secret from Stripe dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * POST /api/payments/webhooks
 * Receives and processes Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      logger.error('Webhook Error: No signature provided')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      logger.info('Webhook signature verified', { eventType: event.type })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Webhook signature verification failed', { error: errorMessage })
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${errorMessage}` },
        { status: 400 }
      )
    }

    // Check for duplicate events (idempotency)
    const isDuplicate = await checkDuplicateEvent(event.id)
    if (isDuplicate) {
      logger.warn('Duplicate event detected - Skipping', { eventId: event.id })
      return NextResponse.json({ received: true, duplicate: true })
    }

    // Log webhook event to database
    await logWebhookEvent(event)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        logger.info('Unhandled event type', { eventType: event.type })
    }

    // Return success response
    return NextResponse.json({ received: true, eventType: event.type })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Webhook Error', { error: errorMessage })
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Check if event has already been processed (idempotency)
 */
async function checkDuplicateEvent(eventId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('stripe_webhook_events')
      .select('id')
      .eq('stripe_event_id', eventId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (not an error in this case)
      logger.error('Error checking duplicate event', { error })
    }

    return !!data
  } catch (error) {
    logger.error('Error in checkDuplicateEvent', { error })
    return false
  }
}

/**
 * Log webhook event to database for audit trail
 */
async function logWebhookEvent(event: Stripe.Event): Promise<void> {
  try {
    const { error } = await supabase
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        data: event.data.object,
        processed: true,
        created_at: new Date(event.created * 1000).toISOString(),
      })

    if (error) {
      logger.error('Error logging webhook event', { error })
    }
  } catch (error) {
    logger.error('Error in logWebhookEvent', { error })
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  logger.info('Payment succeeded', { paymentIntentId: paymentIntent.id })

  try {
    const { projectId, userId, type } = paymentIntent.metadata

    // Update payment record in database
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paid_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (paymentError) {
      logger.error('Error updating payment', { error: paymentError })
    }

    // Grant access to project if applicable
    if (projectId && userId) {
      const { error: accessError } = await supabase
        .from('project_access')
        .insert({
          user_id: userId,
          project_id: projectId,
          access_type: type || 'paid',
          granted_at: new Date().toISOString(),
        })

      if (accessError && accessError.code !== '23505') {
        // 23505 = unique constraint violation (already has access)
        logger.error('Error granting project access', { error: accessError })
      }
    }

    logger.info('Payment processed successfully', { paymentIntentId: paymentIntent.id })
  } catch (error) {
    logger.error('Error in handlePaymentIntentSucceeded', { error })
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  logger.warn('Payment failed', { paymentIntentId: paymentIntent.id })

  try {
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      logger.error('Error updating failed payment', { error })
    }
  } catch (error) {
    logger.error('Error in handlePaymentIntentFailed', { error })
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  logger.info('Subscription created', { subscriptionId: subscription.id })

  try {
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

    // Find user by Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!user) {
      logger.warn('User not found for customer', { customerId })
      return
    }

    // Create subscription record
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })

    if (error) {
      logger.error('Error creating subscription', { error })
    }
  } catch (error) {
    logger.error('Error in handleSubscriptionCreated', { error })
  }
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  logger.info('Subscription updated', { subscriptionId: subscription.id })

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      logger.error('Error updating subscription', { error })
    }
  } catch (error) {
    logger.error('Error in handleSubscriptionUpdated', { error })
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  logger.info('Subscription deleted', { subscriptionId: subscription.id })

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      logger.error('Error updating canceled subscription', { error })
    }
  } catch (error) {
    logger.error('Error in handleSubscriptionDeleted', { error })
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  logger.info('Invoice paid', { invoiceId: invoice.id })

  try {
    // Log invoice payment
    const { error } = await supabase
      .from('invoices')
      .insert({
        stripe_invoice_id: invoice.id,
        stripe_customer_id: typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id,
        stripe_subscription_id: typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id,
        amount_paid: invoice.amount_paid,
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        status: 'paid',
        paid_at: invoice.status_transitions.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          : new Date().toISOString(),
      })

    if (error && error.code !== '23505') {
      // 23505 = unique constraint (invoice already logged)
      logger.error('Error logging invoice', { error })
    }
  } catch (error) {
    logger.error('Error in handleInvoicePaid', { error })
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  logger.warn('Invoice payment failed', { invoiceId: invoice.id })

  try {
    // Get invoice with user info for email
    const { data: invoiceData, error: fetchError } = await supabase
      .from('invoices')
      .select('*, users(email, name)')
      .eq('stripe_invoice_id', invoice.id)
      .single()

    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'payment_failed',
        error_message: 'Payment failed',
      })
      .eq('stripe_invoice_id', invoice.id)

    if (error) {
      logger.error('Error updating failed invoice', { error })
    }

    // Send email notification to user about failed payment
    const userEmail = invoiceData?.users?.email || invoice.customer_email
    if (process.env.RESEND_API_KEY && userEmail) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: 'KAZI Billing <billing@kazi.app>',
          to: userEmail,
          subject: 'Payment Failed - Action Required',
          html: `
            <h1>Payment Failed</h1>
            <p>We were unable to process your payment for invoice ${invoice.id}.</p>
            <p>Please update your payment method or try again.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/billing">Update Payment Method</a></p>
          `
        })
      } catch {
        // Email optional
      }
    }
  } catch (error) {
    logger.error('Error in handleInvoicePaymentFailed', { error })
  }
}

/**
 * Handle completed checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  logger.info('Checkout session completed', { sessionId: session.id })

  try {
    const { userId, projectId, type } = session.metadata || {}

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id,
        stripe_checkout_session_id: session.id,
        amount: session.amount_total,
        currency: session.currency,
        status: 'succeeded',
        paid_at: new Date().toISOString(),
      })

    if (paymentError && paymentError.code !== '23505') {
      logger.error('Error creating payment record', { error: paymentError })
    }

    // Grant project access if applicable
    if (projectId && userId) {
      const { error: accessError } = await supabase
        .from('project_access')
        .insert({
          user_id: userId,
          project_id: projectId,
          access_type: type || 'paid',
          granted_at: new Date().toISOString(),
        })

      if (accessError && accessError.code !== '23505') {
        logger.error('Error granting project access', { error: accessError })
      }
    }
  } catch (error) {
    logger.error('Error in handleCheckoutSessionCompleted', { error })
  }
}

/**
 * GET request returns webhook info (for debugging)
 */
export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint',
    webhookSecretConfigured: !!webhookSecret,
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    supportedEvents: [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_failed',
      'checkout.session.completed',
    ],
  })
}
