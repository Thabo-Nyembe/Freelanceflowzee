'use client'

/**
 * Extended Invites Hooks
 * Tables: invites, invite_codes, invite_links, invite_campaigns, invite_rewards, invite_tracking
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInvite(inviteId?: string) {
  const [invite, setInvite] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!inviteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invites').select('*').eq('id', inviteId).single(); setInvite(data) } finally { setIsLoading(false) }
  }, [inviteId])
  useEffect(() => { fetch() }, [fetch])
  return { invite, isLoading, refresh: fetch }
}

export function useInvites(options?: { inviter_id?: string; status?: string; type?: string; limit?: number }) {
  const [invites, setInvites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('invites').select('*')
      if (options?.inviter_id) query = query.eq('inviter_id', options.inviter_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setInvites(data || [])
    } finally { setIsLoading(false) }
  }, [options?.inviter_id, options?.status, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { invites, isLoading, refresh: fetch }
}

export function useUserInvites(userId?: string, options?: { status?: string }) {
  const [invites, setInvites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('invites').select('*').eq('inviter_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setInvites(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { invites, isLoading, refresh: fetch }
}

export function useInviteByCode(code?: string) {
  const [invite, setInvite] = useState<any>(null)
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!code) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('invites').select('*').eq('code', code).single()
      setInvite(data)
      const valid = data && data.status === 'pending' && (!data.expires_at || new Date(data.expires_at) > new Date())
      setIsValid(valid)
    } finally { setIsLoading(false) }
  }, [code])
  useEffect(() => { fetch() }, [fetch])
  return { invite, isValid, isLoading, refresh: fetch }
}

export function useInviteCode(code?: string) {
  const [inviteCode, setInviteCode] = useState<any>(null)
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!code) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('invite_codes').select('*').eq('code', code).single()
      setInviteCode(data)
      const valid = data && data.is_active && (!data.max_uses || data.use_count < data.max_uses) && (!data.expires_at || new Date(data.expires_at) > new Date())
      setIsValid(valid)
    } finally { setIsLoading(false) }
  }, [code])
  useEffect(() => { fetch() }, [fetch])
  return { inviteCode, isValid, isLoading, refresh: fetch }
}

export function useInviteLink(token?: string) {
  const [link, setLink] = useState<any>(null)
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!token) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('invite_links').select('*').eq('token', token).single()
      setLink(data)
      const valid = data && data.is_active && (!data.max_uses || data.use_count < data.max_uses) && (!data.expires_at || new Date(data.expires_at) > new Date())
      setIsValid(valid)
    } finally { setIsLoading(false) }
  }, [token])
  useEffect(() => { fetch() }, [fetch])
  return { link, isValid, isLoading, refresh: fetch }
}

export function useInviteCampaigns(options?: { is_active?: boolean }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('invite_campaigns').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false })
      setCampaigns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { campaigns, isLoading, refresh: fetch }
}

export function useInviteRewards(options?: { is_active?: boolean }) {
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('invite_rewards').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setRewards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { rewards, isLoading, refresh: fetch }
}

export function useUserInviteStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; accepted: number; pending: number; conversion_rate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: invites } = await supabase.from('invites').select('id, status').eq('inviter_id', userId)
      const total = invites?.length || 0
      const accepted = invites?.filter(i => i.status === 'accepted').length || 0
      const pending = invites?.filter(i => i.status === 'pending').length || 0
      setStats({ total, accepted, pending, conversion_rate: total > 0 ? (accepted / total) * 100 : 0 })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function usePendingInvites(userId?: string) {
  const [invites, setInvites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invites').select('*').eq('inviter_id', userId).eq('status', 'pending').order('created_at', { ascending: false }); setInvites(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { invites, isLoading, refresh: fetch }
}
