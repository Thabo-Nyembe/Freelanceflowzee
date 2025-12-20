'use client'

/**
 * Extended Tiers Hooks
 * Tables: tiers, tier_features, tier_limits, tier_pricing, tier_subscriptions, tier_upgrades
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTier(tierId?: string) {
  const [tier, setTier] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!tierId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tiers').select('*, tier_features(*), tier_limits(*), tier_pricing(*)').eq('id', tierId).single(); setTier(data) } finally { setIsLoading(false) }
  }, [tierId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tier, isLoading, refresh: fetch }
}

export function useTiers(options?: { tier_type?: string; is_public?: boolean; status?: string; limit?: number }) {
  const [tiers, setTiers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('tiers').select('*, tier_features(*), tier_limits(*), tier_pricing(*)')
      if (options?.tier_type) query = query.eq('tier_type', options.tier_type)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('tier_level', { ascending: true }).limit(options?.limit || 20)
      setTiers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.tier_type, options?.is_public, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tiers, isLoading, refresh: fetch }
}

export function usePublicTiers(options?: { tier_type?: string }) {
  const [tiers, setTiers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('tiers').select('*, tier_features(*), tier_limits(*), tier_pricing(*)').eq('is_public', true).eq('status', 'active')
      if (options?.tier_type) query = query.eq('tier_type', options.tier_type)
      const { data } = await query.order('tier_level', { ascending: true })
      setTiers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.tier_type, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tiers, isLoading, refresh: fetch }
}

export function useTierFeatures(tierId?: string) {
  const [features, setFeatures] = useState<any[]>([])
  const [featureMap, setFeatureMap] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!tierId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tier_features').select('*').eq('tier_id', tierId).order('feature_name', { ascending: true })
      setFeatures(data || [])
      const map: Record<string, any> = {}
      data?.forEach(f => { map[f.feature_key] = f })
      setFeatureMap(map)
    } finally { setIsLoading(false) }
  }, [tierId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { features, featureMap, isLoading, refresh: fetch }
}

export function useTierLimits(tierId?: string) {
  const [limits, setLimits] = useState<any[]>([])
  const [limitMap, setLimitMap] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!tierId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tier_limits').select('*').eq('tier_id', tierId).order('limit_name', { ascending: true })
      setLimits(data || [])
      const map: Record<string, number> = {}
      data?.forEach(l => { map[l.limit_key] = l.limit_value })
      setLimitMap(map)
    } finally { setIsLoading(false) }
  }, [tierId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { limits, limitMap, isLoading, refresh: fetch }
}

export function useTierPricing(tierId?: string, options?: { billing_period?: string }) {
  const [pricing, setPricing] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!tierId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tier_pricing').select('*').eq('tier_id', tierId).eq('is_active', true)
      if (options?.billing_period) query = query.eq('billing_period', options.billing_period)
      const { data } = await query.order('price', { ascending: true })
      setPricing(data || [])
    } finally { setIsLoading(false) }
  }, [tierId, options?.billing_period, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { pricing, isLoading, refresh: fetch }
}

export function useTierSubscription(entityType?: string, entityId?: string) {
  const [subscription, setSubscription] = useState<any>(null)
  const [tier, setTier] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tier_subscriptions').select('*, tiers(*, tier_features(*), tier_limits(*))').eq('entity_type', entityType).eq('entity_id', entityId).in('status', ['active', 'trialing']).order('created_at', { ascending: false }).limit(1).single()
      setSubscription(data)
      setTier(data?.tiers || null)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { subscription, tier, isLoading, refresh: fetch }
}

export function useFeatureAccess(entityType?: string, entityId?: string, featureKey?: string) {
  const [hasAccess, setHasAccess] = useState(false)
  const [feature, setFeature] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId || !featureKey) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tier_subscriptions').select('*, tiers(*, tier_features(*))').eq('entity_type', entityType).eq('entity_id', entityId).in('status', ['active', 'trialing']).order('created_at', { ascending: false }).limit(1).single()
      const feat = data?.tiers?.tier_features?.find((f: any) => f.feature_key === featureKey)
      setFeature(feat || null)
      setHasAccess(feat?.is_enabled || false)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, featureKey, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { hasAccess, feature, isLoading, refresh: fetch }
}

export function useLimitCheck(entityType?: string, entityId?: string, limitKey?: string, currentUsage?: number) {
  const [withinLimit, setWithinLimit] = useState(true)
  const [limit, setLimit] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId || !limitKey || currentUsage === undefined) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tier_subscriptions').select('*, tiers(*, tier_limits(*))').eq('entity_type', entityType).eq('entity_id', entityId).in('status', ['active', 'trialing']).order('created_at', { ascending: false }).limit(1).single()
      const lim = data?.tiers?.tier_limits?.find((l: any) => l.limit_key === limitKey)
      if (lim) {
        setLimit(lim.limit_value)
        setWithinLimit(currentUsage < lim.limit_value)
        setRemaining(Math.max(0, lim.limit_value - currentUsage))
      } else {
        setLimit(null)
        setWithinLimit(true)
        setRemaining(null)
      }
    } finally { setIsLoading(false) }
  }, [entityType, entityId, limitKey, currentUsage, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { withinLimit, limit, remaining, isLoading, refresh: fetch }
}

export function useTierComparison(tierIds?: string[]) {
  const [comparison, setComparison] = useState<any[]>([])
  const [allFeatures, setAllFeatures] = useState<string[]>([])
  const [allLimits, setAllLimits] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!tierIds || tierIds.length === 0) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tiers').select('*, tier_features(*), tier_limits(*), tier_pricing(*)').in('id', tierIds).order('tier_level', { ascending: true })
      setComparison(data || [])
      const features = new Set<string>()
      const limits = new Set<string>()
      data?.forEach(t => {
        t.tier_features?.forEach((f: any) => features.add(f.feature_key))
        t.tier_limits?.forEach((l: any) => limits.add(l.limit_key))
      })
      setAllFeatures([...features])
      setAllLimits([...limits])
    } finally { setIsLoading(false) }
  }, [tierIds, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { comparison, allFeatures, allLimits, isLoading, refresh: fetch }
}

export function useDefaultTier() {
  const [tier, setTier] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('tiers').select('*, tier_features(*), tier_limits(*), tier_pricing(*)').eq('is_default', true).eq('status', 'active').single(); setTier(data) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tier, isLoading, refresh: fetch }
}
