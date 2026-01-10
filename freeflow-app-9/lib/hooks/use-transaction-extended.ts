'use client'

/**
 * Extended Transaction Hooks - Covers all Transaction-related tables
 * Tables: transactions, transaction_fees, transaction_webhooks
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTransaction(transactionId?: string) {
  const [transaction, setTransaction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('transactions').select('*').eq('id', transactionId).single()
      setTransaction(data)
    } finally { setIsLoading(false) }
  }, [transactionId])
  useEffect(() => { fetch() }, [fetch])
  return { transaction, isLoading, refresh: fetch }
}

export function useTransactions(userId?: string, options?: { type?: string; status?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('transactions').select('*', { count: 'exact' }).eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result, count } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
      setTotal(count || 0)
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, total, isLoading, refresh: fetch }
}

export function useTransactionsByReference(referenceType?: string, referenceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!referenceType || !referenceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('transactions').select('*').eq('reference_type', referenceType).eq('reference_id', referenceId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [referenceType, referenceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTransactionStats(userId?: string, options?: { startDate?: string; endDate?: string }) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('transactions').select('amount, type, status, currency').eq('user_id', userId).eq('status', 'completed')
      if (options?.startDate) query = query.gte('created_at', options.startDate)
      if (options?.endDate) query = query.lte('created_at', options.endDate)
      const { data } = await query
      const result = { totalIn: 0, totalOut: 0, count: data?.length || 0, byType: {} as Record<string, number>, byCurrency: {} as Record<string, number> }
      data?.forEach(tx => {
        if (tx.type === 'credit' || tx.type === 'deposit' || tx.type === 'refund') result.totalIn += tx.amount
        else result.totalOut += tx.amount
        result.byType[tx.type] = (result.byType[tx.type] || 0) + tx.amount
        result.byCurrency[tx.currency] = (result.byCurrency[tx.currency] || 0) + tx.amount
      })
      setStats(result)
    } finally { setIsLoading(false) }
  }, [userId, options?.startDate, options?.endDate, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useTransactionFees(transactionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('transaction_fees').select('*').eq('transaction_id', transactionId).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [transactionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTransactionWebhooks(transactionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('transaction_webhooks').select('*').eq('transaction_id', transactionId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [transactionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTransactionsRealtime(userId?: string) {
  const [transactions, setTransactions] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50).then(({ data }) => setTransactions(data || []))
    const channel = supabase.channel(`transactions_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, (payload) => setTransactions(prev => [payload.new, ...prev].slice(0, 50)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, (payload) => setTransactions(prev => prev.map(tx => tx.id === (payload.new as any).id ? payload.new : tx)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])
  return { transactions }
}

export function useTransactionWithDetails(transactionId?: string) {
  const [transaction, setTransaction] = useState<any>(null)
  const [fees, setFees] = useState<any[]>([])
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [txRes, feesRes, webhooksRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('id', transactionId).single(),
        supabase.from('transaction_fees').select('*').eq('transaction_id', transactionId),
        supabase.from('transaction_webhooks').select('*').eq('transaction_id', transactionId)
      ])
      setTransaction(txRes.data)
      setFees(feesRes.data || [])
      setWebhooks(webhooksRes.data || [])
    } finally { setIsLoading(false) }
  }, [transactionId])
  useEffect(() => { fetch() }, [fetch])
  return { transaction, fees, webhooks, isLoading, refresh: fetch }
}
