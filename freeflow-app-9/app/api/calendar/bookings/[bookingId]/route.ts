// =====================================================
// KAZI Calendar API - Single Booking Route
// Individual booking operations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calendarService } from '@/lib/calendar/calendar-service';
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

const logger = createSimpleLogger('calendar-bookings');

// =====================================================
// GET - Get booking details
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const booking = await calendarService.getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Public access: Allow client to view their own booking
    const { searchParams } = new URL(request.url);
    const clientEmail = searchParams.get('email');

    if (!user) {
      // Public access - verify email matches
      if (clientEmail && clientEmail === booking.client_email) {
        return NextResponse.json({
          booking: {
            id: booking.id,
            status: booking.status,
            start_time: booking.start_time,
            end_time: booking.end_time,
            location: booking.location,
            video_url: booking.video_url,
          },
        });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Authenticated access
    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get booking type info
    const bookingType = await calendarService.getBookingType(booking.booking_type_id);

    return NextResponse.json({
      booking,
      booking_type: bookingType ? {
        name: bookingType.name,
        duration_minutes: bookingType.duration_minutes,
        location_type: bookingType.location_type,
      } : null,
    });
  } catch (error) {
    logger.error('Booking GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update booking
// =====================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Reschedule
    if (body.start_time) {
      const booking = await calendarService.rescheduleBooking(
        bookingId,
        user.id,
        body.start_time
      );
      return NextResponse.json({ booking });
    }

    // Update notes
    if (body.internal_notes !== undefined) {
      const booking = await calendarService.updateBookingStatus(
        bookingId,
        user.id,
        body.status || 'confirmed',
        body.internal_notes
      );
      return NextResponse.json({ booking });
    }

    return NextResponse.json(
      { error: 'No valid update fields provided' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Booking PUT error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Quick booking updates (status changes)
// =====================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json();

    // Public cancellation by client
    if (body.client_cancel && body.client_email) {
      const booking = await calendarService.getBooking(bookingId);
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      if (booking.client_email !== body.client_email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Use user_id from booking for cancellation
      const updated = await calendarService.updateBookingStatus(
        bookingId,
        booking.user_id,
        'cancelled',
        body.reason || 'Cancelled by client'
      );

      return NextResponse.json({
        booking: { id: updated.id, status: updated.status },
        message: 'Booking cancelled successfully',
      });
    }

    // Authenticated status updates
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (body.status) {
      const booking = await calendarService.updateBookingStatus(
        bookingId,
        user.id,
        body.status,
        body.notes
      );
      return NextResponse.json({ booking });
    }

    return NextResponse.json(
      { error: 'No valid update fields provided' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Booking PATCH error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Cancel/Delete booking
// =====================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Cancelled by host';

    await calendarService.updateBookingStatus(bookingId, user.id, 'cancelled', reason);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Booking DELETE error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
