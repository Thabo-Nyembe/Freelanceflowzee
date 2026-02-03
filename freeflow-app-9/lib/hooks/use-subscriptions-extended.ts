'use client'

/**
 * Extended Subscriptions Hooks - Covers all Subscription-related tables
 * Tables: subscriptions, subscription_usage
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue, DatabaseError } from '@/lib/types/database'
import { toDbError } from '@/lib/types/database'

/**
 * Subscription record from database
 */
export interface SubscriptionRecord {
  id: string
  user_id: string
  plan_id?: string
  plan_type?: string
  status: string
  billing_cycle?: string
  billing_interval?: string
  amount?: number
  currency?: string
  current_period_start?: string
  current_period_end?: string
  trial_start?: string
  trial_end?: string
  cancel_at_period_end?: boolean
  canceled_at?: string
  cancellation_reason?: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  metadata?: Record<string, JsonValue>
  created_at: string
  updated_at?: string
}

/**
 * Subscription usage record from database
 */
export interface SubscriptionUsageRecord {
  id: string
  subscription_id: string
  feature: string
  quantity: number
  timestamp: string
  metadata?: Record<string, JsonValue>
  created_at: string
}

/**
 * Subscription statistics
 */
export interface SubscriptionStats {
  total: number
  byStatus: Record<string, number>
  byPlan: Record<string, number>
  byBillingCycle: Record<string, number>
}

/**
 * Subscription data for create/update operations
 */
export interface SubscriptionInput {
  plan_id?: string
  plan_type?: string
  status?: string
  billing_cycle?: string
  billing_interval?: string
  amount?: number
  currency?: string
  current_period_start?: string
  current_period_end?: string
  trial_start?: string
  trial_end?: string
  cancel_at_period_end?: boolean
  stripe_subscription_id?: string
  stripe_customer_id?: string
  metadata?: Record<string, JsonValue>
}

export function useSubscription(subscriptionId?: string) {
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!subscriptionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('subscriptions').select('*').eq('id', subscriptionId).single()
      setSubscription(data)
    } finally { setIsLoading(false) }
  }, [subscriptionId])
  useEffect(() => { loadData() }, [loadData])
  return { subscription, isLoading, refresh: loadData }
}

export function useUserSubscription(userId?: string) {
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).in('status', ['active', 'trialing', 'past_due']).order('created_at', { ascending: false }).limit(1).single()
      setSubscription(data)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { subscription, isLoading, refresh: loadData }
}

export function useUserSubscriptions(userId?: string, options?: { status?: string; includeAll?: boolean }) {
  const [data, setData] = useState<SubscriptionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useSubscriptionStatus(userId?: string) {
  const [status, setStatus] = useState<{ isActive: boolean; plan: string | null; expiresAt: string | null; isTrial: boolean; willCancel: boolean }>({ isActive: false, plan: null, expiresAt: null, isTrial: false, willCancel: false })
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { status, isLoading, refresh: loadData }
}

export function useSubscriptionUsage(subscriptionId?: string, options?: { feature?: string; startDate?: string; endDate?: string }) {
  const [data, setData] = useState<SubscriptionUsageRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useSubscriptionUsageSummary(subscriptionId?: string) {
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { summary, isLoading, refresh: loadData }
}

export function useSubscriptionFeatureLimit(subscriptionId?: string, feature?: string, limit?: number) {
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number; isWithinLimit: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { usage, isLoading, refresh: loadData }
}

export function useActiveSubscriptions(options?: { planId?: string; billingCycle?: string; limit?: number }) {
  const [data, setData] = useState<SubscriptionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useSubscriptionRealtime(subscriptionId?: string) {
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!subscriptionId) return
    supabase.from('subscriptions').select('*').eq('id', subscriptionId).single().then(({ data }) => setSubscription(data))
    const channel = supabase.channel(`subscription_${subscriptionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subscriptions', filter: `id=eq.${subscriptionId}` }, (payload) => setSubscription(payload.new as SubscriptionRecord))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [subscriptionId])
  return { subscription }
}

export function useSubscriptionStats() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useCreateSubscription() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<DatabaseError | null>(null)
  const supabase = createClient()

  const create = useCallback(async (subscriptionData: SubscriptionInput) => {
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
    } catch (err: unknown) {
      const dbError = toDbError(err)
      setError(dbError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { create, isLoading, error }
}
