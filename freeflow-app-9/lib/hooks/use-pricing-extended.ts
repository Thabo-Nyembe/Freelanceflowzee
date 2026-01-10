'use client'

/**
 * Extended Pricing Hooks
 * Tables: pricing, pricing_tiers, pricing_features, pricing_discounts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePricingPlan(planId?: string) {
  const [plan, setPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pricing').select('*, pricing_features(*)').eq('id', planId).single(); setPlan(data) } finally { setIsLoading(false) }
  }, [planId])
  useEffect(() => { fetch() }, [fetch])
  return { plan, isLoading, refresh: fetch }
}

export function usePricingPlans(options?: { billing_period?: string; is_active?: boolean; limit?: number }) {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('pricing').select('*, pricing_features(*)')
      if (options?.billing_period) query = query.eq('billing_period', options.billing_period)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('price', { ascending: true }).limit(options?.limit || 20)
      setPlans(data || [])
    } finally { setIsLoading(false) }
  }, [options?.billing_period, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { plans, isLoading, refresh: fetch }
}

export function usePricingTiers() {
  const [tiers, setTiers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('pricing_tiers').select('*, pricing(*)').order('order', { ascending: true }); setTiers(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { tiers, isLoading, refresh: fetch }
}

export function usePricingFeatures(planId?: string) {
  const [features, setFeatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pricing_features').select('*').eq('plan_id', planId).order('order', { ascending: true }); setFeatures(data || []) } finally { setIsLoading(false) }
  }, [planId])
  useEffect(() => { fetch() }, [fetch])
  return { features, isLoading, refresh: fetch }
}

export function useActivePricingPlans() {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('pricing').select('*, pricing_features(*)').eq('is_active', true).order('price', { ascending: true }); setPlans(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { plans, isLoading, refresh: fetch }
}

export function usePricingDiscounts(options?: { is_active?: boolean }) {
  const [discounts, setDiscounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('pricing_discounts').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false })
      setDiscounts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { discounts, isLoading, refresh: fetch }
}
