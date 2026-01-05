'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type EventType = 'conference' | 'meetup' | 'workshop' | 'webinar' | 'social' | 'training' | 'other'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'waitlist'

export interface Event {
  id: string
  title: string
  description: string
  type: EventType
  status: EventStatus
  startDate: string
  endDate: string
  timezone: string
  location: EventLocation
  isVirtual: boolean
  virtualUrl?: string
  virtualPlatform?: string
  coverImage?: string
  organizer: EventOrganizer
  speakers: EventSpeaker[]
  sponsors: EventSponsor[]
  tickets: EventTicket[]
  agenda: AgendaItem[]
  attendees: EventAttendee[]
  maxAttendees?: number
  tags: string[]
  category: string
  isPublic: boolean
  requiresApproval: boolean
  registrationDeadline?: string
  createdAt: string
  updatedAt: string
}

export interface EventLocation {
  type: 'physical' | 'virtual' | 'hybrid'
  venue?: string
  address?: string
  city?: string
  state?: string
  country?: string
  coordinates?: { lat: number; lng: number }
}

export interface EventOrganizer {
  id: string
  name: string
  email: string
  avatar?: string
  organization?: string
}

export interface EventSpeaker {
  id: string
  name: string
  title: string
  company?: string
  bio?: string
  avatar?: string
  socialLinks?: Record<string, string>
}

export interface EventSponsor {
  id: string
  name: string
  logo?: string
  website?: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
}

export interface EventTicket {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  quantity: number
  sold: number
  maxPerOrder: number
  salesStart?: string
  salesEnd?: string
  isAvailable: boolean
}

export interface AgendaItem {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  speakerIds: string[]
  location?: string
  track?: string
}

export interface EventAttendee {
  id: string
  userId: string
  name: string
  email: string
  avatar?: string
  ticketId: string
  ticketName: string
  rsvpStatus: RSVPStatus
  checkInTime?: string
  registeredAt: string
}

