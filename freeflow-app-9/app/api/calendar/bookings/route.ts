// =====================================================
// KAZI Calendar API - Bookings Route
// Public and authenticated booking operations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calendarService } from '@/lib/calendar/calendar-service';
import { createFeatureLogger } from '@/lib/logger';

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

const logger = createFeatureLogger('calendar-bookings');

// =====================================================
// GET - List bookings or get public booking info
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Public endpoint: Get booking type info for public booking page
    if (action === 'public-booking-type') {
      const userId = searchParams.get('user_id');
      const slug = searchParams.get('slug');

      if (!userId || !slug) {
        return NextResponse.json(
          { error: 'user_id and slug are required' },
          { status: 400 }
        );
      }

      const bookingType = await calendarService.getBookingTypeBySlug(userId, slug);
      if (!bookingType || !bookingType.is_active || !bookingType.is_public) {
        return NextResponse.json(
          { error: 'Booking type not found' },
          { status: 404 }
        );
      }

      // Return limited public info
      return NextResponse.json({
        booking_type: {
          id: bookingType.id,
          name: bookingType.name,
          description: bookingType.description,
          duration_minutes: bookingType.duration_minutes,
          color: bookingType.color,
          price: bookingType.price,
          currency: bookingType.currency,
          location_type: bookingType.location_type,
          custom_questions: bookingType.custom_questions,
          min_notice_hours: bookingType.min_notice_hours,
          max_advance_days: bookingType.max_advance_days,
        },
      });
    }

    // Public endpoint: Get available slots
    if (action === 'public-slots') {
      const bookingTypeId = searchParams.get('booking_type_id');
      const date = searchParams.get('date');

      if (!bookingTypeId || !date) {
        return NextResponse.json(
          { error: 'booking_type_id and date are required' },
          { status: 400 }
        );
      }

      const bookingType = await calendarService.getBookingType(bookingTypeId);
      if (!bookingType || !bookingType.is_active) {
        return NextResponse.json(
          { error: 'Booking type not found' },
          { status: 404 }
        );
      }

      const slots = await calendarService.getAvailableSlots(
        bookingType.user_id,
        bookingTypeId,
        date
      );
      return NextResponse.json({ slots });
    }

    // Authenticated endpoints below
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // List user's bookings
    const params = {
      booking_type_id: searchParams.get('booking_type_id') || undefined,
      status: searchParams.get('status') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      client_email: searchParams.get('client_email') || undefined,
    };

    const bookings = await calendarService.getBookings(user.id, params);
    return NextResponse.json({ bookings });
  } catch (error) {
    logger.error('Bookings GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create booking (public or authenticated)
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    // Public booking creation
    if (action === 'create-public-booking' || !action) {
      const booking = await calendarService.createBooking({
        booking_type_id: data.booking_type_id,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        start_time: data.start_time,
        answers: data.answers,
        notes: data.notes,
      });

      return NextResponse.json({
        booking: {
          id: booking.id,
          status: booking.status,
          start_time: booking.start_time,
          end_time: booking.end_time,
        },
        message: booking.status === 'pending'
          ? 'Booking request submitted. You will receive confirmation shortly.'
          : 'Booking confirmed! Check your email for details.',
      }, { status: 201 });
    }

    // Authenticated actions
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'confirm': {
        const booking = await calendarService.updateBookingStatus(
          data.booking_id,
          user.id,
          'confirmed',
          data.notes
        );
        return NextResponse.json({ booking });
      }

      case 'cancel': {
        const booking = await calendarService.updateBookingStatus(
          data.booking_id,
          user.id,
          'cancelled',
          data.cancellation_reason
        );
        return NextResponse.json({ booking });
      }

      case 'complete': {
        const booking = await calendarService.updateBookingStatus(
          data.booking_id,
          user.id,
          'completed',
          data.notes
        );
        return NextResponse.json({ booking });
      }

      case 'no-show': {
        const booking = await calendarService.updateBookingStatus(
          data.booking_id,
          user.id,
          'no_show',
          data.notes
        );
        return NextResponse.json({ booking });
      }

      case 'reschedule': {
        const booking = await calendarService.rescheduleBooking(
          data.booking_id,
          user.id,
          data.new_start_time
        );
        return NextResponse.json({ booking });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Bookings POST error', { error });
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
