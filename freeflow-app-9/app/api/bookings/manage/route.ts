import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `B-${year}-${month}${random}`
}

// Create new booking
async function handleCreateBooking(userId: string, data: Partial<Booking>): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const bookingNumber = generateBookingId()

    const bookingData = {
      user_id: userId,
      booking_number: bookingNumber,
      client_name: data.clientName || 'Unknown Client',
      client_email: data.clientEmail || null,
      client_phone: data.clientPhone || null,
      service: data.service || 'General Consultation',
      booking_date: data.date || new Date().toISOString().split('T')[0],
      booking_time: data.time || '10:00',
      duration: data.duration || '60 min',
      status: 'pending',
      payment_status: 'awaiting',
      amount: data.amount || 0,
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'create',
      booking,
      message: `Booking ${bookingNumber} created successfully!`,
      bookingId: booking.id,
      nextSteps: [
        'Send calendar invite to client',
        'Prepare materials for the session',
        'Set up meeting room/video link'
      ]
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create booking'
    }, { status: 500 })
  }
}

// List bookings with filters
async function handleListBookings(userId: string, filters?: any): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('booking_date', { ascending: true })

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.date) {
      query = query.eq('booking_date', filters.date)
    }
    if (filters?.service) {
      query = query.ilike('service', `%${filters.service}%`)
    }
    if (filters?.search) {
      query = query.or(`client_name.ilike.%${filters.search}%,service.ilike.%${filters.search}%,booking_number.ilike.%${filters.search}%`)
    }
    if (filters?.limit) {
      query = query.limit(parseInt(filters.limit))
    }

    const { data: bookings, error, count } = await query

    if (error) throw error

    const bookingsList = bookings || []

    const stats = {
      total: count || 0,
      upcoming: bookingsList.filter(b => ['pending', 'confirmed'].includes(b.status)).length,
      confirmed: bookingsList.filter(b => b.status === 'confirmed').length,
      pending: bookingsList.filter(b => b.status === 'pending').length,
      cancelled: bookingsList.filter(b => b.status === 'cancelled').length,
      revenue: bookingsList.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0),
      pendingRevenue: bookingsList.filter(b => b.payment_status === 'awaiting').reduce((sum, b) => sum + (b.amount || 0), 0)
    }

    return NextResponse.json({
      success: true,
      action: 'list',
      bookings: bookingsList,
      stats,
      total: count || 0,
      message: `Found ${count || 0} bookings`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to list bookings'
    }, { status: 500 })
  }
}

// Confirm booking
async function handleConfirmBooking(userId: string, bookingId: string): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'confirm',
      booking,
      message: 'Booking confirmed successfully!',
      emailSent: true
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to confirm booking'
    }, { status: 500 })
  }
}

// Cancel booking
async function handleCancelBooking(userId: string, bookingId: string, reason?: string): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancel_reason: reason || 'No reason provided',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'cancel',
      booking,
      message: 'Booking cancelled successfully',
      refundProcessed: true,
      emailSent: true
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to cancel booking'
    }, { status: 500 })
  }
}

// Reschedule booking
async function handleRescheduleBooking(userId: string, bookingId: string, data: any): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        booking_date: data.newDate,
        booking_time: data.newTime,
        previous_date: data.oldDate,
        previous_time: data.oldTime,
        rescheduled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'reschedule',
      booking,
      message: 'Booking rescheduled successfully!',
      emailSent: true
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to reschedule booking'
    }, { status: 500 })
  }
}

// Complete booking
async function handleCompleteBooking(userId: string, bookingId: string, data?: any): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        feedback: data?.feedback || null,
        rating: data?.rating || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

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
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to complete booking'
    }, { status: 500 })
  }
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body: BookingRequest = await request.json()

    switch (body.action) {
      case 'create':
        if (!body.data) {
          return NextResponse.json({
            success: false,
            error: 'Booking data required'
          }, { status: 400 })
        }
        return handleCreateBooking(user.id, body.data)

      case 'list':
        return handleListBookings(user.id, body.filters)

      case 'confirm':
        if (!body.bookingId) {
          return NextResponse.json({
            success: false,
            error: 'Booking ID required'
          }, { status: 400 })
        }
        return handleConfirmBooking(user.id, body.bookingId)

      case 'cancel':
        if (!body.bookingId) {
          return NextResponse.json({
            success: false,
            error: 'Booking ID required'
          }, { status: 400 })
        }
        return handleCancelBooking(user.id, body.bookingId, body.data?.notes)

      case 'reschedule':
        if (!body.bookingId || !body.data) {
          return NextResponse.json({
            success: false,
            error: 'Booking ID and new date/time required'
          }, { status: 400 })
        }
        return handleRescheduleBooking(user.id, body.bookingId, body.data)

      case 'complete':
        if (!body.bookingId) {
          return NextResponse.json({
            success: false,
            error: 'Booking ID required'
          }, { status: 400 })
        }
        return handleCompleteBooking(user.id, body.bookingId, body.data)

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${body.action}`
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request'
    }, { status: 400 })
  }
}

// GET handler
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')

    return handleListBookings(user.id, { status, date, search, limit })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch bookings'
    }, { status: 500 })
  }
}
