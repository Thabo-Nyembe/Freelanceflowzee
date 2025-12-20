'use client'

/**
 * Extended Attribution Hooks
 * Tables: attribution_sources, attribution_tracking, attribution_conversions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAttributionSource(sourceId?: string) {
  const [source, setSource] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('attribution_sources').select('*').eq('id', sourceId).single(); setSource(data) } finally { setIsLoading(false) }
  }, [sourceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { source, isLoading, refresh: fetch }
}

export function useAttributionSources(options?: { user_id?: string; type?: string; limit?: number }) {
  const [sources, setSources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('attribution_sources').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('click_count', { ascending: false }).limit(options?.limit || 50)
      setSources(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { sources, isLoading, refresh: fetch }
}

export function useAttributionStats(userId?: string) {
  const [stats, setStats] = useState<{ totalClicks: number; totalConversions: number; conversionRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('attribution_sources').select('click_count, conversion_count').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const totalClicks = data.reduce((sum, s) => sum + (s.click_count || 0), 0)
      const totalConversions = data.reduce((sum, s) => sum + (s.conversion_count || 0), 0)
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
      setStats({ totalClicks, totalConversions, conversionRate })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useTopAttributionSources(userId?: string, options?: { by?: 'clicks' | 'conversions'; limit?: number }) {
  const [sources, setSources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const orderBy = options?.by === 'conversions' ? 'conversion_count' : 'click_count'
      const { data } = await supabase.from('attribution_sources').select('*').eq('user_id', userId).order(orderBy, { ascending: false }).limit(options?.limit || 10)
      setSources(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.by, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { sources, isLoading, refresh: fetch }
}

export function useAttributionConversions(sourceId?: string, options?: { limit?: number }) {
  const [conversions, setConversions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('attribution_conversions').select('*').eq('source_id', sourceId).order('created_at', { ascending: false }).limit(options?.limit || 50); setConversions(data || []) } finally { setIsLoading(false) }
  }, [sourceId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { conversions, isLoading, refresh: fetch }
}

export function useAttributionByType(userId?: string) {
  const [byType, setByType] = useState<Record<string, { clicks: number; conversions: number }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('attribution_sources').select('type, click_count, conversion_count').eq('user_id', userId)
      const grouped = (data || []).reduce((acc: Record<string, { clicks: number; conversions: number }>, s) => {
        const type = s.type || 'unknown'
        if (!acc[type]) acc[type] = { clicks: 0, conversions: 0 }
        acc[type].clicks += s.click_count || 0
        acc[type].conversions += s.conversion_count || 0
        return acc
      }, {})
      setByType(grouped)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { byType, isLoading, refresh: fetch }
}
