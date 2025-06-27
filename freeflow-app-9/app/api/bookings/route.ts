import { NextRequest, NextResponse } from 'next/server'
import { BookingService, Booking } from '@/types/booking'
import { stripeEnhanced } from '@/lib/stripe-enhanced-v2'
import { createClient } from '@/lib/supabase/server'

// Use the exported instance
const stripeService = stripeEnhanced

// Mock services data - in production, this would come from a database
const MOCK_SERVICES: BookingService[] = [
  {
    id: 'service-1',
    title: 'Initial Consultation',
    description: 'Comprehensive project consultation and planning session',
    duration: 90,
    price: 15000, // $150.00 in cents
    category: 'consultation',
    freelancerId: 'user1',
    isActive: true,
    maxAdvanceBooking: 30,
    bufferTime: 15,
    tags: ['strategy', 'planning', 'consultation'],
    requirements: ['Project brief', 'Business goals document'],
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' }
    }
  },
  {
    id: 'service-2',
    title: 'Design Review',
    description: 'Review and feedback session for design deliverables',
    duration: 60,
    price: 12000, // $120.00 in cents
    category: 'review',
    freelancerId: 'user1',
    isActive: true,
    maxAdvanceBooking: 14,
    bufferTime: 10,
    tags: ['design', 'review', 'feedback'],
    requirements: ['Design files', 'Revision notes'],
    availability: {
      monday: { start: '10:00', end: '16:00' },
      tuesday: { start: '10:00', end: '16:00' },
      wednesday: { start: '10:00', end: '16:00' },
      thursday: { start: '10:00', end: '16:00' },
      friday: { start: '10:00', end: '16:00' }
    }
  },
  {
    id: 'service-3',
    title: 'Development Workshop',
    description: 'Hands-on development session and technical guidance',
    duration: 120,
    price: 25000, // $250.00 in cents
    category: 'workshop',
    freelancerId: 'user1',
    isActive: true,
    maxAdvanceBooking: 21,
    bufferTime: 20,
    tags: ['development', 'workshop', 'technical'],
    requirements: ['Development environment setup', 'Code repository access'],
    availability: {
      monday: { start: '09:00', end: '15:00' },
      wednesday: { start: '09:00', end: '15:00' },
      friday: { start: '09:00', end: '15:00' }
    }
  }
]

