'use client'

/**
 * Extended Strategies Hooks
 * Tables: strategies, strategy_goals, strategy_initiatives, strategy_metrics, strategy_reviews, strategy_milestones
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStrategy(strategyId?: string) {
  const [strategy, setStrategy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!strategyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('strategies').select('*, strategy_goals(*), strategy_initiatives(*), strategy_metrics(*), strategy_milestones(*)').eq('id', strategyId).single(); setStrategy(data) } finally { setIsLoading(false) }
  }, [strategyId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { strategy, isLoading, refresh: fetch }
}

export function useStrategies(options?: { strategy_type?: string; owner_id?: string; status?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [strategies, setStrategies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('strategies').select('*, strategy_goals(count), strategy_initiatives(count)')
      if (options?.strategy_type) query = query.eq('strategy_type', options.strategy_type)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setStrategies(data || [])
    } finally { setIsLoading(false) }
  }, [options?.strategy_type, options?.owner_id, options?.status, options?.is_active, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { strategies, isLoading, refresh: fetch }
}

export function useStrategyGoals(strategyId?: string, options?: { goal_type?: string; status?: string; owner_id?: string }) {
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!strategyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('strategy_goals').select('*, users(*)').eq('strategy_id', strategyId)
      if (options?.goal_type) query = query.eq('goal_type', options.goal_type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      const { data } = await query.order('priority', { ascending: true })
      setGoals(data || [])
    } finally { setIsLoading(false) }
  }, [strategyId, options?.goal_type, options?.status, options?.owner_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { goals, isLoading, refresh: fetch }
}

export function useStrategyInitiatives(strategyId?: string, options?: { goal_id?: string; status?: string; owner_id?: string }) {
  const [initiatives, setInitiatives] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!strategyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('strategy_initiatives').select('*, strategy_goals(*), users(*)').eq('strategy_id', strategyId)
      if (options?.goal_id) query = query.eq('goal_id', options.goal_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      const { data } = await query.order('priority', { ascending: true })
      setInitiatives(data || [])
    } finally { setIsLoading(false) }
  }, [strategyId, options?.goal_id, options?.status, options?.owner_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { initiatives, isLoading, refresh: fetch }
}

export function useStrategyMetrics(strategyId?: string, options?: { metric_name?: string; goal_id?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!strategyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('strategy_metrics').select('*').eq('strategy_id', strategyId)
      if (options?.metric_name) query = query.eq('metric_name', options.metric_name)
      if (options?.goal_id) query = query.eq('goal_id', options.goal_id)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      const { data } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100)
      setMetrics(data || [])
    } finally { setIsLoading(false) }
  }, [strategyId, options?.metric_name, options?.goal_id, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useStrategyMilestones(strategyId?: string, options?: { status?: string; initiative_id?: string }) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!strategyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('strategy_milestones').select('*, strategy_initiatives(*)').eq('strategy_id', strategyId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.initiative_id) query = query.eq('initiative_id', options.initiative_id)
      const { data } = await query.order('target_date', { ascending: true })
      setMilestones(data || [])
    } finally { setIsLoading(false) }
  }, [strategyId, options?.status, options?.initiative_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { milestones, isLoading, refresh: fetch }
}

export function useStrategyReviews(strategyId?: string, options?: { review_type?: string; limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!strategyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('strategy_reviews').select('*, users(*)').eq('strategy_id', strategyId)
      if (options?.review_type) query = query.eq('review_type', options.review_type)
      const { data } = await query.order('reviewed_at', { ascending: false }).limit(options?.limit || 20)
      setReviews(data || [])
    } finally { setIsLoading(false) }
  }, [strategyId, options?.review_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reviews, isLoading, refresh: fetch }
}

export function useStrategyProgress(strategyId?: string) {
  const [progress, setProgress] = useState<{ goalsProgress: number; initiativesProgress: number; milestonesProgress: number; overallProgress: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!strategyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [goalsRes, initiativesRes, milestonesRes] = await Promise.all([
        supabase.from('strategy_goals').select('progress').eq('strategy_id', strategyId),
        supabase.from('strategy_initiatives').select('progress').eq('strategy_id', strategyId),
        supabase.from('strategy_milestones').select('status').eq('strategy_id', strategyId)
      ])
      const goals = goalsRes.data || []
      const initiatives = initiativesRes.data || []
      const milestones = milestonesRes.data || []
      const goalsProgress = goals.length ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length : 0
      const initiativesProgress = initiatives.length ? initiatives.reduce((sum, i) => sum + (i.progress || 0), 0) / initiatives.length : 0
      const completedMilestones = milestones.filter(m => m.status === 'completed').length
      const milestonesProgress = milestones.length ? (completedMilestones / milestones.length) * 100 : 0
      const overallProgress = (goalsProgress + initiativesProgress + milestonesProgress) / 3
      setProgress({ goalsProgress, initiativesProgress, milestonesProgress, overallProgress })
    } finally { setIsLoading(false) }
  }, [strategyId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function useUpcomingMilestones(options?: { strategy_id?: string; owner_id?: string; days?: number; limit?: number }) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      const futureDate = new Date(now.getTime() + (options?.days || 30) * 24 * 60 * 60 * 1000)
      let query = supabase.from('strategy_milestones').select('*, strategies(*)').eq('status', 'pending').gte('target_date', now.toISOString()).lte('target_date', futureDate.toISOString())
      if (options?.strategy_id) query = query.eq('strategy_id', options.strategy_id)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      const { data } = await query.order('target_date', { ascending: true }).limit(options?.limit || 20)
      setMilestones(data || [])
    } finally { setIsLoading(false) }
  }, [options?.strategy_id, options?.owner_id, options?.days, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { milestones, isLoading, refresh: fetch }
}

