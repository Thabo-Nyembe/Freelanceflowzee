'use client'

/**
 * Extended Trend Hooks
 * Tables: trends, trend_data, trend_alerts, trend_forecasts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTrend(trendId?: string) {
  const [trend, setTrend] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!trendId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('trends').select('*').eq('id', trendId).single(); setTrend(data) } finally { setIsLoading(false) }
  }, [trendId])
  useEffect(() => { fetch() }, [fetch])
  return { trend, isLoading, refresh: fetch }
}

export function useTrends(options?: { metric_type?: string; is_active?: boolean; limit?: number }) {
  const [trends, setTrends] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('trends').select('*')
      if (options?.metric_type) query = query.eq('metric_type', options.metric_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setTrends(data || [])
    } finally { setIsLoading(false) }
  }, [options?.metric_type, options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { trends, isLoading, refresh: fetch }
}

export function useTrendData(trendId?: string, options?: { days?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!trendId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const since = new Date(); since.setDate(since.getDate() - (options?.days || 30)); const { data: trendData } = await supabase.from('trend_data').select('*').eq('trend_id', trendId).gte('recorded_at', since.toISOString()).order('recorded_at', { ascending: true }); setData(trendData || []) } finally { setIsLoading(false) }
  }, [trendId, options?.days, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTrendAlerts(options?: { trend_id?: string; is_acknowledged?: boolean; limit?: number }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('trend_alerts').select('*')
      if (options?.trend_id) query = query.eq('trend_id', options.trend_id)
      if (options?.is_acknowledged !== undefined) query = query.eq('is_acknowledged', options.is_acknowledged)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.trend_id, options?.is_acknowledged, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useTrendForecasts(trendId?: string) {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!trendId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('trend_forecasts').select('*').eq('trend_id', trendId).order('forecast_date', { ascending: true }); setForecasts(data || []) } finally { setIsLoading(false) }
  }, [trendId])
  useEffect(() => { fetch() }, [fetch])
  return { forecasts, isLoading, refresh: fetch }
}

export function useActiveTrends() {
  const [trends, setTrends] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('trends').select('*').eq('is_active', true).order('name', { ascending: true }); setTrends(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { trends, isLoading, refresh: fetch }
}
