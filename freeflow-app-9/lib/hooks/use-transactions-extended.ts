'use client'

/**
 * Extended Transactions Hooks
 * Tables: transactions, transaction_items, transaction_fees, transaction_refunds, transaction_disputes, transaction_logs
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
    try { const { data } = await supabase.from('transactions').select('*, transaction_items(*), transaction_fees(*), transaction_refunds(*)').eq('id', transactionId).single(); setTransaction(data) } finally { setIsLoading(false) }
  }, [transactionId])
  useEffect(() => { fetch() }, [fetch])
  return { transaction, isLoading, refresh: fetch }
}

export function useTransactions(options?: { transaction_type?: string; status?: string; sender_id?: string; recipient_id?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('transactions').select('*, transaction_items(count)')
      if (options?.transaction_type) query = query.eq('transaction_type', options.transaction_type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.sender_id) query = query.eq('sender_id', options.sender_id)
      if (options?.recipient_id) query = query.eq('recipient_id', options.recipient_id)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setTransactions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.transaction_type, options?.status, options?.sender_id, options?.recipient_id, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { transactions, isLoading, refresh: fetch }
}

export function useMyTransactions(userId?: string, options?: { role?: 'sender' | 'recipient' | 'both'; status?: string; limit?: number }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('transactions').select('*, transaction_items(count)')
      const role = options?.role || 'both'
      if (role === 'sender') query = query.eq('sender_id', userId)
      else if (role === 'recipient') query = query.eq('recipient_id', userId)
      else query = query.or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTransactions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.role, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { transactions, isLoading, refresh: fetch }
}

export function useTransactionItems(transactionId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('transaction_items').select('*').eq('transaction_id', transactionId).order('created_at', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [transactionId])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useTransactionFees(transactionId?: string) {
  const [fees, setFees] = useState<any[]>([])
  const [totalFees, setTotalFees] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('transaction_fees').select('*').eq('transaction_id', transactionId)
      setFees(data || [])
      setTotalFees(data?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0)
    } finally { setIsLoading(false) }
  }, [transactionId])
  useEffect(() => { fetch() }, [fetch])
  return { fees, totalFees, isLoading, refresh: fetch }
}

export function useTransactionRefunds(transactionId?: string) {
  const [refunds, setRefunds] = useState<any[]>([])
  const [totalRefunded, setTotalRefunded] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('transaction_refunds').select('*').eq('transaction_id', transactionId).order('created_at', { ascending: false })
      setRefunds(data || [])
      setTotalRefunded(data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0)
    } finally { setIsLoading(false) }
  }, [transactionId])
  useEffect(() => { fetch() }, [fetch])
  return { refunds, totalRefunded, isLoading, refresh: fetch }
}

export function useTransactionDisputes(transactionId?: string) {
  const [disputes, setDisputes] = useState<any[]>([])
  const [activeDispute, setActiveDispute] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('transaction_disputes').select('*').eq('transaction_id', transactionId).order('created_at', { ascending: false })
      setDisputes(data || [])
      setActiveDispute(data?.find(d => d.status === 'open') || null)
    } finally { setIsLoading(false) }
  }, [transactionId])
  useEffect(() => { fetch() }, [fetch])
  return { disputes, activeDispute, hasActiveDispute: !!activeDispute, isLoading, refresh: fetch }
}

export function useTransactionLogs(transactionId?: string, options?: { action?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!transactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('transaction_logs').select('*').eq('transaction_id', transactionId)
      if (options?.action) query = query.eq('action', options.action)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [transactionId, options?.action, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useTransactionStats(options?: { from_date?: string; to_date?: string; transaction_type?: string }) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('transactions').select('status, amount, net_amount')
      if (options?.transaction_type) query = query.eq('transaction_type', options.transaction_type)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const transactions = data || []
      setStats({
        total: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        totalNetAmount: transactions.reduce((sum, t) => sum + (t.net_amount || 0), 0),
        completed: transactions.filter(t => t.status === 'completed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        failed: transactions.filter(t => t.status === 'failed').length
      })
    } finally { setIsLoading(false) }
  }, [options?.from_date, options?.to_date, options?.transaction_type])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function usePendingTransactions(options?: { sender_id?: string; recipient_id?: string; limit?: number }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('transactions').select('*, transaction_items(count)').eq('status', 'pending')
      if (options?.sender_id) query = query.eq('sender_id', options.sender_id)
      if (options?.recipient_id) query = query.eq('recipient_id', options.recipient_id)
      const { data } = await query.order('created_at', { ascending: true }).limit(options?.limit || 50)
      setTransactions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.sender_id, options?.recipient_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { transactions, isLoading, refresh: fetch }
}
