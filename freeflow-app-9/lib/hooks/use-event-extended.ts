'use client'

/**
 * Extended Event Hooks - Covers all Event-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

/** Event record from the events table */
export interface EventRecord {
  id: string
  user_id: string
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

/** Event registration record */
export interface EventRegistrationRecord {
  id: string
  event_id: string
  user_id: string
  status: string
  registered_at: string
  metadata: Record<string, JsonValue> | null
  created_at: string
  updated_at: string
}

export function useEvents(status?: string, eventType?: string) {
  const [data, setData] = useState<EventRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('events').select('*').order('start_date', { ascending: true })
      if (status) query = query.eq('status', status)
      if (eventType) query = query.eq('event_type', eventType)
      const { data: result } = await query
      setData((result as EventRecord[]) || [])
    } finally { setIsLoading(false) }
  }, [status, eventType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useEventRegistrations(eventId?: string) {
  const [data, setData] = useState<EventRegistrationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!eventId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('event_registrations').select('*').eq('event_id', eventId).order('registered_at', { ascending: false }); setData((result as EventRegistrationRecord[]) || []) } finally { setIsLoading(false) }
  }, [eventId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
