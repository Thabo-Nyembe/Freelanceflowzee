'use client'

/**
 * Extended Insight Hooks
 * Tables: insights, insight_categories, insight_metrics, insight_alerts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInsight(insightId?: string) {
  const [insight, setInsight] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!insightId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insights').select('*').eq('id', insightId).single(); setInsight(data) } finally { setIsLoading(false) }
  }, [insightId])
  useEffect(() => { fetch() }, [fetch])
  return { insight, isLoading, refresh: fetch }
}

export function useInsights(options?: { user_id?: string; type?: string; category_id?: string; status?: string; priority?: string; limit?: number }) {
  const [insights, setInsights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('insights').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setInsights(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.category_id, options?.status, options?.priority, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { insights, isLoading, refresh: fetch }
}

export function useInsightCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('insight_categories').select('*').order('name', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useInsightMetrics(insightId?: string) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!insightId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insight_metrics').select('*').eq('insight_id', insightId).order('recorded_at', { ascending: false }); setMetrics(data || []) } finally { setIsLoading(false) }
  }, [insightId])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useNewInsights(userId?: string, options?: { limit?: number }) {
  const [insights, setInsights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insights').select('*').eq('user_id', userId).eq('status', 'new').order('priority', { ascending: true }).order('created_at', { ascending: false }).limit(options?.limit || 20); setInsights(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { insights, isLoading, refresh: fetch }
}

export function useHighPriorityInsights(userId?: string) {
  const [insights, setInsights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insights').select('*').eq('user_id', userId).eq('priority', 'high').in('status', ['new', 'acknowledged']).order('created_at', { ascending: false }); setInsights(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { insights, isLoading, refresh: fetch }
}
