'use client'

/**
 * Extended Realtime Hooks
 * Tables: realtime_connections, realtime_channels, realtime_messages, realtime_presence
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeConnection(connectionId?: string) {
  const [connection, setConnection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!connectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('realtime_connections').select('*').eq('id', connectionId).single(); setConnection(data) } finally { setIsLoading(false) }
  }, [connectionId])
  useEffect(() => { fetch() }, [fetch])
  return { connection, isLoading, refresh: fetch }
}

export function useRealtimeConnections(options?: { user_id?: string; channel_id?: string; status?: string; limit?: number }) {
  const [connections, setConnections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('realtime_connections').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.channel_id) query = query.eq('channel_id', options.channel_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('connected_at', { ascending: false }).limit(options?.limit || 100)
      setConnections(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.channel_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { connections, isLoading, refresh: fetch }
}

export function useRealtimeChannels(options?: { type?: string; is_active?: boolean; limit?: number }) {
  const [channels, setChannels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('realtime_channels').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setChannels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { channels, isLoading, refresh: fetch }
}

export function useRealtimeMessages(channelId?: string, options?: { limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!channelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('realtime_messages').select('*').eq('channel_id', channelId).order('created_at', { ascending: false }).limit(options?.limit || 50); setMessages(data || []) } finally { setIsLoading(false) }
  }, [channelId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { messages, isLoading, refresh: fetch }
}

export function useRealtimePresence(channelId?: string) {
  const [presence, setPresence] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!channelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('realtime_presence').select('*').eq('channel_id', channelId).eq('is_online', true).order('last_seen_at', { ascending: false }); setPresence(data || []) } finally { setIsLoading(false) }
  }, [channelId])
  useEffect(() => { fetch() }, [fetch])
  return { presence, isLoading, refresh: fetch }
}

export function useActiveConnections(userId?: string) {
  const [connections, setConnections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('realtime_connections').select('*').eq('user_id', userId).eq('status', 'connected').order('connected_at', { ascending: false }); setConnections(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { connections, isLoading, refresh: fetch }
}
