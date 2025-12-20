'use client'

/**
 * Extended Streams Hooks
 * Tables: streams, stream_sessions, stream_viewers, stream_chats, stream_recordings, stream_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStream(streamId?: string) {
  const [stream, setStream] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('streams').select('*, stream_sessions(*), stream_recordings(*)').eq('id', streamId).single(); setStream(data) } finally { setIsLoading(false) }
  }, [streamId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stream, isLoading, refresh: fetch }
}

export function useStreams(options?: { streamer_id?: string; category?: string; is_live?: boolean; stream_type?: string; search?: string; limit?: number }) {
  const [streams, setStreams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('streams').select('*, users(*)')
      if (options?.streamer_id) query = query.eq('streamer_id', options.streamer_id)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_live !== undefined) query = query.eq('is_live', options.is_live)
      if (options?.stream_type) query = query.eq('stream_type', options.stream_type)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setStreams(data || [])
    } finally { setIsLoading(false) }
  }, [options?.streamer_id, options?.category, options?.is_live, options?.stream_type, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { streams, isLoading, refresh: fetch }
}

export function useLiveStreams(options?: { category?: string; limit?: number }) {
  const [streams, setStreams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('streams').select('*, users(*)').eq('is_live', true)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('viewer_count', { ascending: false }).limit(options?.limit || 50)
      setStreams(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { streams, isLoading, refresh: fetch }
}

export function useStreamViewers(streamId?: string) {
  const [viewers, setViewers] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data, count: viewerCount } = await supabase.from('stream_viewers').select('*, users(*)', { count: 'exact' }).eq('stream_id', streamId).eq('is_watching', true)
      setViewers(data || [])
      setCount(viewerCount || 0)
    } finally { setIsLoading(false) }
  }, [streamId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { viewers, count, isLoading, refresh: fetch }
}

export function useStreamChat(streamId?: string, options?: { limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('stream_chats').select('*, users(*)').eq('stream_id', streamId).order('sent_at', { ascending: true }).limit(options?.limit || 100)
      setMessages(data || [])
    } finally { setIsLoading(false) }
  }, [streamId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  // Subscribe to new messages
  useEffect(() => {
    if (!streamId) return
    const channel = supabase.channel(`stream-chat-${streamId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stream_chats', filter: `stream_id=eq.${streamId}` }, (payload) => { setMessages(prev => [...prev, payload.new]) }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [streamId, supabase])
  return { messages, isLoading, refresh: fetch }
}

export function useStreamRecordings(streamId?: string) {
  const [recordings, setRecordings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('stream_recordings').select('*').eq('stream_id', streamId).order('created_at', { ascending: false }); setRecordings(data || []) } finally { setIsLoading(false) }
  }, [streamId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { recordings, isLoading, refresh: fetch }
}

export function useStreamAnalytics(streamId?: string, options?: { metric_type?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('stream_analytics').select('*').eq('stream_id', streamId)
      if (options?.metric_type) query = query.eq('metric_type', options.metric_type)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      const { data } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100)
      setAnalytics(data || [])
    } finally { setIsLoading(false) }
  }, [streamId, options?.metric_type, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}

export function useStreamCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('streams').select('category').not('category', 'is', null)
      const unique = [...new Set(data?.map(s => s.category).filter(Boolean))]
      setCategories(unique)
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useStreamerStats(streamerId?: string) {
  const [stats, setStats] = useState<{ totalStreams: number; totalViewers: number; totalHours: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!streamerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [streamsRes, sessionsRes] = await Promise.all([
        supabase.from('streams').select('id, viewer_count').eq('streamer_id', streamerId),
        supabase.from('stream_sessions').select('started_at, ended_at, streams!inner(streamer_id)').eq('streams.streamer_id', streamerId)
      ])
      const streams = streamsRes.data || []
      const sessions = sessionsRes.data || []
      const totalViewers = streams.reduce((sum, s) => sum + (s.viewer_count || 0), 0)
      const totalHours = sessions.reduce((sum, s) => {
        if (!s.started_at || !s.ended_at) return sum
        return sum + (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 3600000
      }, 0)
      setStats({ totalStreams: streams.length, totalViewers, totalHours })
    } finally { setIsLoading(false) }
  }, [streamerId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

