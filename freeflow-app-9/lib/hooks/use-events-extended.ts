'use client'

/**
 * Extended Events Hooks - Covers all Event-related tables
 * Tables: events, event_attachments, event_attendees, event_recurrence, event_registrations, event_reminders, event_views
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useEvent(eventId?: string) {
  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
      setEvent(data)
    } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { event, isLoading, refresh: fetch }
}

export function useEvents(options?: { organizerId?: string; calendarId?: string; startDate?: string; endDate?: string; status?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
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
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.organizerId, options?.calendarId, options?.startDate, options?.endDate, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEventAttendees(eventId?: string, options?: { status?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('event_attendees').select('*, users(id, name, email, avatar_url)').eq('event_id', eventId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [eventId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEventAttachments(eventId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('event_attachments').select('*').eq('event_id', eventId).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEventRecurrence(eventId?: string) {
  const [recurrence, setRecurrence] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('event_recurrence').select('*').eq('event_id', eventId).single()
      setRecurrence(data)
    } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { recurrence, isLoading, refresh: fetch }
}

export function useEventRegistrations(eventId?: string, options?: { status?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('event_registrations').select('*, users(id, name, email)').eq('event_id', eventId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [eventId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserEvents(userId?: string, options?: { upcoming?: boolean; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('events').select('*').eq('organizer_id', userId)
      if (options?.upcoming) query = query.gte('start_date', new Date().toISOString())
      const { data: result } = await query.order('start_date', { ascending: true }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.upcoming, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEventViewCount(eventId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
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
  const [event, setEvent] = useState<any>(null)
  const [attendees, setAttendees] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [recurrence, setRecurrence] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
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
      setEvent(eventRes.data)
      setAttendees(attendeesRes.data || [])
      setAttachments(attachmentsRes.data || [])
      setRecurrence(recurrenceRes.data)
    } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { event, attendees, attachments, recurrence, isLoading, refresh: fetch }
}

export function useEventsRealtime(organizerId?: string) {
  const [events, setEvents] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!organizerId) return
    supabase.from('events').select('*').eq('organizer_id', organizerId).order('start_date', { ascending: true }).limit(100).then(({ data }) => setEvents(data || []))
    const channel = supabase.channel(`events_${organizerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `organizer_id=eq.${organizerId}` }, () => {
        supabase.from('events').select('*').eq('organizer_id', organizerId).order('start_date', { ascending: true }).limit(100).then(({ data }) => setEvents(data || []))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [organizerId])
  return { events }
}
