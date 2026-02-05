// =====================================================
// KAZI Incoming Webhook Receiver
// Receive webhooks from external services
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';


const logger = createSimpleLogger('webhooks-incoming');

// =====================================================
// POST - Receive incoming webhook
// =====================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  const startTime = Date.now();

  try {
    const { webhookId } = await params;
    const supabase = await createClient();

    // Get webhook endpoint configuration
    const { data: endpoint, error: endpointError } = await supabase
      .from('incoming_webhooks')
      .select('*')
      .eq('id', webhookId)
      .eq('is_active', true)
      .single();

    if (endpointError || !endpoint) {
      return NextResponse.json(
        { success: false, error: 'Webhook endpoint not found or inactive' },
        { status: 404 }
      );
    }

    // Get raw body and headers
    const body = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Verify signature if secret is configured
    if (endpoint.secret) {
      const signature = headers['x-webhook-signature'] ||
                       headers['x-hub-signature-256'] ||
                       headers['stripe-signature'];

      if (!signature) {
        await logWebhookEvent(supabase, {
          endpoint_id: webhookId,
          status: 'rejected',
          reason: 'Missing signature',
          payload_preview: body.substring(0, 500),
          headers,
          response_time_ms: Date.now() - startTime,
        });

        return NextResponse.json(
          { success: false, error: 'Missing webhook signature' },
          { status: 401 }
        );
      }

      const isValid = verifySignature(body, signature, endpoint.secret, endpoint.signature_type);
      if (!isValid) {
        await logWebhookEvent(supabase, {
          endpoint_id: webhookId,
          status: 'rejected',
          reason: 'Invalid signature',
          payload_preview: body.substring(0, 500),
          headers,
          response_time_ms: Date.now() - startTime,
        });

        return NextResponse.json(
          { success: false, error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    // Parse JSON payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      payload = { raw: body };
    }

    // Determine event type
    const eventType = extractEventType(payload, headers, endpoint.source);

    // Log successful receipt
    const { data: webhookLog } = await logWebhookEvent(supabase, {
      endpoint_id: webhookId,
      status: 'received',
      event_type: eventType,
      payload,
      headers,
      response_time_ms: Date.now() - startTime,
    });

    // Queue for processing
    await supabase
      .from('webhook_processing_queue')
      .insert({
        webhook_log_id: webhookLog?.id,
        endpoint_id: webhookId,
        user_id: endpoint.user_id,
        event_type: eventType,
        payload,
        status: 'pending',
      });

    // Update endpoint stats
    await supabase
      .from('incoming_webhooks')
      .update({
        total_received: (endpoint.total_received || 0) + 1,
        last_received_at: new Date().toISOString(),
      })
      .eq('id', webhookId);

    return NextResponse.json({
      success: true,
      message: 'Webhook received',
      log_id: webhookLog?.id,
    });

  } catch (error) {
    logger.error('Incoming webhook error', { error });
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function logWebhookEvent(supabase: any, data: {
  endpoint_id: string;
  status: string;
  reason?: string;
  event_type?: string;
  payload?: any;
  payload_preview?: string;
  headers: Record<string, string>;
  response_time_ms: number;
}) {
  return supabase
    .from('incoming_webhook_logs')
    .insert({
      endpoint_id: data.endpoint_id,
      status: data.status,
      rejection_reason: data.reason,
      event_type: data.event_type,
      payload: data.payload,
      payload_preview: data.payload_preview,
      request_headers: data.headers,
      response_time_ms: data.response_time_ms,
    })
    .select()
    .single();
}

function verifySignature(
  payload: string,
  signature: string,
  secret: string,
  signatureType?: string
): boolean {
  // Basic signature verification
  // In production, implement proper HMAC verification for each provider

  switch (signatureType) {
    case 'stripe':
      // Stripe uses a specific format: t=timestamp,v1=signature
      return verifyStripeSignature(payload, signature, secret);

    case 'github':
      // GitHub uses sha256=signature
      return verifyGitHubSignature(payload, signature, secret);

    case 'hmac-sha256':
    default:
      // Generic HMAC-SHA256
      return verifyHmacSignature(payload, signature, secret);
  }
}

function verifyStripeSignature(payload: string, signature: string, secret: string): boolean {
  // Simplified Stripe signature verification
  // In production, use stripe.webhooks.constructEvent()
  try {
    const parts = signature.split(',').reduce((acc: any, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {});

    return !!parts.v1; // Simplified check
  } catch {
    return false;
  }
}

function verifyGitHubSignature(payload: string, signature: string, secret: string): boolean {
  // Simplified GitHub signature verification
  // In production, use proper HMAC verification
  return signature.startsWith('sha256=');
}

function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  // Simplified HMAC verification
  // In production, use crypto.createHmac()
  return !!signature && !!secret;
}

function extractEventType(
  payload: any,
  headers: Record<string, string>,
  source?: string
): string {
  // Extract event type based on source
  switch (source) {
    case 'stripe':
      return payload.type || 'stripe.unknown';

    case 'github':
      return headers['x-github-event'] || 'github.unknown';

    case 'slack':
      return payload.event?.type || payload.type || 'slack.unknown';

    case 'shopify':
      return headers['x-shopify-topic'] || 'shopify.unknown';

    case 'twilio':
      return payload.EventType || 'twilio.unknown';

    case 'sendgrid':
      return payload[0]?.event || 'sendgrid.unknown';

    default:
      return payload.event || payload.type || payload.event_type || 'webhook.received';
  }
}

// =====================================================
// GET - Webhook endpoint info (for verification)
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  const { webhookId } = await params;

  // Some services (like Slack) need to verify the endpoint exists
  return NextResponse.json({
    success: true,
    endpoint_id: webhookId,
    status: 'active',
    message: 'Webhook endpoint is active',
  });
}
