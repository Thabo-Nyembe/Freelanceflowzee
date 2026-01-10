'use client'

/**
 * Extended Prices Hooks
 * Tables: prices, price_tiers, price_rules, price_discounts, price_history, price_schedules, price_lists, price_adjustments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePrice(priceId?: string) {
  const [price, setPrice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('prices').select('*, price_tiers(*), price_rules(*), price_discounts(*)').eq('id', priceId).single(); setPrice(data) } finally { setIsLoading(false) }
  }, [priceId])
  useEffect(() => { fetch() }, [fetch])
  return { price, isLoading, refresh: fetch }
}

export function usePrices(options?: { product_id?: string; type?: string; currency?: string; is_active?: boolean; limit?: number }) {
  const [prices, setPrices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('prices').select('*, price_tiers(*), price_discounts(*)')
      if (options?.product_id) query = query.eq('product_id', options.product_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.currency) query = query.eq('currency', options.currency)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('amount', { ascending: true }).limit(options?.limit || 100)
      setPrices(data || [])
    } finally { setIsLoading(false) }
  }, [options?.product_id, options?.type, options?.currency, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { prices, isLoading, refresh: fetch }
}

export function usePriceTiers(priceId?: string) {
  const [tiers, setTiers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('price_tiers').select('*').eq('price_id', priceId).order('min_quantity', { ascending: true }); setTiers(data || []) } finally { setIsLoading(false) }
  }, [priceId])
  useEffect(() => { fetch() }, [fetch])
  return { tiers, isLoading, refresh: fetch }
}

export function usePriceRules(priceId?: string) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('price_rules').select('*').eq('price_id', priceId).eq('is_active', true).order('priority', { ascending: true }); setRules(data || []) } finally { setIsLoading(false) }
  }, [priceId])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function usePriceDiscounts(priceId?: string, options?: { is_active?: boolean }) {
  const [discounts, setDiscounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('price_discounts').select('*').eq('price_id', priceId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false })
      setDiscounts(data || [])
    } finally { setIsLoading(false) }
  }, [priceId, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { discounts, isLoading, refresh: fetch }
}

export function usePriceHistory(priceId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('price_history').select('*').eq('price_id', priceId).order('changed_at', { ascending: false }).limit(options?.limit || 50); setHistory(data || []) } finally { setIsLoading(false) }
  }, [priceId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function usePriceSchedules(priceId?: string) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('price_schedules').select('*').eq('price_id', priceId).order('starts_at', { ascending: true }); setSchedules(data || []) } finally { setIsLoading(false) }
  }, [priceId])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useActiveSchedule(priceId?: string) {
  const [schedule, setSchedule] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      const { data } = await supabase.from('price_schedules').select('*').eq('price_id', priceId).eq('status', 'active').lte('starts_at', now).or(`ends_at.is.null,ends_at.gt.${now}`).single()
      setSchedule(data)
    } finally { setIsLoading(false) }
  }, [priceId])
  useEffect(() => { fetch() }, [fetch])
  return { schedule, isLoading, refresh: fetch }
}

export function usePriceLists(options?: { is_active?: boolean; currency?: string }) {
  const [lists, setLists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('price_lists').select('*, prices(count)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.currency) query = query.eq('currency', options.currency)
      const { data } = await query.order('name', { ascending: true })
      setLists(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.currency])
  useEffect(() => { fetch() }, [fetch])
  return { lists, isLoading, refresh: fetch }
}

export function usePriceList(listId?: string) {
  const [list, setList] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!listId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('price_lists').select('*, prices(*, products(*))').eq('id', listId).single(); setList(data) } finally { setIsLoading(false) }
  }, [listId])
  useEffect(() => { fetch() }, [fetch])
  return { list, isLoading, refresh: fetch }
}

export function useCalculatedPrice(priceId?: string, quantity?: number, discountCode?: string) {
  const [calculation, setCalculation] = useState<{ unitPrice: number; quantity: number; subtotal: number; discount: number; total: number; currency: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priceId || !quantity) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: price } = await supabase.from('prices').select('*, price_tiers(*), price_rules(*)').eq('id', priceId).single()
      if (!price) { setCalculation(null); setIsLoading(false); return }
      let unitPrice = price.amount
      if (price.price_tiers && price.price_tiers.length > 0) {
        const applicableTier = price.price_tiers.find((t: any) => quantity >= t.min_quantity && (!t.max_quantity || quantity <= t.max_quantity))
        if (applicableTier) { unitPrice = applicableTier.unit_amount }
      }
      let subtotal = unitPrice * quantity
      let discount = 0
      if (discountCode) {
        const { data: discountData } = await supabase.from('price_discounts').select('*').eq('price_id', priceId).eq('code', discountCode).eq('is_active', true).single()
        if (discountData) {
          if (discountData.type === 'percentage') { discount = subtotal * (discountData.value / 100) } else { discount = discountData.value }
        }
      }
      const total = subtotal - discount
      setCalculation({ unitPrice, quantity, subtotal, discount, total, currency: price.currency })
    } finally { setIsLoading(false) }
  }, [priceId, quantity, discountCode])
  useEffect(() => { fetch() }, [fetch])
  return { calculation, isLoading, refresh: fetch }
}

export function useProductPrices(productId?: string) {
  const [prices, setPrices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!productId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('prices').select('*, price_tiers(*), price_discounts(*)').eq('product_id', productId).eq('is_active', true).order('amount', { ascending: true }); setPrices(data || []) } finally { setIsLoading(false) }
  }, [productId])
  useEffect(() => { fetch() }, [fetch])
  return { prices, isLoading, refresh: fetch }
}
