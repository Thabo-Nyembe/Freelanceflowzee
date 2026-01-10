'use client'

/**
 * Extended Referrals Hooks
 * Tables: referrals, referral_codes, referral_rewards, referral_tiers, referral_campaigns, referral_payouts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReferral(referralId?: string) {
  const [referral, setReferral] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!referralId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('referrals').select('*, referrer:referrer_id(id, full_name, email, avatar_url), referred:referred_id(id, full_name, email, avatar_url), referral_codes(*), referral_rewards(*)').eq('id', referralId).single(); setReferral(data) } finally { setIsLoading(false) }
  }, [referralId])
  useEffect(() => { fetch() }, [fetch])
  return { referral, isLoading, refresh: fetch }
}

export function useReferrals(options?: { referrer_id?: string; referred_id?: string; campaign_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [referrals, setReferrals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('referrals').select('*, referrer:referrer_id(id, full_name, email), referred:referred_id(id, full_name, email), referral_codes(*)')
      if (options?.referrer_id) query = query.eq('referrer_id', options.referrer_id)
      if (options?.referred_id) query = query.eq('referred_id', options.referred_id)
      if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReferrals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.referrer_id, options?.referred_id, options?.campaign_id, options?.status, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { referrals, isLoading, refresh: fetch }
}

export function useMyReferrals(userId?: string, options?: { status?: string; limit?: number }) {
  const [referrals, setReferrals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('referrals').select('*, referred:referred_id(id, full_name, email, avatar_url), referral_rewards(*)').eq('referrer_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReferrals(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { referrals, isLoading, refresh: fetch }
}

export function useReferralCode(codeId?: string) {
  const [code, setCode] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!codeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('referral_codes').select('*, users(*), referral_campaigns(*)').eq('id', codeId).single(); setCode(data) } finally { setIsLoading(false) }
  }, [codeId])
  useEffect(() => { fetch() }, [fetch])
  return { code, isLoading, refresh: fetch }
}

export function useUserReferralCode(userId?: string, campaignId?: string) {
  const [code, setCode] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('referral_codes').select('*, referral_campaigns(*)').eq('user_id', userId).eq('is_active', true)
      if (campaignId) query = query.eq('campaign_id', campaignId)
      const { data } = await query.order('created_at', { ascending: false }).limit(1).single()
      setCode(data)
    } finally { setIsLoading(false) }
  }, [userId, campaignId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { code, isLoading, refresh: fetch }
}

export function useReferralRewards(options?: { user_id?: string; referral_id?: string; status?: string; limit?: number }) {
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('referral_rewards').select('*, referrals(*), users(*)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.referral_id) query = query.eq('referral_id', options.referral_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRewards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.referral_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rewards, isLoading, refresh: fetch }
}

export function useMyRewards(userId?: string, options?: { status?: string; limit?: number }) {
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('referral_rewards').select('*, referrals(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRewards(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rewards, isLoading, refresh: fetch }
}

export function useReferralCampaigns(options?: { is_active?: boolean; limit?: number }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('referral_campaigns').select('*, referral_tiers(*)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setCampaigns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { campaigns, isLoading, refresh: fetch }
}

export function useReferralStats(userId?: string, options?: { campaign_id?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ totalReferrals: number; pendingReferrals: number; completedReferrals: number; totalEarned: number; pendingRewards: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('referrals').select('status, created_at').eq('referrer_id', userId)
      if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data: referrals } = await query
      const { data: rewards } = await supabase.from('referral_rewards').select('amount, status').eq('user_id', userId)
      const totalReferrals = referrals?.length || 0
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0
      const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0
      const totalEarned = rewards?.filter(r => r.status === 'claimed').reduce((sum, r) => sum + (r.amount || 0), 0) || 0
      const pendingRewards = rewards?.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0) || 0
      setStats({ totalReferrals, pendingReferrals, completedReferrals, totalEarned, pendingRewards })
    } finally { setIsLoading(false) }
  }, [userId, options?.campaign_id, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useTopReferrers(options?: { campaign_id?: string; limit?: number }) {
  const [referrers, setReferrers] = useState<{ user: any; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('referrals').select('referrer_id, users:referrer_id(id, full_name, email, avatar_url)').eq('status', 'completed')
      if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id)
      const { data } = await query
      const counts: { [key: string]: { user: any; count: number } } = {}
      data?.forEach(r => {
        if (r.referrer_id) {
          if (!counts[r.referrer_id]) counts[r.referrer_id] = { user: r.users, count: 0 }
          counts[r.referrer_id].count++
        }
      })
      const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, options?.limit || 10)
      setReferrers(sorted)
    } finally { setIsLoading(false) }
  }, [options?.campaign_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { referrers, isLoading, refresh: fetch }
}

export function usePendingRewards(userId?: string) {
  const [rewards, setRewards] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('referral_rewards').select('*, referrals(*)').eq('user_id', userId).eq('status', 'pending').order('created_at', { ascending: false })
      setRewards(data || [])
      setTotal(data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { rewards, total, isLoading, refresh: fetch }
}
