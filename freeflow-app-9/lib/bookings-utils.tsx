/**
 * Bookings System Utilities
 *
 * Comprehensive appointment and booking management with scheduling,
 * availability tracking, reminders, and revenue calculations.
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('BookingsUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type PaymentStatus = 'awaiting' | 'paid' | 'partial' | 'refunded' | 'failed'
export type BookingType = 'consultation' | 'meeting' | 'service' | 'call' | 'workshop' | 'event'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
export type ReminderType = 'email' | 'sms' | 'push' | 'all'

export interface Booking {
  id: string
  userId: string
  clientId?: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  service: string
  type: BookingType
  date: string // ISO date string
  time: string
  duration: string // e.g., "60 min", "2 hours"
  durationMinutes: number
  status: BookingStatus
  payment: PaymentStatus
  amount: number
  currency: string
  location?: string
  meetingLink?: string
  notes?: string
  tags?: string[]
  recurrence?: RecurrenceType
  parentBookingId?: string
  reminderSent?: boolean
  reminderType?: ReminderType
  createdAt: string
  updatedAt: string
}

export interface BookingSlot {
  id: string
  userId: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  isAvailable: boolean
  slotDuration: number // minutes
  bufferTime: number // minutes between bookings
}

export interface BookingSettings {
  userId: string
  businessHoursStart: string
  businessHoursEnd: string
  timezone: string
  workingDays: number[] // 0-6
  slotDuration: number
  bufferTime: number
  advanceBookingDays: number
  cancellationPolicy: string
  autoConfirm: boolean
  requireDeposit: boolean
  depositPercentage: number
  sendReminders: boolean
  reminderHours: number[] // e.g., [24, 2] = 24h and 2h before
}

export interface BookingReminder {
  id: string
  bookingId: string
  type: ReminderType
  scheduledFor: string
  sent: boolean
  sentAt?: string
  failureReason?: string
}

export interface BookingStats {
  userId: string
  totalBookings: number
  confirmed: number
  pending: number
  completed: number
  cancelled: number
  noShows: number
  totalRevenue: number
  averageBookingValue: number
  mostPopularService: string
  peakBookingDay: string
  completionRate: number
  cancellationRate: number
  noShowRate: number
}

export interface TimeSlot {
  time: string
  isAvailable: boolean
  booking?: Booking
}

export interface DailyAvailability {
  date: string
  dayOfWeek: number
  slots: TimeSlot[]
  totalSlots: number
  availableSlots: number
  bookedSlots: number
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export const mockBookings: Booking[] = [
  {
    id: 'BK001',
    userId: 'user-1',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@email.com',
    clientPhone: '+1 (555) 123-4567',
    service: 'Website Design Consultation',
    type: 'consultation',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00 AM',
    duration: '60 min',
    durationMinutes: 60,
    status: 'confirmed',
    payment: 'paid',
    amount: 150,
    currency: 'USD',
    meetingLink: 'https://zoom.us/j/123456789',
    notes: 'Discussion about e-commerce redesign',
    tags: ['design', 'website'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'BK002',
    userId: 'user-1',
    clientName: 'Mike Rodriguez',
    clientEmail: 'mike@email.com',
    clientPhone: '+1 (555) 234-5678',
    service: 'Logo Design Review',
    type: 'meeting',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '2:00 PM',
    duration: '45 min',
    durationMinutes: 45,
    status: 'confirmed',
    payment: 'paid',
    amount: 100,
    currency: 'USD',
    location: 'Office - Room 3A',
    notes: 'Final logo concepts presentation',
    tags: ['branding', 'design'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'BK003',
    userId: 'user-1',
    clientName: 'Emma Thompson',
    clientEmail: 'emma@email.com',
    service: 'Brand Strategy Workshop',
    type: 'workshop',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '11:00 AM',
    duration: '2 hours',
    durationMinutes: 120,
    status: 'pending',
    payment: 'awaiting',
    amount: 300,
    currency: 'USD',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    notes: 'Comprehensive brand identity development session',
    tags: ['branding', 'strategy'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export function generateMockBookings(count: number = 30, userId: string = 'user-1'): Booking[] {
  const services = [
    'Website Design Consultation',
    'Logo Design Review',
    'Brand Strategy Workshop',
    'Video Production Meeting',
    'SEO Analysis Call',
    'Content Strategy Session',
    'UX Research Interview',
    'Mobile App Design Review',
    'Social Media Planning',
    'Marketing Consultation'
  ]

  const statuses: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']
  const paymentStatuses: PaymentStatus[] = ['awaiting', 'paid', 'partial', 'refunded']
  const types: BookingType[] = ['consultation', 'meeting', 'service', 'call', 'workshop']

  return Array.from({ length: count }, (_, i) => {
    const daysOut = Math.floor(Math.random() * 60) - 30 // -30 to +30 days
    const date = new Date(Date.now() + daysOut * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]

    return {
      id: `BK${String(i + 1).padStart(3, '0')}`,
      userId,
      clientName: `Client ${i + 1}`,
      clientEmail: `client${i + 1}@email.com`,
      clientPhone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      service: services[i % services.length],
      type: types[Math.floor(Math.random() * types.length)],
      date,
      time: `${Math.floor(Math.random() * 8) + 9}:${['00', '15', '30', '45'][Math.floor(Math.random() * 4)]} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
      duration: ['30 min', '45 min', '60 min', '90 min', '2 hours'][Math.floor(Math.random() * 5)],
      durationMinutes: [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)],
      status,
      payment: paymentStatus,
      amount: Math.floor(Math.random() * 300) + 50,
      currency: 'USD',
      meetingLink: Math.random() > 0.5 ? `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}` : undefined,
      location: Math.random() > 0.7 ? `Office - Room ${Math.floor(Math.random() * 10) + 1}` : undefined,
      notes: Math.random() > 0.5 ? 'Important discussion about project requirements' : undefined,
      tags: ['design', 'consulting', 'development'].slice(0, Math.floor(Math.random() * 3) + 1),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function filterBookings(
  bookings: Booking[],
  filters: {
    statusFilter?: string
    dateFilter?: string
    serviceFilter?: string
    searchQuery?: string
  }
): Booking[] {
  let filtered = [...bookings]

  // Status filter
  if (filters.statusFilter && filters.statusFilter !== 'all') {
    filtered = filtered.filter(b => b.status === filters.statusFilter)
  }

  // Date filter
  if (filters.dateFilter) {
    filtered = filtered.filter(b => b.date === filters.dateFilter)
  }

  // Service filter
  if (filters.serviceFilter && filters.serviceFilter !== 'all') {
    filtered = filtered.filter(b => b.service === filters.serviceFilter)
  }

  // Search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(b =>
      b.clientName.toLowerCase().includes(query) ||
      b.service.toLowerCase().includes(query) ||
      b.id.toLowerCase().includes(query) ||
      (b.notes && b.notes.toLowerCase().includes(query))
    )
  }

  return filtered
}

export function calculateRevenue(bookings: Booking[]): number {
  return bookings
    .filter(b => b.payment === 'paid')
    .reduce((sum, b) => sum + b.amount, 0)
}

export function countByStatus(bookings: Booking[], status: BookingStatus): number {
  return bookings.filter(b => b.status === status).length
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function generateBookingId(existingBookings: Booking[]): string {
  const maxId = existingBookings.reduce((max, b) => {
    const num = parseInt(b.id.replace('BK', ''))
    return num > max ? num : max
  }, 0)
  return `BK${String(maxId + 1).padStart(3, '0')}`
}

export function validateBookingDate(date: string): boolean {
  const bookingDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return bookingDate >= today
}

export function checkDoubleBooking(
  bookings: Booking[],
  date: string,
  time: string,
  excludeId?: string
): boolean {
  return bookings.some(
    b => b.date === date && b.time === time && b.status !== 'cancelled' && b.id !== excludeId
  )
}

export function parseTime(timeString: string): { hours: number; minutes: number } {
  const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/)
  if (!match) return { hours: 0, minutes: 0 }

  let [, hours, minutes, period] = match
  let h = parseInt(hours)
  const m = parseInt(minutes)

  if (period === 'PM' && h < 12) h += 12
  if (period === 'AM' && h === 12) h = 0

  return { hours: h, minutes: m }
}

export function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*(min|hour|hr)/)
  if (!match) return 60 // default to 60 minutes

  const value = parseInt(match[1])
  const unit = match[2]

  if (unit === 'min') return value
  if (unit === 'hour' || unit === 'hr') return value * 60

  return 60
}

export function getEndTime(startTime: string, durationMinutes: number): string {
  const { hours, minutes } = parseTime(startTime)
  const totalMinutes = hours * 60 + minutes + durationMinutes

  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMinutes = totalMinutes % 60

  const period = endHours >= 12 ? 'PM' : 'AM'
  const displayHours = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours

  return `${displayHours}:${String(endMinutes).padStart(2, '0')} ${period}`
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number,
  bookings: Booking[],
  date: string
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const start = parseTime(startTime)
  const end = parseTime(endTime)

  const startMinutes = start.hours * 60 + start.minutes
  const endMinutes = end.hours * 60 + end.minutes

  for (let time = startMinutes; time < endMinutes; time += slotDuration) {
    const hours = Math.floor(time / 60)
    const minutes = time % 60
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const timeString = `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`

    const booking = bookings.find(
      b => b.date === date && b.time === timeString && b.status !== 'cancelled'
    )

    slots.push({
      time: timeString,
      isAvailable: !booking,
      booking
    })
  }

  return slots
}

export function calculateBookingStats(bookings: Booking[]): BookingStats {
  const total = bookings.length
  const confirmed = countByStatus(bookings, 'confirmed')
  const pending = countByStatus(bookings, 'pending')
  const completed = countByStatus(bookings, 'completed')
  const cancelled = countByStatus(bookings, 'cancelled')
  const noShows = countByStatus(bookings, 'no_show')

  const totalRevenue = calculateRevenue(bookings)
  const avgBookingValue = total > 0 ? totalRevenue / total : 0

  // Most popular service
  const serviceCounts = new Map<string, number>()
  bookings.forEach(b => {
    serviceCounts.set(b.service, (serviceCounts.get(b.service) || 0) + 1)
  })
  const mostPopularService = Array.from(serviceCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

  // Peak booking day
  const dayCounts = new Map<number, number>()
  bookings.forEach(b => {
    const day = new Date(b.date).getDay()
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
  })
  const peakDay = Array.from(dayCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 0
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const peakBookingDay = dayNames[peakDay]

  const completionRate = total > 0 ? (completed / total) * 100 : 0
  const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0
  const noShowRate = total > 0 ? (noShows / total) * 100 : 0

  return {
    userId: bookings[0]?.userId || 'unknown',
    totalBookings: total,
    confirmed,
    pending,
    completed,
    cancelled,
    noShows,
    totalRevenue,
    averageBookingValue: Math.round(avgBookingValue),
    mostPopularService,
    peakBookingDay,
    completionRate: Math.round(completionRate),
    cancellationRate: Math.round(cancellationRate),
    noShowRate: Math.round(noShowRate)
  }
}

export function getUpcomingBookings(bookings: Booking[], days: number = 7): Booking[] {
  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  return bookings
    .filter(b => {
      const bookingDate = new Date(b.date)
      return bookingDate >= now && bookingDate <= futureDate && b.status !== 'cancelled'
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getPastBookings(bookings: Booking[], days: number = 30): Booking[] {
  const now = new Date()
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return bookings
    .filter(b => {
      const bookingDate = new Date(b.date)
      return bookingDate < now && bookingDate >= pastDate
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function isConflicting(
  booking1: Booking,
  booking2: Booking
): boolean {
  if (booking1.date !== booking2.date) return false

  const start1 = parseTime(booking1.time)
  const end1Minutes = start1.hours * 60 + start1.minutes + booking1.durationMinutes

  const start2 = parseTime(booking2.time)
  const end2Minutes = start2.hours * 60 + start2.minutes + booking2.durationMinutes

  const start1Minutes = start1.hours * 60 + start1.minutes
  const start2Minutes = start2.hours * 60 + start2.minutes

  return (
    (start1Minutes >= start2Minutes && start1Minutes < end2Minutes) ||
    (start2Minutes >= start1Minutes && start2Minutes < end1Minutes)
  )
}

logger.info('Bookings utilities initialized', {
  mockBookings: mockBookings.length,
  utilityFunctions: 15,
  supportedBookingTypes: 5
})

// Mock services data for booking services page
export const mockServices = [
  {
    id: '1',
    name: 'Strategy Consultation',
    description: 'One-on-one strategy session',
    duration: '60 min',
    price: 150,
    status: 'active',
    bookings: 24
  },
  {
    id: '2',
    name: 'Design Review',
    description: 'Comprehensive design feedback',
    duration: '90 min',
    price: 200,
    status: 'active',
    bookings: 18
  },
  {
    id: '3',
    name: 'Quick Call',
    description: 'Brief consultation',
    duration: '30 min',
    price: 75,
    status: 'active',
    bookings: 42
  }
]

export const getClientBookingCount = (clientId?: string) => {
  if (!clientId) return 0
  // Mock implementation - in real app would query database
  return mockBookings.filter(b => b.clientId === clientId).length
}
