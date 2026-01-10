'use client'

/**
 * Extended Promotions Hooks
 * Tables: promotions, promotion_codes, promotion_usage, promotion_rules, promotion_campaigns, promotion_tiers, promotion_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePromotion(promotionId?: string) {
  const [promotion, setPromotion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!promotionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('promotions').select('*, promotion_codes(*), promotion_rules(*), promotion_tiers(*)').eq('id', promotionId).single(); setPromotion(data) } finally { setIsLoading(false) }
  }, [promotionId])
  useEffect(() => { fetch() }, [fetch])
  return { promotion, isLoading, refresh: fetch }
}

export function usePromotions(options?: { organization_id?: string; type?: string; status?: string; search?: string; limit?: number }) {
  const [promotions, setPromotions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('promotions').select('*, promotion_codes(count), promotion_usage(count)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPromotions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.type, options?.status, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { promotions, isLoading, refresh: fetch }
}

export function useActivePromotions() {
  const [promotions, setPromotions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      const { data } = await supabase.from('promotions').select('*, promotion_codes(*)').eq('status', 'active').lte('starts_at', now).or(`ends_at.is.null,ends_at.gt.${now}`).order('created_at', { ascending: false })
      setPromotions(data || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { promotions, isLoading, refresh: fetch }
}

export function usePromotionCodes(promotionId?: string, options?: { is_active?: boolean; limit?: number }) {
  const [codes, setCodes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!promotionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('promotion_codes').select('*').eq('promotion_id', promotionId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setCodes(data || [])
    } finally { setIsLoading(false) }
  }, [promotionId, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { codes, isLoading, refresh: fetch }
}

export function usePromotionUsage(promotionId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [usage, setUsage] = useState<any[]>([])
  const [totalDiscount, setTotalDiscount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!promotionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('promotion_usage').select('*, users(*), promotion_codes(*)').eq('promotion_id', promotionId)
      if (options?.from_date) query = query.gte('used_at', options.from_date)
      if (options?.to_date) query = query.lte('used_at', options.to_date)
      const { data } = await query.order('used_at', { ascending: false }).limit(options?.limit || 100)
      setUsage(data || [])
      setTotalDiscount(data?.reduce((sum, u) => sum + (u.discount_amount || 0), 0) || 0)
    } finally { setIsLoading(false) }
  }, [promotionId, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { usage, totalDiscount, isLoading, refresh: fetch }
}

export function usePromotionRules(promotionId?: string) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!promotionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('promotion_rules').select('*').eq('promotion_id', promotionId).eq('is_active', true).order('priority', { ascending: true }); setRules(data || []) } finally { setIsLoading(false) }
  }, [promotionId])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function usePromotionCampaigns(options?: { status?: string; limit?: number }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('promotion_campaigns').select('*')
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCampaigns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { campaigns, isLoading, refresh: fetch }
}

export function usePromotionTiers(promotionId?: string) {
  const [tiers, setTiers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!promotionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('promotion_tiers').select('*').eq('promotion_id', promotionId).order('min_amount', { ascending: true }); setTiers(data || []) } finally { setIsLoading(false) }
  }, [promotionId])
  useEffect(() => { fetch() }, [fetch])
  return { tiers, isLoading, refresh: fetch }
}

export function useCodeValidation(code?: string, userId?: string, orderAmount?: number) {
  const [validation, setValidation] = useState<{ isValid: boolean; promotion?: any; code?: any; error?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const validate = useCallback(async () => {
    if (!code) { setValidation(null); return }
    setIsLoading(true)
    try {
      const { data: promoCode } = await supabase.from('promotion_codes').select('*, promotions(*)').eq('code', code).eq('is_active', true).single()
      if (!promoCode) { setValidation({ isValid: false, error: 'Invalid code' }); setIsLoading(false); return }
      const promotion = promoCode.promotions
      if (promotion.status !== 'active') { setValidation({ isValid: false, error: 'Promotion is not active' }); setIsLoading(false); return }
      if (promotion.ends_at && new Date(promotion.ends_at) < new Date()) { setValidation({ isValid: false, error: 'Promotion has expired' }); setIsLoading(false); return }
      if (promotion.min_order_amount && orderAmount && orderAmount < promotion.min_order_amount) { setValidation({ isValid: false, error: `Minimum order of ${promotion.min_order_amount} required` }); setIsLoading(false); return }
      setValidation({ isValid: true, promotion, code: promoCode })
    } finally { setIsLoading(false) }
  }, [code, userId, orderAmount])
  useEffect(() => { validate() }, [validate])
  return { validation, isLoading, validate }
}

export function usePromotionStats(promotionId?: string) {
  const [stats, setStats] = useState<{ usageCount: number; totalDiscount: number; uniqueUsers: number; conversionRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!promotionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [usageRes, codesRes] = await Promise.all([
        supabase.from('promotion_usage').select('discount_amount, user_id').eq('promotion_id', promotionId),
        supabase.from('promotion_codes').select('id', { count: 'exact' }).eq('promotion_id', promotionId)
      ])
      const usage = usageRes.data || []
      const usageCount = usage.length
      const totalDiscount = usage.reduce((sum, u) => sum + (u.discount_amount || 0), 0)
      const uniqueUsers = new Set(usage.map(u => u.user_id)).size
      const totalCodes = codesRes.count || 1
      const conversionRate = Math.round((usageCount / totalCodes) * 100)
      setStats({ usageCount, totalDiscount, uniqueUsers, conversionRate })
    } finally { setIsLoading(false) }
  }, [promotionId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useMyPromotions(userId?: string) {
  const [promotions, setPromotions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      const { data: codes } = await supabase.from('promotion_codes').select('*, promotions(*)').eq('user_id', userId).eq('is_active', true)
      const validPromotions = codes?.filter(c => c.promotions?.status === 'active' && (!c.promotions?.ends_at || new Date(c.promotions.ends_at) > new Date())) || []
      setPromotions(validPromotions.map(c => ({ ...c.promotions, code: c })))
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { promotions, isLoading, refresh: fetch }
}
