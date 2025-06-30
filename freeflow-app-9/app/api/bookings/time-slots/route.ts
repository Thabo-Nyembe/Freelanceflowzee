import { NextRequest, NextResponse } from 'next/server'
import { TimeSlot } from '@/types/booking'
import { format, addDays, addMinutes, startOfDay, isAfter, isBefore, parseISO } from 'date-fns'

// Mock existing bookings to check for conflicts
const EXISTING_BOOKINGS = [
  {
    id: 'booking-1',
    serviceId: 'service-1',
    startTime: '2024-06-15T10:00:00.000Z',
    endTime: '2024-06-15T11:30:00.000Z'
  },
  {
    id: 'booking-2',
    serviceId: 'service-2',
    startTime: '2024-06-15T14:00:00.000Z',
    endTime: '2024-06-15T15:00:00.000Z'
  }
]

// Mock service availability
const SERVICE_AVAILABILITY = {
  'service-1': {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' }
  },
  'service-2': {
    monday: { start: '10:00', end: '16:00' },
    tuesday: { start: '10:00', end: '16:00' },
    wednesday: { start: '10:00', end: '16:00' },
    thursday: { start: '10:00', end: '16:00' },
    friday: { start: '10:00', end: '16:00' }
  },
  'service-3': {
    monday: { start: '09:00', end: '15:00' },
    wednesday: { start: '09:00', end: '15:00' },
    friday: { start: '09:00', end: '15:00' }
  }
}

// Service durations (in minutes)
const SERVICE_DURATIONS = {
  'service-1': 90, 'service-2': 60, 'service-3': 120, 'service-4': 90, 'service-5': 30
}

function getDayName(date: Date): keyof typeof SERVICE_AVAILABILITY['service-1'] {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
  return days[date.getDay()] as keyof typeof SERVICE_AVAILABILITY['service-1']
}

function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function isTimeSlotAvailable(
  serviceId: string,
  startTime: Date,
  endTime: Date
): boolean {
  // Check for conflicts with existing bookings
  for (const booking of EXISTING_BOOKINGS) {
    if (booking.serviceId === serviceId) {
      const bookingStart = parseISO(booking.startTime)
      const bookingEnd = parseISO(booking.endTime)
      
      // Check for overlap
      if (
        (isAfter(startTime, bookingStart) && isBefore(startTime, bookingEnd)) ||
        (isAfter(endTime, bookingStart) && isBefore(endTime, bookingEnd)) ||
        (isBefore(startTime, bookingStart) && isAfter(endTime, bookingEnd))
      ) {
        return false
      }
    }
  }
  
  return true
}

// Simple time slot generation for booking system
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const date = searchParams.get('date')

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing serviceId parameter' },
        { status: 400 }
      )
    }

    // Generate sample time slots (9 AM to 6 PM, 30-minute intervals)
    const timeSlots: TimeSlot[] = []
    const selectedDate = date ? new Date(date) : new Date()
    
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = new Date(selectedDate)
        startTime.setHours(hour, minute, 0, 0)
        
        const endTime = new Date(startTime)
        endTime.setHours(hour, minute + 30, 0, 0)
        
        timeSlots.push({
          id: `slot-${hour}-${minute}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isAvailable: true,
          serviceId,
          freelancerId: 'user1'
        })
      }
    }

    return NextResponse.json({
      timeSlots,
      total: timeSlots.length
    })

  } catch (error) {
    console.error('Time slots error:', error)
    return NextResponse.json(
      { error: 'Failed to generate time slots' },
      { status: 500 }
    )
  }
}

// POST: Block or reserve specific time slots
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, timeSlotIds, action = 'block', reason } = body

    if (!serviceId || !timeSlotIds || !Array.isArray(timeSlotIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, timeSlotIds (array)' },
        { status: 400 }
      )
    }

    // In a real application, this would update the database
    const results = timeSlotIds.map((slotId: string) => ({
      slotId,
      action,
      success: true,
      reason: reason || `Time slot ${action}ed by admin`
    }))

    return NextResponse.json({
      message: `Successfully ${action}ed ${timeSlotIds.length} time slots`,
      results
    })

  } catch (error) {
    console.error('Time slot management error:', error)
    return NextResponse.json(
      { error: 'Failed to manage time slots' },
      { status: 500 }
    )
  }
}

// PUT: Update time slot availability
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { timeSlotId, isAvailable, reason } = body

    if (!timeSlotId) {
      return NextResponse.json(
        { error: 'Missing timeSlotId' },
        { status: 400 }
      )
    }

    // In a real application, this would update the database
    const updatedSlot = {
      id: timeSlotId,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      updatedAt: new Date().toISOString(),
      reason: reason || 'Availability updated'
    }

    return NextResponse.json({
      timeSlot: updatedSlot,
      message: 'Time slot availability updated successfully'
    })

  } catch (error) {
    console.error('Time slot update error:', error)
    return NextResponse.json(
      { error: 'Failed to update time slot' },
      { status: 500 }
    )
  }
} 