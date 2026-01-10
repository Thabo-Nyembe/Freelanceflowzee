'use client'

/**
 * Extended Refunds Hooks
 * Tables: refunds, refund_items, refund_requests, refund_policies, refund_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRefund(refundId?: string) {
  const [refund, setRefund] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!refundId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('refunds').select('*, refund_items(*), transactions(*), orders(*), users(*), refund_history(*)').eq('id', refundId).single(); setRefund(data) } finally { setIsLoading(false) }
  }, [refundId])
  useEffect(() => { fetch() }, [fetch])
  return { refund, isLoading, refresh: fetch }
}

export function useRefunds(options?: { customer_id?: string; order_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  const [refunds, setRefunds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('refunds').select('*, refund_items(count), users(*), orders(*)')
      if (options?.customer_id) query = query.eq('customer_id', options.customer_id)
      if (options?.order_id) query = query.eq('order_id', options.order_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      if (options?.search) query = query.ilike('refund_number', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRefunds(data || [])
    } finally { setIsLoading(false) }
  }, [options?.customer_id, options?.order_id, options?.status, options?.from_date, options?.to_date, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { refunds, isLoading, refresh: fetch }
}

export function usePendingRefunds(options?: { limit?: number }) {
  const [refunds, setRefunds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('refunds').select('*, refund_items(count), users(*), orders(*)').eq('status', 'pending').order('created_at', { ascending: true }).limit(options?.limit || 50)
      setRefunds(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { refunds, isLoading, refresh: fetch }
}

export function useRefundHistory(refundId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!refundId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('refund_history').select('*, users(*)').eq('refund_id', refundId).order('created_at', { ascending: false }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [refundId])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useRefundPolicies(options?: { category?: string; is_active?: boolean }) {
  const [policies, setPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('refund_policies').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setPolicies(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { policies, isLoading, refresh: fetch }
}

export function useRefundStats(options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; pending: number; approved: number; processed: number; rejected: number; totalAmount: number; pendingAmount: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('refunds').select('status, amount')
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const refunds = data || []
      const total = refunds.length
      const pending = refunds.filter(r => r.status === 'pending').length
      const approved = refunds.filter(r => r.status === 'approved').length
      const processed = refunds.filter(r => r.status === 'processed').length
      const rejected = refunds.filter(r => r.status === 'rejected').length
      const totalAmount = refunds.filter(r => r.status === 'processed').reduce((sum, r) => sum + (r.amount || 0), 0)
      const pendingAmount = refunds.filter(r => r.status === 'pending' || r.status === 'approved').reduce((sum, r) => sum + (r.amount || 0), 0)
      setStats({ total, pending, approved, processed, rejected, totalAmount, pendingAmount })
    } finally { setIsLoading(false) }
  }, [options?.from_date, options?.to_date])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useCustomerRefunds(customerId?: string, options?: { status?: string; limit?: number }) {
  const [refunds, setRefunds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('refunds').select('*, refund_items(count), orders(*)').eq('customer_id', customerId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setRefunds(data || [])
    } finally { setIsLoading(false) }
  }, [customerId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { refunds, isLoading, refresh: fetch }
}

export function useRefundItems(refundId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!refundId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('refund_items').select('*').eq('refund_id', refundId); setItems(data || []) } finally { setIsLoading(false) }
  }, [refundId])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useRecentRefunds(options?: { limit?: number }) {
  const [refunds, setRefunds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('refunds').select('*, users(*), orders(*)').order('created_at', { ascending: false }).limit(options?.limit || 20)
      setRefunds(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { refunds, isLoading, refresh: fetch }
}
