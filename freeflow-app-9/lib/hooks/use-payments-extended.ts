'use client'

/**
 * Extended Payments Hooks - Covers all Payment-related tables
 * Tables: payments, payment_methods, payment_configs, payment_links, payment_reminders, payment_analytics_snapshots
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePayment(paymentId?: string) {
  const [payment, setPayment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!paymentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('payments').select('*').eq('id', paymentId).single()
      setPayment(data)
    } finally { setIsLoading(false) }
  }, [paymentId])
  useEffect(() => { loadData() }, [loadData])
  return { payment, isLoading, refresh: loadData }
}

export function usePayments(userId?: string, options?: { status?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('payments').select('*', { count: 'exact' }).eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result, count } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
      setTotal(count || 0)
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, total, isLoading, refresh: loadData }
}

export function usePaymentMethod(methodId?: string) {
  const [method, setMethod] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!methodId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('payment_methods').select('*').eq('id', methodId).single()
      setMethod(data)
    } finally { setIsLoading(false) }
  }, [methodId])
  useEffect(() => { loadData() }, [loadData])
  return { method, isLoading, refresh: loadData }
}

export function usePaymentMethods(userId?: string, options?: { type?: string; isVerified?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('payment_methods').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.isVerified !== undefined) query = query.eq('is_verified', options.isVerified)
      const { data: result } = await query.order('is_default', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.isVerified])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDefaultPaymentMethod(userId?: string) {
  const [method, setMethod] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('payment_methods').select('*').eq('user_id', userId).eq('is_default', true).single()
      setMethod(data)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { method, isLoading, refresh: loadData }
}

export function usePaymentLinks(userId?: string, options?: { isActive?: boolean; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('payment_links').select('*').eq('user_id', userId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.isActive, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePaymentLink(linkId?: string) {
  const [link, setLink] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!linkId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('payment_links').select('*').eq('id', linkId).single()
      setLink(data)
    } finally { setIsLoading(false) }
  }, [linkId])
  useEffect(() => { loadData() }, [loadData])
  return { link, isLoading, refresh: loadData }
}

export function usePaymentLinkByCode(code?: string) {
  const [link, setLink] = useState<any>(null)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!code) { setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await supabase.from('payment_links').select('*').eq('code', code).eq('is_active', true).single()
      if (!data) { setError('Payment link not found'); setIsValid(false); return }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { setError('Payment link has expired'); setIsValid(false); return }
      if (data.max_uses && data.use_count >= data.max_uses) { setError('Payment link has reached maximum uses'); setIsValid(false); return }
      setLink(data)
      setIsValid(true)
    } finally { setIsLoading(false) }
  }, [code])
  useEffect(() => { loadData() }, [loadData])
  return { link, isValid, error, isLoading, refresh: loadData }
}

export function usePaymentConfigs() {
  const [configs, setConfigs] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('payment_configs').select('*')
      const configMap: Record<string, any> = {}
      data?.forEach(c => { configMap[c.key] = c.value })
      setConfigs(configMap)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { configs, isLoading, refresh: loadData }
}

export function usePaymentAnalytics(options?: { period?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('payment_analytics_snapshots').select('*')
      if (options?.period) query = query.eq('period', options.period)
      const { data: result } = await query.order('period_start', { ascending: false }).limit(options?.limit || 30)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.period, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function usePaymentsRealtime(userId?: string) {
  const [payments, setPayments] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    supabase.from('payments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50).then(({ data }) => setPayments(data || []))
    const channel = supabase.channel(`payments_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments', filter: `user_id=eq.${userId}` }, (payload) => setPayments(prev => [payload.new, ...prev].slice(0, 50)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'payments', filter: `user_id=eq.${userId}` }, (payload) => setPayments(prev => prev.map(p => p.id === (payload.new as Record<string, unknown>).id ? payload.new : p)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])
  return { payments }
}
