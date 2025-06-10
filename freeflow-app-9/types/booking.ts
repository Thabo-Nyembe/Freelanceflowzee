export interface BookingService {
  id: string
  title: string
  description: string
  duration: number // in minutes
  price: number // in cents
  category: 'consultation' | 'design' | 'development' | 'strategy' | 'review' | 'workshop' | 'other'
  isActive: boolean
  maxAdvanceBooking: number // days in advance
  bufferTime: number // minutes between bookings
  tags: string[]
  requirements?: string[]
  deliverables?: string[]
  meetingUrl?: string
  isRecurring?: boolean
  maxBookingsPerDay?: number
}

export interface TimeSlot {
  id: string
  startTime: string // ISO string
  endTime: string // ISO string
  isAvailable: boolean
  serviceId: string
  freelancerId: string
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly'
    endDate?: string
    daysOfWeek?: number[] // 0 = Sunday, 1 = Monday, etc.
  }
}

export interface Booking {
  id: string
  clientId: string
  clientEmail: string
  clientName: string
  freelancerId: string
  serviceId: string
  timeSlotId: string
  status: 'pending' | 'confirmed' | 'paid' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentIntentId?: string
  startTime: string // ISO string
  endTime: string // ISO string
  totalAmount: number // in cents
  notes?: string
  clientNotes?: string
  requirements?: string[]
  meetingLink?: string
  createdAt: string
  updatedAt: string
  cancelledAt?: string
  cancelReason?: string
  remindersSent?: {
    '24h'?: boolean
    '1h'?: boolean
    '15min'?: boolean
  }
}

export interface BookingForm {
  serviceId: string
  timeSlotId: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  notes?: string
  requirements?: string[]
  agreeToTerms: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: {
    bookingId: string
    serviceId: string
    clientName: string
    status: Booking['status']
    paymentStatus: Booking['paymentStatus']
  }
  allDay?: boolean
}

export interface BookingAnalytics {
  totalBookings: number
  totalRevenue: number
  completedBookings: number
  cancelledBookings: number
  noShowBookings: number
  averageBookingValue: number
  popularServices: Array<{
    serviceId: string
    serviceName: string
    bookingCount: number
    revenue: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
    bookingCount: number
  }>
  clientRetentionRate: number
  averageRating?: number
}

export interface AvailabilityRule {
  id: string
  freelancerId: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  isAvailable: boolean
  timezone: string
  effectiveFrom: string // ISO date
  effectiveUntil?: string // ISO date
}

export interface BlockedTime {
  id: string
  freelancerId: string
  startTime: string // ISO string
  endTime: string // ISO string
  reason: string
  isRecurring: boolean
  createdAt: string
}

export interface BookingNotification {
  id: string
  bookingId: string
  type: 'confirmation' | 'reminder' | 'cancellation' | 'rescheduling'
  recipientEmail: string
  sentAt?: string
  scheduledFor?: string
  status: 'pending' | 'sent' | 'failed'
}

export interface PaymentDetails {
  paymentIntentId: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded'
  clientSecret: string
  paymentMethodId?: string
  receiptUrl?: string
  refundId?: string
}

export interface BookingClient {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  avatar?: string
  timezone: string
  totalBookings: number
  completedBookings: number
  totalSpent: number
  averageRating?: number
  notes?: string
  tags: string[]
  preferredCommunication: 'email' | 'phone' | 'video' | 'in-person'
  createdAt: string
  lastBookingAt?: string
}

export interface BookingSettings {
  id: string
  userId: string
  
  // Availability
  availabilityRules: AvailabilityRule[]
  maxAdvanceBooking: number // days
  minAdvanceBooking: number // hours
  bufferTime: number // minutes between bookings
  timezone: string
  
  // Booking policies
  cancellationPolicy: {
    allowCancellation: boolean
    cancellationDeadline: number // hours before appointment
    refundPolicy: 'full' | 'partial' | 'none'
    refundPercentage?: number
  }
  
  // Notifications
  emailNotifications: {
    newBooking: boolean
    cancellation: boolean
    reminder24h: boolean
    reminder1h: boolean
    noShow: boolean
    followUp: boolean
  }
  
  // Integration
  calendarIntegration: {
    provider?: 'google' | 'outlook' | 'apple'
    syncEnabled: boolean
    calendarId?: string
  }
  
  // Payment
  requirePayment: boolean
  depositPercentage?: number // percentage of total amount
  acceptedPaymentMethods: string[]
  
  // Branding
  brandColor: string
  welcomeMessage: string
  instructionsMessage?: string
  
  createdAt: string
  updatedAt: string
}

export interface BookingCalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  bookingId: string
  status: Booking['status']
  clientName: string
  serviceName: string
  backgroundColor: string
  borderColor: string
  extendedProps: {
    booking: Booking
    service: BookingService
    client: BookingClient
  }
}

export interface BookingPublicPageProps {
  userId: string
  services: BookingService[]
  settings: BookingSettings
  availability: TimeSlot[]
} 