'use client'

/**
 * Extended Timer Hooks
 * Tables: timers, timer_entries, timer_settings, timer_reports
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTimer(timerId?: string) {
  const [timer, setTimer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!timerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('timers').select('*').eq('id', timerId).single(); setTimer(data) } finally { setIsLoading(false) }
  }, [timerId])
  useEffect(() => { fetch() }, [fetch])
  return { timer, isLoading, refresh: fetch }
}

export function useTimers(options?: { user_id?: string; project_id?: string; status?: string; limit?: number }) {
  const [timers, setTimers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('timers').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTimers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.project_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { timers, isLoading, refresh: fetch }
}

export function useActiveTimer(userId?: string) {
  const [timer, setTimer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('timers').select('*').eq('user_id', userId).eq('status', 'running').order('started_at', { ascending: false }).limit(1).single(); setTimer(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { timer, isLoading, refresh: fetch }
}

export function useTimerEntries(options?: { user_id?: string; project_id?: string; date?: string; limit?: number }) {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('timer_entries').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.date) query = query.gte('created_at', options.date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setEntries(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.project_id, options?.date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { entries, isLoading, refresh: fetch }
}

export function useTimerSettings(userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('timer_settings').select('*').eq('user_id', userId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useTodayTimers(userId?: string) {
  const [timers, setTimers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const today = new Date().toISOString().split('T')[0]; const { data } = await supabase.from('timers').select('*').eq('user_id', userId).gte('created_at', today).order('created_at', { ascending: false }); setTimers(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { timers, isLoading, refresh: fetch }
}
