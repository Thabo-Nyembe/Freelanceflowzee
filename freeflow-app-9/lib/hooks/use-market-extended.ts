'use client'

/**
 * Extended Market Hooks
 * Tables: markets, market_data, market_analysis, market_trends
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMarket(marketId?: string) {
  const [market, setMarket] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadMarket = useCallback(async () => {
  const supabase = createClient()
    if (!marketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('markets').select('*').eq('id', marketId).single(); setMarket(data) } finally { setIsLoading(false) }
  }, [marketId])
  useEffect(() => { loadMarket() }, [loadMarket])
  return { market, isLoading, refresh: loadMarket }
}

export function useMarkets(options?: { type?: string; region?: string; is_active?: boolean; limit?: number }) {
  const [markets, setMarkets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadMarkets = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('markets').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.region) query = query.eq('region', options.region)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setMarkets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.region, options?.is_active, options?.limit])
  useEffect(() => { loadMarkets() }, [loadMarkets])
  return { markets, isLoading, refresh: loadMarkets }
}

export function useMarketData(marketId?: string, options?: { date_from?: string; date_to?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!marketId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('market_data').select('*').eq('market_id', marketId)
      if (options?.date_from) query = query.gte('recorded_at', options.date_from)
      if (options?.date_to) query = query.lte('recorded_at', options.date_to)
      const { data: result } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [marketId, options?.date_from, options?.date_to, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useMarketTrends(options?: { market_id?: string; type?: string; limit?: number }) {
  const [trends, setTrends] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadTrends = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('market_trends').select('*')
      if (options?.market_id) query = query.eq('market_id', options.market_id)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('trend_score', { ascending: false }).limit(options?.limit || 20)
      setTrends(data || [])
    } finally { setIsLoading(false) }
  }, [options?.market_id, options?.type, options?.limit])
  useEffect(() => { loadTrends() }, [loadTrends])
  return { trends, isLoading, refresh: loadTrends }
}

export function useActiveMarkets() {
  const [markets, setMarkets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadActiveMarkets = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('markets').select('*').eq('is_active', true).order('name', { ascending: true }); setMarkets(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadActiveMarkets() }, [loadActiveMarkets])
  return { markets, isLoading, refresh: loadActiveMarkets }
}
