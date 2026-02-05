// =====================================================
// KAZI Calendar API - Single Event Route
// Individual event operations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calendarService } from '@/lib/calendar/calendar-service';
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';


const logger = createSimpleLogger('calendar-events');

// =====================================================
// GET - Get event details
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await calendarService.getEvent(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.user_id !== user.id) {
      // Check if user is an attendee
      const isAttendee = event.attendees.some(a => a.email === user.email);
      if (!isAttendee) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return NextResponse.json({ event });
  } catch (error) {
    logger.error('Event GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update event
// =====================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const event = await calendarService.updateEvent(eventId, user.id, body);
    return NextResponse.json({ event });
  } catch (error) {
    logger.error('Event PUT error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Quick event updates (status, attendee response)
// =====================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Attendee response
    if (body.attendee_response && user.email) {
      const event = await calendarService.updateAttendeeStatus(
        eventId,
        user.email,
        body.attendee_response
      );
      return NextResponse.json({ event });
    }

    // Quick status update
    if (body.status) {
      const event = await calendarService.updateEvent(eventId, user.id, { status: body.status });
      return NextResponse.json({ event });
    }

    // Partial update
    const event = await calendarService.updateEvent(eventId, user.id, body);
    return NextResponse.json({ event });
  } catch (error) {
    logger.error('Event PATCH error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete event
// =====================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deleteRecurring = searchParams.get('delete_recurring') === 'true';

    await calendarService.deleteEvent(eventId, user.id, deleteRecurring);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Event DELETE error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
