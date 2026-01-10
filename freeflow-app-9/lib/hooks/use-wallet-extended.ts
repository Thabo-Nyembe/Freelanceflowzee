'use client'

/**
 * Extended Wallet Hooks
 * Tables: wallets, wallet_transactions, wallet_balances, wallet_limits
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWallet(walletId?: string) {
  const [wallet, setWallet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!walletId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('wallets').select('*').eq('id', walletId).single(); setWallet(data) } finally { setIsLoading(false) }
  }, [walletId])
  useEffect(() => { fetch() }, [fetch])
  return { wallet, isLoading, refresh: fetch }
}

export function useUserWallet(userId?: string) {
  const [wallet, setWallet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).single(); setWallet(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { wallet, isLoading, refresh: fetch }
}

export function useWalletTransactions(walletId?: string, options?: { type?: string; limit?: number }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!walletId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('wallet_transactions').select('*').eq('wallet_id', walletId); if (options?.type) query = query.eq('type', options.type); const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); setTransactions(data || []) } finally { setIsLoading(false) }
  }, [walletId, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { transactions, isLoading, refresh: fetch }
}

export function useWalletBalance(walletId?: string) {
  const [balance, setBalance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!walletId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('wallet_balances').select('*').eq('wallet_id', walletId).single(); setBalance(data) } finally { setIsLoading(false) }
  }, [walletId])
  useEffect(() => { fetch() }, [fetch])
  return { balance, isLoading, refresh: fetch }
}

export function useWalletLimits(walletId?: string) {
  const [limits, setLimits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!walletId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('wallet_limits').select('*').eq('wallet_id', walletId); setLimits(data || []) } finally { setIsLoading(false) }
  }, [walletId])
  useEffect(() => { fetch() }, [fetch])
  return { limits, isLoading, refresh: fetch }
}
