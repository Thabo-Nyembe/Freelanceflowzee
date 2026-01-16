/**
 * Calendar/Events React Hooks
 *
 * TanStack Query hooks for calendar events, bookings, and scheduling
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  calendarClient,
  CalendarEvent,
  Calendar,
  Booking,
  CreateEventData,
  UpdateEventData,
  CreateCalendarData,
  CreateBookingData,
  EventFilters,
  CalendarStats
} from './calendar-client'

/**
 * Get events within a date range with optional filters
 */
export function useEvents(
  startDate: string,
  endDate: string,
  filters?: EventFilters,
  options?: Omit<UseQueryOptions<CalendarEvent[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['calendar-events', startDate, endDate, filters],
    queryFn: async () => {
      const response = await calendarClient.getEvents(startDate, endDate, filters)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch events')
      }
      return response.data
    },
    ...options
  })
}

/**
 * Get a single event by ID
 */
export function useEvent(
  id: string,
  options?: Omit<UseQueryOptions<CalendarEvent>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['calendar-event', id],
    queryFn: async () => {
      const response = await calendarClient.getEvent(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch event')
      }
      return response.data
    },
    enabled: !!id,
    ...options
  })
}

/**
 * Create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      const response = await calendarClient.createEvent(eventData)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create event')
      }
      return response.data
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-stats'] })
      queryClient.setQueryData(['calendar-event', event.id], event)
      toast.success('Event created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update an existing event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateEventData }) => {
      const response = await calendarClient.updateEvent(id, updates)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update event')
      }
      return response.data
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['calendar-event', id] })

      const previousEvent = queryClient.getQueryData(['calendar-event', id])

      queryClient.setQueryData(['calendar-event', id], (old: any) => {
        if (!old) return old
        return { ...old, ...updates, updated_at: new Date().toISOString() }
      })

      return { previousEvent }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(['calendar-event', _variables.id], context.previousEvent)
      }
      toast.error(error.message)
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-event', event.id] })
      queryClient.invalidateQueries({ queryKey: ['calendar-stats'] })
      toast.success('Event updated successfully')
    }
  })
}

/**
 * Delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await calendarClient.deleteEvent(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete event')
      }
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-stats'] })
      queryClient.removeQueries({ queryKey: ['calendar-event', id] })
      toast.success('Event deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Get all calendars
 */
export function useCalendars(
  options?: Omit<UseQueryOptions<Calendar[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['calendars'],
    queryFn: async () => {
      const response = await calendarClient.getCalendars()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch calendars')
      }
      return response.data
    },
    ...options
  })
}

/**
 * Create a new calendar
 */
export function useCreateCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (calendarData: CreateCalendarData) => {
      const response = await calendarClient.createCalendar(calendarData)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create calendar')
      }
      return response.data
    },
    onSuccess: (calendar) => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] })
      queryClient.setQueryData(['calendar', calendar.id], calendar)
      toast.success('Calendar created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Get bookings with optional status filter
 */
export function useBookings(
  status?: ('pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show')[],
  options?: Omit<UseQueryOptions<Booking[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['bookings', status],
    queryFn: async () => {
      const response = await calendarClient.getBookings(status)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch bookings')
      }
      return response.data
    },
    ...options
  })
}

/**
 * Create a new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingData: CreateBookingData) => {
      const response = await calendarClient.createBooking(bookingData)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create booking')
      }
      return response.data
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-stats'] })
      queryClient.setQueryData(['booking', booking.id], booking)
      toast.success('Booking created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update booking status (confirm, cancel, complete, no-show)
 */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
      cancellationReason
    }: {
      id: string
      status: 'confirmed' | 'cancelled' | 'completed' | 'no-show'
      cancellationReason?: string
    }) => {
      const response = await calendarClient.updateBookingStatus(id, status, cancellationReason)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update booking status')
      }
      return response.data
    },
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['booking', id] })

      const previousBooking = queryClient.getQueryData(['booking', id])

      queryClient.setQueryData(['booking', id], (old: any) => {
        if (!old) return old
        return { ...old, status, updated_at: new Date().toISOString() }
      })

      return { previousBooking }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousBooking) {
        queryClient.setQueryData(['booking', _variables.id], context.previousBooking)
      }
      toast.error(error.message)
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking', booking.id] })
      queryClient.invalidateQueries({ queryKey: ['calendar-stats'] })

      const statusMessages = {
        confirmed: 'Booking confirmed',
        cancelled: 'Booking cancelled',
        completed: 'Booking marked as completed',
        'no-show': 'Booking marked as no-show'
      }

      toast.success(statusMessages[booking.status] || 'Booking updated')
    }
  })
}

/**
 * Get calendar statistics
 */
export function useCalendarStats(
  options?: Omit<UseQueryOptions<CalendarStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['calendar-stats'],
    queryFn: async () => {
      const response = await calendarClient.getCalendarStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch calendar stats')
      }
      return response.data
    },
    staleTime: 30000, // Stats are fresh for 30 seconds
    ...options
  })
}
