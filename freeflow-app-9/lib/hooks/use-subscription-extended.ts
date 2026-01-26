'use client'

/**
 * Extended Subscription Hooks - Covers all Subscription-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

/**
 * Subscription record from database
 */
export interface SubscriptionRecord {
  id: string
  user_id: string
  plan_type: string
  status: string
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
 * Subscription plan record from database
 */
export interface SubscriptionPlanRecord {
  id: string
  name: string
  price: number
  interval?: string
  features?: string[]
  is_active: boolean
  stripe_product_id?: string
  stripe_price_id?: string
  metadata?: Record<string, JsonValue>
  created_at: string
  updated_at?: string
}

export function useSubscriptions(userId?: string, status?: string) {
  const [data, setData] = useState<SubscriptionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('subscriptions').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, status])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSubscriptionPlans(isActive?: boolean) {
  const [data, setData] = useState<SubscriptionPlanRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('subscription_plans').select('*').order('price', { ascending: true })
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [isActive])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
