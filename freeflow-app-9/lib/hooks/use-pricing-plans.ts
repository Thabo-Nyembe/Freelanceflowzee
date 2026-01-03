'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PricingPlan {
  id: string
  user_id: string
  name: string
  description: string | null
  monthly_price: number
  annual_price: number
  currency: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  subscribers_count: number
  revenue_monthly: number
  revenue_annual: number
  churn_rate: number
  upgrade_rate: number
  features: any[]
  limits: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PricingStats {
  total: number
  active: number
  featured: number
  totalSubscribers: number
  totalRevenueMonthly: number
  totalRevenueAnnual: number
  avgChurnRate: number
  avgUpgradeRate: number
  arpu: number
}

export interface PricingPlanInput {
  name: string
  description?: string
  monthly_price?: number
  annual_price?: number
  currency?: string
  is_active?: boolean
  is_featured?: boolean
  sort_order?: number
  features?: any[]
  limits?: Record<string, any>
}

export function usePricingPlans(initialPlans: PricingPlan[] = [], initialStats: PricingStats) {
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans)
  const [stats, setStats] = useState<PricingStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const calculateStats = useCallback((pls: PricingPlan[]): PricingStats => {
    const totalSubs = pls.reduce((sum, p) => sum + p.subscribers_count, 0)
    const totalRevMonthly = pls.reduce((sum, p) => sum + p.revenue_monthly, 0)
    const totalRevAnnual = pls.reduce((sum, p) => sum + p.revenue_annual, 0)
    const totalChurn = pls.reduce((sum, p) => sum + p.churn_rate, 0)
    const totalUpgrade = pls.reduce((sum, p) => sum + p.upgrade_rate, 0)

    return {
      total: pls.length,
      active: pls.filter(p => p.is_active).length,
      featured: pls.filter(p => p.is_featured).length,
      totalSubscribers: totalSubs,
      totalRevenueMonthly: totalRevMonthly,
      totalRevenueAnnual: totalRevAnnual,
      avgChurnRate: pls.length > 0 ? totalChurn / pls.length : 0,
      avgUpgradeRate: pls.length > 0 ? totalUpgrade / pls.length : 0,
      arpu: totalSubs > 0 ? totalRevMonthly / totalSubs : 0
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('pricing-plans-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pricing_plans' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlans(prev => {
              const updated = [...prev, payload.new as PricingPlan].sort((a, b) => a.sort_order - b.sort_order)
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setPlans(prev => {
              const updated = prev.map(p => p.id === payload.new.id ? payload.new as PricingPlan : p)
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setPlans(prev => {
              const updated = prev.filter(p => p.id !== payload.old.id)
              setStats(calculateStats(updated))
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, calculateStats])

  const createPlan = useCallback(async (input: PricingPlanInput) => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const maxOrder = plans.length > 0 ? Math.max(...plans.map(p => p.sort_order)) : 0

      const { data, error: insertError } = await supabase
        .from('pricing_plans')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          monthly_price: input.monthly_price || 0,
          annual_price: input.annual_price || (input.monthly_price || 0) * 10,
          currency: input.currency || 'USD',
          is_active: input.is_active ?? true,
          is_featured: input.is_featured ?? false,
          sort_order: input.sort_order ?? maxOrder + 1,
          features: input.features || [],
          limits: input.limits || {}
        })
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, plans])

  const updatePlan = useCallback(async (id: string, updates: Partial<PricingPlanInput>) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('pricing_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const deletePlan = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plan')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const toggleActive = useCallback(async (id: string) => {
    const plan = plans.find(p => p.id === id)
    if (!plan) return null
    return updatePlan(id, { is_active: !plan.is_active })
  }, [plans, updatePlan])

  const setFeatured = useCallback(async (id: string) => {
    // Unset all featured first, then set the new one
    for (const plan of plans) {
      if (plan.is_featured && plan.id !== id) {
        await updatePlan(plan.id, { is_featured: false })
      }
    }
    return updatePlan(id, { is_featured: true })
  }, [plans, updatePlan])

  const updateSubscribers = useCallback(async (id: string, count: number) => {
    const plan = plans.find(p => p.id === id)
    if (!plan) return null

    const revenueMonthly = count * plan.monthly_price
    const revenueAnnual = count * plan.annual_price

    const { data, error: updateError } = await supabase
      .from('pricing_plans')
      .update({
        subscribers_count: count,
        revenue_monthly: revenueMonthly,
        revenue_annual: revenueAnnual,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return null
    }
    return data
  }, [supabase, plans])

  return {
    plans,
    stats,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    toggleActive,
    setFeatured,
    updateSubscribers
  }
}
