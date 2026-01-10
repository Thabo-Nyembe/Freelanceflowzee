'use client'

/**
 * Extended Plans Hooks
 * Tables: plans, plan_features, plan_limits, plan_pricing, plan_subscriptions, plan_usage
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePlan(planId?: string) {
  const [plan, setPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('plans').select('*, plan_features(*), plan_limits(*), plan_pricing(*)').eq('id', planId).single(); setPlan(data) } finally { setIsLoading(false) }
  }, [planId])
  useEffect(() => { fetch() }, [fetch])
  return { plan, isLoading, refresh: fetch }
}

export function usePlanBySlug(slug?: string) {
  const [plan, setPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!slug) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('plans').select('*, plan_features(*), plan_limits(*), plan_pricing(*)').eq('slug', slug).eq('is_active', true).single(); setPlan(data) } finally { setIsLoading(false) }
  }, [slug])
  useEffect(() => { fetch() }, [fetch])
  return { plan, isLoading, refresh: fetch }
}

export function usePlans(options?: { is_active?: boolean; is_public?: boolean }) {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('plans').select('*, plan_features(*), plan_limits(*), plan_pricing(*)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('tier', { ascending: true })
      setPlans(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.is_public])
  useEffect(() => { fetch() }, [fetch])
  return { plans, isLoading, refresh: fetch }
}

export function usePlanFeatures(planId?: string) {
  const [features, setFeatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('plan_features').select('*').eq('plan_id', planId).order('feature_name', { ascending: true }); setFeatures(data || []) } finally { setIsLoading(false) }
  }, [planId])
  useEffect(() => { fetch() }, [fetch])
  return { features, isLoading, refresh: fetch }
}

export function usePlanLimits(planId?: string) {
  const [limits, setLimits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('plan_limits').select('*').eq('plan_id', planId).order('limit_name', { ascending: true }); setLimits(data || []) } finally { setIsLoading(false) }
  }, [planId])
  useEffect(() => { fetch() }, [fetch])
  return { limits, isLoading, refresh: fetch }
}

export function usePlanPricing(planId?: string, options?: { currency?: string }) {
  const [pricing, setPricing] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('plan_pricing').select('*').eq('plan_id', planId).eq('is_active', true)
      if (options?.currency) query = query.eq('currency', options.currency)
      const { data } = await query.order('interval', { ascending: true })
      setPricing(data || [])
    } finally { setIsLoading(false) }
  }, [planId, options?.currency])
  useEffect(() => { fetch() }, [fetch])
  return { pricing, isLoading, refresh: fetch }
}

export function useSubscription(subscriptionId?: string) {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!subscriptionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('plan_subscriptions').select('*, plans(*, plan_features(*), plan_limits(*)), plan_pricing(*)').eq('id', subscriptionId).single(); setSubscription(data) } finally { setIsLoading(false) }
  }, [subscriptionId])
  useEffect(() => { fetch() }, [fetch])
  return { subscription, isLoading, refresh: fetch }
}

export function useUserSubscription(userId?: string) {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('plan_subscriptions').select('*, plans(*, plan_features(*), plan_limits(*)), plan_pricing(*)').eq('user_id', userId).eq('status', 'active').single(); setSubscription(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { subscription, isLoading, refresh: fetch }
}

export function useOrganizationSubscription(organizationId?: string) {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('plan_subscriptions').select('*, plans(*, plan_features(*), plan_limits(*)), plan_pricing(*)').eq('organization_id', organizationId).eq('status', 'active').single(); setSubscription(data) } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { subscription, isLoading, refresh: fetch }
}

export function useSubscriptionUsage(subscriptionId?: string, options?: { limit_key?: string; from_date?: string }) {
  const [usage, setUsage] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!subscriptionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('plan_usage').select('*').eq('subscription_id', subscriptionId)
      if (options?.limit_key) query = query.eq('limit_key', options.limit_key)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      const { data } = await query.order('recorded_at', { ascending: false })
      setUsage(data || [])
    } finally { setIsLoading(false) }
  }, [subscriptionId, options?.limit_key, options?.from_date])
  useEffect(() => { fetch() }, [fetch])
  return { usage, isLoading, refresh: fetch }
}

export function useLimitCheck(subscriptionId?: string, limitKey?: string) {
  const [check, setCheck] = useState<{ allowed: boolean; current: number; limit: number; percentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!subscriptionId || !limitKey) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: subscription } = await supabase.from('plan_subscriptions').select('plan_id').eq('id', subscriptionId).single()
      if (!subscription) { setCheck({ allowed: false, current: 0, limit: 0, percentage: 100 }); setIsLoading(false); return }
      const { data: limit } = await supabase.from('plan_limits').select('limit_value').eq('plan_id', subscription.plan_id).eq('limit_key', limitKey).single()
      if (!limit) { setCheck({ allowed: true, current: 0, limit: -1, percentage: 0 }); setIsLoading(false); return }
      const currentMonth = new Date(); currentMonth.setDate(1); currentMonth.setHours(0, 0, 0, 0)
      const { data: usage } = await supabase.from('plan_usage').select('quantity').eq('subscription_id', subscriptionId).eq('limit_key', limitKey).gte('recorded_at', currentMonth.toISOString())
      const current = usage?.reduce((sum, u) => sum + u.quantity, 0) || 0
      const percentage = limit.limit_value > 0 ? Math.round((current / limit.limit_value) * 100) : 0
      setCheck({ allowed: current < limit.limit_value, current, limit: limit.limit_value, percentage })
    } finally { setIsLoading(false) }
  }, [subscriptionId, limitKey])
  useEffect(() => { fetch() }, [fetch])
  return { check, isLoading, refresh: fetch }
}

export function usePublicPlans() {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('plans').select('*, plan_features(*), plan_limits(*), plan_pricing(*)').eq('is_active', true).eq('is_public', true).order('tier', { ascending: true }); setPlans(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { plans, isLoading, refresh: fetch }
}
