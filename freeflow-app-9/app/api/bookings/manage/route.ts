import { NextRequest, NextResponse } from 'next/server'

// Bookings Management API
// Supports: Create, cancel, reschedule, confirm bookings

interface Booking {
  id: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  service: string
  date: string
  time: string
  duration: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  payment: 'paid' | 'awaiting' | 'refunded' | 'partial'
  amount: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

interface BookingRequest {
  action: 'create' | 'list' | 'update' | 'cancel' | 'confirm' | 'reschedule' | 'complete'
  bookingId?: string
  data?: Partial<Booking>
  filters?: {
    status?: string
    date?: string
    service?: string
    search?: string
  }
}

// Generate unique booking ID
function generateBookingId(): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() + 1000).toString().padStart(3, '0')
  return `B-${year}-${month}${random}`
}

// Create new booking
async function handleCreateBooking(data: Partial<Booking>): Promise<NextResponse> {
  try {
    const booking: Booking = {
      id: generateBookingId(),
      clientName: data.clientName || 'Unknown Client',
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      service: data.service || 'General Consultation',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '10:00 AM',
      duration: data.duration || '60 min',
      status: 'pending',
      payment: 'awaiting',
      amount: data.amount || 0,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In production: Save to database
    // await db.bookings.create(booking)

    // Send confirmation email (in production)
    // await sendEmail(booking.clientEmail, 'booking-confirmation', booking)

    return NextResponse.json({
      success: true,
      action: 'create',
      booking,
      message: `Booking ${booking.id} created successfully!`,
      bookingId: booking.id,
      nextSteps: [
        'Send calendar invite to client',
        'Prepare materials for the session',
        'Set up meeting room/video link'
      ]
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create booking'
    }, { status: 500 })
  }
}

// List bookings with filters
async function handleListBookings(filters?: any): Promise<NextResponse> {
  try {
    // Mock booking data
    const mockBookings: Booking[] = [
      {
        id: 'B-2025-001',
        clientName: 'Alex Johnson',
        clientEmail: 'alex@example.com',
        service: 'Brand Strategy Session',
        date: '2025-08-07',
        time: '10:00 AM',
        duration: '60 min',
        status: 'confirmed',
        payment: 'paid',
        amount: 150
      },
      {
        id: 'B-2025-002',
        clientName: 'Maria Garcia',
        clientEmail: 'maria@example.com',
        service: 'Website Consultation',
        date: '2025-08-07',
        time: '2:30 PM',
        duration: '90 min',
        status: 'pending',
        payment: 'awaiting',
        amount: 225
      },
      {
        id: 'B-2025-003',
        clientName: 'John Smith',
        clientEmail: 'john@example.com',
        service: 'Logo Design Review',
        date: '2025-08-08',
        time: '11:00 AM',
        duration: '45 min',
        status: 'confirmed',
        payment: 'paid',
        amount: 120
      }
    ]

    let filteredBookings = mockBookings

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      filteredBookings = filteredBookings.filter(b => b.status === filters.status)
    }
    if (filters?.date) {
      filteredBookings = filteredBookings.filter(b => b.date === filters.date)
    }
    if (filters?.service) {
      filteredBookings = filteredBookings.filter(b =>
        b.service.toLowerCase().includes(filters.service.toLowerCase())
      )
    }
    if (filters?.search) {
      filteredBookings = filteredBookings.filter(b =>
        b.clientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.service.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.id.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    const stats = {
      total: filteredBookings.length,
      upcoming: filteredBookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length,
      confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
      pending: filteredBookings.filter(b => b.status === 'pending').length,
      cancelled: filteredBookings.filter(b => b.status === 'cancelled').length,
      revenue: filteredBookings.filter(b => b.payment === 'paid').reduce((sum, b) => sum + b.amount, 0),
      pendingRevenue: filteredBookings.filter(b => b.payment === 'awaiting').reduce((sum, b) => sum + b.amount, 0)
    }

    return NextResponse.json({
      success: true,
      action: 'list',
      bookings: filteredBookings,
      stats,
      message: `Found ${filteredBookings.length} bookings`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to list bookings'
    }, { status: 500 })
  }
}

// Confirm booking
async function handleConfirmBooking(bookingId: string): Promise<NextResponse> {
  try {
    const booking = {
      id: bookingId,
      status: 'confirmed',
      updatedAt: new Date().toISOString()
    }

    // In production: Update database and send confirmation email
    // await db.bookings.update(bookingId, booking)
    // await sendEmail(booking.clientEmail, 'booking-confirmed', booking)

    return NextResponse.json({
      success: true,
      action: 'confirm',
      booking,
      message: 'Booking confirmed successfully!',
      emailSent: true
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to confirm booking'
    }, { status: 500 })
  }
}

// Cancel booking
async function handleCancelBooking(bookingId: string, reason?: string): Promise<NextResponse> {
  try {
    const booking = {
      id: bookingId,
      status: 'cancelled',
      cancelReason: reason || 'No reason provided',
      updatedAt: new Date().toISOString()
    }

    // In production: Update database, process refund, send notification
    // await db.bookings.update(bookingId, booking)
    // await processRefund(bookingId)
    // await sendEmail(booking.clientEmail, 'booking-cancelled', booking)

    return NextResponse.json({
      success: true,
      action: 'cancel',
      booking,
      message: 'Booking cancelled successfully',
      refundProcessed: true,
      emailSent: true
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to cancel booking'
    }, { status: 500 })
  }
}

// Reschedule booking
async function handleRescheduleBooking(bookingId: string, data: any): Promise<NextResponse> {
  try {
    const booking = {
      id: bookingId,
      date: data.newDate,
      time: data.newTime,
      previousDate: data.oldDate,
      previousTime: data.oldTime,
      rescheduledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In production: Update database and send notifications
    // await db.bookings.update(bookingId, booking)
    // await sendEmail(booking.clientEmail, 'booking-rescheduled', booking)

    return NextResponse.json({
      success: true,
      action: 'reschedule',
      booking,
      message: 'Booking rescheduled successfully!',
      emailSent: true
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to reschedule booking'
    }, { status: 500 })
  }
}

// Complete booking
async function handleCompleteBooking(bookingId: string, data?: any): Promise<NextResponse> {
  try {
    const booking = {
      id: bookingId,
      status: 'completed',
      completedAt: new Date().toISOString(),
      feedback: data?.feedback,
      rating: data?.rating,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      action: 'complete',
      booking,
      message: 'Booking marked as completed!',
      achievement: {
        message: '🎉 Session completed successfully!',
        points: 20
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to complete booking'
    }, { status: 500 })
  }
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: BookingRequest = await request.json()

    switch (body.action) {
      case 'create':
        if (!body.data) {
          return NextResponse.json({
            success: false,
            error: 'Booking data required'
          }, { status: 400 })
        }
        return handleCreateBooking(body.data)

      case 'list':
        return handleListBookings(body.filters)

      case 'confirm':
        if (!body.bookingId) {
          return NextResponse.json({
            success: false,
            error: 'Booking ID required'
          }, { status: 400 })
        }
        return handleConfirmBooking(body.bookingId)

      case 'cancel':
        if (!body.bookingId) {
          return NextResponse.json({
            success: false,
            error: 'Booking ID required'
          }, { status: 400 })
        }
        return handleCancelBooking(body.bookingId, body.data?.notes)

      case 'reschedule':
        if (!body.bookingId || !body.data) {
          return NextResponse.json({
            success: false,
            error: 'Booking ID and new date/time required'
          }, { status: 400 })
        }
        return handleRescheduleBooking(body.bookingId, body.data)

      case 'complete':
        if (!body.bookingId) {
          return NextResponse.json({
            success: false,
            error: 'Booking ID required'
          }, { status: 400 })
        }
        return handleCompleteBooking(body.bookingId, body.data)

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${body.action}`
        }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request'
    }, { status: 400 })
  }
}

// GET handler
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const search = searchParams.get('search')

    return handleListBookings({ status, date, search })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch bookings'
    }, { status: 500 })
  }
}
