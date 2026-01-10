'use client'

/**
 * Extended Rate Hooks
 * Tables: rates, rate_limits, rate_cards, rate_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRate(rateId?: string) {
  const [rate, setRate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!rateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rates').select('*').eq('id', rateId).single(); setRate(data) } finally { setIsLoading(false) }
  }, [rateId])
  useEffect(() => { fetch() }, [fetch])
  return { rate, isLoading, refresh: fetch }
}

export function useRates(options?: { type?: string; is_active?: boolean; currency?: string; limit?: number }) {
  const [rates, setRates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rates').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.currency) query = query.eq('currency', options.currency)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setRates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, options?.currency, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rates, isLoading, refresh: fetch }
}

export function useRateLimits(options?: { endpoint?: string; is_active?: boolean }) {
  const [limits, setLimits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rate_limits').select('*')
      if (options?.endpoint) query = query.eq('endpoint', options.endpoint)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('endpoint', { ascending: true })
      setLimits(data || [])
    } finally { setIsLoading(false) }
  }, [options?.endpoint, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { limits, isLoading, refresh: fetch }
}

export function useRateCards(options?: { type?: string; is_active?: boolean }) {
  const [cards, setCards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rate_cards').select('*, rates(*)')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setCards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { cards, isLoading, refresh: fetch }
}

export function useRateHistory(rateId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!rateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rate_history').select('*').eq('rate_id', rateId).order('changed_at', { ascending: false }).limit(options?.limit || 50); setHistory(data || []) } finally { setIsLoading(false) }
  }, [rateId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useActiveRates() {
  const [rates, setRates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('rates').select('*').eq('is_active', true).order('name', { ascending: true }); setRates(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { rates, isLoading, refresh: fetch }
}
