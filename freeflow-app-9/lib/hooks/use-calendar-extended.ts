'use client'

/**
 * Extended Calendar Hooks - Covers all Calendar-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

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

export function useCalendar(calendarId?: string) {
  const [calendar, setCalendar] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!calendarId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('calendars').select('*').eq('id', calendarId).single()
      setCalendar(data)
    } finally { setIsLoading(false) }
  }, [calendarId])
  useEffect(() => { loadData() }, [loadData])
  return { calendar, isLoading, refresh: loadData }
}

export function useUserCalendars(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('calendars').select('*').eq('user_id', userId).order('is_default', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useCalendarEvents(calendarId?: string, start?: string, end?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!calendarId || !start || !end) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('calendar_events').select('*').eq('calendar_id', calendarId).gte('start_time', start).lte('end_time', end).order('start_time', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [calendarId, start, end])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useSharedCalendars(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('calendar_shares').select('calendar_id, permission, calendars(*)').eq('shared_with_id', userId)
      setData(result?.map(cs => ({ ...cs.calendars, permission: cs.permission })) || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
