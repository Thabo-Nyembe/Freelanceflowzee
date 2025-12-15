'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface InvestorMetric {
  id: string
  user_id: string
  metric_name: string
  category: 'revenue' | 'growth' | 'efficiency' | 'engagement'
  current_value: number
  previous_value: number
  change_percent: number
  unit: string
  description: string | null
  period: 'monthly' | 'quarterly' | 'yearly'
  quarter: string | null
  year: number
  metadata: Record<string, any>
  recorded_at: string
  created_at: string
  updated_at: string
}

export interface InvestorStats {
  total: number
  revenue: number
  growth: number
  efficiency: number
  engagement: number
  avgChangePercent: number
  totalCurrentValue: number
}

export interface InvestorMetricInput {
  metric_name: string
  category?: 'revenue' | 'growth' | 'efficiency' | 'engagement'
  current_value?: number
  previous_value?: number
  unit?: string
  description?: string
  period?: 'monthly' | 'quarterly' | 'yearly'
  quarter?: string
  year?: number
}

export function useInvestorMetrics(initialMetrics: InvestorMetric[] = [], initialStats: InvestorStats) {
  const [metrics, setMetrics] = useState<InvestorMetric[]>(initialMetrics)
  const [stats, setStats] = useState<InvestorStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const calculateStats = useCallback((mets: InvestorMetric[]): InvestorStats => {
    const totalChange = mets.reduce((sum, m) => sum + m.change_percent, 0)
    return {
      total: mets.length,
      revenue: mets.filter(m => m.category === 'revenue').length,
      growth: mets.filter(m => m.category === 'growth').length,
      efficiency: mets.filter(m => m.category === 'efficiency').length,
      engagement: mets.filter(m => m.category === 'engagement').length,
      avgChangePercent: mets.length > 0 ? totalChange / mets.length : 0,
      totalCurrentValue: mets.reduce((sum, m) => sum + m.current_value, 0)
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('investor-metrics-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investor_metrics' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMetrics(prev => {
              const updated = [payload.new as InvestorMetric, ...prev]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setMetrics(prev => {
              const updated = prev.map(m => m.id === payload.new.id ? payload.new as InvestorMetric : m)
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

  const createMetric = useCallback(async (input: InvestorMetricInput) => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const currentValue = input.current_value || 0
      const previousValue = input.previous_value || 0
      const changePercent = previousValue > 0
        ? ((currentValue - previousValue) / previousValue) * 100
        : 0

      const { data, error: insertError } = await supabase
        .from('investor_metrics')
        .insert({
          user_id: user.id,
          metric_name: input.metric_name,
          category: input.category || 'revenue',
          current_value: currentValue,
          previous_value: previousValue,
          change_percent: changePercent,
          unit: input.unit || 'currency',
          description: input.description || null,
          period: input.period || 'quarterly',
          quarter: input.quarter || null,
          year: input.year || new Date().getFullYear()
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

  const updateMetric = useCallback(async (id: string, updates: Partial<InvestorMetricInput>) => {
    setLoading(true)
    setError(null)
    try {
      const metric = metrics.find(m => m.id === id)
      if (!metric) throw new Error('Metric not found')

      const currentValue = updates.current_value ?? metric.current_value
      const previousValue = updates.previous_value ?? metric.previous_value
      const changePercent = previousValue > 0
        ? ((currentValue - previousValue) / previousValue) * 100
        : 0

      const { data, error: updateError } = await supabase
        .from('investor_metrics')
        .update({
          ...updates,
          change_percent: changePercent,
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
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('investor_metrics')
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

  const getMetricsByCategory = useCallback((category: string) => {
    return metrics.filter(m => m.category === category)
  }, [metrics])

  const getMetricsByPeriod = useCallback((period: string) => {
    return metrics.filter(m => m.period === period)
  }, [metrics])

  return {
    metrics,
    stats,
    loading,
    error,
    createMetric,
    updateMetric,
    deleteMetric,
    getMetricsByCategory,
    getMetricsByPeriod
  }
}
