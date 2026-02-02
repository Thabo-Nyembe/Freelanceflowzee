// =====================================================
// KAZI Calendar & Scheduling API - Main Route
// Events, availability & calendar management
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calendarService } from '@/lib/calendar/calendar-service';
import { createFeatureLogger } from '@/lib/logger';
import { getServerSession } from '@/lib/auth';

const logger = createFeatureLogger('calendar');

// Demo calendar events for investor demo
function getDemoEvents() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  return [
    {
      id: 'demo-event-1',
      title: 'Team Standup',
      description: 'Daily team sync meeting',
      event_type: 'meeting',
      start_time: `${today}T09:00:00Z`,
      end_time: `${today}T09:30:00Z`,
      all_day: false,
      timezone: 'UTC',
      location: 'Google Meet',
      location_type: 'virtual',
      meeting_url: 'https://meet.google.com/abc-defg-hij',
      status: 'confirmed',
      availability: 'busy',
      visibility: 'default',
      is_recurring: true,
      recurrence_frequency: 'daily',
      attendees: [
        { email: 'sarah@techcorp.com', name: 'Sarah Chen', status: 'accepted' },
        { email: 'mike@techcorp.com', name: 'Mike Johnson', status: 'accepted' }
      ],
      total_attendees: 2,
      rsvp_required: false,
      accepted_count: 2,
      declined_count: 0,
      tentative_count: 0,
      color: '#4285F4',
      priority: 'medium',
      reminders: [{ type: 'push', minutes_before: 10 }],
      reminder_sent: false,
      created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-event-2',
      title: 'Client Review: TechCorp Website',
      description: 'Review website redesign progress with TechCorp team',
      event_type: 'meeting',
      start_time: `${today}T14:00:00Z`,
      end_time: `${today}T15:00:00Z`,
      all_day: false,
      timezone: 'UTC',
      location: 'Zoom',
      location_type: 'virtual',
      meeting_url: 'https://zoom.us/j/123456789',
      status: 'confirmed',
      availability: 'busy',
      visibility: 'default',
      is_recurring: false,
      attendees: [
        { email: 'client@techcorp.com', name: 'David Lee', status: 'accepted' }
      ],
      total_attendees: 1,
      rsvp_required: true,
      accepted_count: 1,
      declined_count: 0,
      tentative_count: 0,
      color: '#0F9D58',
      priority: 'high',
      reminders: [{ type: 'email', minutes_before: 60 }, { type: 'push', minutes_before: 15 }],
      reminder_sent: false,
      created_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-event-3',
      title: 'Project Deadline: Brand Identity',
      description: 'Final delivery of brand identity package to StartupX',
      event_type: 'deadline',
      start_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      all_day: true,
      timezone: 'UTC',
      status: 'confirmed',
      availability: 'busy',
      visibility: 'default',
      is_recurring: false,
      total_attendees: 0,
      rsvp_required: false,
      accepted_count: 0,
      declined_count: 0,
      tentative_count: 0,
      color: '#DB4437',
      priority: 'urgent',
      reminders: [{ type: 'email', minutes_before: 1440 }],
      reminder_sent: false,
      created_at: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-event-4',
      title: 'Sprint Planning',
      description: 'Plan next sprint tasks and priorities',
      event_type: 'meeting',
      start_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T10:00:00Z',
      end_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T11:30:00Z',
      all_day: false,
      timezone: 'UTC',
      location: 'Conference Room A',
      location_type: 'in_person',
      status: 'confirmed',
      availability: 'busy',
      visibility: 'default',
      is_recurring: true,
      recurrence_frequency: 'weekly',
      attendees: [
        { email: 'team@kazi.app', name: 'Development Team', status: 'accepted' }
      ],
      total_attendees: 5,
      rsvp_required: false,
      accepted_count: 5,
      declined_count: 0,
      tentative_count: 0,
      color: '#F4B400',
      priority: 'high',
      reminders: [{ type: 'push', minutes_before: 30 }],
      reminder_sent: false,
      created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

// =====================================================
// GET - List events and calendar data
// =====================================================
export async function GET(request: NextRequest) {
  try {
    // Check for demo mode via query param, cookie, or header
    const { searchParams } = new URL(request.url);
    const isDemoMode =
      searchParams.get('demo') === 'true' ||
      request.cookies.get('demo_mode')?.value === 'true' ||
      request.headers.get('X-Demo-Mode') === 'true';

    // Try NextAuth session first
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    // Check for demo account or demo mode
    const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io';

    if (isDemoAccount || isDemoMode) {
      const action = searchParams.get('action');

      // Return demo data for all calendar queries
      const demoEvents = getDemoEvents();

      switch (action) {
        case 'upcoming-events':
          return NextResponse.json({ events: demoEvents, demo: true });
        case 'upcoming-bookings':
          return NextResponse.json({ bookings: [], demo: true });
        case 'booking-types':
          return NextResponse.json({ booking_types: [], demo: true });
        case 'availability':
          return NextResponse.json({ availabilities: [], demo: true });
        case 'available-slots':
          return NextResponse.json({ slots: [], demo: true });
        case 'calendar-syncs':
          return NextResponse.json({ syncs: [], demo: true });
        default:
          return NextResponse.json({ events: demoEvents, demo: true });
      }
    }

    // Fall back to Supabase auth for non-demo users
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const action = searchParams.get('action');

    switch (action) {
      case 'upcoming-events': {
        const days = parseInt(searchParams.get('days') || '7');
        const events = await calendarService.getUpcomingEvents(user.id, days);
        return NextResponse.json({ events });
      }

      case 'upcoming-bookings': {
        const days = parseInt(searchParams.get('days') || '7');
        const bookings = await calendarService.getUpcomingBookings(user.id, days);
        return NextResponse.json({ bookings });
      }

      case 'booking-types': {
        const bookingTypes = await calendarService.getBookingTypes(user.id);
        return NextResponse.json({ booking_types: bookingTypes });
      }

      case 'availability': {
        const availabilities = await calendarService.getAvailabilities(user.id);
        return NextResponse.json({ availabilities });
      }

      case 'available-slots': {
        const bookingTypeId = searchParams.get('booking_type_id');
        const date = searchParams.get('date');

        if (!bookingTypeId || !date) {
          return NextResponse.json(
            { error: 'booking_type_id and date are required' },
            { status: 400 }
          );
        }

        const slots = await calendarService.getAvailableSlots(user.id, bookingTypeId, date);
        return NextResponse.json({ slots });
      }

      case 'calendar-syncs': {
        const syncs = await calendarService.getCalendarSyncs(user.id);
        return NextResponse.json({ syncs });
      }

      default: {
        // List events with filters
        const params = {
          start_date: searchParams.get('start_date') || undefined,
          end_date: searchParams.get('end_date') || undefined,
          status: searchParams.get('status') || undefined,
          client_id: searchParams.get('client_id') || undefined,
          project_id: searchParams.get('project_id') || undefined,
        };

        const events = await calendarService.getEvents(user.id, params);
        return NextResponse.json({ events });
      }
    }
  } catch (error) {
    logger.error('Calendar GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create events, booking types, etc.
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
      case 'create-event': {
        const event = await calendarService.createEvent(user.id, {
          title: data.title,
          description: data.description,
          start_time: data.start_time,
          end_time: data.end_time,
          all_day: data.all_day,
          location: data.location,
          location_type: data.location_type,
          video_url: data.video_url,
          color: data.color,
          visibility: data.visibility,
          recurrence_rule: data.recurrence_rule,
          recurrence_end: data.recurrence_end,
          client_id: data.client_id,
          project_id: data.project_id,
          attendees: data.attendees,
          reminders: data.reminders,
        });
        return NextResponse.json({ event }, { status: 201 });
      }

      case 'create-booking-type': {
        const bookingType = await calendarService.createBookingType(user.id, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          duration_minutes: data.duration_minutes,
          buffer_before: data.buffer_before,
          buffer_after: data.buffer_after,
          color: data.color,
          price: data.price,
          currency: data.currency,
          location_type: data.location_type,
          location_details: data.location_details,
          custom_questions: data.custom_questions,
          confirmation_message: data.confirmation_message,
          cancellation_policy: data.cancellation_policy,
          requires_approval: data.requires_approval,
          max_bookings_per_day: data.max_bookings_per_day,
          min_notice_hours: data.min_notice_hours,
          max_advance_days: data.max_advance_days,
          is_public: data.is_public,
        });
        return NextResponse.json({ booking_type: bookingType }, { status: 201 });
      }

      case 'create-availability': {
        const availability = await calendarService.createAvailability(user.id, {
          name: data.name,
          timezone: data.timezone,
          schedule: data.schedule,
          is_default: data.is_default,
        });
        return NextResponse.json({ availability }, { status: 201 });
      }

      case 'add-date-override': {
        const availability = await calendarService.addDateOverride(
          data.availability_id,
          user.id,
          {
            date: data.date,
            available: data.available,
            slots: data.slots,
            reason: data.reason,
          }
        );
        return NextResponse.json({ availability });
      }

      case 'create-calendar-sync': {
        const sync = await calendarService.createCalendarSync(user.id, {
          provider: data.provider,
          calendar_id: data.calendar_id,
          calendar_name: data.calendar_name,
          sync_direction: data.sync_direction,
          credentials: data.credentials,
        });
        return NextResponse.json({ sync }, { status: 201 });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Calendar POST error', { error });
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Update calendar events
// =====================================================
export async function PATCH(request: NextRequest) {
  try {
    // Check for demo mode via query param, cookie, or header
    const { searchParams } = new URL(request.url);
    const isDemoMode =
      searchParams.get('demo') === 'true' ||
      request.cookies.get('demo_mode')?.value === 'true' ||
      request.headers.get('X-Demo-Mode') === 'true';

    // Try NextAuth session first
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    // Check for demo account or demo mode
    const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io';

    if (isDemoAccount || isDemoMode) {
      const body = await request.json();
      const eventId = searchParams.get('id') || body.id;

      if (!eventId) {
        return NextResponse.json(
          { error: 'Event ID is required' },
          { status: 400 }
        );
      }

      // Return mock updated event for demo mode
      const demoEvents = getDemoEvents();
      const existingEvent = demoEvents.find(e => e.id === eventId);

      if (!existingEvent) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      const updatedEvent = {
        ...existingEvent,
        ...body,
        id: eventId, // Ensure ID is preserved
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({ event: updatedEvent, demo: true });
    }

    // Fall back to Supabase auth for non-demo users
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const eventId = searchParams.get('id') || body.id;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Extract update fields from body
    const { id, ...updates } = body;

    const event = await calendarService.updateEvent(eventId, user.id, {
      title: updates.title,
      description: updates.description,
      start_time: updates.start_time,
      end_time: updates.end_time,
      all_day: updates.all_day,
      location: updates.location,
      location_type: updates.location_type,
      video_url: updates.video_url,
      color: updates.color,
      visibility: updates.visibility,
      recurrence_rule: updates.recurrence_rule,
      recurrence_end: updates.recurrence_end,
      client_id: updates.client_id,
      project_id: updates.project_id,
      attendees: updates.attendees,
      reminders: updates.reminders,
    });

    return NextResponse.json({ event });
  } catch (error) {
    logger.error('Calendar PATCH error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete calendar events
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    // Check for demo mode via query param, cookie, or header
    const { searchParams } = new URL(request.url);
    const isDemoMode =
      searchParams.get('demo') === 'true' ||
      request.cookies.get('demo_mode')?.value === 'true' ||
      request.headers.get('X-Demo-Mode') === 'true';

    // Try NextAuth session first
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    // Check for demo account or demo mode
    const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io';

    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (isDemoAccount || isDemoMode) {
      // Check if event exists in demo data
      const demoEvents = getDemoEvents();
      const existingEvent = demoEvents.find(e => e.id === eventId);

      if (!existingEvent) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Event deleted successfully',
        demo: true
      });
    }

    // Fall back to Supabase auth for non-demo users
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deleteRecurring = searchParams.get('delete_recurring') === 'true';

    await calendarService.deleteEvent(eventId, user.id, deleteRecurring);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    logger.error('Calendar DELETE error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
