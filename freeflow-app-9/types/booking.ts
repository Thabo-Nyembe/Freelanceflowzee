// Status type exports for API usage
export type BookingStatus = &apos;pending&apos; | &apos;confirmed&apos; | &apos;paid&apos; | &apos;in-progress&apos; | &apos;completed&apos; | &apos;cancelled&apos; | &apos;no-show&apos;
export type PaymentStatus = &apos;pending&apos; | &apos;paid&apos; | &apos;failed&apos; | &apos;refunded&apos;

export interface BookingService {
  id: string
  title: string
  description: string
  duration: number // in minutes
  price: number // in cents
  category: &apos;consultation&apos; | &apos;design&apos; | &apos;development&apos; | &apos;strategy&apos; | &apos;review&apos; | &apos;workshop&apos; | &apos;other&apos;
  freelancerId: string
  isActive: boolean
  maxAdvanceBooking: number // days in advance
  bufferTime: number // minutes between bookings
  tags: string[]
  requirements?: string[]
  deliverables?: string[]
  meetingUrl?: string
  isRecurring?: boolean
  maxBookingsPerDay?: number
  availability?: {
    [key: string]: { start: string; end: string }
  }
}

export interface TimeSlot {
  id: string
  startTime: string // ISO string
  endTime: string // ISO string
  isAvailable: boolean
  serviceId: string
  freelancerId: string
  recurring?: {
    pattern: &apos;daily&apos; | &apos;weekly&apos; | &apos;monthly&apos;
    endDate?: string
    daysOfWeek?: number[] // 0 = Sunday, 1 = Monday, etc.
  }
}

export interface Booking {
  id: string
  clientId: string
  clientEmail: string
  clientName: string
  clientPhone?: string
  freelancerId: string
  serviceId: string
  timeSlotId: string
  status: &apos;pending&apos; | &apos;confirmed&apos; | &apos;paid&apos; | &apos;in-progress&apos; | &apos;completed&apos; | &apos;cancelled&apos; | &apos;no-show&apos;
  paymentStatus: &apos;pending&apos; | &apos;paid&apos; | &apos;failed&apos; | &apos;refunded&apos;
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
    &apos;24h&apos;?: boolean
    &apos;1h&apos;?: boolean
    &apos;15min&apos;?: boolean
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
    status: Booking[&apos;status&apos;]
    paymentStatus: Booking[&apos;paymentStatus&apos;]
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
  type: &apos;confirmation&apos; | &apos;reminder&apos; | &apos;cancellation&apos; | &apos;rescheduling&apos;
  recipientEmail: string
  sentAt?: string
  scheduledFor?: string
  status: &apos;pending&apos; | &apos;sent&apos; | &apos;failed&apos;
}

export interface PaymentDetails {
  paymentIntentId: string
  amount: number
  currency: string
  status: &apos;requires_payment_method&apos; | &apos;requires_confirmation&apos; | &apos;requires_action&apos; | &apos;processing&apos; | &apos;requires_capture&apos; | &apos;canceled&apos; | &apos;succeeded&apos;
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
  preferredCommunication: &apos;email&apos; | &apos;phone&apos; | &apos;video&apos; | &apos;in-person&apos;
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
    refundPolicy: &apos;full&apos; | &apos;partial&apos; | &apos;none&apos;
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
    provider?: &apos;google&apos; | &apos;outlook&apos; | &apos;apple&apos;
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
  status: Booking[&apos;status&apos;]
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