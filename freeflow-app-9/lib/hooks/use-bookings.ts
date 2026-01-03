import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type BookingType = 'appointment' | 'reservation' | 'session' | 'class' | 'event' | 'rental' | 'service' | 'consultation' | 'custom'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled' | 'waitlisted'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded' | 'cancelled'

export interface Booking {
  id: string
  user_id: string
  booking_number: string
  title: string
  description?: string
  booking_type: BookingType
  customer_id?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  guest_count: number
  start_time: string
  end_time: string
  duration_minutes: number
  timezone: string
  buffer_before_minutes: number
  buffer_after_minutes: number
  status: BookingStatus
  confirmation_code?: string
  confirmed_at?: string
  confirmed_by?: string
  resource_id?: string
  resource_name?: string
  location?: string
  location_type?: string
  meeting_url?: string
  room_number?: string
  provider_id?: string
  provider_name?: string
  service_id?: string
  service_name?: string
  price: number
  deposit_amount: number
  paid_amount: number
  balance_due: number
  currency: string
  payment_status: PaymentStatus
  cancellation_policy?: string
  cancellation_deadline?: string
  cancellation_fee?: number
  cancelled_at?: string
  cancelled_by?: string
  cancellation_reason?: string
  reminder_sent: boolean
  reminder_sent_at?: string
  confirmation_sent: boolean
  confirmation_sent_at?: string
  follow_up_sent: boolean
  check_in_time?: string
  check_out_time?: string
  actual_start_time?: string
  actual_end_time?: string
  special_requests?: string
  notes?: string
  internal_notes?: string
  requirements: any
  is_recurring: boolean
  recurrence_rule?: string
  parent_booking_id?: string
  capacity: number
  slots_booked: number
  waitlist_position?: number
  tags?: string[]
  category?: string
  metadata: any
  external_id?: string
  external_source?: string
  sync_status?: string
  last_synced_at?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UseBookingsOptions {
  bookingType?: BookingType | 'all'
  status?: BookingStatus | 'all'
  paymentStatus?: PaymentStatus | 'all'
  limit?: number
}

export function useBookings(options: UseBookingsOptions = {}) {
  const { bookingType, status, paymentStatus, limit } = options

  const filters: Record<string, any> = {}
  if (bookingType && bookingType !== 'all') filters.booking_type = bookingType
  if (status && status !== 'all') filters.status = status
  if (paymentStatus && paymentStatus !== 'all') filters.payment_status = paymentStatus

  const queryOptions: any = {
    table: 'bookings',
    filters,
    orderBy: { column: 'start_time', ascending: false },
    limit: limit || 50,
    realtime: true,
    softDelete: false // bookings table doesn't have deleted_at column
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Booking>(queryOptions)

  const { create, update, remove } = useSupabaseMutation({
    table: 'bookings'
  })

  // Wrapper functions with proper typing
  const createBooking = async (bookingData: Partial<Booking>) => {
    return await create(bookingData)
  }

  const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
    return await update(id, bookingData)
  }

  const deleteBooking = async (id: string) => {
    return await remove(id)
  }

  return {
    bookings: data,
    loading,
    error,
    createBooking,
    updateBooking,
    deleteBooking,
    refetch
  }
}
