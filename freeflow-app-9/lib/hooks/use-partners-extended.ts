'use client'

/**
 * Extended Partners Hooks
 * Tables: partners, partner_applications, partner_tiers, partner_commissions, partner_referrals, partner_payouts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePartner(partnerId?: string) {
  const [partner, setPartner] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!partnerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('partners').select('*, partner_tiers(*), partner_commissions(*), partner_referrals(*)').eq('id', partnerId).single(); setPartner(data) } finally { setIsLoading(false) }
  }, [partnerId])
  useEffect(() => { fetch() }, [fetch])
  return { partner, isLoading, refresh: fetch }
}

export function useUserPartner(userId?: string) {
  const [partner, setPartner] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('partners').select('*, partner_tiers(*)').eq('user_id', userId).single(); setPartner(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { partner, isLoading, refresh: fetch }
}

export function usePartners(options?: { tier_id?: string; status?: string; search?: string; limit?: number }) {
  const [partners, setPartners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('partners').select('*, partner_tiers(*), users(*)')
      if (options?.tier_id) query = query.eq('tier_id', options.tier_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.ilike('partner_code', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPartners(data || [])
    } finally { setIsLoading(false) }
  }, [options?.tier_id, options?.status, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { partners, isLoading, refresh: fetch }
}

export function usePartnerApplications(options?: { status?: string; limit?: number }) {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('partner_applications').select('*, users(*)')
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setApplications(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { applications, isLoading, refresh: fetch }
}

export function usePartnerTiers() {
  const [tiers, setTiers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('partner_tiers').select('*').order('commission_rate', { ascending: true }); setTiers(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { tiers, isLoading, refresh: fetch }
}

export function usePartnerReferrals(partnerId?: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [referrals, setReferrals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!partnerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('partner_referrals').select('*').eq('partner_id', partnerId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setReferrals(data || [])
    } finally { setIsLoading(false) }
  }, [partnerId, options?.status, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { referrals, isLoading, refresh: fetch }
}

export function usePartnerCommissions(partnerId?: string, options?: { status?: string; limit?: number }) {
  const [commissions, setCommissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!partnerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('partner_commissions').select('*, partner_referrals(*)').eq('partner_id', partnerId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setCommissions(data || [])
    } finally { setIsLoading(false) }
  }, [partnerId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { commissions, isLoading, refresh: fetch }
}

export function usePartnerPayouts(partnerId?: string, options?: { status?: string; limit?: number }) {
  const [payouts, setPayouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!partnerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('partner_payouts').select('*').eq('partner_id', partnerId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPayouts(data || [])
    } finally { setIsLoading(false) }
  }, [partnerId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { payouts, isLoading, refresh: fetch }
}

export function usePartnerStats(partnerId?: string) {
  const [stats, setStats] = useState<{ totalReferrals: number; convertedReferrals: number; totalEarnings: number; pendingEarnings: number; conversionRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!partnerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [referralsRes, commissionsRes] = await Promise.all([
        supabase.from('partner_referrals').select('status').eq('partner_id', partnerId),
        supabase.from('partner_commissions').select('amount, status').eq('partner_id', partnerId)
      ])
      const totalReferrals = referralsRes.data?.length || 0
      const convertedReferrals = referralsRes.data?.filter(r => r.status === 'converted').length || 0
      const totalEarnings = commissionsRes.data?.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0) || 0
      const pendingEarnings = commissionsRes.data?.filter(c => ['pending', 'approved'].includes(c.status)).reduce((sum, c) => sum + c.amount, 0) || 0
      const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0
      setStats({ totalReferrals, convertedReferrals, totalEarnings, pendingEarnings, conversionRate })
    } finally { setIsLoading(false) }
  }, [partnerId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function usePendingApplications() {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('partner_applications').select('*, users(*)').eq('status', 'pending').order('created_at', { ascending: true }); setApplications(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { applications, isLoading, refresh: fetch }
}
