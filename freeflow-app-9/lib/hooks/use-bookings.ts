'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('Bookings')

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

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
}

export interface UseBookingsOptions {
  bookingType?: BookingType | 'all'
  status?: BookingStatus | 'all'
  paymentStatus?: PaymentStatus | 'all'
  limit?: number
  enableRealtime?: boolean
}

export function useBookings(options: UseBookingsOptions = {}) {
  const { bookingType, status, paymentStatus, limit = 50, enableRealtime = true } = options
  const supabase = createClient()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  // Fetch bookings from API (to bypass RLS issues with auth.users table)
  const fetchBookings = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    try {
      setLoading(true)
      setError(null)

      // Use API endpoint to fetch bookings - this handles RLS errors gracefully
      const response = await fetch('/api/bookings?type=list')
      const result = await response.json()

      if (result.success && result.data) {
        let filteredData = result.data

        // Apply client-side filters
        if (bookingType && bookingType !== 'all') {
          filteredData = filteredData.filter((b: Booking) => b.booking_type === bookingType)
        }
        if (status && status !== 'all') {
          filteredData = filteredData.filter((b: Booking) => b.status === status)
        }
        if (paymentStatus && paymentStatus !== 'all') {
          filteredData = filteredData.filter((b: Booking) => b.payment_status === paymentStatus)
        }

        // Sort by start_time descending and apply limit
        filteredData = filteredData
          .sort((a: Booking, b: Booking) => new Date(b.start_time || b.created_at).getTime() - new Date(a.start_time || a.created_at).getTime())
          .slice(0, limit)

        setBookings(filteredData)
      } else {
        // If API fails, return empty array instead of erroring
        logger.warn('Bookings API returned no data', { error: result.error })
        setBookings([])
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch bookings')
      setError(error)
      logger.error('Error fetching bookings', { error })
      // Return empty array on error so UI doesn't show error state
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [bookingType, status, paymentStatus, limit])

  // Set up real-time subscription
  useEffect(() => {
    fetchBookings()

    if (!enableRealtime) return

    setRealtimeStatus('connecting')

    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newBooking = payload.new as Booking
            // Check if the new booking matches our filters
            const matchesFilters =
              (!bookingType || bookingType === 'all' || newBooking.booking_type === bookingType) &&
              (!status || status === 'all' || newBooking.status === status) &&
              (!paymentStatus || paymentStatus === 'all' || newBooking.payment_status === paymentStatus)

            if (matchesFilters) {
              setBookings(prev => [newBooking, ...prev].slice(0, limit))
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedBooking = payload.new as Booking
            setBookings(prev =>
              prev.map(booking =>
                booking.id === updatedBooking.id ? updatedBooking : booking
              )
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setBookings(prev => prev.filter(booking => booking.id !== deletedId))
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected')
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('disconnected')
        }
      })

    return () => {
      supabase.removeChannel(channel)
      setRealtimeStatus('disconnected')
    }
  }, [fetchBookings, supabase, enableRealtime, bookingType, status, paymentStatus, limit])

  // Create a new booking
  const createBooking = useCallback(async (bookingData: Partial<Booking>) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Optimistically add to local state (realtime will sync if there's a mismatch)
      if (data) {
        setBookings(prev => [data as Booking, ...prev].slice(0, limit))
      }

      return data as Booking
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create booking')
      logger.error('Error creating booking', { error })
      throw error
    }
  }, [supabase, limit])

  // Update an existing booking
  const updateBooking = useCallback(async (id: string, bookingData: Partial<Booking>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          ...bookingData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Optimistically update local state
      if (data) {
        setBookings(prev =>
          prev.map(booking =>
            booking.id === id ? (data as Booking) : booking
          )
        )
      }

      return data as Booking
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update booking')
      logger.error('Error updating booking', { error })
      throw error
    }
  }, [supabase])

  // Delete a booking (hard delete since bookings table doesn't have deleted_at)
  const deleteBooking = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }

      // Optimistically remove from local state
      setBookings(prev => prev.filter(booking => booking.id !== id))

      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete booking')
      logger.error('Error deleting booking', { error })
      throw error
    }
  }, [supabase])

  // Confirm a booking
  const confirmBooking = useCallback(async (id: string) => {
    return updateBooking(id, {
      status: 'confirmed' as BookingStatus,
      confirmed_at: new Date().toISOString(),
      confirmation_code: `CONF-${Date.now().toString(36).toUpperCase()}`
    })
  }, [updateBooking])

  // Cancel a booking
  const cancelBooking = useCallback(async (id: string, reason?: string) => {
    return updateBooking(id, {
      status: 'cancelled' as BookingStatus,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || 'Cancelled by user'
    })
  }, [updateBooking])

  // Complete a booking
  const completeBooking = useCallback(async (id: string) => {
    return updateBooking(id, {
      status: 'completed' as BookingStatus,
      actual_end_time: new Date().toISOString()
    })
  }, [updateBooking])

  // Reschedule a booking
  const rescheduleBooking = useCallback(async (id: string, newStartTime: string, newEndTime: string) => {
    return updateBooking(id, {
      start_time: newStartTime,
      end_time: newEndTime,
      status: 'rescheduled' as BookingStatus
    })
  }, [updateBooking])

  // Computed booking lists
  const upcomingBookings = useMemo(() => {
    const now = new Date()
    return bookings
      .filter(b => new Date(b.start_time) > now && !['cancelled', 'completed', 'no_show'].includes(b.status))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }, [bookings])

  const pastBookings = useMemo(() => {
    const now = new Date()
    return bookings.filter(b => new Date(b.end_time) < now)
  }, [bookings])

  const todayBookings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return bookings.filter(b => b.start_time.startsWith(today))
  }, [bookings])

  const pendingBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'pending')
  }, [bookings])

  const confirmedBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'confirmed')
  }, [bookings])

  // Stats
  const stats = useMemo(() => {
    const total = bookings.length
    const confirmed = bookings.filter(b => b.status === 'confirmed').length
    const pending = bookings.filter(b => b.status === 'pending').length
    const completed = bookings.filter(b => b.status === 'completed').length
    const cancelled = bookings.filter(b => b.status === 'cancelled').length
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0)
    const paidRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (b.price || 0), 0)
    const pendingPayments = bookings.filter(b => b.payment_status !== 'paid').reduce((sum, b) => sum + (b.balance_due || 0), 0)

    return {
      total,
      confirmed,
      pending,
      completed,
      cancelled,
      totalRevenue,
      paidRevenue,
      pendingPayments,
      noShowRate: total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0',
      conversionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0'
    }
  }, [bookings])

  return {
    bookings,
    loading,
    error,
    realtimeStatus,
    stats,
    upcomingBookings,
    pastBookings,
    todayBookings,
    pendingBookings,
    confirmedBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    confirmBooking,
    cancelBooking,
    completeBooking,
    rescheduleBooking,
    refetch: fetchBookings
  }
}
