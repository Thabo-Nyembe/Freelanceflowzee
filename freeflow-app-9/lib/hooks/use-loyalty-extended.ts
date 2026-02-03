'use client'

/**
 * Extended Loyalty Hooks
 * Tables: loyalty_programs, loyalty_members, loyalty_points, loyalty_rewards, loyalty_tiers, loyalty_transactions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLoyaltyProgram(programId?: string) {
  const [program, setProgram] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!programId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('loyalty_programs').select('*, loyalty_tiers(*), loyalty_rewards(*)').eq('id', programId).single(); setProgram(data) } finally { setIsLoading(false) }
  }, [programId])
  useEffect(() => { loadData() }, [loadData])
  return { program, isLoading, refresh: loadData }
}

export function useLoyaltyMember(memberId?: string) {
  const [member, setMember] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!memberId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('loyalty_members').select('*, loyalty_programs(*), loyalty_tiers(*)').eq('id', memberId).single(); setMember(data) } finally { setIsLoading(false) }
  }, [memberId])
  useEffect(() => { loadData() }, [loadData])
  return { member, isLoading, refresh: loadData }
}

export function useUserMembership(userId?: string, programId?: string) {
  const [membership, setMembership] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !programId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('loyalty_members').select('*, loyalty_programs(*), loyalty_tiers(*)').eq('user_id', userId).eq('program_id', programId).single(); setMembership(data) } finally { setIsLoading(false) }
  }, [userId, programId])
  useEffect(() => { loadData() }, [loadData])
  return { membership, isLoading, refresh: loadData }
}

export function useLoyaltyTransactions(memberId?: string, options?: { type?: string; limit?: number }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!memberId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('loyalty_transactions').select('*').eq('member_id', memberId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTransactions(data || [])
    } finally { setIsLoading(false) }
  }, [memberId, options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { transactions, isLoading, refresh: loadData }
}

export function useLoyaltyRewards(programId?: string, options?: { is_active?: boolean }) {
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!programId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('loyalty_rewards').select('*').eq('program_id', programId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('points_cost', { ascending: true })
      setRewards(data || [])
    } finally { setIsLoading(false) }
  }, [programId, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { rewards, isLoading, refresh: loadData }
}

export function useLoyaltyTiers(programId?: string) {
  const [tiers, setTiers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!programId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('loyalty_tiers').select('*').eq('program_id', programId).order('min_points', { ascending: true }); setTiers(data || []) } finally { setIsLoading(false) }
  }, [programId])
  useEffect(() => { loadData() }, [loadData])
  return { tiers, isLoading, refresh: loadData }
}

export function usePointsBalance(memberId?: string) {
  const [balance, setBalance] = useState<{ current: number; lifetime: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!memberId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('loyalty_members').select('points_balance, lifetime_points').eq('id', memberId).single(); setBalance(data ? { current: data.points_balance, lifetime: data.lifetime_points } : null) } finally { setIsLoading(false) }
  }, [memberId])
  useEffect(() => { loadData() }, [loadData])
  return { balance, isLoading, refresh: loadData }
}

export function useAvailableRewards(memberId?: string) {
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!memberId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: member } = await supabase.from('loyalty_members').select('program_id, points_balance, tier_id').eq('id', memberId).single()
      if (member) {
        const { data } = await supabase.from('loyalty_rewards').select('*').eq('program_id', member.program_id).eq('is_active', true).lte('points_cost', member.points_balance).order('points_cost', { ascending: true })
        setRewards(data || [])
      }
    } finally { setIsLoading(false) }
  }, [memberId])
  useEffect(() => { loadData() }, [loadData])
  return { rewards, isLoading, refresh: loadData }
}

export function useUserMemberships(userId?: string) {
  const [memberships, setMemberships] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('loyalty_members').select('*, loyalty_programs(*), loyalty_tiers(*)').eq('user_id', userId).eq('status', 'active').order('enrolled_at', { ascending: false }); setMemberships(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { memberships, isLoading, refresh: loadData }
}

export function useTierProgress(memberId?: string) {
  const [progress, setProgress] = useState<{ currentTier: any; nextTier: any; pointsToNext: number; percentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!memberId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: member } = await supabase.from('loyalty_members').select('program_id, lifetime_points, tier_id').eq('id', memberId).single()
      if (member) {
        const { data: tiers } = await supabase.from('loyalty_tiers').select('*').eq('program_id', member.program_id).order('min_points', { ascending: true })
        const currentTierIndex = tiers?.findIndex(t => t.id === member.tier_id) ?? -1
        const currentTier = currentTierIndex >= 0 ? tiers?.[currentTierIndex] : null
        const nextTier = currentTierIndex >= 0 && tiers ? tiers[currentTierIndex + 1] : tiers?.[0]
        const pointsToNext = nextTier ? Math.max(0, nextTier.min_points - member.lifetime_points) : 0
        const currentMin = currentTier?.min_points || 0
        const nextMin = nextTier?.min_points || currentMin + 1
        const percentage = nextTier ? Math.min(100, Math.round(((member.lifetime_points - currentMin) / (nextMin - currentMin)) * 100)) : 100
        setProgress({ currentTier, nextTier, pointsToNext, percentage })
      }
    } finally { setIsLoading(false) }
  }, [memberId])
  useEffect(() => { loadData() }, [loadData])
  return { progress, isLoading, refresh: loadData }
}
