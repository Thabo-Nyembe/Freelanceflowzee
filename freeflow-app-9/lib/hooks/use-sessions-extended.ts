'use client'

/**
 * Extended Sessions Hooks
 * Tables: sessions, session_tokens, session_activities, session_devices, session_logs, session_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSession(sessionId?: string) {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('sessions').select('*, session_tokens(*), session_devices(*), session_activities(*), users(*)').eq('id', sessionId).single(); setSession(data) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { loadData() }, [loadData])
  return { session, isLoading, refresh: loadData }
}

export function useSessions(options?: { user_id?: string; status?: string; device_id?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sessions').select('*, session_devices(*), users(*)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.device_id) query = query.eq('device_id', options.device_id)
      if (options?.from_date) query = query.gte('started_at', options.from_date)
      if (options?.to_date) query = query.lte('started_at', options.to_date)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setSessions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.device_id, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, isLoading, refresh: loadData }
}

export function useUserActiveSessions(userId?: string) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('sessions').select('*, session_devices(*)').eq('user_id', userId).eq('status', 'active').gt('expires_at', new Date().toISOString()).order('last_activity_at', { ascending: false })
      setSessions(data || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, isLoading, refresh: loadData }
}

export function useSessionActivities(sessionId?: string, options?: { action?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('session_activities').select('*').eq('session_id', sessionId)
      if (options?.action) query = query.eq('action', options.action)
      if (options?.from_date) query = query.gte('performed_at', options.from_date)
      if (options?.to_date) query = query.lte('performed_at', options.to_date)
      const { data } = await query.order('performed_at', { ascending: false }).limit(options?.limit || 100)
      setActivities(data || [])
    } finally { setIsLoading(false) }
  }, [sessionId, options?.action, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { activities, isLoading, refresh: loadData }
}

export function useUserDevices(userId?: string, options?: { is_trusted?: boolean }) {
  const [devices, setDevices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('session_devices').select('*').eq('user_id', userId)
      if (options?.is_trusted !== undefined) query = query.eq('is_trusted', options.is_trusted)
      const { data } = await query.order('last_used_at', { ascending: false })
      setDevices(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_trusted])
  useEffect(() => { loadData() }, [loadData])
  return { devices, isLoading, refresh: loadData }
}

export function useCurrentSession() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true)
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession()
        if (authSession?.user) {
          const { data } = await supabase.from('sessions').select('*, session_devices(*)').eq('user_id', authSession.user.id).eq('status', 'active').order('started_at', { ascending: false }).limit(1).single()
          setSession(data)
        }
      } finally { setIsLoading(false) }
    }
    fetchSession()
  }, [])
  return { session, isLoading }
}

export function useSessionStats(options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; active: number; ended: number; expired: number; uniqueUsers: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let baseQuery = supabase.from('sessions').select('status, user_id')
      if (options?.from_date) baseQuery = baseQuery.gte('started_at', options.from_date)
      if (options?.to_date) baseQuery = baseQuery.lte('started_at', options.to_date)
      const { data } = await baseQuery
      const sessions = data || []
      const total = sessions.length
      const active = sessions.filter(s => s.status === 'active').length
      const ended = sessions.filter(s => s.status === 'ended').length
      const expired = sessions.filter(s => s.status === 'expired').length
      const uniqueUsers = new Set(sessions.map(s => s.user_id)).size
      setStats({ total, active, ended, expired, uniqueUsers })
    } finally { setIsLoading(false) }
  }, [options?.from_date, options?.to_date])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useRecentActivities(userId?: string, options?: { limit?: number }) {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: sessions } = await supabase.from('sessions').select('id').eq('user_id', userId)
      if (!sessions || sessions.length === 0) { setActivities([]); return }
      const sessionIds = sessions.map(s => s.id)
      const { data } = await supabase.from('session_activities').select('*, sessions(*)').in('session_id', sessionIds).order('performed_at', { ascending: false }).limit(options?.limit || 50)
      setActivities(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { activities, isLoading, refresh: loadData }
}

