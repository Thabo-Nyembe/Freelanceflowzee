'use client'

/**
 * Extended Focus Hooks
 * Tables: focus_sessions, focus_goals, focus_blocks, focus_timers, focus_streaks, focus_stats
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFocusSession(sessionId?: string) {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('focus_sessions').select('*, focus_blocks(*)').eq('id', sessionId).single(); setSession(data) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { fetch() }, [fetch])
  return { session, isLoading, refresh: fetch }
}

export function useFocusSessions(userId?: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('focus_sessions').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('started_at', options.from_date)
      if (options?.to_date) query = query.lte('started_at', options.to_date)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setSessions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { sessions, isLoading, refresh: fetch }
}

export function useActiveFocusSession(userId?: string) {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('focus_sessions').select('*').eq('user_id', userId).eq('status', 'active').order('started_at', { ascending: false }).limit(1).single(); setSession(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { session, isLoading, refresh: fetch }
}

export function useFocusGoals(userId?: string, options?: { status?: string }) {
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('focus_goals').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setGoals(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { goals, isLoading, refresh: fetch }
}

export function useFocusBlocks(userId?: string, options?: { is_active?: boolean }) {
  const [blocks, setBlocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('focus_blocks').select('*').eq('user_id', userId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('start_time', { ascending: true })
      setBlocks(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { blocks, isLoading, refresh: fetch }
}

export function useFocusStreak(userId?: string) {
  const [streak, setStreak] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('focus_streaks').select('*').eq('user_id', userId).single(); setStreak(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { streak, isLoading, refresh: fetch }
}

export function useFocusStats(userId?: string, period?: string) {
  const [stats, setStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('focus_stats').select('*').eq('user_id', userId)
      if (period) query = query.eq('period', period)
      const { data } = await query.order('date', { ascending: false }).limit(30)
      setStats(data || [])
    } finally { setIsLoading(false) }
  }, [userId, period])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useTodaysFocusStats(userId?: string) {
  const [stats, setStats] = useState<{ sessions: any[]; totalMinutes: number; completedSessions: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('focus_sessions').select('*').eq('user_id', userId).gte('started_at', `${today}T00:00:00`).lte('started_at', `${today}T23:59:59`)
      const totalMinutes = data?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
      const completedSessions = data?.filter(s => s.status === 'completed').length || 0
      setStats({ sessions: data || [], totalMinutes, completedSessions })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useWeeklyFocusStats(userId?: string) {
  const [stats, setStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data } = await supabase.from('focus_sessions').select('*').eq('user_id', userId).gte('started_at', weekAgo.toISOString()).order('started_at', { ascending: true })
      setStats(data || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
