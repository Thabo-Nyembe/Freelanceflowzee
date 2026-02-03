'use client'

/**
 * Extended Presence Hooks
 * Tables: presence, presence_sessions, presence_channels, presence_subscriptions, presence_history, presence_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function usePresence(userId?: string) {
  const [presence, setPresence] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('presence').select('*, presence_sessions(*), presence_settings(*)').eq('user_id', userId).single(); setPresence(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { presence, isLoading, refresh: loadData }
}

export function useUserStatus(userId?: string) {
  const [status, setStatus] = useState<string>('offline')
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('presence').select('status, last_seen').eq('user_id', userId).single()
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      if (data) {
        const isRecent = new Date(data.last_seen) >= fiveMinutesAgo
        setStatus(isRecent ? data.status : 'offline')
        setLastSeen(data.last_seen)
      } else {
        setStatus('offline')
        setLastSeen(null)
      }
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { status, lastSeen, isLoading, refresh: loadData }
}

export function useOnlineUsers(options?: { channel_id?: string; limit?: number }) {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const query = supabase.from('presence').select('*, users(*)').in('status', ['online', 'away', 'busy']).gte('last_seen', fiveMinutesAgo)
      const { data } = await query.order('last_seen', { ascending: false }).limit(options?.limit || 100)
      setUsers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.channel_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { users, isLoading, refresh: loadData }
}

export function useBulkPresence(userIds?: string[]) {
  const [presenceMap, setPresenceMap] = useState<{ [userId: string]: any }>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userIds || userIds.length === 0) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('presence').select('*').in('user_id', userIds)
      const map: { [key: string]: any } = {}
      data?.forEach(p => { map[p.user_id] = p })
      setPresenceMap(map)
    } finally { setIsLoading(false) }
  }, [userIds?.join(',')])
  useEffect(() => { loadData() }, [loadData])
  return { presenceMap, isLoading, refresh: loadData }
}

export function usePresenceSessions(userId?: string) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('presence_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false }); setSessions(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, isLoading, refresh: loadData }
}

export function useActiveSessions(userId?: string) {
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('presence_sessions').select('*').eq('user_id', userId).eq('status', 'active').order('started_at', { ascending: false }); setSessions(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { sessions, isLoading, refresh: loadData }
}

export function usePresenceChannels(options?: { type?: string }) {
  const [channels, setChannels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('presence_channels').select('*')
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('member_count', { ascending: false })
      setChannels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type])
  useEffect(() => { loadData() }, [loadData])
  return { channels, isLoading, refresh: loadData }
}

export function useChannelMembers(channelId?: string) {
  const [members, setMembers] = useState<any[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!channelId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { data } = await supabase.from('presence_subscriptions').select('*, users(*), presence(*)').eq('channel_id', channelId)
      setMembers(data || [])
      const online = data?.filter(m => m.presence && new Date(m.presence.last_seen) >= new Date(fiveMinutesAgo)).length || 0
      setOnlineCount(online)
    } finally { setIsLoading(false) }
  }, [channelId])
  useEffect(() => { loadData() }, [loadData])
  return { members, onlineCount, isLoading, refresh: loadData }
}

export function useMyChannels(userId?: string) {
  const [channels, setChannels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('presence_subscriptions').select('*, presence_channels(*)').eq('user_id', userId).order('joined_at', { ascending: false }); setChannels(data?.map(d => d.presence_channels) || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { channels, isLoading, refresh: loadData }
}

export function usePresenceHistory(userId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('presence_history').select('*').eq('user_id', userId)
      if (options?.from_date) query = query.gte('started_at', options.from_date)
      if (options?.to_date) query = query.lte('started_at', options.to_date)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 100)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function usePresenceSettings(userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('presence_settings').select('*').eq('user_id', userId).single(); setSettings(data || { show_online_status: true, allow_tracking: true, auto_away_timeout: 5, invisible_mode: false }) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}
