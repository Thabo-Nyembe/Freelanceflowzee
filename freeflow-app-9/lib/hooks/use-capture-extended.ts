'use client'

/**
 * Extended Capture Hooks
 * Tables: captures, capture_sessions, capture_frames, capture_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCapture(captureId?: string) {
  const [capture, setCapture] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!captureId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('captures').select('*, capture_frames(*)').eq('id', captureId).single(); setCapture(data) } finally { setIsLoading(false) }
  }, [captureId])
  useEffect(() => { fetch() }, [fetch])
  return { capture, isLoading, refresh: fetch }
}

export function useCaptures(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  const [captures, setCaptures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('captures').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCaptures(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { captures, isLoading, refresh: fetch }
}

export function useCaptureFrames(captureId?: string, options?: { limit?: number }) {
  const [frames, setFrames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!captureId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('capture_frames').select('*').eq('capture_id', captureId).order('frame_number', { ascending: true }).limit(options?.limit || 100); setFrames(data || []) } finally { setIsLoading(false) }
  }, [captureId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { frames, isLoading, refresh: fetch }
}

export function useCaptureSessions(captureId?: string) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!captureId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('capture_sessions').select('*').eq('capture_id', captureId).order('started_at', { ascending: false }); setSessions(data || []) } finally { setIsLoading(false) }
  }, [captureId])
  useEffect(() => { fetch() }, [fetch])
  return { sessions, isLoading, refresh: fetch }
}

export function useActiveCaptures(userId?: string) {
  const [captures, setCaptures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('captures').select('*').eq('user_id', userId).eq('status', 'capturing').order('created_at', { ascending: false }); setCaptures(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { captures, isLoading, refresh: fetch }
}

export function useCaptureRealtime(captureId?: string) {
  const [capture, setCapture] = useState<any>(null)
  const [latestFrame, setLatestFrame] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!captureId) return
    supabase.from('captures').select('*').eq('id', captureId).single().then(({ data }) => setCapture(data))
    const channel = supabase.channel(`capture_${captureId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'captures', filter: `id=eq.${captureId}` }, (payload) => {
        setCapture(payload.new)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'capture_frames', filter: `capture_id=eq.${captureId}` }, (payload) => {
        setLatestFrame(payload.new)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [captureId])
  return { capture, latestFrame }
}
