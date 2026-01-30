'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export interface GrowthMetric {
  id: string
  user_id: string
  metric_name: string
  metric_type: 'revenue' | 'users' | 'conversion' | 'engagement' | 'retention' | 'custom'
  current_value: number
  previous_value: number
  target_value: number | null
  growth_rate: number
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  unit: string
  is_goal: boolean
  goal_deadline: string | null
  notes: string | null
  metadata: Record<string, any>
  recorded_at: string
  created_at: string
  updated_at: string
}

export interface GrowthStats {
  total: number
  revenue: number
  users: number
  conversion: number
  goals: number
  avgGrowthRate: number
  totalCurrentValue: number
  totalTargetValue: number
}

export interface GrowthMetricInput {
  metric_name: string
  metric_type?: 'revenue' | 'users' | 'conversion' | 'engagement' | 'retention' | 'custom'
  current_value?: number
  previous_value?: number
  target_value?: number
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  unit?: string
  is_goal?: boolean
  goal_deadline?: string
  notes?: string
}

export function useGrowthMetrics(initialMetrics: GrowthMetric[] = [], initialStats: GrowthStats) {
  const [metrics, setMetrics] = useState<GrowthMetric[]>(initialMetrics)
  const [stats, setStats] = useState<GrowthStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Calculate stats from metrics
  const calculateStats = useCallback((mets: GrowthMetric[]): GrowthStats => {
    const totalGrowth = mets.reduce((sum, m) => sum + m.growth_rate, 0)
    return {
      total: mets.length,
      revenue: mets.filter(m => m.metric_type === 'revenue').length,
      users: mets.filter(m => m.metric_type === 'users').length,
      conversion: mets.filter(m => m.metric_type === 'conversion').length,
      goals: mets.filter(m => m.is_goal).length,
      avgGrowthRate: mets.length > 0 ? totalGrowth / mets.length : 0,
      totalCurrentValue: mets.reduce((sum, m) => sum + m.current_value, 0),
      totalTargetValue: mets.reduce((sum, m) => sum + (m.target_value || 0), 0)
    }
  }, [])

  // Real-time subscription
  useEffect(() => {
    // Demo mode: fetch data with demo=true parameter

    const channel = supabase
      .channel('growth-metrics-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'growth_metrics' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMetrics(prev => {
              const updated = [payload.new as GrowthMetric, ...prev]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setMetrics(prev => {
              const updated = prev.map(m => m.id === payload.new.id ? payload.new as GrowthMetric : m)
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setMetrics(prev => {
              const updated = prev.filter(m => m.id !== payload.old.id)
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

  const createMetric = useCallback(async (input: GrowthMetricInput) => {
    // Demo mode: fetch data with demo=true parameter

    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const currentValue = input.current_value || 0
      const previousValue = input.previous_value || 0
      const growthRate = previousValue > 0
        ? ((currentValue - previousValue) / previousValue) * 100
        : 0

      const { data, error: insertError } = await supabase
        .from('growth_metrics')
        .insert({
          user_id: user.id,
          metric_name: input.metric_name,
          metric_type: input.metric_type || 'custom',
          current_value: currentValue,
          previous_value: previousValue,
          target_value: input.target_value || null,
          growth_rate: growthRate,
          period: input.period || 'monthly',
          unit: input.unit || 'count',
          is_goal: input.is_goal || false,
          goal_deadline: input.goal_deadline || null,
          notes: input.notes || null
        })
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create metric')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const updateMetric = useCallback(async (id: string, updates: Partial<GrowthMetricInput>) => {
    // Demo mode: fetch data with demo=true parameter

    setLoading(true)
    setError(null)
    try {
      const metric = metrics.find(m => m.id === id)
      if (!metric) throw new Error('Metric not found')

      const currentValue = updates.current_value ?? metric.current_value
      const previousValue = updates.previous_value ?? metric.previous_value
      const growthRate = previousValue > 0
        ? ((currentValue - previousValue) / previousValue) * 100
        : 0

      const { data, error: updateError } = await supabase
        .from('growth_metrics')
        .update({
          ...updates,
          growth_rate: growthRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update metric')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, metrics])

  const deleteMetric = useCallback(async (id: string) => {
    // Demo mode: fetch data with demo=true parameter

    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('growth_metrics')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete metric')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const recordValue = useCallback(async (id: string, newValue: number) => {
    const metric = metrics.find(m => m.id === id)
    if (!metric) return null

    return updateMetric(id, {
      previous_value: metric.current_value,
      current_value: newValue
    })
  }, [metrics, updateMetric])

  const setAsGoal = useCallback(async (id: string, targetValue: number, deadline?: string) => {
    return updateMetric(id, {
      is_goal: true,
      target_value: targetValue,
      goal_deadline: deadline
    })
  }, [updateMetric])

  const getGoalProgress = useCallback((metric: GrowthMetric): number => {
    if (!metric.is_goal || !metric.target_value) return 0
    return Math.min((metric.current_value / metric.target_value) * 100, 100)
  }, [])

  return {
    metrics,
    stats,
    loading,
    error,
    createMetric,
    updateMetric,
    deleteMetric,
    recordValue,
    setAsGoal,
    getGoalProgress
  }
}
