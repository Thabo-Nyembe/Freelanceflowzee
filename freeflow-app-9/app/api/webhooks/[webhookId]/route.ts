/**
 * Webhook Individual API
 *
 * Manage individual webhook subscriptions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WebhookService, WebhookEventType } from '@/lib/webhooks/webhook-service';
import { createSimpleLogger } from '@/lib/simple-logger';

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

const logger = createSimpleLogger('webhooks');

const webhookService = new WebhookService();

interface RouteParams {
  params: Promise<{ webhookId: string }>;
}

/**
 * GET /api/webhooks/:webhookId - Get webhook details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const { webhookId } = await params;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get webhook with delivery history
    const webhooks = await webhookService.getWebhooks(user.id);
    const webhook = webhooks.find(w => w.id === webhookId);

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    const deliveries = await webhookService.getDeliveryHistory(webhookId, { limit: 20 });

    return NextResponse.json({
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        metadata: webhook.metadata,
        createdAt: webhook.createdAt.toISOString(),
        updatedAt: webhook.updatedAt.toISOString()
      },
      deliveries: deliveries.map(d => ({
        id: d.id,
        event: d.event,
        status: d.status,
        attempts: d.attempts,
        responseCode: d.responseCode,
        error: d.error,
        createdAt: d.createdAt.toISOString(),
        lastAttemptAt: d.lastAttemptAt?.toISOString()
      }))
    });
  } catch (error) {
    logger.error('Webhook GET error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch webhook' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/webhooks/:webhookId - Update webhook
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const { webhookId } = await params;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const webhooks = await webhookService.getWebhooks(user.id);
    const existingWebhook = webhooks.find(w => w.id === webhookId);

    if (!existingWebhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { url, events, isActive, metadata } = body as {
      url?: string;
      events?: WebhookEventType[];
      isActive?: boolean;
      metadata?: Record<string, unknown>;
    };

    // Validate URL if provided
    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid webhook URL' },
          { status: 400 }
        );
      }
    }

    // Validate events if provided
    if (events) {
      const validEvents: WebhookEventType[] = [
        'task.created', 'task.started', 'task.completed', 'task.failed', 'task.cancelled',
        'step.started', 'step.completed', 'step.failed',
        'file.created', 'file.updated',
        'session.created', 'session.completed', 'session.failed',
        'message.created'
      ];

      const invalidEvents = events.filter(e => !validEvents.includes(e));
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          { error: `Invalid events: ${invalidEvents.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const webhook = await webhookService.updateWebhook(webhookId, {
      url,
      events,
      isActive,
      metadata
    });

    return NextResponse.json({
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        metadata: webhook.metadata,
        updatedAt: webhook.updatedAt.toISOString()
      }
    });
  } catch (error) {
    logger.error('Webhook PATCH error', { error });
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/webhooks/:webhookId - Delete webhook
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const { webhookId } = await params;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const webhooks = await webhookService.getWebhooks(user.id);
    const existingWebhook = webhooks.find(w => w.id === webhookId);

    if (!existingWebhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    await webhookService.deleteWebhook(webhookId);

    return NextResponse.json({
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    logger.error('Webhook DELETE error', { error });
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}
