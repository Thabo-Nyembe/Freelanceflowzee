'use client'

/**
 * Extended Advisory Hooks
 * Tables: advisory_sessions, advisory_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAdvisorySession(sessionId?: string) {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('advisory_sessions').select('*').eq('id', sessionId).single(); setSession(data) } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { loadData() }, [loadData])
  return { session, isLoading, refresh: loadData }
}

export function useAdvisorySessions(options?: { user_id?: string; advisor_id?: string; status?: string; session_type?: string; limit?: number }) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('advisory_sessions').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.advisor_id) query = query.eq('advisor_id', options.advisor_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.session_type) query = query.eq('session_type', options.session_type)
      const { data } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 50)
      setSessions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.advisor_id, options?.status, options?.session_type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, isLoading, refresh: loadData }
}

export function useUpcomingAdvisorySessions(userId?: string, options?: { limit?: number }) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('advisory_sessions').select('*').eq('user_id', userId).in('status', ['scheduled', 'confirmed']).gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(options?.limit || 10); setSessions(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, isLoading, refresh: loadData }
}

export function usePastAdvisorySessions(userId?: string, options?: { limit?: number }) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('advisory_sessions').select('*').eq('user_id', userId).eq('status', 'completed').order('completed_at', { ascending: false }).limit(options?.limit || 20); setSessions(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, isLoading, refresh: loadData }
}

export function useAdvisoryAnalytics(advisorId?: string) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!advisorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('advisory_analytics').select('*').eq('advisor_id', advisorId).single(); setAnalytics(data) } finally { setIsLoading(false) }
  }, [advisorId])
  useEffect(() => { loadData() }, [loadData])
  return { analytics, isLoading, refresh: loadData }
}

export function useAdvisorStats(advisorId?: string) {
  const [stats, setStats] = useState<{ total: number; completed: number; avgRating: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!advisorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('advisory_sessions').select('status, rating').eq('advisor_id', advisorId)
      if (!data) { setStats(null); return }
      const total = data.length
      const completed = data.filter(s => s.status === 'completed').length
      const ratings = data.filter(s => s.rating).map(s => s.rating)
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      setStats({ total, completed, avgRating })
    } finally { setIsLoading(false) }
  }, [advisorId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
