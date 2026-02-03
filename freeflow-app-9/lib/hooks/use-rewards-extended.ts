'use client'

/**
 * Extended Rewards Hooks
 * Tables: rewards, reward_types, reward_redemptions, reward_points, reward_tiers, reward_programs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReward(rewardId?: string) {
  const [reward, setReward] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!rewardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rewards').select('*, reward_types(*), reward_tiers(*), reward_programs(*)').eq('id', rewardId).single(); setReward(data) } finally { setIsLoading(false) }
  }, [rewardId])
  useEffect(() => { loadData() }, [loadData])
  return { reward, isLoading, refresh: loadData }
}

export function useRewards(options?: { program_id?: string; type_id?: string; tier_id?: string; is_active?: boolean; min_points?: number; max_points?: number; search?: string; limit?: number }) {
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rewards').select('*, reward_types(*), reward_tiers(*), reward_programs(*)')
      if (options?.program_id) query = query.eq('program_id', options.program_id)
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.tier_id) query = query.eq('tier_id', options.tier_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.min_points) query = query.gte('points_required', options.min_points)
      if (options?.max_points) query = query.lte('points_required', options.max_points)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('points_required', { ascending: true }).limit(options?.limit || 50)
      setRewards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.program_id, options?.type_id, options?.tier_id, options?.is_active, options?.min_points, options?.max_points, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { rewards, isLoading, refresh: loadData }
}

export function useRewardTypes(options?: { is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('reward_types').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { types, isLoading, refresh: loadData }
}

export function useRewardPrograms(options?: { is_active?: boolean }) {
  const [programs, setPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('reward_programs').select('*, reward_tiers(*)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setPrograms(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { programs, isLoading, refresh: loadData }
}

export function useUserPoints(userId?: string, programId?: string) {
  const [points, setPoints] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('reward_points').select('*, reward_programs(*)').eq('user_id', userId)
      if (programId) query = query.eq('program_id', programId)
      const { data } = await query
      setPoints(data || [])
    } finally { setIsLoading(false) }
  }, [userId, programId])
  useEffect(() => { loadData() }, [loadData])
  return { points, isLoading, refresh: loadData }
}

export function useUserRedemptions(userId?: string, options?: { status?: string; limit?: number }) {
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('reward_redemptions').select('*, rewards(*, reward_types(*))').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('redeemed_at', { ascending: false }).limit(options?.limit || 50)
      setRedemptions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { redemptions, isLoading, refresh: loadData }
}

export function useUserTier(userId?: string, programId?: string) {
  const [tier, setTier] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !programId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: points } = await supabase.from('reward_points').select('lifetime_earned').eq('user_id', userId).eq('program_id', programId).single()
      if (!points) { setTier(null); return }
      const { data } = await supabase.from('reward_tiers').select('*').eq('program_id', programId).lte('points_threshold', points.lifetime_earned).order('points_threshold', { ascending: false }).limit(1).single()
      setTier(data)
    } finally { setIsLoading(false) }
  }, [userId, programId])
  useEffect(() => { loadData() }, [loadData])
  return { tier, isLoading, refresh: loadData }
}

export function useRewardTiers(programId?: string) {
  const [tiers, setTiers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!programId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('reward_tiers').select('*').eq('program_id', programId).order('points_threshold', { ascending: true }); setTiers(data || []) } finally { setIsLoading(false) }
  }, [programId])
  useEffect(() => { loadData() }, [loadData])
  return { tiers, isLoading, refresh: loadData }
}

export function useAvailableRewards(userId?: string, programId?: string) {
  const [rewards, setRewards] = useState<any[]>([])
  const [userPoints, setUserPoints] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !programId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: points } = await supabase.from('reward_points').select('balance').eq('user_id', userId).eq('program_id', programId).single()
      const balance = points?.balance || 0
      setUserPoints(balance)
      const { data } = await supabase.from('rewards').select('*, reward_types(*)').eq('program_id', programId).eq('is_active', true).lte('points_required', balance).or('quantity_available.is.null,quantity_available.gt.0').order('points_required', { ascending: false })
      setRewards(data || [])
    } finally { setIsLoading(false) }
  }, [userId, programId])
  useEffect(() => { loadData() }, [loadData])
  return { rewards, userPoints, isLoading, refresh: loadData }
}

export function useRewardStats(programId?: string) {
  const [stats, setStats] = useState<{ totalMembers: number; totalPointsIssued: number; totalRedemptions: number; activeRewards: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!programId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [members, redemptions, rewards] = await Promise.all([
        supabase.from('reward_points').select('lifetime_earned', { count: 'exact' }).eq('program_id', programId),
        supabase.from('reward_redemptions').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('rewards').select('*', { count: 'exact', head: true }).eq('program_id', programId).eq('is_active', true)
      ])
      const totalPointsIssued = (members.data || []).reduce((sum, m) => sum + (m.lifetime_earned || 0), 0)
      setStats({ totalMembers: members.count || 0, totalPointsIssued, totalRedemptions: redemptions.count || 0, activeRewards: rewards.count || 0 })
    } finally { setIsLoading(false) }
  }, [programId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

