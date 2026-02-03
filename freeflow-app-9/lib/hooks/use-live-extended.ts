'use client'

/**
 * Extended Live Hooks
 * Tables: live_streams, live_viewers, live_chat, live_events, live_recordings, live_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLiveStream(streamId?: string) {
  const [stream, setStream] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('live_streams').select('*').eq('id', streamId).single(); setStream(data) } finally { setIsLoading(false) }
  }, [streamId])
  useEffect(() => { loadData() }, [loadData])
  return { stream, isLoading, refresh: loadData }
}

export function useLiveStreams(options?: { user_id?: string; status?: string; category?: string; limit?: number }) {
  const [streams, setStreams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('live_streams').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setStreams(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.category, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { streams, isLoading, refresh: loadData }
}

export function useActiveStreams(options?: { category?: string; limit?: number }) {
  const [streams, setStreams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('live_streams').select('*').eq('status', 'live').eq('is_private', false)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('viewer_count', { ascending: false }).limit(options?.limit || 20)
      setStreams(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { streams, isLoading, refresh: loadData }
}

export function useStreamViewers(streamId?: string) {
  const [viewers, setViewers] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('live_viewers').select('*').eq('stream_id', streamId).is('left_at', null).order('joined_at', { ascending: false })
      setViewers(data || [])
      setCount(data?.length || 0)
    } finally { setIsLoading(false) }
  }, [streamId])
  useEffect(() => { loadData() }, [loadData])
  return { viewers, count, isLoading, refresh: loadData }
}

export function useLiveChat(streamId?: string, options?: { limit?: number }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('live_chat').select('*').eq('stream_id', streamId).order('sent_at', { ascending: true }).limit(options?.limit || 100); setMessages(data || []) } finally { setIsLoading(false) }
  }, [streamId, options?.limit])
  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (!streamId) return
    const channel = supabase.channel(`live_chat_${streamId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_chat', filter: `stream_id=eq.${streamId}` }, (payload) => { setMessages(prev => [...prev, payload.new]) }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [streamId])

  return { messages, isLoading, refresh: loadData }
}

export function useStreamRecordings(streamId?: string) {
  const [recordings, setRecordings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('live_recordings').select('*').eq('stream_id', streamId).order('created_at', { ascending: false }); setRecordings(data || []) } finally { setIsLoading(false) }
  }, [streamId])
  useEffect(() => { loadData() }, [loadData])
  return { recordings, isLoading, refresh: loadData }
}

export function useStreamAnalytics(streamId?: string) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: stream } = await supabase.from('live_streams').select('viewer_count, peak_viewers, duration_seconds').eq('id', streamId).single()
      const { data: viewers } = await supabase.from('live_viewers').select('id').eq('stream_id', streamId)
      const { data: messages } = await supabase.from('live_chat').select('id').eq('stream_id', streamId)
      setAnalytics({
        currentViewers: stream?.viewer_count || 0,
        peakViewers: stream?.peak_viewers || 0,
        totalViewers: viewers?.length || 0,
        chatMessages: messages?.length || 0,
        duration: stream?.duration_seconds || 0
      })
    } finally { setIsLoading(false) }
  }, [streamId])
  useEffect(() => { loadData() }, [loadData])
  return { analytics, isLoading, refresh: loadData }
}

export function useMyStreams(userId?: string, options?: { status?: string }) {
  const [streams, setStreams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('live_streams').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setStreams(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { streams, isLoading, refresh: loadData }
}

export function useScheduledStreams(options?: { user_id?: string; limit?: number }) {
  const [streams, setStreams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('live_streams').select('*').eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString())
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      const { data } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 20)
      setStreams(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { streams, isLoading, refresh: loadData }
}

export function useStreamCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('live_streams').select('category').eq('status', 'live').not('category', 'is', null)
      const uniqueCategories = [...new Set(data?.map(s => s.category).filter(Boolean))]
      setCategories(uniqueCategories as string[])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}
