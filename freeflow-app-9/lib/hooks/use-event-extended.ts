'use client'

/**
 * Extended Event Hooks - Covers all Event-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useEvents(status?: string, eventType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('events').select('*').order('start_date', { ascending: true })
      if (status) query = query.eq('status', status)
      if (eventType) query = query.eq('event_type', eventType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [status, eventType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEventRegistrations(eventId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('event_registrations').select('*').eq('event_id', eventId).order('registered_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
