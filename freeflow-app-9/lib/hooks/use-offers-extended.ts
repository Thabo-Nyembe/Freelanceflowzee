'use client'

/**
 * Extended Offers Hooks
 * Tables: offers, offer_codes, offer_redemptions, offer_conditions, offer_products, offer_schedules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useOffer(offerId?: string) {
  const [offer, setOffer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!offerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('offers').select('*, offer_codes(*), offer_conditions(*), offer_products(*), offer_schedules(*)').eq('id', offerId).single(); setOffer(data) } finally { setIsLoading(false) }
  }, [offerId])
  useEffect(() => { loadData() }, [loadData])
  return { offer, isLoading, refresh: loadData }
}

export function useOffers(options?: { organization_id?: string; status?: string; offer_type?: string; limit?: number }) {
  const [offers, setOffers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('offers').select('*')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.offer_type) query = query.eq('offer_type', options.offer_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setOffers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.status, options?.offer_type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { offers, isLoading, refresh: loadData }
}

export function useActiveOffers(organizationId?: string) {
  const [offers, setOffers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      let query = supabase.from('offers').select('*').eq('status', 'active').or(`end_date.is.null,end_date.gte.${now}`)
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('created_at', { ascending: false })
      setOffers(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { offers, isLoading, refresh: loadData }
}

export function useOfferCodes(offerId?: string) {
  const [codes, setCodes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!offerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('offer_codes').select('*').eq('offer_id', offerId).order('created_at', { ascending: false }); setCodes(data || []) } finally { setIsLoading(false) }
  }, [offerId])
  useEffect(() => { loadData() }, [loadData])
  return { codes, isLoading, refresh: loadData }
}

export function useOfferRedemptions(offerId?: string, options?: { user_id?: string; limit?: number }) {
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!offerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('offer_redemptions').select('*').eq('offer_id', offerId)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      const { data } = await query.order('redeemed_at', { ascending: false }).limit(options?.limit || 100)
      setRedemptions(data || [])
    } finally { setIsLoading(false) }
  }, [offerId, options?.user_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { redemptions, isLoading, refresh: loadData }
}

export function useOfferConditions(offerId?: string) {
  const [conditions, setConditions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!offerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('offer_conditions').select('*').eq('offer_id', offerId); setConditions(data || []) } finally { setIsLoading(false) }
  }, [offerId])
  useEffect(() => { loadData() }, [loadData])
  return { conditions, isLoading, refresh: loadData }
}

export function useOfferProducts(offerId?: string) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!offerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('offer_products').select('*, products(*)').eq('offer_id', offerId); setProducts(data || []) } finally { setIsLoading(false) }
  }, [offerId])
  useEffect(() => { loadData() }, [loadData])
  return { products, isLoading, refresh: loadData }
}

export function useOfferSchedule(offerId?: string) {
  const [schedule, setSchedule] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!offerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('offer_schedules').select('*').eq('offer_id', offerId).single(); setSchedule(data) } finally { setIsLoading(false) }
  }, [offerId])
  useEffect(() => { loadData() }, [loadData])
  return { schedule, isLoading, refresh: loadData }
}

export function useUserRedemptions(userId?: string, options?: { limit?: number }) {
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('offer_redemptions').select('*, offers(*)').eq('user_id', userId).order('redeemed_at', { ascending: false }).limit(options?.limit || 50); setRedemptions(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { redemptions, isLoading, refresh: loadData }
}

export function useOfferStats(offerId?: string) {
  const [stats, setStats] = useState<{ totalRedemptions: number; totalDiscount: number; uniqueUsers: number; codesUsed: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!offerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [redemptionsRes, codesRes] = await Promise.all([
        supabase.from('offer_redemptions').select('user_id, discount_amount').eq('offer_id', offerId),
        supabase.from('offer_codes').select('use_count').eq('offer_id', offerId)
      ])
      const totalRedemptions = redemptionsRes.data?.length || 0
      const totalDiscount = redemptionsRes.data?.reduce((sum, r) => sum + (r.discount_amount || 0), 0) || 0
      const uniqueUsers = new Set(redemptionsRes.data?.map(r => r.user_id)).size
      const codesUsed = codesRes.data?.reduce((sum, c) => sum + (c.use_count || 0), 0) || 0
      setStats({ totalRedemptions, totalDiscount, uniqueUsers, codesUsed })
    } finally { setIsLoading(false) }
  }, [offerId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
