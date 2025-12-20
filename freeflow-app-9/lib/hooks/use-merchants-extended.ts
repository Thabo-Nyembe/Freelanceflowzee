'use client'

/**
 * Extended Merchants Hooks
 * Tables: merchants, merchant_accounts, merchant_products, merchant_orders, merchant_payouts, merchant_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMerchant(merchantId?: string) {
  const [merchant, setMerchant] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!merchantId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('merchants').select('*, merchant_accounts(*), merchant_settings(*)').eq('id', merchantId).single(); setMerchant(data) } finally { setIsLoading(false) }
  }, [merchantId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { merchant, isLoading, refresh: fetch }
}

export function useUserMerchant(userId?: string) {
  const [merchant, setMerchant] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('merchants').select('*, merchant_accounts(*), merchant_settings(*)').eq('user_id', userId).single(); setMerchant(data) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { merchant, isLoading, refresh: fetch }
}

export function useMerchants(options?: { status?: string; verification_status?: string; business_type?: string; limit?: number }) {
  const [merchants, setMerchants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('merchants').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.verification_status) query = query.eq('verification_status', options.verification_status)
      if (options?.business_type) query = query.eq('business_type', options.business_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setMerchants(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.verification_status, options?.business_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { merchants, isLoading, refresh: fetch }
}

export function useMerchantAccounts(merchantId?: string) {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!merchantId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('merchant_accounts').select('*').eq('merchant_id', merchantId); setAccounts(data || []) } finally { setIsLoading(false) }
  }, [merchantId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { accounts, isLoading, refresh: fetch }
}

export function useMerchantProducts(merchantId?: string, options?: { status?: string; category?: string; limit?: number }) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!merchantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('merchant_products').select('*').eq('merchant_id', merchantId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setProducts(data || [])
    } finally { setIsLoading(false) }
  }, [merchantId, options?.status, options?.category, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { products, isLoading, refresh: fetch }
}

export function useMerchantOrders(merchantId?: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!merchantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('merchant_orders').select('*').eq('merchant_id', merchantId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setOrders(data || [])
    } finally { setIsLoading(false) }
  }, [merchantId, options?.status, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { orders, isLoading, refresh: fetch }
}

export function useMerchantPayouts(merchantId?: string, options?: { status?: string; limit?: number }) {
  const [payouts, setPayouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!merchantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('merchant_payouts').select('*, merchant_accounts(*)').eq('merchant_id', merchantId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPayouts(data || [])
    } finally { setIsLoading(false) }
  }, [merchantId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { payouts, isLoading, refresh: fetch }
}

export function useMerchantSettings(merchantId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!merchantId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('merchant_settings').select('*').eq('merchant_id', merchantId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [merchantId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useMerchantStats(merchantId?: string) {
  const [stats, setStats] = useState<{ totalProducts: number; totalOrders: number; totalRevenue: number; pendingPayouts: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!merchantId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [productsRes, ordersRes, payoutsRes] = await Promise.all([
        supabase.from('merchant_products').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId),
        supabase.from('merchant_orders').select('total_amount, status').eq('merchant_id', merchantId),
        supabase.from('merchant_payouts').select('amount, status').eq('merchant_id', merchantId)
      ])
      const totalProducts = productsRes.count || 0
      const totalOrders = ordersRes.data?.length || 0
      const totalRevenue = ordersRes.data?.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
      const pendingPayouts = payoutsRes.data?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      setStats({ totalProducts, totalOrders, totalRevenue, pendingPayouts })
    } finally { setIsLoading(false) }
  }, [merchantId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function usePendingMerchants(options?: { limit?: number }) {
  const [merchants, setMerchants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('merchants').select('*').eq('verification_status', 'pending').order('created_at', { ascending: true }).limit(options?.limit || 50); setMerchants(data || []) } finally { setIsLoading(false) }
  }, [options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { merchants, isLoading, refresh: fetch }
}
