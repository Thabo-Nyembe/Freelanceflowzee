'use client'

/**
 * Extended Secure Hooks - Covers all Secure-related tables
 * Tables: secure_file_deliveries, secure_share_tokens
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSecureFileDelivery(deliveryId?: string) {
  const [delivery, setDelivery] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!deliveryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('secure_file_deliveries').select('*').eq('id', deliveryId).single()
      setDelivery(data)
    } finally { setIsLoading(false) }
  }, [deliveryId])
  useEffect(() => { fetch() }, [fetch])
  return { delivery, isLoading, refresh: fetch }
}

export function useSecureFileDeliveries(options?: { owner_id?: string; recipient_id?: string; status?: string; limit?: number }) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('secure_file_deliveries').select('*')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.recipient_id) query = query.eq('recipient_id', options.recipient_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setDeliveries(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.recipient_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { deliveries, isLoading, refresh: fetch }
}

export function useSecureFileDeliveryByToken(accessToken?: string) {
  const [delivery, setDelivery] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!accessToken) { setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await supabase.from('secure_file_deliveries').select('*').eq('access_token', accessToken).single()
      if (!data) { setError('Invalid or expired link'); return }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { setError('This link has expired'); return }
      if (data.max_downloads && data.download_count >= data.max_downloads) { setError('Download limit reached'); return }
      setDelivery(data)
    } catch { setError('Failed to load delivery') } finally { setIsLoading(false) }
  }, [accessToken])
  useEffect(() => { fetch() }, [fetch])
  return { delivery, error, isLoading, refresh: fetch }
}

export function useSentSecureDeliveries(ownerId?: string, options?: { status?: string; limit?: number }) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!ownerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('secure_file_deliveries').select('*').eq('owner_id', ownerId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setDeliveries(data || [])
    } finally { setIsLoading(false) }
  }, [ownerId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { deliveries, isLoading, refresh: fetch }
}

export function useReceivedSecureDeliveries(recipientId?: string, options?: { status?: string; limit?: number }) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!recipientId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('secure_file_deliveries').select('*').eq('recipient_id', recipientId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setDeliveries(data || [])
    } finally { setIsLoading(false) }
  }, [recipientId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { deliveries, isLoading, refresh: fetch }
}

export function useSecureDeliveryStats(ownerId?: string) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; totalDownloads: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!ownerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('secure_file_deliveries').select('status, download_count').eq('owner_id', ownerId)
      if (!data) { setStats(null); return }
      const byStatus = data.reduce((acc: Record<string, number>, d) => { acc[d.status || 'unknown'] = (acc[d.status || 'unknown'] || 0) + 1; return acc }, {})
      const totalDownloads = data.reduce((sum, d) => sum + (d.download_count || 0), 0)
      setStats({ total: data.length, byStatus, totalDownloads })
    } finally { setIsLoading(false) }
  }, [ownerId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useSecureShareToken(tokenId?: string) {
  const [token, setToken] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tokenId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('secure_share_tokens').select('*').eq('id', tokenId).single()
      setToken(data)
    } finally { setIsLoading(false) }
  }, [tokenId])
  useEffect(() => { fetch() }, [fetch])
  return { token, isLoading, refresh: fetch }
}

export function useSecureShareTokenByToken(tokenValue?: string) {
  const [token, setToken] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tokenValue) { setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await supabase.from('secure_share_tokens').select('*').eq('token', tokenValue).eq('is_active', true).single()
      if (!data) { setError('Invalid or inactive share link'); return }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { setError('This share link has expired'); return }
      if (data.max_views && data.view_count >= data.max_views) { setError('View limit reached'); return }
      setToken(data)
    } catch { setError('Failed to load share token') } finally { setIsLoading(false) }
  }, [tokenValue])
  useEffect(() => { fetch() }, [fetch])
  return { token, error, isLoading, refresh: fetch }
}

export function useUserSecureShareTokens(userId?: string, options?: { video_id?: string; is_active?: boolean; limit?: number }) {
  const [tokens, setTokens] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('secure_share_tokens').select('*').eq('created_by', userId)
      if (options?.video_id) query = query.eq('video_id', options.video_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTokens(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.video_id, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { tokens, isLoading, refresh: fetch }
}

export function useActiveSecureShareTokens(userId?: string, options?: { limit?: number }) {
  const [tokens, setTokens] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('secure_share_tokens').select('*').eq('created_by', userId).eq('is_active', true).order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTokens(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { tokens, isLoading, refresh: fetch }
}

export function useSecureDeliveryRealtime(ownerId?: string) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!ownerId) return
    supabase.from('secure_file_deliveries').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }).limit(50).then(({ data }) => setDeliveries(data || []))
    const channel = supabase.channel(`secure_deliveries_${ownerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'secure_file_deliveries', filter: `owner_id=eq.${ownerId}` }, (payload) => setDeliveries(prev => [payload.new, ...prev].slice(0, 50)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'secure_file_deliveries', filter: `owner_id=eq.${ownerId}` }, (payload) => setDeliveries(prev => prev.map(d => d.id === (payload.new as Record<string, unknown>).id ? payload.new : d)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'secure_file_deliveries', filter: `owner_id=eq.${ownerId}` }, (payload) => setDeliveries(prev => prev.filter(d => d.id !== (payload.old as Record<string, unknown>).id)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [ownerId])
  return { deliveries }
}

export function usePendingSecureDeliveries(recipientId?: string) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!recipientId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('secure_file_deliveries').select('*').eq('recipient_id', recipientId).eq('status', 'pending').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false })
      setDeliveries(data || [])
    } finally { setIsLoading(false) }
  }, [recipientId])
  useEffect(() => { fetch() }, [fetch])
  return { deliveries, isLoading, refresh: fetch }
}
