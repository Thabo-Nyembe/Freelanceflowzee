'use client'

/**
 * Extended Tokens Hooks
 * Tables: tokens, token_usages, token_revocations, token_scopes, token_refresh_history, token_audit_logs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useToken(tokenId?: string) {
  const [token, setToken] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tokenId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tokens').select('*, token_scopes(*)').eq('id', tokenId).single(); setToken(data) } finally { setIsLoading(false) }
  }, [tokenId])
  useEffect(() => { fetch() }, [fetch])
  return { token, isLoading, refresh: fetch }
}

export function useTokens(options?: { token_type?: string; owner_id?: string; owner_type?: string; status?: string; search?: string; limit?: number }) {
  const [tokens, setTokens] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tokens').select('*, token_scopes(*)')
      if (options?.token_type) query = query.eq('token_type', options.token_type)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.owner_type) query = query.eq('owner_type', options.owner_type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTokens(data || [])
    } finally { setIsLoading(false) }
  }, [options?.token_type, options?.owner_id, options?.owner_type, options?.status, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tokens, isLoading, refresh: fetch }
}

export function useMyTokens(userId?: string, options?: { token_type?: string; status?: string }) {
  const [tokens, setTokens] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tokens').select('*, token_scopes(*)').eq('owner_id', userId).eq('owner_type', 'user')
      if (options?.token_type) query = query.eq('token_type', options.token_type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setTokens(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.token_type, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tokens, isLoading, refresh: fetch }
}

export function useTokenScopes(tokenId?: string) {
  const [scopes, setScopes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tokenId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('token_scopes').select('scope').eq('token_id', tokenId); setScopes((data || []).map(s => s.scope)) } finally { setIsLoading(false) }
  }, [tokenId])
  useEffect(() => { fetch() }, [fetch])
  return { scopes, isLoading, refresh: fetch }
}

export function useTokenUsage(tokenId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [usages, setUsages] = useState<any[]>([])
  const [totalUsage, setTotalUsage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tokenId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('token_usages').select('*').eq('token_id', tokenId)
      if (options?.from_date) query = query.gte('used_at', options.from_date)
      if (options?.to_date) query = query.lte('used_at', options.to_date)
      const { data, count } = await query.order('used_at', { ascending: false }).limit(options?.limit || 100)
      setUsages(data || [])
      setTotalUsage(count || data?.length || 0)
    } finally { setIsLoading(false) }
  }, [tokenId, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { usages, totalUsage, isLoading, refresh: fetch }
}

export function useTokenRateLimit(tokenId?: string) {
  const [rateLimit, setRateLimit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tokenId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: token } = await supabase.from('tokens').select('rate_limit').eq('id', tokenId).single()
      if (!token?.rate_limit) {
        setRateLimit({ withinLimit: true, unlimited: true })
        return
      }
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { count } = await supabase.from('token_usages').select('*', { count: 'exact', head: true }).eq('token_id', tokenId).gte('used_at', oneHourAgo)
      setRateLimit({
        withinLimit: (count || 0) < token.rate_limit,
        limit: token.rate_limit,
        current: count || 0,
        remaining: Math.max(0, token.rate_limit - (count || 0))
      })
    } finally { setIsLoading(false) }
  }, [tokenId])
  useEffect(() => { fetch() }, [fetch])
  return { rateLimit, isLoading, refresh: fetch }
}

export function useTokenAuditLogs(tokenId?: string, options?: { action?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tokenId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('token_audit_logs').select('*, users(*)').eq('token_id', tokenId)
      if (options?.action) query = query.eq('action', options.action)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [tokenId, options?.action, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useTokenRefreshHistory(tokenId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tokenId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('token_refresh_history').select('*').eq('token_id', tokenId).order('refreshed_at', { ascending: false }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [tokenId])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useExpiringTokens(ownerId?: string, daysUntilExpiry: number = 7) {
  const [tokens, setTokens] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!ownerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const expiryDate = new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase.from('tokens').select('*, token_scopes(*)').eq('owner_id', ownerId).eq('status', 'active').not('expires_at', 'is', null).lte('expires_at', expiryDate).order('expires_at', { ascending: true })
      setTokens(data || [])
    } finally { setIsLoading(false) }
  }, [ownerId, daysUntilExpiry, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tokens, isLoading, refresh: fetch }
}

export function useTokenStats(ownerId?: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!ownerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tokens').select('status, usage_count').eq('owner_id', ownerId)
      const tokens = data || []
      setStats({
        total: tokens.length,
        active: tokens.filter(t => t.status === 'active').length,
        expired: tokens.filter(t => t.status === 'expired').length,
        revoked: tokens.filter(t => t.status === 'revoked').length,
        totalUsage: tokens.reduce((sum, t) => sum + (t.usage_count || 0), 0)
      })
    } finally { setIsLoading(false) }
  }, [ownerId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useAvailableScopes() {
  const [scopes, setScopes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('token_scopes').select('scope')
      const unique = [...new Set(data?.map(s => s.scope) || [])]
      setScopes(unique.sort())
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { scopes, isLoading, refresh: fetch }
}
