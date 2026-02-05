/**
 * Webhooks API
 *
 * Manage webhook subscriptions for AI agent events.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WebhookService, WebhookEventType } from '@/lib/webhooks/webhook-service';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

const logger = createSimpleLogger('webhooks');

const webhookService = new WebhookService();

/**
 * GET /api/webhooks - List user's webhooks
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const webhooks = await webhookService.getWebhooks(user.id);

    return NextResponse.json({
      webhooks: webhooks.map(w => ({
        id: w.id,
        url: w.url,
        events: w.events,
        isActive: w.isActive,
        createdAt: w.createdAt.toISOString(),
        updatedAt: w.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    logger.error('Webhooks GET error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks - Create a new webhook
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
    const { url, events, metadata } = body as {
      url: string;
      events: WebhookEventType[];
      metadata?: Record<string, unknown>;
    };

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }

    // Validate events
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

    const webhook = await webhookService.registerWebhook(
      user.id,
      url,
      events,
      { metadata }
    );

    return NextResponse.json({
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret, // Only returned on creation
        isActive: webhook.isActive,
        createdAt: webhook.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    logger.error('Webhooks POST error', { error });
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}
