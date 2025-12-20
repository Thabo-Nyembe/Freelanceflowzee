'use client'

/**
 * Extended Crypto Hooks - Covers all Crypto/Blockchain-related tables
 * Tables: crypto_addresses, crypto_prices, crypto_transactions, crypto_wallets
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCryptoWallet(walletId?: string) {
  const [wallet, setWallet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!walletId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('crypto_wallets').select('*').eq('id', walletId).single()
      setWallet(data)
    } finally { setIsLoading(false) }
  }, [walletId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { wallet, isLoading, refresh: fetch }
}

export function useCryptoWallets(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('crypto_wallets').select('*').eq('user_id', userId).order('is_default', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCryptoAddresses(walletId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!walletId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('crypto_addresses').select('*').eq('wallet_id', walletId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [walletId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCryptoTransactions(walletId?: string, options?: { txType?: string; status?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!walletId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('crypto_transactions').select('*').eq('wallet_id', walletId)
      if (options?.txType) query = query.eq('tx_type', options.txType)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [walletId, options?.txType, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCryptoPrices(options?: { currencies?: string[]; networks?: string[] }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('crypto_prices').select('*')
      if (options?.currencies?.length) query = query.in('currency', options.currencies)
      if (options?.networks?.length) query = query.in('network', options.networks)
      const { data: result } = await query.order('updated_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.currencies, options?.networks, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCryptoPrice(currency?: string, network?: string) {
  const [price, setPrice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!currency || !network) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('crypto_prices').select('*').eq('currency', currency).eq('network', network).single()
      setPrice(data)
    } finally { setIsLoading(false) }
  }, [currency, network, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { price, isLoading, refresh: fetch }
}

export function useCryptoWalletBalance(walletId?: string) {
  const [balance, setBalance] = useState<{ balance: number; balanceUsd: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!walletId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: wallet } = await supabase.from('crypto_wallets').select('balance, network').eq('id', walletId).single()
      const { data: price } = await supabase.from('crypto_prices').select('price_usd').eq('network', wallet?.network).single()
      const balanceUsd = (wallet?.balance || 0) * (price?.price_usd || 0)
      setBalance({ balance: wallet?.balance || 0, balanceUsd })
    } finally { setIsLoading(false) }
  }, [walletId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { balance, isLoading, refresh: fetch }
}

export function useCryptoPricesRealtime(currencies?: string[]) {
  const [prices, setPrices] = useState<Record<string, any>>({})
  const supabase = createClient()
  useEffect(() => {
    supabase.from('crypto_prices').select('*').then(({ data }) => {
      const priceMap: Record<string, any> = {}
      data?.forEach(p => { priceMap[`${p.currency}_${p.network}`] = p })
      setPrices(priceMap)
    })
    const channel = supabase.channel('crypto_prices_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crypto_prices' }, (payload) => {
        if (payload.new) {
          const p = payload.new as any
          setPrices(prev => ({ ...prev, [`${p.currency}_${p.network}`]: p }))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currencies, supabase])
  return { prices }
}

export function useCryptoTransactionsRealtime(walletId?: string) {
  const [transactions, setTransactions] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!walletId) return
    supabase.from('crypto_transactions').select('*').eq('wallet_id', walletId).order('created_at', { ascending: false }).limit(50).then(({ data }) => setTransactions(data || []))
    const channel = supabase.channel(`crypto_tx_${walletId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'crypto_transactions', filter: `wallet_id=eq.${walletId}` }, (payload) => setTransactions(prev => [payload.new, ...prev].slice(0, 50)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'crypto_transactions', filter: `wallet_id=eq.${walletId}` }, (payload) => setTransactions(prev => prev.map(tx => tx.id === (payload.new as any).id ? payload.new : tx)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [walletId, supabase])
  return { transactions }
}
