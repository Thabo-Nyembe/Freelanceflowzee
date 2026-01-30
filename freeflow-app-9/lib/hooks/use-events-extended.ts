'use client'

/**
 * Extended Events Hooks - Covers all Event-related tables
 * Tables: events, event_attachments, event_attendees, event_recurrence, event_registrations, event_reminders, event_views
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

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

/** Base event record */
export interface ExtendedEventRecord {
  id: string
  user_id?: string
  organizer_id?: string
  calendar_id?: string | null
  title: string
  description: string | null
  event_type: string
  status: string
  start_date: string
  end_date: string | null
  location: string | null
  metadata: Record<string, JsonValue> | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** User info for joins */
export interface UserInfo {
  id: string
  name: string | null
  email: string
  avatar_url: string | null
}

/** Event attendee record with user join */
export interface EventAttendeeRecord {
  id: string
  event_id: string
  user_id: string
  status: string
  created_at: string
  updated_at: string
  users?: UserInfo
}

/** Event attachment record */
export interface EventAttachmentRecord {
  id: string
  event_id: string
  name: string
  url: string
  file_type: string | null
  file_size: number | null
  created_at: string
}

/** Event recurrence record */
export interface EventRecurrenceRecord {
  id: string
  event_id: string
  frequency: string
  interval: number
  end_date: string | null
  count: number | null
  by_day: string[] | null
  by_month: number[] | null
  created_at: string
}

/** Event registration record with user join */
export interface ExtendedEventRegistrationRecord {
  id: string
  event_id: string
  user_id: string
  status: string
  created_at: string
  updated_at: string
  users?: { id: string; name: string | null; email: string }
}

export function useEvent(eventId?: string) {
  const [event, setEvent] = useState<ExtendedEventRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
      setEvent(data as ExtendedEventRecord | null)
    } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { event, isLoading, refresh: fetch }
}

export function useEvents(options?: { organizerId?: string; calendarId?: string; startDate?: string; endDate?: string; status?: string; limit?: number }) {
  const [data, setData] = useState<ExtendedEventRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('events').select('*')
      if (options?.organizerId) query = query.eq('organizer_id', options.organizerId)
      if (options?.calendarId) query = query.eq('calendar_id', options.calendarId)
      if (options?.startDate) query = query.gte('start_date', options.startDate)
      if (options?.endDate) query = query.lte('start_date', options.endDate)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('start_date', { ascending: true }).limit(options?.limit || 100)
      setData((result as ExtendedEventRecord[]) || [])
    } finally { setIsLoading(false) }
  }, [options?.organizerId, options?.calendarId, options?.startDate, options?.endDate, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEventAttendees(eventId?: string, options?: { status?: string }) {
  const [data, setData] = useState<EventAttendeeRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('event_attendees').select('*, users(id, name, email, avatar_url)').eq('event_id', eventId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: true })
      setData((result as EventAttendeeRecord[]) || [])
    } finally { setIsLoading(false) }
  }, [eventId, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEventAttachments(eventId?: string) {
  const [data, setData] = useState<EventAttachmentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('event_attachments').select('*').eq('event_id', eventId).order('created_at', { ascending: true })
      setData((result as EventAttachmentRecord[]) || [])
    } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEventRecurrence(eventId?: string) {
  const [recurrence, setRecurrence] = useState<EventRecurrenceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('event_recurrence').select('*').eq('event_id', eventId).single()
      setRecurrence(data as EventRecurrenceRecord | null)
    } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { recurrence, isLoading, refresh: fetch }
}

export function useEventRegistrations(eventId?: string, options?: { status?: string; limit?: number }) {
  const [data, setData] = useState<ExtendedEventRegistrationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('event_registrations').select('*, users(id, name, email)').eq('event_id', eventId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setData((result as ExtendedEventRegistrationRecord[]) || [])
    } finally { setIsLoading(false) }
  }, [eventId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserEvents(userId?: string, options?: { upcoming?: boolean; limit?: number }) {
  const [data, setData] = useState<ExtendedEventRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('events').select('*').eq('organizer_id', userId)
      if (options?.upcoming) query = query.gte('start_date', new Date().toISOString())
      const { data: result } = await query.order('start_date', { ascending: true }).limit(options?.limit || 50)
      setData((result as ExtendedEventRecord[]) || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.upcoming, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEventViewCount(eventId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('event_views').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useEventWithDetails(eventId?: string) {
  const [event, setEvent] = useState<ExtendedEventRecord | null>(null)
  const [attendees, setAttendees] = useState<EventAttendeeRecord[]>([])
  const [attachments, setAttachments] = useState<EventAttachmentRecord[]>([])
  const [recurrence, setRecurrence] = useState<EventRecurrenceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [eventRes, attendeesRes, attachmentsRes, recurrenceRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase.from('event_attendees').select('*, users(id, name, email, avatar_url)').eq('event_id', eventId),
        supabase.from('event_attachments').select('*').eq('event_id', eventId),
        supabase.from('event_recurrence').select('*').eq('event_id', eventId).single()
      ])
      setEvent(eventRes.data as ExtendedEventRecord | null)
      setAttendees((attendeesRes.data as EventAttendeeRecord[]) || [])
      setAttachments((attachmentsRes.data as EventAttachmentRecord[]) || [])
      setRecurrence(recurrenceRes.data as EventRecurrenceRecord | null)
    } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { event, attendees, attachments, recurrence, isLoading, refresh: fetch }
}

export function useEventsRealtime(organizerId?: string) {
  const [events, setEvents] = useState<ExtendedEventRecord[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (isDemoModeEnabled()) return
    if (!organizerId) return
    supabase.from('events').select('*').eq('organizer_id', organizerId).order('start_date', { ascending: true }).limit(100).then(({ data }) => setEvents((data as ExtendedEventRecord[]) || []))
    const channel = supabase.channel(`events_${organizerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `organizer_id=eq.${organizerId}` }, () => {
        supabase.from('events').select('*').eq('organizer_id', organizerId).order('start_date', { ascending: true }).limit(100).then(({ data }) => setEvents((data as ExtendedEventRecord[]) || []))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [organizerId])
  return { events }
}
