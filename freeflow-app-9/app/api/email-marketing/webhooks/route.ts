/**
 * KAZI Email Webhooks API
 *
 * Handles incoming webhooks from email service providers
 * for event tracking (deliveries, opens, clicks, bounces, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { eventTrackingService } from '@/lib/email/event-tracking-service'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('email-webhooks')

// Disable body parsing for raw webhook payload access
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') || 'custom'

    // Get raw body for signature verification
    const body = await request.json()

    // Get signature header based on provider
    let signature: string | undefined
    switch (provider) {
      case 'sendgrid':
        signature = request.headers.get('x-twilio-email-event-webhook-signature') || undefined
        break
      case 'postmark':
        signature = request.headers.get('x-postmark-signature') || undefined
        break
      case 'mailgun':
        signature = body.signature?.signature
        break
      case 'resend':
        signature = request.headers.get('svix-signature') || undefined
        break
      default:
        signature = request.headers.get('x-webhook-signature') || undefined
    }

    // Normalize events based on provider
    let events: any[] = []
    switch (provider) {
      case 'sendgrid':
        events = Array.isArray(body) ? body : [body]
        break
      case 'postmark':
        events = Array.isArray(body) ? body : [body]
        break
      case 'mailgun':
        events = body['event-data'] ? [{ type: body['event-data'].event, data: body['event-data'] }] : []
        break
      case 'resend':
        events = [{ type: body.type, data: body.data, messageId: body.data?.email_id }]
        break
      case 'ses':
        const snsMessage = typeof body.Message === 'string' ? JSON.parse(body.Message) : body
        events = [{ type: snsMessage.eventType || snsMessage.notificationType, data: snsMessage }]
        break
      default:
        events = Array.isArray(body) ? body : [body]
    }

    // Process webhook
    const result = await eventTrackingService.processWebhook({
      provider: provider,
      signature,
      timestamp: request.headers.get('x-webhook-timestamp') || undefined,
      events: events.map(e => ({
        type: e.type || e.event || e.eventType || 'unknown',
        timestamp: e.timestamp || e.Timestamp || e.sg_event_id,
        messageId: e.messageId || e.MessageID || e.sg_message_id || e['message-id'],
        recipient: e.recipient || e.Recipient || e.email || e.Email,
        data: e.data || e
      }))
    })

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Webhook processing failed', { error })
    // Return 200 to acknowledge receipt even if processing fails
    // This prevents providers from retrying unnecessarily
    return NextResponse.json({
      received: true,
      error: error instanceof Error ? error.message : 'Processing failed'
    }, { status: 200 })
  }
}

// Handle webhook verification requests (used by some providers)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')

  // SendGrid webhook verification
  if (provider === 'sendgrid') {
    return NextResponse.json({ status: 'ok' })
  }

  // Mailgun webhook verification
  if (provider === 'mailgun') {
    return NextResponse.json({ status: 'ok' })
  }

  // AWS SNS subscription confirmation
  if (provider === 'ses') {
    const subscriptionUrl = searchParams.get('SubscribeURL')
    if (subscriptionUrl) {
      // Confirm subscription
      await fetch(subscriptionUrl)
      return NextResponse.json({ status: 'confirmed' })
    }
  }

  return NextResponse.json({ status: 'ready' })
}
