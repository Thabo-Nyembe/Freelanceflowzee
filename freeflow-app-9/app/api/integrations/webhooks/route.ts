// =====================================================
// KAZI Webhooks API - Main Route
// Webhook management and delivery
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { integrationService } from '@/lib/integrations/integration-service';
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

// =====================================================
// GET - List webhooks or get deliveries
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'deliveries': {
        const webhookId = searchParams.get('webhook_id');
        if (!webhookId) {
          return NextResponse.json(
            { success: false, error: 'webhook_id is required' },
            { status: 400 }
          );
        }

        const limit = parseInt(searchParams.get('limit') || '50');
        const deliveries = await integrationService.getWebhookDeliveries(webhookId, limit);
        return NextResponse.json({ success: true, deliveries });
      }

      case 'events': {
        // Return available webhook event types
        const eventTypes = [
          { category: 'Invoices', events: [
            { type: 'invoice.created', description: 'When a new invoice is created' },
            { type: 'invoice.paid', description: 'When an invoice is paid' },
            { type: 'invoice.overdue', description: 'When an invoice becomes overdue' },
          ]},
          { category: 'Projects', events: [
            { type: 'project.created', description: 'When a new project is created' },
            { type: 'project.completed', description: 'When a project is completed' },
            { type: 'project.status_changed', description: 'When project status changes' },
          ]},
          { category: 'Clients', events: [
            { type: 'client.created', description: 'When a new client is added' },
            { type: 'client.updated', description: 'When client info is updated' },
          ]},
          { category: 'Tasks', events: [
            { type: 'task.created', description: 'When a new task is created' },
            { type: 'task.completed', description: 'When a task is completed' },
            { type: 'task.assigned', description: 'When a task is assigned' },
          ]},
          { category: 'Bookings', events: [
            { type: 'booking.created', description: 'When a new booking is created' },
            { type: 'booking.confirmed', description: 'When a booking is confirmed' },
            { type: 'booking.cancelled', description: 'When a booking is cancelled' },
          ]},
          { category: 'Payments', events: [
            { type: 'payment.received', description: 'When a payment is received' },
            { type: 'payment.failed', description: 'When a payment fails' },
          ]},
          { category: 'Files', events: [
            { type: 'file.uploaded', description: 'When a file is uploaded' },
            { type: 'file.shared', description: 'When a file is shared' },
          ]},
          { category: 'Messages', events: [
            { type: 'message.received', description: 'When a new message is received' },
          ]},
          { category: 'Contracts', events: [
            { type: 'contract.signed', description: 'When a contract is signed' },
            { type: 'contract.expired', description: 'When a contract expires' },
          ]},
        ];
        return NextResponse.json({ success: true, eventTypes });
      }

      default: {
        const webhooks = await integrationService.getWebhooks(user.id);
        return NextResponse.json({
          success: true,
          webhooks,
          total: webhooks.length,
        });
      }
    }
  } catch (error) {
    logger.error('Webhooks GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create webhook or perform actions
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create': {
        if (!data.name || !data.url || !data.events?.length) {
          return NextResponse.json(
            { success: false, error: 'name, url, and events are required' },
            { status: 400 }
          );
        }

        // Validate URL
        try {
          new URL(data.url);
        } catch {
          return NextResponse.json(
            { success: false, error: 'Invalid URL format' },
            { status: 400 }
          );
        }

        const webhook = await integrationService.createWebhook(user.id, {
          name: data.name,
          url: data.url,
          events: data.events,
          secret: data.secret,
          headers: data.headers,
          retry_policy: data.retry_policy,
        });

        return NextResponse.json({
          success: true,
          action: 'create',
          webhook,
          message: `Webhook "${webhook.name}" created successfully`,
        }, { status: 201 });
      }

      case 'test': {
        if (!data.webhook_id) {
          return NextResponse.json(
            { success: false, error: 'webhook_id is required' },
            { status: 400 }
          );
        }

        const delivery = await integrationService.testWebhook(data.webhook_id);
        return NextResponse.json({
          success: true,
          action: 'test',
          delivery,
          message: delivery.status === 'success'
            ? 'Test webhook delivered successfully'
            : 'Test webhook delivery failed',
        });
      }

      case 'toggle': {
        if (!data.webhook_id || typeof data.is_active !== 'boolean') {
          return NextResponse.json(
            { success: false, error: 'webhook_id and is_active are required' },
            { status: 400 }
          );
        }

        const webhook = await integrationService.toggleWebhook(data.webhook_id, data.is_active);
        return NextResponse.json({
          success: true,
          action: 'toggle',
          webhook,
          message: data.is_active ? 'Webhook activated' : 'Webhook deactivated',
        });
      }

      case 'retry': {
        if (!data.delivery_id) {
          return NextResponse.json(
            { success: false, error: 'delivery_id is required' },
            { status: 400 }
          );
        }

        const delivery = await integrationService.retryWebhookDelivery(data.delivery_id);
        return NextResponse.json({
          success: true,
          action: 'retry',
          delivery,
          message: 'Webhook retry initiated',
        });
      }

      case 'delete': {
        if (!data.webhook_id) {
          return NextResponse.json(
            { success: false, error: 'webhook_id is required' },
            { status: 400 }
          );
        }

        await integrationService.deleteWebhook(data.webhook_id);
        return NextResponse.json({
          success: true,
          action: 'delete',
          message: 'Webhook deleted successfully',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Webhooks POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update webhook
// =====================================================
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { webhook_id, ...updates } = body;

    if (!webhook_id) {
      return NextResponse.json(
        { success: false, error: 'webhook_id is required' },
        { status: 400 }
      );
    }

    // Validate URL if being updated
    if (updates.url) {
      try {
        new URL(updates.url);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    const webhook = await integrationService.updateWebhook(webhook_id, updates);
    return NextResponse.json({
      success: true,
      webhook,
      message: 'Webhook updated successfully',
    });
  } catch (error) {
    logger.error('Webhooks PUT error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete webhook
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    await integrationService.deleteWebhook(webhookId);
    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    logger.error('Webhooks DELETE error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}
