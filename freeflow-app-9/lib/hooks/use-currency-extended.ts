'use client'

/**
 * Extended Currency Hooks - Covers all Currency-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCurrencies(isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('currencies').select('*').order('name', { ascending: true })
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [isActive])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDefaultCurrency() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('currencies').select('*').eq('is_default', true).single()
      setData(result)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useExchangeRates(baseCurrency?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('exchange_rates').select('*').order('target_currency', { ascending: true })
      if (baseCurrency) query = query.eq('base_currency', baseCurrency)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [baseCurrency])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useExchangeRate(baseCurrency?: string, targetCurrency?: string) {
  const [rate, setRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!baseCurrency || !targetCurrency) { setIsLoading(false); return }
    if (baseCurrency === targetCurrency) { setRate(1); setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('exchange_rates').select('rate').eq('base_currency', baseCurrency).eq('target_currency', targetCurrency).single()
      setRate(data?.rate || null)
    } finally { setIsLoading(false) }
  }, [baseCurrency, targetCurrency])
  useEffect(() => { fetch() }, [fetch])
  return { rate, isLoading, refresh: fetch }
}
