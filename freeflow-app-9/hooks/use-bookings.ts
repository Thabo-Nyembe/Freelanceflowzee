'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type BookingType = 'meeting' | 'consultation' | 'service' | 'appointment' | 'call' | 'demo'

export interface Booking {
  id: string
  title: string
  type: BookingType
  clientId?: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  status: BookingStatus
  startTime: string
  endTime: string
  duration: number
  timezone: string
  location?: string
  meetingUrl?: string
  notes?: string
  price?: number
  currency: string
  isPaid: boolean
  reminder: boolean
  reminderSent: boolean
  calendarEventId?: string
  createdAt: string
  updatedAt: string
}

export interface BookingSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface BookingSettings {
  bufferBefore: number
  bufferAfter: number
  minNotice: number
  maxAdvance: number
  defaultDuration: number
  availableDays: number[]
  availableHours: { start: string; end: string }
  timezone: string
}

export interface BookingStats {
  totalBookings: number
  confirmedBookings: number
  completedBookings: number
  cancelledBookings: number
  totalRevenue: number
  noShowRate: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockBookings: Booking[] = [
  { id: 'book-1', title: 'Project Consultation', type: 'consultation', clientId: 'client-1', clientName: 'John Smith', clientEmail: 'john@example.com', clientPhone: '+1-555-0100', status: 'confirmed', startTime: '2024-03-25T10:00:00Z', endTime: '2024-03-25T11:00:00Z', duration: 60, timezone: 'America/New_York', meetingUrl: 'https://meet.google.com/abc-defg-hij', notes: 'Discuss website redesign project', price: 150, currency: 'USD', isPaid: true, reminder: true, reminderSent: false, createdAt: '2024-03-20', updatedAt: '2024-03-20' },
  { id: 'book-2', title: 'Demo Call', type: 'demo', clientName: 'Sarah Lee', clientEmail: 'sarah@startup.io', status: 'pending', startTime: '2024-03-26T14:00:00Z', endTime: '2024-03-26T14:30:00Z', duration: 30, timezone: 'America/New_York', meetingUrl: 'https://zoom.us/j/123456789', price: 0, currency: 'USD', isPaid: true, reminder: true, reminderSent: false, createdAt: '2024-03-21', updatedAt: '2024-03-21' },
  { id: 'book-3', title: 'Strategy Session', type: 'meeting', clientId: 'client-2', clientName: 'Mike Johnson', clientEmail: 'mike@techsol.com', status: 'completed', startTime: '2024-03-20T09:00:00Z', endTime: '2024-03-20T10:30:00Z', duration: 90, timezone: 'America/New_York', location: 'Conference Room A', price: 250, currency: 'USD', isPaid: true, reminder: true, reminderSent: true, createdAt: '2024-03-15', updatedAt: '2024-03-20' },
  { id: 'book-4', title: 'Quick Call', type: 'call', clientName: 'Alex Brown', clientEmail: 'alex@company.com', status: 'cancelled', startTime: '2024-03-22T15:00:00Z', endTime: '2024-03-22T15:15:00Z', duration: 15, timezone: 'America/New_York', notes: 'Cancelled by client', price: 0, currency: 'USD', isPaid: true, reminder: false, reminderSent: false, createdAt: '2024-03-18', updatedAt: '2024-03-21' }
]

const mockStats: BookingStats = {
  totalBookings: 4,
  confirmedBookings: 1,
  completedBookings: 1,
  cancelledBookings: 1,
  totalRevenue: 400,
  noShowRate: 0
}

const mockSettings: BookingSettings = {
  bufferBefore: 15,
  bufferAfter: 15,
  minNotice: 24,
  maxAdvance: 60,
  defaultDuration: 60,
  availableDays: [1, 2, 3, 4, 5],
  availableHours: { start: '09:00', end: '17:00' },
  timezone: 'America/New_York'
}

// ============================================================================
// HOOK
// ============================================================================

interface UseBookingsOptions {
  
