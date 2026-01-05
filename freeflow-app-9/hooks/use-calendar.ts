'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type EventType = 'meeting' | 'task' | 'reminder' | 'deadline' | 'holiday' | 'personal' | 'other'
export type EventStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: EventType
  status: EventStatus
  startDate: string
  endDate: string
  allDay: boolean
  location?: string
  meetingUrl?: string
  recurrence: RecurrencePattern
  recurrenceEndDate?: string
  color: string
  attendees: EventAttendee[]
  reminders: EventReminder[]
  projectId?: string
  projectName?: string
  clientId?: string
  clientName?: string
  isPrivate: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface EventAttendee {
  id: string
  name: string
  email: string
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
  isOrganizer: boolean
}

export interface EventReminder {
  id: string
  type: 'email' | 'push' | 'sms'
  minutesBefore: number
  sent: boolean
}

export interface CalendarView {
  type: 'day' | 'week' | 'month' | 'agenda'
  date: Date
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockEvents: CalendarEvent[] = [
  { id: 'evt-1', title: 'Team Standup', description: 'Daily team sync', type: 'meeting', status: 'scheduled', startDate: '2024-03-21T09:00:00Z', endDate: '2024-03-21T09:30:00Z', allDay: false, meetingUrl: 'https://meet.google.com/abc', recurrence: 'daily', color: '#3B82F6', attendees: [{ id: 'a1', name: 'Alex Chen', email: 'alex@company.com', status: 'accepted', isOrganizer: true }], reminders: [{ id: 'r1', type: 'push', minutesBefore: 15, sent: false }], isPrivate: false, createdBy: 'user-1', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: 'evt-2', title: 'Client Presentation', description: 'Q1 results presentation', type: 'meeting', status: 'scheduled', startDate: '2024-03-22T14:00:00Z', endDate: '2024-03-22T15:30:00Z', allDay: false, location: 'Conference Room A', clientId: 'client-1', clientName: 'Acme Corp', recurrence: 'none', color: '#10B981', attendees: [{ id: 'a2', name: 'John Smith', email: 'john@acme.com', status: 'accepted', isOrganizer: false }], reminders: [{ id: 'r2', type: 'email', minutesBefore: 60, sent: false }], isPrivate: false, createdBy: 'user-1', createdAt: '2024-03-15', updatedAt: '2024-03-15' },
  { id: 'evt-3', title: 'Project Deadline', description: 'Website redesign delivery', type: 'deadline', status: 'scheduled', startDate: '2024-03-25T23:59:00Z', endDate: '2024-03-25T23:59:00Z', allDay: true, projectId: 'proj-1', projectName: 'Website Redesign', recurrence: 'none', color: '#EF4444', attendees: [], reminders: [{ id: 'r3', type: 'push', minutesBefore: 1440, sent: false }], isPrivate: false, createdBy: 'user-1', createdAt: '2024-02-01', updatedAt: '2024-02-01' },
  { id: 'evt-4', title: 'Lunch with Sarah', type: 'personal', status: 'scheduled', startDate: '2024-03-21T12:00:00Z', endDate: '2024-03-21T13:00:00Z', allDay: false, location: 'Downtown Cafe', recurrence: 'none', color: '#F59E0B', attendees: [], reminders: [], isPrivate: true, createdBy: 'user-1', createdAt: '2024-03-18', updatedAt: '2024-03-18' },
  { id: 'evt-5', title: 'Holiday - Good Friday', type: 'holiday', status: 'scheduled', startDate: '2024-03-29T00:00:00Z', endDate: '2024-03-29T23:59:00Z', allDay: true, recurrence: 'none', color: '#8B5CF6', attendees: [], reminders: [], isPrivate: false, createdBy: 'system', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseCalendarOptions {
  
  projectId?: string
  userId?: string
}

export function useCalendar(options: UseCalendarOptions = {}) {
  const {  projectId, userId } = options

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null)
  const [view, setView] = useState<CalendarView>({ type: 'month', date: new Date() })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const fetchEvents = useCallback(async (filters?: { dateFrom?: string; dateTo?: string; type?: string }) => {
    try {
      const params = new URLSearchParams()
      if (projectId) params.set('projectId', projectId)
      if (userId) params.set('userId', userId)
      if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.set('dateTo', filters.dateTo)
      if (filters?.type) params.set('type', filters.type)

      const response = await fetch(`/api/calendar?${params}`)
      const result = await response.json()
      if (result.success) {
        setEvents(Array.isArray(result.events) ? result.events : [])
        return result.events
      }
      setEvents([])
      return []
    } catch (err) {
      setEvents([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ projectId, userId])

  const createEvent = useCallback(async (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchEvents()
        return { success: true, event: result.event }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newEvent: CalendarEvent = { ...data, id: `evt-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setEvents(prev => [...prev, newEvent])
      return { success: true, event: newEvent }
    }
  }, [fetchEvents])

  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      }
      return result
    } catch (err) {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates } : e))
      return { success: true }
    }
  }, [])

  const deleteEvent = useCallback(async (eventId: string, deleteRecurring?: boolean) => {
    try {
      await fetch(`/api/calendar/${eventId}?deleteRecurring=${deleteRecurring}`, { method: 'DELETE' })
      setEvents(prev => prev.filter(e => e.id !== eventId))
      return { success: true }
    } catch (err) {
      setEvents(prev => prev.filter(e => e.id !== eventId))
      return { success: true }
    }
  }, [])

  const rescheduleEvent = useCallback(async (eventId: string, newStartDate: string, newEndDate: string) => {
    return updateEvent(eventId, { startDate: newStartDate, endDate: newEndDate, status: 'rescheduled' })
  }, [updateEvent])

  const cancelEvent = useCallback(async (eventId: string) => {
    return updateEvent(eventId, { status: 'cancelled' })
  }, [updateEvent])

  const completeEvent = useCallback(async (eventId: string) => {
    return updateEvent(eventId, { status: 'completed' })
  }, [updateEvent])

  const addAttendee = useCallback(async (eventId: string, attendee: Omit<EventAttendee, 'id' | 'status'>) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      const newAttendee: EventAttendee = { ...attendee, id: `att-${Date.now()}`, status: 'pending' }
      return updateEvent(eventId, { attendees: [...event.attendees, newAttendee] })
    }
    return { success: false, error: 'Event not found' }
  }, [events, updateEvent])

  const updateAttendeeStatus = useCallback(async (eventId: string, attendeeId: string, status: EventAttendee['status']) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      const updatedAttendees = event.attendees.map(a => a.id === attendeeId ? { ...a, status } : a)
      return updateEvent(eventId, { attendees: updatedAttendees })
    }
    return { success: false, error: 'Event not found' }
  }, [events, updateEvent])

  const duplicateEvent = useCallback(async (eventId: string, newDate: string) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      const duration = new Date(event.endDate).getTime() - new Date(event.startDate).getTime()
      const newEndDate = new Date(new Date(newDate).getTime() + duration).toISOString()
      const newEvent: CalendarEvent = { ...event, id: `evt-${Date.now()}`, startDate: newDate, endDate: newEndDate, status: 'scheduled', attendees: event.attendees.map(a => ({ ...a, status: 'pending' as const })), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setEvents(prev => [...prev, newEvent])
      return { success: true, event: newEvent }
    }
    return { success: false, error: 'Event not found' }
  }, [events])

  const navigateView = useCallback((direction: 'prev' | 'next' | 'today') => {
    setView(prev => {
      const newDate = new Date(prev.date)
      if (direction === 'today') {
        return { ...prev, date: new Date() }
      }
      const delta = direction === 'next' ? 1 : -1
      switch (prev.type) {
        case 'day': newDate.setDate(newDate.getDate() + delta); break
        case 'week': newDate.setDate(newDate.getDate() + (7 * delta)); break
        case 'month': newDate.setMonth(newDate.getMonth() + delta); break
        case 'agenda': newDate.setDate(newDate.getDate() + (7 * delta)); break
      }
      return { ...prev, date: newDate }
    })
  }, [])

  const changeViewType = useCallback((type: CalendarView['type']) => {
    setView(prev => ({ ...prev, type }))
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchEvents()
  }, [fetchEvents])

  useEffect(() => { refresh() }, [refresh])

  const todayEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return events.filter(e => e.startDate.startsWith(today))
  }, [events])

  const upcomingEvents = useMemo(() => {
    const now = new Date().toISOString()
    return events.filter(e => e.startDate > now && e.status === 'scheduled').sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 10)
  }, [events])

  const eventsForSelectedDate = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    return events.filter(e => e.startDate.startsWith(dateStr))
  }, [events, selectedDate])

  const eventsByType = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {}
    events.forEach(e => {
      if (!grouped[e.type]) grouped[e.type] = []
      grouped[e.type].push(e)
    })
    return grouped
  }, [events])

  const eventTypes: EventType[] = ['meeting', 'task', 'reminder', 'deadline', 'holiday', 'personal', 'other']
  const eventColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1']

  return {
    events, currentEvent, view, selectedDate, todayEvents, upcomingEvents, eventsForSelectedDate, eventsByType, eventTypes, eventColors,
    isLoading, error,
    refresh, fetchEvents, createEvent, updateEvent, deleteEvent, rescheduleEvent, cancelEvent, completeEvent, addAttendee, updateAttendeeStatus, duplicateEvent,
    navigateView, changeViewType, setSelectedDate, setCurrentEvent
  }
}

export default useCalendar
