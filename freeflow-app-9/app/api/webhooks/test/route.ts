/**
 * Webhook Test API
 *
 * Test webhook endpoints by sending a test payload
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';
import crypto from 'crypto';

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

const logger = createSimpleLogger('webhooks-test');

/**
 * POST /api/webhooks/test - Test a webhook URL
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, webhookId, secret, customHeaders } = body as {
      url: string;
      webhookId?: string;
      secret?: string;
      customHeaders?: Record<string, string>;
    };

    // Validate URL
    if (!url) {
      return NextResponse.json(
        { error: 'Webhook URL is required' },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }

    // Create test payload
    const testPayload = {
      id: `test-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook delivery from FreeFlow',
        source: 'api/webhooks/test',
        user_id: user.id,
        ...(webhookId && { webhook_id: webhookId })
      }
    };

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': 'test',
      'X-Webhook-Delivery': testPayload.id,
      'User-Agent': 'FreeFlow-Webhook/1.0',
      ...(customHeaders || {})
    };

    // Add signature if secret provided
    if (secret) {
      const timestamp = Date.now();
      const signedPayload = `${timestamp}.${JSON.stringify(testPayload)}`;
      const signature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');
      headers['X-Webhook-Signature'] = `t=${timestamp},v1=${signature}`;
    }

    // Send test request
    const startTime = Date.now();
    let responseStatus = 0;
    let responseBody = '';
    let deliveryError: string | null = null;
    let success = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      responseStatus = response.status;
      responseBody = await response.text().catch(() => '');
      success = response.ok;

      if (!response.ok) {
        deliveryError = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (fetchError) {
      deliveryError = fetchError instanceof Error ? fetchError.message : 'Request failed';
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        deliveryError = 'Request timeout (30s)';
      }
    }

    const responseTime = Date.now() - startTime;

    // Log test result if webhookId provided
    if (webhookId) {
      try {
        await supabase
          .from('webhook_deliveries')
          .insert({
            webhook_id: webhookId,
            event_type: 'test',
            event_id: testPayload.id,
            payload: testPayload,
            status: success ? 'success' : 'failed',
            attempts: 1,
            max_attempts: 1,
            response_status_code: responseStatus || null,
            response_body: responseBody.slice(0, 1000) || null,
            response_time_ms: responseTime,
            error_message: deliveryError,
            delivered_at: success ? new Date().toISOString() : null
          });
      } catch (logError) {
        logger.error('Failed to log test delivery', { error: logError });
      }
    }

    logger.info('Webhook test completed', {
      url,
      success,
      responseStatus,
      responseTime,
      error: deliveryError
    });

    return NextResponse.json({
      success,
      deliveryId: testPayload.id,
      url,
      responseStatus,
      responseTime,
      responseBody: responseBody.slice(0, 500),
      error: deliveryError
    });

  } catch (error) {
    logger.error('Webhook test error', { error });
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
}
