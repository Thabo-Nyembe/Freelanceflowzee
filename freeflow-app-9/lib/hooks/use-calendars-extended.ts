'use client'

/**
 * Extended Calendars Hooks
 * Tables: calendars, calendar_events, calendar_sharing, calendar_sync
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCalendar(calendarId?: string) {
  const [calendar, setCalendar] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!calendarId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('calendars').select('*').eq('id', calendarId).single(); setCalendar(data) } finally { setIsLoading(false) }
  }, [calendarId])
  useEffect(() => { fetch() }, [fetch])
  return { calendar, isLoading, refresh: fetch }
}

export function useCalendars(userId?: string) {
  const [calendars, setCalendars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('calendars').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('name', { ascending: true }); setCalendars(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { calendars, isLoading, refresh: fetch }
}

export function useCalendarEvents(calendarId?: string, options?: { start_date?: string; end_date?: string; limit?: number }) {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!calendarId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('calendar_events').select('*').eq('calendar_id', calendarId)
      if (options?.start_date) query = query.gte('start_time', options.start_date)
      if (options?.end_date) query = query.lte('end_time', options.end_date)
      const { data } = await query.order('start_time', { ascending: true }).limit(options?.limit || 100)
      setEvents(data || [])
    } finally { setIsLoading(false) }
  }, [calendarId, options?.start_date, options?.end_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { events, isLoading, refresh: fetch }
}

export function useAllCalendarEvents(userId?: string, options?: { start_date?: string; end_date?: string }) {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: calendars } = await supabase.from('calendars').select('id').eq('user_id', userId).eq('is_visible', true)
      if (!calendars?.length) { setEvents([]); return }
      let query = supabase.from('calendar_events').select('*, calendars(name, color)').in('calendar_id', calendars.map(c => c.id))
      if (options?.start_date) query = query.gte('start_time', options.start_date)
      if (options?.end_date) query = query.lte('end_time', options.end_date)
      const { data } = await query.order('start_time', { ascending: true })
      setEvents(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.start_date, options?.end_date])
  useEffect(() => { fetch() }, [fetch])
  return { events, isLoading, refresh: fetch }
}

export function useSharedCalendars(userId?: string) {
  const [calendars, setCalendars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('calendar_sharing').select('*, calendars(*)').eq('shared_with_id', userId); setCalendars(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { calendars, isLoading, refresh: fetch }
}

export function useUpcomingEvents(userId?: string, limit?: number) {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: calendars } = await supabase.from('calendars').select('id').eq('user_id', userId).eq('is_visible', true)
      if (!calendars?.length) { setEvents([]); return }
      const now = new Date().toISOString()
      const { data } = await supabase.from('calendar_events').select('*, calendars(name, color)').in('calendar_id', calendars.map(c => c.id)).gte('start_time', now).order('start_time', { ascending: true }).limit(limit || 10)
      setEvents(data || [])
    } finally { setIsLoading(false) }
  }, [userId, limit])
  useEffect(() => { fetch() }, [fetch])
  return { events, isLoading, refresh: fetch }
}

export function useTodayEvents(userId?: string) {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
      const { data: calendars } = await supabase.from('calendars').select('id').eq('user_id', userId).eq('is_visible', true)
      if (!calendars?.length) { setEvents([]); return }
      const { data } = await supabase.from('calendar_events').select('*, calendars(name, color)').in('calendar_id', calendars.map(c => c.id)).gte('start_time', startOfDay).lt('start_time', endOfDay).order('start_time', { ascending: true })
      setEvents(data || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { events, isLoading, refresh: fetch }
}
