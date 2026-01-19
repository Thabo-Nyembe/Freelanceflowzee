/**
 * Hyperswitch Webhooks API
 *
 * Handle payment events from Hyperswitch for multi-processor orchestration
 *
 * POST /api/hyperswitch/webhooks - Receive webhook events
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

interface WebhookEvent {
  event_type: string
  content: {
    payment_id?: string
    refund_id?: string
    dispute_id?: string
    mandate_id?: string
    status?: string
    amount?: number
    currency?: string
    connector?: string
    error_code?: string
    error_message?: string
    metadata?: Record<string, unknown>
  }
  timestamp: string
  merchant_id: string
}

// Verify webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret)
    const expectedSignature = hmac.update(payload).digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

/**
 * Handle Hyperswitch webhook events
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-webhook-signature')
    const webhookSecret = process.env.HYPERSWITCH_WEBHOOK_SECRET

    // Verify signature in production
    if (webhookSecret && signature) {
      const isValid = verifySignature(payload, signature, webhookSecret)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const event: WebhookEvent = JSON.parse(payload)
    const supabase = await createClient()

    // Store webhook event
    await supabase.from('payment_webhook_events').insert({
      event_type: event.event_type,
      payment_id: event.content.payment_id,
      refund_id: event.content.refund_id,
      dispute_id: event.content.dispute_id,
      content: event.content,
      merchant_id: event.merchant_id,
      received_at: new Date().toISOString(),
      processed: false,
    })

    // Process event based on type
    switch (event.event_type) {
      case 'payment_succeeded':
        await handlePaymentSucceeded(supabase, event)
        break

      case 'payment_failed':
        await handlePaymentFailed(supabase, event)
        break

      case 'payment_processing':
        await handlePaymentProcessing(supabase, event)
        break

      case 'payment_captured':
        await handlePaymentCaptured(supabase, event)
        break

      case 'payment_cancelled':
        await handlePaymentCancelled(supabase, event)
        break

      case 'refund_succeeded':
        await handleRefundSucceeded(supabase, event)
        break

      case 'refund_failed':
        await handleRefundFailed(supabase, event)
        break

      case 'dispute_opened':
        await handleDisputeOpened(supabase, event)
        break

      case 'dispute_won':
      case 'dispute_lost':
        await handleDisputeResolved(supabase, event)
        break

      case 'connector_payout':
        await handleConnectorPayout(supabase, event)
        break

      default:
        console.log(`Unhandled webhook event type: ${event.event_type}`)
    }

    // Mark as processed
    await supabase
      .from('payment_webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_type', event.event_type)
      .eq('payment_id', event.content.payment_id)
      .eq('received_at', event.timestamp)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Event handlers
async function handlePaymentSucceeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: WebhookEvent
): Promise<void> {
  const { payment_id, connector, amount, currency } = event.content

  if (!payment_id) return

  // Update payment status
  await supabase
    .from('payment_intents')
    .update({
      status: 'succeeded',
      connector,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment_id)

  // Get payment details for notification
  const { data: payment } = await supabase
    .from('payment_intents')
    .select('user_id, description, metadata')
    .eq('id', payment_id)
    .single()

  if (payment?.user_id) {
    // Create notification
    await supabase.from('notifications').insert({
      user_id: payment.user_id,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your payment of ${(amount || 0) / 100} ${currency} has been processed successfully.`,
      metadata: {
        payment_id,
        amount,
        currency,
        connector,
      },
      read: false,
      created_at: new Date().toISOString(),
    })

    // Track analytics
    await supabase.from('payment_analytics').insert({
      payment_id,
      user_id: payment.user_id,
      event_type: 'payment_succeeded',
      amount,
      currency,
      connector,
      timestamp: new Date().toISOString(),
    })
  }
}

async function handlePaymentFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: WebhookEvent
): Promise<void> {
  const { payment_id, error_code, error_message, connector } = event.content

  if (!payment_id) return

  // Update payment status
  await supabase
    .from('payment_intents')
    .update({
      status: 'failed',
      error_code,
      error_message,
      connector,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment_id)

  // Get payment for notification
  const { data: payment } = await supabase
    .from('payment_intents')
    .select('user_id')
    .eq('id', payment_id)
    .single()

  if (payment?.user_id) {
    await supabase.from('notifications').insert({
      user_id: payment.user_id,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: error_message || 'Your payment could not be processed. Please try again.',
      metadata: {
        payment_id,
        error_code,
        error_message,
        connector,
      },
      read: false,
      created_at: new Date().toISOString(),
    })

    // Track failure analytics
    await supabase.from('payment_analytics').insert({
      payment_id,
      user_id: payment.user_id,
      event_type: 'payment_failed',
      error_code,
      error_message,
      connector,
      timestamp: new Date().toISOString(),
    })
  }
}

async function handlePaymentProcessing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: WebhookEvent
): Promise<void> {
  const { payment_id, connector } = event.content

  if (!payment_id) return

  await supabase
    .from('payment_intents')
    .update({
      status: 'processing',
      connector,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment_id)
}

async function handlePaymentCaptured(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: WebhookEvent
): Promise<void> {
  const { payment_id, amount, connector } = event.content

  if (!payment_id) return

  await supabase
    .from('payment_intents')
    .update({
      status: 'captured',
      captured_amount: amount,
      connector,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment_id)
}

async function handlePaymentCancelled(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: WebhookEvent
): Promise<void> {
  const { payment_id } = event.content

  if (!payment_id) return

  await supabase
    .from('payment_intents')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment_id)
}

async function handleRefundSucceeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: WebhookEvent
): Promise<void> {
  const { refund_id, payment_id, amount, connector } = event.content

  if (!refund_id) return

  await supabase
    .from('payment_refunds')
    .update({
      status: 'succeeded',
      connector,
      updated_at: new Date().toISOString(),
    })
    .eq('id', refund_id)

  // Check if payment is fully refunded
  if (payment_id) {
    const { data: payment } = await supabase
      .from('payment_intents')
      .select('amount, user_id')
      .eq('id', payment_id)
      .single()

    const { data: refunds } = await supabase
      .from('payment_refunds')
      .select('amount')
      .eq('payment_id', payment_id)
      .eq('status', 'succeeded')

    const totalRefunded = refunds?.reduce((sum, r) => sum + r.amount, 0) || 0

    if (payment && totalRefunded >= payment.amount) {
      await supabase
        .from('payment_intents')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('id', payment_id)
    }

    // Notify user
    if (payment?.user_id) {
      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        type: 'refund_processed',
        title: 'Refund Processed',
        message: `Your refund of ${(amount || 0) / 100} has been processed.`,
        metadata: { refund_id, payment_id, amount },
        read: false,
        created_at: new Date().toISOString(),
      })
    }
  }
}

async function handleRefundFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: WebhookEvent
): Promise<void> {
  const { refund_id, error_code, error_message } = event.content

  if (!refund_id) return

  await supabase
    .from('payment_refunds')
    .update({
      status: 'failed',
      error_code,
      error_message,
      updated_at: new Date().toISOString(),
    })
    .eq('id', refund_id)
}

async function handleDisputeOpened(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: WebhookEvent
): Promise<void> {
  const { dispute_id, payment_id, amount, currency } = event.content

  if (!dispute_id || !payment_id) return

  // Create dispute record
  await supabase.from('payment_disputes').insert({
    id: dispute_id,
    payment_id,
    amount,
    currency,
    status: 'opened',
    opened_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  })

  // Update payment status
  await supabase
    .from('payment_intents')
    .update({
      status: 'disputed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment_id)

  // Get payment owner for notification
  const { data: payment } = await supabase
    .from('payment_intents')
    .select('user_id')
    .eq('id', payment_id)
    .single()

  if (payment?.user_id) {
    await supabase.from('notifications').insert({
      user_id: payment.user_id,
      type: 'dispute_opened',
      title: 'Payment Disputed',
      message: 'A dispute has been opened for one of your payments. Please review and respond.',
      metadata: { dispute_id, payment_id, amount, currency },
      read: false,
      priority: 'high',
      created_at: new Date().toISOString(),
    })
  }
}

async function handleDisputeResolved(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: WebhookEvent
): Promise<void> {
  const { dispute_id, payment_id } = event.content
  const isWon = event.event_type === 'dispute_won'

  if (!dispute_id) return

  await supabase
    .from('payment_disputes')
    .update({
      status: isWon ? 'won' : 'lost',
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', dispute_id)

  // Update payment status
  if (payment_id) {
    await supabase
      .from('payment_intents')
      .update({
        status: isWon ? 'succeeded' : 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment_id)

    const { data: payment } = await supabase
      .from('payment_intents')
      .select('user_id')
      .eq('id', payment_id)
      .single()

    if (payment?.user_id) {
      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        type: isWon ? 'dispute_won' : 'dispute_lost',
        title: isWon ? 'Dispute Won' : 'Dispute Lost',
        message: isWon
          ? 'The dispute has been resolved in your favor.'
          : 'The dispute was resolved against your case. The funds have been returned to the customer.',
        metadata: { dispute_id, payment_id },
        read: false,
        created_at: new Date().toISOString(),
      })
    }
  }
}

async function handleConnectorPayout(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: WebhookEvent
): Promise<void> {
  const { amount, currency, connector, metadata } = event.content

  // Record payout for analytics
  await supabase.from('payment_payouts').insert({
    connector,
    amount,
    currency,
    metadata,
    received_at: new Date().toISOString(),
  })
}