export interface EventStats {
  totalEvents: number
  upcomingEvents: number
  completedEvents: number
  totalAttendees: number
  avgAttendance: number
  ticketRevenue: number
  popularCategories: { category: string; count: number }[]
  attendanceTrend: { date: string; count: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockEvents: Event[] = [
  {
    id: 'evt-1',
    title: 'Annual Tech Summit 2024',
    description: 'Join us for our biggest event of the year! Network with industry leaders and learn about the latest trends.',
    type: 'conference',
    status: 'published',
    startDate: '2024-04-15T09:00:00Z',
    endDate: '2024-04-16T18:00:00Z',
    timezone: 'America/New_York',
    location: {
      type: 'hybrid',
      venue: 'Convention Center',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    isVirtual: true,
    virtualUrl: 'https://stream.example.com/tech-summit',
    virtualPlatform: 'Zoom',
    coverImage: '/events/tech-summit.jpg',
    organizer: { id: 'user-1', name: 'Alex Chen', email: 'alex@example.com', organization: 'FreeFlow' },
    speakers: [
      { id: 'spk-1', name: 'Jane Smith', title: 'CEO', company: 'TechCorp', bio: 'Industry veteran with 20 years experience' },
      { id: 'spk-2', name: 'John Doe', title: 'CTO', company: 'StartupX', bio: 'Serial entrepreneur and innovator' }
    ],
    sponsors: [
      { id: 'spon-1', name: 'TechCorp', tier: 'platinum', website: 'https://techcorp.com' },
      { id: 'spon-2', name: 'CloudHost', tier: 'gold', website: 'https://cloudhost.com' }
    ],
    tickets: [
      { id: 'tkt-1', name: 'Early Bird', price: 199, currency: 'USD', quantity: 100, sold: 85, maxPerOrder: 5, isAvailable: true },
      { id: 'tkt-2', name: 'Regular', price: 299, currency: 'USD', quantity: 200, sold: 120, maxPerOrder: 5, isAvailable: true },
      { id: 'tkt-3', name: 'VIP', price: 499, currency: 'USD', quantity: 50, sold: 35, maxPerOrder: 2, isAvailable: true }
    ],
    agenda: [
      { id: 'agd-1', title: 'Opening Keynote', startTime: '09:00', endTime: '10:00', speakerIds: ['spk-1'] },
      { id: 'agd-2', title: 'Future of AI Panel', startTime: '10:30', endTime: '12:00', speakerIds: ['spk-1', 'spk-2'] }
    ],
    attendees: [
      { id: 'att-1', userId: 'user-3', name: 'Emily Johnson', email: 'emily@example.com', ticketId: 'tkt-2', ticketName: 'Regular', rsvpStatus: 'confirmed', registeredAt: '2024-03-01' }
    ],
    maxAttendees: 350,
    tags: ['tech', 'conference', 'networking'],
    category: 'Technology',
    isPublic: true,
    requiresApproval: false,
    registrationDeadline: '2024-04-14',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-15'
  },
  {
    id: 'evt-2',
    title: 'Product Workshop: Building Better UX',
    description: 'A hands-on workshop on creating exceptional user experiences.',
    type: 'workshop',
    status: 'published',
    startDate: '2024-03-28T14:00:00Z',
    endDate: '2024-03-28T17:00:00Z',
    timezone: 'America/New_York',
    location: { type: 'virtual' },
    isVirtual: true,
    virtualUrl: 'https://meet.example.com/ux-workshop',
    virtualPlatform: 'Google Meet',
    organizer: { id: 'user-2', name: 'Sarah Miller', email: 'sarah@example.com' },
    speakers: [{ id: 'spk-3', name: 'Design Expert', title: 'Lead Designer', company: 'DesignCo' }],
    sponsors: [],
    tickets: [{ id: 'tkt-4', name: 'Workshop Pass', price: 49, currency: 'USD', quantity: 30, sold: 18, maxPerOrder: 1, isAvailable: true }],
    agenda: [],
    attendees: [],
    maxAttendees: 30,
    tags: ['workshop', 'design', 'ux'],
    category: 'Design',
    isPublic: true,
    requiresApproval: false,
    createdAt: '2024-03-10',
    updatedAt: '2024-03-15'
  }
]

const mockStats: EventStats = {
  totalEvents: 45,
  upcomingEvents: 8,
  completedEvents: 35,
  totalAttendees: 2850,
  avgAttendance: 63,
  ticketRevenue: 125000,
  popularCategories: [
    { category: 'Technology', count: 18 },
    { category: 'Design', count: 12 },
    { category: 'Business', count: 10 }
  ],
  attendanceTrend: [
    { date: '2024-01', count: 320 },
    { date: '2024-02', count: 410 },
    { date: '2024-03', count: 380 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseEventsOptions {
  
}

export function useEvents(options: UseEventsOptions = {}) {
  const {  } = options

  const [events, setEvents] = useState<Event[]>([])
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<EventStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEvents = useCallback(async () => {
    }, [])

  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      ...updates,
      updatedAt: new Date().toISOString()
    } : e))
    return { success: true }
  }, [])

  const deleteEvent = useCallback(async (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
    return { success: true }
  }, [])

  const publishEvent = useCallback(async (eventId: string) => {
    return updateEvent(eventId, { status: 'published' })
  }, [updateEvent])

  const cancelEvent = useCallback(async (eventId: string) => {
    return updateEvent(eventId, { status: 'cancelled' })
  }, [updateEvent])

  const completeEvent = useCallback(async (eventId: string) => {
    return updateEvent(eventId, { status: 'completed' })
  }, [updateEvent])

  const addSpeaker = useCallback(async (eventId: string, speaker: Omit<EventSpeaker, 'id'>) => {
    const newSpeaker: EventSpeaker = { id: `spk-${Date.now()}`, ...speaker }
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      speakers: [...e.speakers, newSpeaker]
    } : e))
    return { success: true, speaker: newSpeaker }
  }, [])

  const removeSpeaker = useCallback(async (eventId: string, speakerId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      speakers: e.speakers.filter(s => s.id !== speakerId)
    } : e))
    return { success: true }
  }, [])

  const addTicketType = useCallback(async (eventId: string, ticket: Omit<EventTicket, 'id' | 'sold'>) => {
    const newTicket: EventTicket = { id: `tkt-${Date.now()}`, sold: 0, ...ticket }
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      tickets: [...e.tickets, newTicket]
    } : e))
    return { success: true, ticket: newTicket }
  }, [])

  const updateTicketType = useCallback(async (eventId: string, ticketId: string, updates: Partial<EventTicket>) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      tickets: e.tickets.map(t => t.id === ticketId ? { ...t, ...updates } : t)
    } : e))
    return { success: true }
  }, [])

  const removeTicketType = useCallback(async (eventId: string, ticketId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      tickets: e.tickets.filter(t => t.id !== ticketId)
    } : e))
    return { success: true }
  }, [])

  const addAgendaItem = useCallback(async (eventId: string, item: Omit<AgendaItem, 'id'>) => {
    const newItem: AgendaItem = { id: `agd-${Date.now()}`, ...item }
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      agenda: [...e.agenda, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime))
    } : e))
    return { success: true, item: newItem }
  }, [])

  const updateAgendaItem = useCallback(async (eventId: string, itemId: string, updates: Partial<AgendaItem>) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      agenda: e.agenda.map(i => i.id === itemId ? { ...i, ...updates } : i)
    } : e))
    return { success: true }
  }, [])

  const removeAgendaItem = useCallback(async (eventId: string, itemId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      agenda: e.agenda.filter(i => i.id !== itemId)
    } : e))
    return { success: true }
  }, [])

  const registerAttendee = useCallback(async (eventId: string, ticketId: string, attendeeData: { name: string; email: string }) => {
    const event = events.find(e => e.id === eventId)
    const ticket = event?.tickets.find(t => t.id === ticketId)
    if (!event || !ticket) return { success: false, error: 'Event or ticket not found' }
    if (ticket.sold >= ticket.quantity) return { success: false, error: 'Ticket sold out' }

    const attendee: EventAttendee = {
      id: `att-${Date.now()}`,
      userId: 'user-new',
      name: attendeeData.name,
      email: attendeeData.email,
      ticketId,
      ticketName: ticket.name,
      rsvpStatus: event.requiresApproval ? 'pending' : 'confirmed',
      registeredAt: new Date().toISOString()
    }

    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      attendees: [...e.attendees, attendee],
      tickets: e.tickets.map(t => t.id === ticketId ? { ...t, sold: t.sold + 1 } : t)
    } : e))

    return { success: true, attendee }
  }, [events])

  const updateAttendeeStatus = useCallback(async (eventId: string, attendeeId: string, status: RSVPStatus) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      attendees: e.attendees.map(a => a.id === attendeeId ? { ...a, rsvpStatus: status } : a)
    } : e))
    return { success: true }
  }, [])

  const checkInAttendee = useCallback(async (eventId: string, attendeeId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      attendees: e.attendees.map(a => a.id === attendeeId ? {
        ...a,
        checkInTime: new Date().toISOString()
      } : a)
    } : e))
    return { success: true }
  }, [])

  const removeAttendee = useCallback(async (eventId: string, attendeeId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      attendees: e.attendees.filter(a => a.id !== attendeeId)
    } : e))
    return { success: true }
  }, [])

  const duplicateEvent = useCallback(async (eventId: string) => {
    const original = events.find(e => e.id === eventId)
    if (!original) return { success: false, error: 'Event not found' }

    const duplicate: Event = {
      ...original,
      id: `evt-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      attendees: [],
      tickets: original.tickets.map(t => ({ ...t, id: `tkt-${Date.now()}`, sold: 0 })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setEvents(prev => [duplicate, ...prev])
    return { success: true, event: duplicate }
  }, [events])

  const searchEvents = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return events.filter(e =>
      e.title.toLowerCase().includes(lowerQuery) ||
      e.description.toLowerCase().includes(lowerQuery) ||
      e.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
  }, [events])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchEvents()
  }, [fetchEvents])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const upcomingEvents = useMemo(() => events.filter(e => e.status === 'published' && new Date(e.startDate) > new Date()).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), [events])
  const pastEvents = useMemo(() => events.filter(e => e.status === 'completed' || new Date(e.endDate) < new Date()), [events])
  const draftEvents = useMemo(() => events.filter(e => e.status === 'draft'), [events])
  const cancelledEvents = useMemo(() => events.filter(e => e.status === 'cancelled'), [events])
  const todayEvents = useMemo(() => {
    const today = new Date().toDateString()
    return events.filter(e => new Date(e.startDate).toDateString() === today)
  }, [events])

  return {
    events, currentEvent, stats,
    upcomingEvents, pastEvents, draftEvents, cancelledEvents, todayEvents,
    isLoading, error,
    refresh, createEvent, updateEvent, deleteEvent,
    publishEvent, cancelEvent, completeEvent, duplicateEvent,
    addSpeaker, removeSpeaker,
    addTicketType, updateTicketType, removeTicketType,
    addAgendaItem, updateAgendaItem, removeAgendaItem,
    registerAttendee, updateAttendeeStatus, checkInAttendee, removeAttendee,
    searchEvents, setCurrentEvent
  }
}

export default useEvents
