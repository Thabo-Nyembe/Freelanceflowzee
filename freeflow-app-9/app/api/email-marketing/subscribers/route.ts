// =====================================================
// KAZI Email Marketing API - Subscribers Route
// Subscriber management, lists & segments
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { subscriberService } from '@/lib/email/subscriber-service';
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

const logger = createSimpleLogger('email-subscribers');

// =====================================================
// GET - List subscribers with filters
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
      case 'lists': {
        const status = searchParams.get('status') || undefined;
        const lists = await subscriberService.getLists(user.id, status);
        return NextResponse.json({ lists });
      }

      case 'segments': {
        const segments = await subscriberService.getSegments(user.id);
        return NextResponse.json({ segments });
      }

      case 'stats': {
        const stats = await subscriberService.getSubscriberStats(user.id);
        return NextResponse.json({ stats });
      }

      case 'import-jobs': {
        const jobs = await subscriberService.getImportJobs(user.id);
        return NextResponse.json({ jobs });
      }

      default: {
        const params = {
          list_id: searchParams.get('list_id') || undefined,
          status: searchParams.get('status') || undefined,
          tags: searchParams.get('tags')?.split(',') || undefined,
          search: searchParams.get('search') || searchParams.get('q') || undefined,
          sort_by: searchParams.get('sort_by') || undefined,
          sort_order: (searchParams.get('sort_order') as string | null) || 'desc',
          limit: parseInt(searchParams.get('limit') || '50'),
          offset: parseInt(searchParams.get('offset') || '0'),
        };

        const result = await subscriberService.getSubscribers(user.id, params);
        return NextResponse.json(result);
      }
    }
  } catch (error) {
    logger.error('Failed to fetch subscribers', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create subscriber or perform actions
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
      // Subscriber operations
      case 'create': {
        const subscriber = await subscriberService.createSubscriber(user.id, {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          source: data.source,
          source_details: data.source_details,
          tags: data.tags,
          custom_fields: data.custom_fields,
          list_ids: data.list_ids,
          ip_address: data.ip_address,
        });
        return NextResponse.json({ subscriber }, { status: 201 });
      }

      case 'unsubscribe': {
        const subscriber = await subscriberService.unsubscribe(data.subscriber_id, data.reason);
        return NextResponse.json({ subscriber });
      }

      case 'resubscribe': {
        const subscriber = await subscriberService.resubscribe(data.subscriber_id);
        return NextResponse.json({ subscriber });
      }

      case 'add-to-lists': {
        const subscriber = await subscriberService.addToLists(data.subscriber_id, data.list_ids);
        return NextResponse.json({ subscriber });
      }

      case 'remove-from-lists': {
        const subscriber = await subscriberService.removeFromLists(data.subscriber_id, data.list_ids);
        return NextResponse.json({ subscriber });
      }

      case 'add-tags': {
        const subscriber = await subscriberService.addTags(data.subscriber_id, data.tags);
        return NextResponse.json({ subscriber });
      }

      case 'remove-tags': {
        const subscriber = await subscriberService.removeTags(data.subscriber_id, data.tags);
        return NextResponse.json({ subscriber });
      }

      // List operations
      case 'create-list': {
        const list = await subscriberService.createList(user.id, {
          name: data.name,
          description: data.description,
          double_optin: data.double_optin,
          welcome_email_id: data.welcome_email_id,
          tags: data.tags,
          settings: data.settings,
        });
        return NextResponse.json({ list }, { status: 201 });
      }

      case 'update-list': {
        const list = await subscriberService.updateList(data.list_id, data.updates);
        return NextResponse.json({ list });
      }

      case 'delete-list': {
        await subscriberService.deleteList(data.list_id);
        return NextResponse.json({ success: true });
      }

      // Segment operations
      case 'create-segment': {
        const segment = await subscriberService.createSegment(user.id, {
          name: data.name,
          description: data.description,
          type: data.type,
          conditions: data.conditions,
          condition_operator: data.condition_operator,
        });
        return NextResponse.json({ segment }, { status: 201 });
      }

      case 'update-segment': {
        const segment = await subscriberService.updateSegment(data.segment_id, data.updates);
        return NextResponse.json({ segment });
      }

      case 'delete-segment': {
        await subscriberService.deleteSegment(data.segment_id);
        return NextResponse.json({ success: true });
      }

      case 'preview-segment': {
        const segment = await subscriberService.getSegment(data.segment_id);
        if (!segment) {
          return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
        }
        const subscribers = await subscriberService.getSegmentSubscribers(segment);
        return NextResponse.json({
          count: subscribers.length,
          preview: subscribers.slice(0, 10),
        });
      }

      // Import operations
      case 'create-import': {
        const job = await subscriberService.createImportJob(user.id, {
          list_id: data.list_id,
          file_name: data.file_name,
          file_url: data.file_url,
          total_rows: data.total_rows,
          field_mapping: data.field_mapping,
          options: data.options,
        });
        return NextResponse.json({ job }, { status: 201 });
      }

      // Bulk operations
      case 'bulk-update-status': {
        await subscriberService.bulkUpdateStatus(data.subscriber_ids, data.status);
        return NextResponse.json({ success: true, count: data.subscriber_ids.length });
      }

      case 'bulk-add-to-list': {
        await subscriberService.bulkAddToList(data.subscriber_ids, data.list_id);
        return NextResponse.json({ success: true, count: data.subscriber_ids.length });
      }

      case 'bulk-remove-from-list': {
        await subscriberService.bulkRemoveFromList(data.subscriber_ids, data.list_id);
        return NextResponse.json({ success: true, count: data.subscriber_ids.length });
      }

      case 'bulk-add-tags': {
        await subscriberService.bulkAddTags(data.subscriber_ids, data.tags);
        return NextResponse.json({ success: true, count: data.subscriber_ids.length });
      }

      case 'bulk-delete': {
        await subscriberService.bulkDelete(data.subscriber_ids);
        return NextResponse.json({ success: true, count: data.subscriber_ids.length });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Subscriber operation failed', { error });
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update subscriber
// =====================================================
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriber_id, ...updates } = body;

    if (!subscriber_id) {
      return NextResponse.json({ error: 'subscriber_id required' }, { status: 400 });
    }

    const subscriber = await subscriberService.updateSubscriber(subscriber_id, updates);
    return NextResponse.json({ subscriber });
  } catch (error) {
    logger.error('Failed to update subscriber', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete subscriber
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscriberId = searchParams.get('id');

    if (!subscriberId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await subscriberService.deleteSubscriber(subscriberId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete subscriber', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