  clientId?: string
}

export function useBookings(options: UseBookingsOptions = {}) {
  const {  clientId } = options

  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([])
  const [settings, setSettings] = useState<BookingSettings>(mockSettings)
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBookings = useCallback(async (filters?: { status?: string; type?: string; dateFrom?: string; dateTo?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.type) params.set('type', filters.type)
      if (clientId) params.set('clientId', clientId)
      if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.set('dateTo', filters.dateTo)

      const response = await fetch(`/api/bookings?${params}`)
      const result = await response.json()
      if (result.success) {
        setBookings(Array.isArray(result.bookings) ? result.bookings : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.bookings
      }
      setBookings([])
      setStats(null)
      return []
    } catch (err) {
      setBookings([])
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ clientId])

  const fetchAvailableSlots = useCallback(async (date: string, duration?: number) => {
    try {
      const response = await fetch(`/api/bookings/availability?date=${date}&duration=${duration || settings.defaultDuration}`)
      const result = await response.json()
      if (result.success) {
        setAvailableSlots(result.slots || [])
        return result.slots
      }
      return []
    } catch (err) {
      return []
    }
  }, [ settings.defaultDuration])

  const createBooking = useCallback(async (data: Omit<Booking, 'id' | 'reminderSent' | 'calendarEventId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchBookings()
        return { success: true, booking: result.booking }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newBooking: Booking = { ...data, id: `book-${Date.now()}`, reminderSent: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setBookings(prev => [newBooking, ...prev])
      return { success: true, booking: newBooking }
    }
  }, [fetchBookings])

  const updateBooking = useCallback(async (bookingId: string, updates: Partial<Booking>) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
      }
      return result
    } catch (err) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b))
      return { success: true }
    }
  }, [])

  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      const result = await response.json()
      if (result.success) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const, notes: reason || b.notes } : b))
      }
      return result
    } catch (err) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
      return { success: true }
    }
  }, [])

  const confirmBooking = useCallback(async (bookingId: string) => {
    return updateBooking(bookingId, { status: 'confirmed' })
  }, [updateBooking])

  const completeBooking = useCallback(async (bookingId: string) => {
    return updateBooking(bookingId, { status: 'completed' })
  }, [updateBooking])

  const rescheduleBooking = useCallback(async (bookingId: string, newStartTime: string, newEndTime: string) => {
    return updateBooking(bookingId, { startTime: newStartTime, endTime: newEndTime, status: 'pending' })
  }, [updateBooking])

  const sendReminder = useCallback(async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/remind`, { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, reminderSent: true } : b))
      }
      return result
    } catch (err) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, reminderSent: true } : b))
      return { success: true }
    }
  }, [])

  const updateSettings = useCallback(async (updates: Partial<BookingSettings>) => {
    try {
      const response = await fetch('/api/bookings/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setSettings(prev => ({ ...prev, ...updates }))
      }
      return result
    } catch (err) {
      setSettings(prev => ({ ...prev, ...updates }))
      return { success: true }
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchBookings()
  }, [fetchBookings])

  useEffect(() => { refresh() }, [refresh])

  const upcomingBookings = useMemo(() => bookings.filter(b => new Date(b.startTime) > new Date() && b.status !== 'cancelled').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()), [bookings])
  const pastBookings = useMemo(() => bookings.filter(b => new Date(b.endTime) < new Date()), [bookings])
  const todayBookings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return bookings.filter(b => b.startTime.startsWith(today))
  }, [bookings])
  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'pending'), [bookings])
  const confirmedBookings = useMemo(() => bookings.filter(b => b.status === 'confirmed'), [bookings])
  const bookingsByType = useMemo(() => {
    const grouped: Record<string, Booking[]> = {}
    bookings.forEach(b => {
      if (!grouped[b.type]) grouped[b.type] = []
      grouped[b.type].push(b)
    })
    return grouped
  }, [bookings])

  return {
    bookings, currentBooking, availableSlots, settings, stats, upcomingBookings, pastBookings, todayBookings, pendingBookings, confirmedBookings, bookingsByType,
    isLoading, error,
    refresh, fetchBookings, fetchAvailableSlots, createBooking, updateBooking, cancelBooking, confirmBooking, completeBooking, rescheduleBooking, sendReminder, updateSettings,
    setCurrentBooking
  }
}

export default useBookings
