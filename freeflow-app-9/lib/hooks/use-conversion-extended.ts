'use client'

/**
 * Extended Conversion Hooks
 * Tables: conversions, conversion_funnels, conversion_goals, conversion_events
 */

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

export function useConversion(conversionId?: string) {
  const [conversion, setConversion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!conversionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('conversions').select('*, conversion_events(*)').eq('id', conversionId).single(); setConversion(data) } finally { setIsLoading(false) }
  }, [conversionId])
  useEffect(() => { fetch() }, [fetch])
  return { conversion, isLoading, refresh: fetch }
}

export function useConversions(options?: { goal_id?: string; funnel_id?: string; date_from?: string; date_to?: string; limit?: number }) {
  const [conversions, setConversions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('conversions').select('*')
      if (options?.goal_id) query = query.eq('goal_id', options.goal_id)
      if (options?.funnel_id) query = query.eq('funnel_id', options.funnel_id)
      if (options?.date_from) query = query.gte('converted_at', options.date_from)
      if (options?.date_to) query = query.lte('converted_at', options.date_to)
      const { data } = await query.order('converted_at', { ascending: false }).limit(options?.limit || 50)
      setConversions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.goal_id, options?.funnel_id, options?.date_from, options?.date_to, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { conversions, isLoading, refresh: fetch }
}

export function useConversionGoals(options?: { type?: string; is_active?: boolean }) {
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('conversion_goals').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setGoals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { goals, isLoading, refresh: fetch }
}

export function useConversionFunnels(options?: { is_active?: boolean }) {
  const [funnels, setFunnels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('conversion_funnels').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setFunnels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { funnels, isLoading, refresh: fetch }
}

export function useConversionRate(goalId?: string, options?: { date_from?: string; date_to?: string }) {
  const [rate, setRate] = useState<{ conversions: number; target: number; rate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!goalId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let convQuery = supabase.from('conversions').select('*', { count: 'exact', head: true }).eq('goal_id', goalId)
      if (options?.date_from) convQuery = convQuery.gte('converted_at', options.date_from)
      if (options?.date_to) convQuery = convQuery.lte('converted_at', options.date_to)
      const { count: conversions } = await convQuery
      const { data: goal } = await supabase.from('conversion_goals').select('target_value').eq('id', goalId).single()
      const rateValue = goal?.target_value && goal.target_value > 0 ? ((conversions || 0) / goal.target_value) * 100 : 0
      setRate({ conversions: conversions || 0, target: goal?.target_value || 0, rate: rateValue })
    } finally { setIsLoading(false) }
  }, [goalId, options?.date_from, options?.date_to])
  useEffect(() => { fetch() }, [fetch])
  return { rate, isLoading, refresh: fetch }
}

export function useFunnelAnalysis(funnelId?: string, options?: { date_from?: string; date_to?: string }) {
  const [analysis, setAnalysis] = useState<{ steps: { name: string; count: number; dropoff: number }[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!funnelId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: funnel } = await supabase.from('conversion_funnels').select('steps').eq('id', funnelId).single()
      if (!funnel?.steps) { setAnalysis(null); return }
      let query = supabase.from('conversion_events').select('step_name').eq('funnel_id', funnelId)
      if (options?.date_from) query = query.gte('occurred_at', options.date_from)
      if (options?.date_to) query = query.lte('occurred_at', options.date_to)
      const { data: events } = await query
      const stepCounts: Record<string, number> = {}
      events?.forEach(e => { stepCounts[e.step_name] = (stepCounts[e.step_name] || 0) + 1 })
      const steps = funnel.steps.map((step: any, i: number, arr: any[]) => ({
        name: step.name,
        count: stepCounts[step.name] || 0,
        dropoff: i > 0 ? (stepCounts[arr[i-1].name] || 0) - (stepCounts[step.name] || 0) : 0
      }))
      setAnalysis({ steps })
    } finally { setIsLoading(false) }
  }, [funnelId, options?.date_from, options?.date_to])
  useEffect(() => { fetch() }, [fetch])
  return { analysis, isLoading, refresh: fetch }
}

export function useConversionStats(options?: { date_from?: string; date_to?: string }) {
  const [stats, setStats] = useState<{ total: number; totalValue: number; byGoal: Record<string, number>; bySource: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('conversions').select('goal_id, source, value')
      if (options?.date_from) query = query.gte('converted_at', options.date_from)
      if (options?.date_to) query = query.lte('converted_at', options.date_to)
      const { data } = await query
      if (!data) { setStats(null); return }
      const total = data.length
      const totalValue = data.reduce((sum, c) => sum + (c.value || 0), 0)
      const byGoal = data.reduce((acc: Record<string, number>, c) => { acc[c.goal_id] = (acc[c.goal_id] || 0) + 1; return acc }, {})
      const bySource = data.reduce((acc: Record<string, number>, c) => { if (c.source) acc[c.source] = (acc[c.source] || 0) + 1; return acc }, {})
      setStats({ total, totalValue, byGoal, bySource })
    } finally { setIsLoading(false) }
  }, [options?.date_from, options?.date_to])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
