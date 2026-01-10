'use client'

/**
 * Extended Webinars Hooks
 * Tables: webinars, webinar_registrations, webinar_sessions, webinar_recordings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWebinar(webinarId?: string) {
  const [webinar, setWebinar] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!webinarId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('webinars').select('*, webinar_sessions(*)').eq('id', webinarId).single(); setWebinar(data) } finally { setIsLoading(false) }
  }, [webinarId])
  useEffect(() => { fetch() }, [fetch])
  return { webinar, isLoading, refresh: fetch }
}

export function useWebinars(options?: { user_id?: string; status?: string; is_public?: boolean; limit?: number }) {
  const [webinars, setWebinars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('webinars').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 50)
      setWebinars(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.is_public, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { webinars, isLoading, refresh: fetch }
}

export function useWebinarRegistrations(webinarId?: string, options?: { status?: string }) {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!webinarId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('webinar_registrations').select('*').eq('webinar_id', webinarId); if (options?.status) query = query.eq('status', options.status); const { data } = await query.order('created_at', { ascending: false }); setRegistrations(data || []) } finally { setIsLoading(false) }
  }, [webinarId, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { registrations, isLoading, refresh: fetch }
}

export function useWebinarRecordings(webinarId?: string) {
  const [recordings, setRecordings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!webinarId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('webinar_recordings').select('*').eq('webinar_id', webinarId).order('created_at', { ascending: false }); setRecordings(data || []) } finally { setIsLoading(false) }
  }, [webinarId])
  useEffect(() => { fetch() }, [fetch])
  return { recordings, isLoading, refresh: fetch }
}

export function useUpcomingWebinars(options?: { limit?: number }) {
  const [webinars, setWebinars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('webinars').select('*').eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(options?.limit || 10); setWebinars(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { webinars, isLoading, refresh: fetch }
}
