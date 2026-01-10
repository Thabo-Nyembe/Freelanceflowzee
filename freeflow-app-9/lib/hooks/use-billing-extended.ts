'use client'

/**
 * Extended Billing Hooks - Covers all Billing-related tables
 * Tables: billing, billing_addresses, billing_credits, billing_stats
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBillingInfo(userId?: string) {
  const [billing, setBilling] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('billing').select('*').eq('user_id', userId).single()
      setBilling(data)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { billing, isLoading, refresh: fetch }
}

export function useBillingAddress(addressId?: string) {
  const [address, setAddress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!addressId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('billing_addresses').select('*').eq('id', addressId).single()
      setAddress(data)
    } finally { setIsLoading(false) }
  }, [addressId])
  useEffect(() => { fetch() }, [fetch])
  return { address, isLoading, refresh: fetch }
}

export function useBillingAddresses(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('billing_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBillingCreditsBalance(userId?: string) {
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('billing_credits').select('remaining_amount').eq('user_id', userId).gt('remaining_amount', 0).or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      const total = data?.reduce((sum, c) => sum + (c.remaining_amount || 0), 0) || 0
      setBalance(total)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { balance, isLoading, refresh: fetch }
}

export function useBillingCredits(userId?: string, options?: { includeExpired?: boolean; includeUsed?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('billing_credits').select('*').eq('user_id', userId)
      if (!options?.includeUsed) query = query.gt('remaining_amount', 0)
      if (!options?.includeExpired) query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.includeExpired, options?.includeUsed, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBillingStats(userId?: string, limit?: number) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('billing_stats').select('*').eq('user_id', userId).order('period_start', { ascending: false }).limit(limit || 12)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBillingSummary(userId?: string) {
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [billingRes, creditsRes, statsRes] = await Promise.all([
        supabase.from('billing').select('*').eq('user_id', userId).single(),
        supabase.from('billing_credits').select('remaining_amount').eq('user_id', userId).gt('remaining_amount', 0),
        supabase.from('billing_stats').select('*').eq('user_id', userId).order('period_start', { ascending: false }).limit(1).single()
      ])
      const creditsBalance = creditsRes.data?.reduce((sum, c) => sum + (c.remaining_amount || 0), 0) || 0
      setSummary({
        billing: billingRes.data,
        creditsBalance,
        latestStats: statsRes.data
      })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useDefaultBillingAddress(userId?: string) {
  const [address, setAddress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('billing_addresses').select('*').eq('user_id', userId).eq('is_default', true).single()
      setAddress(data)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { address, isLoading, refresh: fetch }
}
