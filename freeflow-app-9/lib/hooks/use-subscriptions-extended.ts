'use client'

/**
 * Extended Subscriptions Hooks - Covers all Subscription-related tables
 * Tables: subscriptions, subscription_usage
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSubscription(subscriptionId?: string) {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!subscriptionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('subscriptions').select('*').eq('id', subscriptionId).single()
      setSubscription(data)
    } finally { setIsLoading(false) }
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
    try {
      const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).in('status', ['active', 'trialing', 'past_due']).order('created_at', { ascending: false }).limit(1).single()
      setSubscription(data)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { subscription, isLoading, refresh: fetch }
}

export function useUserSubscriptions(userId?: string, options?: { status?: string; includeAll?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('subscriptions').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      else if (!options?.includeAll) query = query.in('status', ['active', 'trialing', 'past_due', 'canceled'])
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.includeAll])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSubscriptionStatus(userId?: string) {
  const [status, setStatus] = useState<{ isActive: boolean; plan: string | null; expiresAt: string | null; isTrial: boolean; willCancel: boolean }>({ isActive: false, plan: null, expiresAt: null, isTrial: false, willCancel: false })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).in('status', ['active', 'trialing']).order('created_at', { ascending: false }).limit(1).single()
      if (data) {
        setStatus({
          isActive: true,
          plan: data.plan_id,
          expiresAt: data.current_period_end,
          isTrial: data.status === 'trialing',
          willCancel: data.cancel_at_period_end
        })
      } else {
        setStatus({ isActive: false, plan: null, expiresAt: null, isTrial: false, willCancel: false })
      }
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { status, isLoading, refresh: fetch }
}

export function useSubscriptionUsage(subscriptionId?: string, options?: { feature?: string; startDate?: string; endDate?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!subscriptionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('subscription_usage').select('*').eq('subscription_id', subscriptionId)
      if (options?.feature) query = query.eq('feature', options.feature)
      if (options?.startDate) query = query.gte('timestamp', options.startDate)
      if (options?.endDate) query = query.lte('timestamp', options.endDate)
      const { data: result } = await query.order('timestamp', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [subscriptionId, options?.feature, options?.startDate, options?.endDate])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSubscriptionUsageSummary(subscriptionId?: string) {
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!subscriptionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('subscription_usage').select('feature, quantity').eq('subscription_id', subscriptionId)
      const result: Record<string, number> = {}
      data?.forEach(u => { result[u.feature] = (result[u.feature] || 0) + u.quantity })
      setSummary(result)
    } finally { setIsLoading(false) }
  }, [subscriptionId])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useSubscriptionFeatureLimit(subscriptionId?: string, feature?: string, limit?: number) {
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number; isWithinLimit: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!subscriptionId || !feature || limit === undefined) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: sub } = await supabase.from('subscriptions').select('current_period_start, current_period_end').eq('id', subscriptionId).single()
      if (!sub) { setIsLoading(false); return }
      const { data: usageData } = await supabase.from('subscription_usage').select('quantity').eq('subscription_id', subscriptionId).eq('feature', feature).gte('timestamp', sub.current_period_start).lte('timestamp', sub.current_period_end)
      const total = usageData?.reduce((sum, u) => sum + u.quantity, 0) || 0
      setUsage({ used: total, limit, remaining: Math.max(0, limit - total), isWithinLimit: total < limit })
    } finally { setIsLoading(false) }
  }, [subscriptionId, feature, limit])
  useEffect(() => { fetch() }, [fetch])
  return { usage, isLoading, refresh: fetch }
}

export function useActiveSubscriptions(options?: { planId?: string; billingCycle?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('subscriptions').select('*').in('status', ['active', 'trialing'])
      if (options?.planId) query = query.eq('plan_id', options.planId)
      if (options?.billingCycle) query = query.eq('billing_cycle', options.billingCycle)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.planId, options?.billingCycle, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSubscriptionRealtime(subscriptionId?: string) {
  const [subscription, setSubscription] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!subscriptionId) return
    supabase.from('subscriptions').select('*').eq('id', subscriptionId).single().then(({ data }) => setSubscription(data))
    const channel = supabase.channel(`subscription_${subscriptionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subscriptions', filter: `id=eq.${subscriptionId}` }, (payload) => setSubscription(payload.new))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [subscriptionId])
  return { subscription }
}

export function useSubscriptionStats() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: all } = await supabase.from('subscriptions').select('status, plan_id, billing_cycle')
      const result = { total: all?.length || 0, byStatus: {} as Record<string, number>, byPlan: {} as Record<string, number>, byBillingCycle: {} as Record<string, number> }
      all?.forEach(s => {
        result.byStatus[s.status] = (result.byStatus[s.status] || 0) + 1
        result.byPlan[s.plan_id] = (result.byPlan[s.plan_id] || 0) + 1
        result.byBillingCycle[s.billing_cycle] = (result.byBillingCycle[s.billing_cycle] || 0) + 1
      })
      setStats(result)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useCreateSubscription() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const create = useCallback(async (subscriptionData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error: createError } = await supabase
        .from('subscriptions')
        .insert([{ ...subscriptionData, user_id: user?.id }])
        .select()
        .single()
      if (createError) throw createError
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { create, isLoading, error }
}
