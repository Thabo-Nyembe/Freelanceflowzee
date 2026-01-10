'use client'

/**
 * Extended Session Hooks - Covers all Session-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUserSessions(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('user_sessions').select('*').eq('user_id', userId).order('last_active_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSessionRecordings(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('session_recordings').select('*').eq('session_id', sessionId).order('started_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSessionEvents(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('session_events').select('*').eq('session_id', sessionId).order('timestamp', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
