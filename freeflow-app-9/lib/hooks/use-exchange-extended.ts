'use client'

/**
 * Extended Exchange Hooks
 * Tables: exchange_rates, exchange_transactions, exchange_history, exchange_providers
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useExchangeRate(fromCurrency?: string, toCurrency?: string) {
  const [rate, setRate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!fromCurrency || !toCurrency) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('exchange_rates').select('*').eq('from_currency', fromCurrency).eq('to_currency', toCurrency).single(); setRate(data) } finally { setIsLoading(false) }
  }, [fromCurrency, toCurrency, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rate, isLoading, refresh: fetch }
}

export function useExchangeRates(options?: { base_currency?: string; provider?: string }) {
  const [rates, setRates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('exchange_rates').select('*')
      if (options?.base_currency) query = query.eq('from_currency', options.base_currency)
      if (options?.provider) query = query.eq('provider', options.provider)
      const { data } = await query.order('from_currency', { ascending: true })
      setRates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.base_currency, options?.provider, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rates, isLoading, refresh: fetch }
}

export function useUserExchangeTransactions(userId?: string, options?: { status?: string; from_currency?: string; limit?: number }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('exchange_transactions').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_currency) query = query.eq('from_currency', options.from_currency)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTransactions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.from_currency, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { transactions, isLoading, refresh: fetch }
}

export function useExchangeHistory(fromCurrency?: string, toCurrency?: string, options?: { days?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!fromCurrency || !toCurrency) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const daysAgo = options?.days || 30
      const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const { data } = await supabase.from('exchange_history').select('*').eq('from_currency', fromCurrency).eq('to_currency', toCurrency).gte('date', startDate).order('date', { ascending: true })
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [fromCurrency, toCurrency, options?.days, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useExchangeProviders(options?: { is_active?: boolean }) {
  const [providers, setProviders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('exchange_providers').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setProviders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { providers, isLoading, refresh: fetch }
}

export function useCurrencyConverter(amount?: number, fromCurrency?: string, toCurrency?: string) {
  const [result, setResult] = useState<{ convertedAmount: number; rate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const convert = useCallback(async () => {
    if (!amount || !fromCurrency || !toCurrency) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: rateData } = await supabase.from('exchange_rates').select('rate').eq('from_currency', fromCurrency).eq('to_currency', toCurrency).single()
      if (rateData) { setResult({ convertedAmount: amount * rateData.rate, rate: rateData.rate }) }
    } finally { setIsLoading(false) }
  }, [amount, fromCurrency, toCurrency, supabase])
  useEffect(() => { convert() }, [convert])
  return { result, isLoading, refresh: convert }
}

export function useAvailableCurrencies() {
  const [currencies, setCurrencies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('exchange_rates').select('from_currency, to_currency')
      const allCurrencies = new Set<string>()
      data?.forEach(r => { allCurrencies.add(r.from_currency); allCurrencies.add(r.to_currency) })
      setCurrencies([...allCurrencies].sort())
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { currencies, isLoading, refresh: fetch }
}

export function useExchangeStats(userId?: string) {
  const [stats, setStats] = useState<{ totalTransactions: number; totalVolume: number; byCurrency: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('exchange_transactions').select('from_currency, from_amount').eq('user_id', userId).eq('status', 'completed')
      if (!data) { setStats(null); return }
      const totalTransactions = data.length
      const totalVolume = data.reduce((sum, t) => sum + (t.from_amount || 0), 0)
      const byCurrency = data.reduce((acc: Record<string, number>, t) => { acc[t.from_currency] = (acc[t.from_currency] || 0) + (t.from_amount || 0); return acc }, {})
      setStats({ totalTransactions, totalVolume, byCurrency })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
