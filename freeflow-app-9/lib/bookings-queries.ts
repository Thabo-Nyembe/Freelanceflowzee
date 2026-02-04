/**
 * Bookings Queries
 *
 * Supabase queries for appointment and booking management
 */

import { createClient } from '@/lib/supabase/client'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DatabaseError, toDbError } from '@/lib/types/database'

const supabase = createClient()
const logger = createSimpleLogger('Bookings')

// TypeScript interfaces
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type PaymentStatus = 'awaiting' | 'paid' | 'partial' | 'refunded' | 'failed'
export type BookingType = 'consultation' | 'meeting' | 'service' | 'call' | 'workshop' | 'event'

export interface Booking {
  id: string
  user_id: string
  client_id: string | null
  client_name: string
  client_email: string | null
  client_phone: string | null
  service: string
  type: BookingType
  booking_date: string // DATE format: YYYY-MM-DD
  start_time: string // TIME format: HH:MM:SS
  duration_minutes: number
  status: BookingStatus
  payment: PaymentStatus
  amount: number
  currency: string
  location: string | null
  meeting_link: string | null
  notes: string | null
  tags: string[]
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export interface BookingFilters {
  status?: BookingStatus
  payment?: PaymentStatus
  type?: BookingType
  search?: string
  dateFrom?: string
  dateTo?: string
  clientId?: string
}

export interface BookingSortOptions {
  field: 'booking_date' | 'created_at' | 'updated_at' | 'client_name' | 'amount'
  ascending?: boolean
}

export interface BookingStats {
  total: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  no_show: number
  totalRevenue: number
  averageBookingValue: number
  completionRate: number
  cancellationRate: number
  upcomingCount: number
}

/**
 * Get all bookings for a user with optional filters and sorting
 */
export async function getBookings(
  userId: string,
  filters?: BookingFilters,
  sort?: BookingSortOptions,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: Booking[]; error: DatabaseError | null; count: number }> {
  logger.info('Fetching bookings', { userId, filters, sort, limit, offset })

  try {
    let query = supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.payment) {
      query = query.eq('payment', filters.payment)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId)
    }
    if (filters?.search) {
      query = query.or(`client_name.ilike.%${filters.search}%,service.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
    }
    if (filters?.dateFrom) {
      query = query.gte('booking_date', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('booking_date', filters.dateTo)
    }

    // Apply sorting
    const sortField = sort?.field || 'booking_date'
    const ascending = sort?.ascending ?? true
    query = query.order(sortField, { ascending })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      logger.error('Failed to fetch bookings', { error, userId })
      return { data: [], error: toDbError(error), count: 0 }
    }

    logger.info('Bookings fetched successfully', {
      count: data?.length || 0,
      totalCount: count,
      userId,
    })

    return { data: data || [], error: null, count: count || 0 }
  } catch (error: unknown) {
    logger.error('Exception fetching bookings', { error, userId })
    return { data: [], error: toDbError(error), count: 0 }
  }
}

/**
 * Get a single booking by ID
 */
export async function getBooking(
  bookingId: string
): Promise<{ data: Booking | null; error: DatabaseError | null }> {
  logger.info('Fetching booking', { bookingId })

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error) {
      logger.error('Failed to fetch booking', { error, bookingId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Booking fetched successfully', { bookingId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching booking', { error, bookingId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Create a new booking
 */
export async function createBooking(
  userId: string,
  bookingData: Partial<Booking>
): Promise<{ data: Booking | null; error: DatabaseError | null }> {
  logger.info('Creating booking', { userId, clientName: bookingData.client_name, service: bookingData.service })

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        client_id: bookingData.client_id,
        client_name: bookingData.client_name,
        client_email: bookingData.client_email,
        client_phone: bookingData.client_phone,
        service: bookingData.service,
        type: bookingData.type || 'consultation',
        booking_date: bookingData.booking_date,
        start_time: bookingData.start_time,
        duration_minutes: bookingData.duration_minutes || 60,
        status: bookingData.status || 'pending',
        payment: bookingData.payment || 'awaiting',
        amount: bookingData.amount || 0,
        currency: bookingData.currency || 'USD',
        location: bookingData.location,
        meeting_link: bookingData.meeting_link,
        notes: bookingData.notes,
        tags: bookingData.tags || [],
        reminder_sent: bookingData.reminder_sent || false,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create booking', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Booking created successfully', {
      bookingId: data.id,
      clientName: data.client_name,
      service: data.service,
      date: data.booking_date,
      userId,
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating booking', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update a booking
 */
export async function updateBooking(
  bookingId: string,
  updates: Partial<Booking>
): Promise<{ data: Booking | null; error: DatabaseError | null }> {
  logger.info('Updating booking', { bookingId, updates })

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update booking', { error, bookingId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Booking updated successfully', { bookingId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating booking', { error, bookingId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<{ data: Booking | null; error: DatabaseError | null }> {
  logger.info('Updating booking status', { bookingId, status })

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update booking status', { error, bookingId, status })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Booking status updated successfully', { bookingId, status })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating booking status', { error, bookingId, status })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  bookingId: string,
  payment: PaymentStatus
): Promise<{ data: Booking | null; error: DatabaseError | null }> {
  logger.info('Updating payment status', { bookingId, payment })

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        payment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update payment status', { error, bookingId, payment })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Payment status updated successfully', { bookingId, payment })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating payment status', { error, bookingId, payment })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Delete a booking
 */
export async function deleteBooking(
  bookingId: string
): Promise<{ error: DatabaseError | null }> {
  logger.info('Deleting booking', { bookingId })

  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) {
      logger.error('Failed to delete booking', { error, bookingId })
      return { error: toDbError(error) }
    }

    logger.info('Booking deleted successfully', { bookingId })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting booking', { error, bookingId })
    return { error: toDbError(error) }
  }
}

/**
 * Bulk delete bookings
 */
export async function bulkDeleteBookings(
  bookingIds: string[]
): Promise<{ error: DatabaseError | null }> {
  logger.info('Bulk deleting bookings', { count: bookingIds.length })

  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .in('id', bookingIds)

    if (error) {
      logger.error('Failed to bulk delete bookings', { error, count: bookingIds.length })
      return { error: toDbError(error) }
    }

    logger.info('Bookings bulk deleted successfully', { count: bookingIds.length })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception bulk deleting bookings', { error })
    return { error: toDbError(error) }
  }
}

/**
 * Get booking statistics for a user
 */
export async function getBookingStats(userId: string): Promise<BookingStats> {
  logger.info('Fetching booking statistics', { userId })

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('status, payment, amount, booking_date')
      .eq('user_id', userId)

    if (error) throw error

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    const stats: BookingStats = {
      total: data?.length || 0,
      pending: data?.filter((b) => b.status === 'pending').length || 0,
      confirmed: data?.filter((b) => b.status === 'confirmed').length || 0,
      completed: data?.filter((b) => b.status === 'completed').length || 0,
      cancelled: data?.filter((b) => b.status === 'cancelled').length || 0,
      no_show: data?.filter((b) => b.status === 'no_show').length || 0,
      totalRevenue: data?.filter((b) => b.payment === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
      averageBookingValue: data?.length
        ? data.reduce((sum, b) => sum + (b.amount || 0), 0) / data.length
        : 0,
      completionRate: data?.length
        ? Math.round((data.filter((b) => b.status === 'completed').length / data.length) * 100)
        : 0,
      cancellationRate: data?.length
        ? Math.round((data.filter((b) => b.status === 'cancelled').length / data.length) * 100)
        : 0,
      upcomingCount: data?.filter((b) => b.booking_date >= today && b.status !== 'cancelled').length || 0,
    }

    logger.info('Booking statistics fetched', { stats, userId })
    return stats
  } catch (error: unknown) {
    logger.error('Failed to fetch booking statistics', { error, userId })
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      completionRate: 0,
      cancellationRate: 0,
      upcomingCount: 0,
    }
  }
}

/**
 * Get upcoming bookings
 */
export async function getUpcomingBookings(
  userId: string,
  days: number = 7,
  limit: number = 20
): Promise<{ data: Booking[]; error: DatabaseError | null }> {
  logger.info('Fetching upcoming bookings', { userId, days, limit })

  try {
    const today = new Date().toISOString().split('T')[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    const futureDateStr = futureDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .gte('booking_date', today)
      .lte('booking_date', futureDateStr)
      .neq('status', 'cancelled')
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit)

    if (error) {
      logger.error('Failed to fetch upcoming bookings', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Upcoming bookings fetched', { count: data?.length || 0, userId })
    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching upcoming bookings', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get bookings for a specific date
 */
export async function getBookingsByDate(
  userId: string,
  date: string
): Promise<{ data: Booking[]; error: DatabaseError | null }> {
  logger.info('Fetching bookings by date', { userId, date })

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .eq('booking_date', date)
      .order('start_time', { ascending: true })

    if (error) {
      logger.error('Failed to fetch bookings by date', { error, userId, date })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Bookings by date fetched', { count: data?.length || 0, date, userId })
    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching bookings by date', { error, userId, date })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get bookings for a date range
 */
export async function getBookingsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ data: Booking[]; error: DatabaseError | null }> {
  logger.info('Fetching bookings by date range', { userId, startDate, endDate })

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      logger.error('Failed to fetch bookings by date range', { error, userId, startDate, endDate })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Bookings by date range fetched', {
      count: data?.length || 0,
      startDate,
      endDate,
      userId,
    })
    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching bookings by date range', { error, userId, startDate, endDate })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Search bookings
 */
export async function searchBookings(
  userId: string,
  searchTerm: string,
  limit: number = 20
): Promise<{ data: Booking[]; error: DatabaseError | null }> {
  logger.info('Searching bookings', { userId, searchTerm, limit })

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .or(`client_name.ilike.%${searchTerm}%,service.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
      .order('booking_date', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to search bookings', { error, userId, searchTerm })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Bookings search completed', {
      resultsCount: data?.length || 0,
      searchTerm,
      userId,
    })

    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception searching bookings', { error, userId, searchTerm })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get client bookings (all bookings for a specific client)
 */
export async function getClientBookings(
  userId: string,
  clientId: string
): Promise<{ data: Booking[]; error: DatabaseError | null }> {
  logger.info('Fetching client bookings', { userId, clientId })

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .order('booking_date', { ascending: false })

    if (error) {
      logger.error('Failed to fetch client bookings', { error, userId, clientId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Client bookings fetched', { count: data?.length || 0, clientId, userId })
    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching client bookings', { error, userId, clientId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Calculate revenue for a period
 */
export async function calculateRevenue(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ revenue: number; error: DatabaseError | null }> {
  logger.info('Calculating revenue', { userId, startDate, endDate })

  try {
    let query = supabase
      .from('bookings')
      .select('amount')
      .eq('user_id', userId)
      .eq('payment', 'paid')

    if (startDate) {
      query = query.gte('booking_date', startDate)
    }
    if (endDate) {
      query = query.lte('booking_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to calculate revenue', { error, userId })
      return { revenue: 0, error: toDbError(error) }
    }

    const revenue = data?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0

    logger.info('Revenue calculated', { revenue, userId, startDate, endDate })
    return { revenue, error: null }
  } catch (error: unknown) {
    logger.error('Exception calculating revenue', { error, userId })
    return { revenue: 0, error: toDbError(error) }
  }
}
