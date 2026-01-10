'use client'

/**
 * Extended Cash Hooks
 * Tables: cash_flows, cash_accounts, cash_transactions, cash_forecasts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCashAccount(accountId?: string) {
  const [account, setAccount] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!accountId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('cash_accounts').select('*').eq('id', accountId).single(); setAccount(data) } finally { setIsLoading(false) }
  }, [accountId])
  useEffect(() => { fetch() }, [fetch])
  return { account, isLoading, refresh: fetch }
}

export function useCashAccounts(options?: { user_id?: string; type?: string; is_active?: boolean }) {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('cash_accounts').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setAccounts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { accounts, isLoading, refresh: fetch }
}

export function useCashTransactions(accountId?: string, options?: { type?: string; date_from?: string; date_to?: string; limit?: number }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!accountId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('cash_transactions').select('*').eq('account_id', accountId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      const { data } = await query.order('date', { ascending: false }).limit(options?.limit || 50)
      setTransactions(data || [])
    } finally { setIsLoading(false) }
  }, [accountId, options?.type, options?.date_from, options?.date_to, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { transactions, isLoading, refresh: fetch }
}

export function useCashFlow(userId?: string, options?: { date_from?: string; date_to?: string }) {
  const [cashFlow, setCashFlow] = useState<{ inflow: number; outflow: number; net: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: accounts } = await supabase.from('cash_accounts').select('id').eq('user_id', userId).eq('is_active', true)
      if (!accounts?.length) { setCashFlow({ inflow: 0, outflow: 0, net: 0 }); return }
      let query = supabase.from('cash_transactions').select('type, amount').in('account_id', accounts.map(a => a.id))
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      const { data } = await query
      const inflow = data?.filter(t => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0) || 0
      const outflow = data?.filter(t => t.type === 'outflow').reduce((sum, t) => sum + t.amount, 0) || 0
      setCashFlow({ inflow, outflow, net: inflow - outflow })
    } finally { setIsLoading(false) }
  }, [userId, options?.date_from, options?.date_to])
  useEffect(() => { fetch() }, [fetch])
  return { cashFlow, isLoading, refresh: fetch }
}

export function useTotalCashBalance(userId?: string) {
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('cash_accounts').select('current_balance').eq('user_id', userId).eq('is_active', true)
      const total = data?.reduce((sum, a) => sum + (a.current_balance || 0), 0) || 0
      setBalance(total)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { balance, isLoading, refresh: fetch }
}

export function useCashForecasts(userId?: string, options?: { date_from?: string; date_to?: string }) {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('cash_forecasts').select('*').eq('user_id', userId)
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      const { data } = await query.order('date', { ascending: true })
      setForecasts(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.date_from, options?.date_to])
  useEffect(() => { fetch() }, [fetch])
  return { forecasts, isLoading, refresh: fetch }
}
