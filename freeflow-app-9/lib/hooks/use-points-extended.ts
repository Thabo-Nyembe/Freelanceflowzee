'use client'

/**
 * Extended Points Hooks
 * Tables: points, point_transactions, point_rules, point_rewards, point_redemptions, point_tiers
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePoints(userId?: string) {
  const [points, setPoints] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('points').select('*, point_tiers(*)').eq('user_id', userId).single(); setPoints(data || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 }) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { points, isLoading, refresh: fetch }
}

export function usePointBalance(userId?: string) {
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('points').select('balance').eq('user_id', userId).single(); setBalance(data?.balance || 0) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { balance, isLoading, refresh: fetch }
}

export function usePointTransactions(userId?: string, options?: { type?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('point_transactions').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTransactions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { transactions, isLoading, refresh: fetch }
}

export function usePointRules(options?: { action?: string; is_active?: boolean }) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('point_rules').select('*')
      if (options?.action) query = query.eq('action', options.action)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setRules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.action, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function usePointRewards(options?: { is_active?: boolean; reward_type?: string; affordable_for?: number }) {
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('point_rewards').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.reward_type) query = query.eq('reward_type', options.reward_type)
      if (options?.affordable_for !== undefined) query = query.lte('points_required', options.affordable_for)
      const { data } = await query.order('points_required', { ascending: true })
      setRewards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.reward_type, options?.affordable_for, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rewards, isLoading, refresh: fetch }
}

export function usePointRedemptions(userId?: string, options?: { status?: string; limit?: number }) {
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('point_redemptions').select('*, point_rewards(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('redeemed_at', { ascending: false }).limit(options?.limit || 50)
      setRedemptions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { redemptions, isLoading, refresh: fetch }
}

export function usePointTiers() {
  const [tiers, setTiers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('point_tiers').select('*').order('min_points', { ascending: true }); setTiers(data || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tiers, isLoading, refresh: fetch }
}

export function useCurrentTier(userId?: string) {
  const [tier, setTier] = useState<any>(null)
  const [nextTier, setNextTier] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: points } = await supabase.from('points').select('lifetime_earned, tier_id, point_tiers(*)').eq('user_id', userId).single()
      if (!points) { setIsLoading(false); return }
      setTier(points.point_tiers)
      const { data: tiers } = await supabase.from('point_tiers').select('*').gt('min_points', points.lifetime_earned).order('min_points', { ascending: true }).limit(1)
      if (tiers && tiers.length > 0) {
        setNextTier(tiers[0])
        const currentTierMin = points.point_tiers?.min_points || 0
        const nextTierMin = tiers[0].min_points
        const progressValue = ((points.lifetime_earned - currentTierMin) / (nextTierMin - currentTierMin)) * 100
        setProgress(Math.min(progressValue, 100))
      } else {
        setNextTier(null)
        setProgress(100)
      }
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tier, nextTier, progress, isLoading, refresh: fetch }
}

export function useAffordableRewards(userId?: string) {
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: points } = await supabase.from('points').select('balance').eq('user_id', userId).single()
      const balance = points?.balance || 0
      const { data } = await supabase.from('point_rewards').select('*').eq('is_active', true).lte('points_required', balance).or(`quantity_available.is.null,quantity_available.gt.0`).order('points_required', { ascending: false })
      setRewards(data || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rewards, isLoading, refresh: fetch }
}

export function usePointsLeaderboard(options?: { limit?: number }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('points').select('*, users(*), point_tiers(*)').order('lifetime_earned', { ascending: false }).limit(options?.limit || 10); setLeaderboard(data || []) } finally { setIsLoading(false) }
  }, [options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { leaderboard, isLoading, refresh: fetch }
}

export function usePointStats(userId?: string) {
  const [stats, setStats] = useState<{ earnedThisMonth: number; spentThisMonth: number; transactionCount: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)
      const { data } = await supabase.from('point_transactions').select('amount, type').eq('user_id', userId).gte('created_at', startOfMonth.toISOString())
      const earnedThisMonth = data?.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.amount, 0) || 0
      const spentThisMonth = data?.filter(t => t.type === 'spend').reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
      const transactionCount = data?.length || 0
      setStats({ earnedThisMonth, spentThisMonth, transactionCount })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
