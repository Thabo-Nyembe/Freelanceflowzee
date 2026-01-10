'use client'

/**
 * Extended Blocked Hooks
 * Tables: blocked_users, blocked_ips, blocked_domains
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBlockedUsers(blockerId?: string, options?: { limit?: number }) {
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!blockerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('blocked_users').select('*').eq('blocker_id', blockerId).order('created_at', { ascending: false }).limit(options?.limit || 50); setBlockedUsers(data || []) } finally { setIsLoading(false) }
  }, [blockerId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { blockedUsers, isLoading, refresh: fetch }
}

export function useIsUserBlocked(blockerId?: string, blockedId?: string) {
  const [isBlocked, setIsBlocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!blockerId || !blockedId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('blocked_users').select('id').eq('blocker_id', blockerId).eq('blocked_id', blockedId).single(); setIsBlocked(!!data) } finally { setIsLoading(false) }
  }, [blockerId, blockedId, supabase])
  useEffect(() => { check() }, [check])
  return { isBlocked, isLoading, recheck: check }
}

export function useBlockedIPs(options?: { is_active?: boolean; limit?: number }) {
  const [blockedIPs, setBlockedIPs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('blocked_ips').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setBlockedIPs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { blockedIPs, isLoading, refresh: fetch }
}

export function useBlockedDomains(options?: { is_active?: boolean; limit?: number }) {
  const [blockedDomains, setBlockedDomains] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('blocked_domains').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setBlockedDomains(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { blockedDomains, isLoading, refresh: fetch }
}

export function useBlockedCount(blockerId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!blockerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { count: total } = await supabase.from('blocked_users').select('*', { count: 'exact', head: true }).eq('blocker_id', blockerId); setCount(total || 0) } finally { setIsLoading(false) }
  }, [blockerId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
