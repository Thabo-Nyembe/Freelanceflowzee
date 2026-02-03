'use client'

/**
 * Extended Returns Hooks
 * Tables: returns, return_items, return_reasons, return_labels, return_inspections, return_policies
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReturn(returnId?: string) {
  const [returnRecord, setReturnRecord] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!returnId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('returns').select('*, return_items(*), return_reasons(*), return_labels(*), return_inspections(*), orders(*), users(*)').eq('id', returnId).single(); setReturnRecord(data) } finally { setIsLoading(false) }
  }, [returnId])
  useEffect(() => { loadData() }, [loadData])
  return { return: returnRecord, isLoading, refresh: loadData }
}

export function useReturns(options?: { customer_id?: string; order_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  const [returns, setReturns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('returns').select('*, return_items(count), return_reasons(*), orders(*), users(*)')
      if (options?.customer_id) query = query.eq('customer_id', options.customer_id)
      if (options?.order_id) query = query.eq('order_id', options.order_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      if (options?.search) query = query.ilike('return_number', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReturns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.customer_id, options?.order_id, options?.status, options?.from_date, options?.to_date, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { returns, isLoading, refresh: loadData }
}

export function useReturnItems(returnId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!returnId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('return_items').select('*, order_items(*)').eq('return_id', returnId); setItems(data || []) } finally { setIsLoading(false) }
  }, [returnId])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function useReturnReasons(options?: { category?: string; is_active?: boolean }) {
  const [reasons, setReasons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('return_reasons').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('order', { ascending: true })
      setReasons(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { reasons, isLoading, refresh: loadData }
}

export function useReturnPolicies(options?: { category?: string; is_active?: boolean }) {
  const [policies, setPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('return_policies').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setPolicies(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { policies, isLoading, refresh: loadData }
}

export function useMyReturns(customerId?: string, options?: { status?: string; limit?: number }) {
  const [returns, setReturns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('returns').select('*, return_items(count), orders(*)').eq('customer_id', customerId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setReturns(data || [])
    } finally { setIsLoading(false) }
  }, [customerId, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { returns, isLoading, refresh: loadData }
}

export function usePendingReturns(options?: { limit?: number }) {
  const [returns, setReturns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('returns').select('*, return_items(count), users(*), orders(*)').eq('status', 'requested').order('created_at', { ascending: true }).limit(options?.limit || 50)
      setReturns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { returns, isLoading, refresh: loadData }
}

export function useReturnInspections(returnId?: string) {
  const [inspections, setInspections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!returnId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('return_inspections').select('*, users(*)').eq('return_id', returnId).order('inspected_at', { ascending: false }); setInspections(data || []) } finally { setIsLoading(false) }
  }, [returnId])
  useEffect(() => { loadData() }, [loadData])
  return { inspections, isLoading, refresh: loadData }
}

export function useReturnLabels(returnId?: string) {
  const [labels, setLabels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!returnId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('return_labels').select('*').eq('return_id', returnId).order('generated_at', { ascending: false }); setLabels(data || []) } finally { setIsLoading(false) }
  }, [returnId])
  useEffect(() => { loadData() }, [loadData])
  return { labels, isLoading, refresh: loadData }
}

export function useReturnStats(options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; requested: number; approved: number; shipped: number; received: number; refunded: number; rejected: number; totalRefunded: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('returns').select('status, refund_amount')
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const returns = data || []
      const total = returns.length
      const requested = returns.filter(r => r.status === 'requested').length
      const approved = returns.filter(r => r.status === 'approved').length
      const shipped = returns.filter(r => r.status === 'shipped').length
      const received = returns.filter(r => r.status === 'received').length
      const refunded = returns.filter(r => r.status === 'refunded').length
      const rejected = returns.filter(r => r.status === 'rejected').length
      const totalRefunded = returns.filter(r => r.status === 'refunded').reduce((sum, r) => sum + (r.refund_amount || 0), 0)
      setStats({ total, requested, approved, shipped, received, refunded, rejected, totalRefunded })
    } finally { setIsLoading(false) }
  }, [options?.from_date, options?.to_date])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
