// =====================================================
// KAZI Events API - Database-Wired
// World-class event management with real database
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

const logger = createSimpleLogger('events');

// =====================================================
// GET - List events or export data
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'export': {
        // Export all events data
        const format = searchParams.get('format') || 'json';
        const includeEvents = searchParams.get('events') !== 'false';
        const includeAttendees = searchParams.get('attendees') !== 'false';
        const includeOrders = searchParams.get('orders') !== 'false';
        const includeAnalytics = searchParams.get('analytics') !== 'false';

        const exportData: Record<string, any> = {
          exportedAt: new Date().toISOString(),
          exportedBy: user.id,
        };

        if (includeEvents) {
          const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .eq('user_id', user.id)
            .is('deleted_at', null)
            .order('start_date', { ascending: false });

          if (eventsError) throw eventsError;
          exportData.events = events || [];
        }

        // Note: attendees, orders, and analytics tables would be queried similarly
        // For now, we return placeholder data for those sections
        if (includeAttendees) {
          exportData.attendees = [];
        }

        if (includeOrders) {
          exportData.orders = [];
        }

        if (includeAnalytics) {
          exportData.analytics = {
            totalEvents: exportData.events?.length || 0,
            exportedAt: new Date().toISOString(),
          };
        }

        return NextResponse.json({
          success: true,
          data: exportData,
          format,
          message: 'Data exported successfully',
        });
      }

      default: {
        // List all events
        const status = searchParams.get('status');
        const eventType = searchParams.get('eventType');
        const limit = searchParams.get('limit');

        let query = supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('start_date', { ascending: false });

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        if (eventType && eventType !== 'all') {
          query = query.eq('event_type', eventType);
        }

        if (limit) {
          query = query.limit(parseInt(limit));
        }

        const { data: events, error } = await query;

        if (error) throw error;

        return NextResponse.json({
          success: true,
          events: events || [],
          total: events?.length || 0,
        });
      }
    }
  } catch (error) {
    logger.error('Events GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create event
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      event_type,
      status,
      start_date,
      end_date,
      timezone,
      location_type,
      venue_name,
      venue_address,
      virtual_link,
      max_attendees,
      is_public,
      is_featured,
      tags,
    } = body;

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        name,
        description,
        event_type: event_type || 'other',
        status: status || 'upcoming',
        start_date,
        end_date,
        timezone: timezone || 'UTC',
        location_type,
        venue_name,
        venue_address,
        virtual_link,
        max_attendees,
        is_public: is_public ?? true,
        is_featured: is_featured ?? false,
        tags,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      event,
      message: 'Event created successfully',
    }, { status: 201 });
  } catch (error) {
    logger.error('Events POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update event
// =====================================================
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const { data: event, error } = await supabase
      .from('events')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    logger.error('Events PUT error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete event(s)
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('all') === 'true';

    if (deleteAll) {
      // Delete all events for the user (soft delete)
      const { error } = await supabase
        .from('events')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'All events deleted successfully',
      });
    }

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Soft delete single event
    const { error } = await supabase
      .from('events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    logger.error('Events DELETE error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