// Mock bookings storage - in production, this would be a database
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    clientId: 'client1',
    clientEmail: 'john@example.com',
    clientName: 'John Smith',
    clientPhone: '+1 (555) 123-4567',
    freelancerId: 'user1',
    serviceId: 'service-1',
    timeSlotId: 'slot-1',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentIntentId: 'pi_1234567890',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    totalAmount: 15000,
    notes: 'Looking forward to discussing the new e-commerce project',
    requirements: ['Project brief', 'Business goals document'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Use inline type definitions
type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// POST: Create a new booking with Stripe payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      serviceId, 
      timeSlotId, 
      clientName, 
      clientEmail, 
      clientPhone, 
      notes, 
      requirements = [],
      selectedDate,
      selectedTime
    } = body

    // Validate required fields
    if (!serviceId || !timeSlotId || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, timeSlotId, clientName, clientEmail' },
        { status: 400 }
      )
    }

    // Find the service
    const service = MOCK_SERVICES.find(s => s.id === serviceId)
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Check if service is active
    if (!service.isActive) {
      return NextResponse.json(
        { error: 'Service is not available for booking' },
        { status: 400 }
      )
    }

    // Create Stripe customer if doesn't exist
    const customerResult = await stripeService.createEnhancedCustomer({
      email: clientEmail,
      name: clientName,
      phone: clientPhone,
      metadata: {
        source: 'booking_system',
        service_id: serviceId,
        service_title: service.title
      }
    })

    if (!customerResult.success) {
      console.error('Failed to create customer:', customerResult.error)
      return NextResponse.json(
        { error: 'Failed to process payment setup' },
        { status: 500 }
      )
    }

    // Create Stripe Payment Intent
    const paymentResult = await stripeService.createEnhancedPaymentIntent({
      amount: service.price,
      currency: 'usd',
      metadata: {
        booking_type: 'service_booking',
        service_id: serviceId,
        service_title: service.title,
        client_name: clientName,
        client_email: clientEmail,
        duration: service.duration.toString(),
        selected_date: selectedDate || '','
        selected_time: selectedTime || '
      },
      paymentMethods: ['card', 'apple_pay', 'google_pay', 'link'],
      setupFutureUsage: 'off_session' // Save payment method for future bookings
    })

    if (!paymentResult.success) {
      console.error('Failed to create payment intent:', paymentResult.error)
      return NextResponse.json(
        { error: 'Failed to create payment intent' },
        { status: 500 }
      )
    }

    // Calculate booking time
    const startTime = selectedDate && selectedTime 
      ? new Date(`${selectedDate}T${selectedTime}`).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Default to tomorrow

    const endTime = new Date(new Date(startTime).getTime() + service.duration * 60 * 1000).toISOString()

    // Create booking
    const bookingId = `booking-${Date.now()}`
    const newBooking: Booking = {
      id: bookingId,
      clientId: customerResult.customer?.id || 'unknown-client',
      serviceId,
      freelancerId: service.freelancerId,
      clientName,
      clientEmail,
      clientPhone,
      timeSlotId,
      status: 'pending',
      paymentStatus: 'pending',
      startTime,
      endTime,
      totalAmount: service.price,
      notes,
      requirements,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentIntentId: paymentResult.paymentIntent?.id
    }

    // Add to mock storage
    MOCK_BOOKINGS.push(newBooking)

    // Return success response with client secret for Stripe
    return NextResponse.json({
      booking: newBooking,
      clientSecret: paymentResult.clientSecret,
      publishableKey: paymentResult.publishableKey,
      message: 'Booking created successfully. Complete payment to confirm.'
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// GET: Fetch bookings (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientEmail = searchParams.get('clientEmail')
    const freelancerId = searchParams.get('freelancerId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')'

    let filteredBookings = [...MOCK_BOOKINGS]

    // Apply filters
    if (status) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.status === status
      )
    }

    if (clientEmail) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.clientEmail.toLowerCase().includes(clientEmail.toLowerCase())
      )
    }

    if (freelancerId) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.freelancerId === freelancerId
      )
    }

    // Apply pagination
    const paginatedBookings = filteredBookings.slice(offset, offset + limit)

    // Enrich bookings with service details
    const enrichedBookings = paginatedBookings.map(booking => {
      const service = MOCK_SERVICES.find(s => s.id === booking.serviceId)
      return {
        ...booking,
        service: service ? {
          title: service.title,
          description: service.description,
          category: service.category,
          duration: service.duration
        } : null
      }
    })

    return NextResponse.json({
      bookings: enrichedBookings,
      total: filteredBookings.length,
      hasMore: offset + limit < filteredBookings.length
    })

  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// PUT: Update booking status (usually called by webhook or manual admin action)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, status, paymentStatus, stripePaymentIntentId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing bookingId' },
        { status: 400 }
      )
    }

    // Find booking
    const bookingIndex = MOCK_BOOKINGS.findIndex(b => b.id === bookingId)
    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const booking = MOCK_BOOKINGS[bookingIndex]

    // Update fields
    if (status) {
      booking.status = status
      
      // Auto-confirm if payment is successful
      if (status === 'confirmed' && booking.paymentStatus === 'paid') {
        // In a real app, you might send confirmation emails here
        console.log(`Booking ${bookingId} confirmed for ${booking.clientEmail}`)
      }
    }
    
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus
      
      // Auto-confirm booking if payment succeeds
      if (paymentStatus === 'paid' && booking.status === 'pending') {
        booking.status = 'confirmed'
      }
    }
    
    if (stripePaymentIntentId) booking.paymentIntentId = stripePaymentIntentId
    booking.updatedAt = new Date().toISOString()

    // Update in mock storage
    MOCK_BOOKINGS[bookingIndex] = booking

    return NextResponse.json({
      booking,
      message: 'Booking updated successfully'
    })

  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
} 