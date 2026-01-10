'use client'

/**
 * Extended Mentions Hooks
 * Tables: mentions, mention_notifications, mention_settings, mention_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMentions(userId?: string, options?: { content_type?: string; status?: string; limit?: number }) {
  const [mentions, setMentions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('mentions').select('*').eq('mentioned_user_id', userId)
      if (options?.content_type) query = query.eq('content_type', options.content_type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setMentions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.content_type, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { mentions, isLoading, refresh: fetch }
}

export function useUnreadMentions(userId?: string) {
  const [mentions, setMentions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('mentions').select('*').eq('mentioned_user_id', userId).eq('status', 'unread').order('created_at', { ascending: false }); setMentions(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { mentions, isLoading, refresh: fetch }
}

export function useUnreadMentionCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { count: c } = await supabase.from('mentions').select('*', { count: 'exact', head: true }).eq('mentioned_user_id', userId).eq('status', 'unread'); setCount(c || 0) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useContentMentions(contentType?: string, contentId?: string) {
  const [mentions, setMentions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!contentType || !contentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('mentions').select('*').eq('content_type', contentType).eq('content_id', contentId).order('position', { ascending: true }); setMentions(data || []) } finally { setIsLoading(false) }
  }, [contentType, contentId])
  useEffect(() => { fetch() }, [fetch])
  return { mentions, isLoading, refresh: fetch }
}

export function useMentionSettings(userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('mention_settings').select('*').eq('user_id', userId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useMentionableUsers(query: string, options?: { organization_id?: string; limit?: number }) {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 2) { setUsers([]); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('users').select('id, name, email, avatar_url').or(`name.ilike.%${query}%,email.ilike.%${query}%`).limit(options?.limit || 10); setUsers(data || []) } finally { setIsLoading(false) }
  }, [query, options?.limit])
  useEffect(() => { const debounce = setTimeout(search, 300); return () => clearTimeout(debounce) }, [search])
  return { users, isLoading }
}

export function useMentionHistory(userId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('mention_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 100); setHistory(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useMentionRealtime(userId?: string) {
  const [mentions, setMentions] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    supabase.from('mentions').select('*').eq('mentioned_user_id', userId).order('created_at', { ascending: false }).limit(20).then(({ data }) => { setMentions(data || []); setUnreadCount(data?.filter(m => m.status === 'unread').length || 0) })
    const channel = supabase.channel(`mentions_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mentions', filter: `mentioned_user_id=eq.${userId}` }, (payload) => { setMentions(prev => [payload.new, ...prev].slice(0, 20)); setUnreadCount(prev => prev + 1) })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mentions', filter: `mentioned_user_id=eq.${userId}` }, (payload) => { setMentions(prev => prev.map(m => m.id === payload.new.id ? payload.new : m)); if (payload.new.status === 'read') setUnreadCount(prev => Math.max(0, prev - 1)) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])
  return { mentions, unreadCount }
}

export function useRecentMentioners(userId?: string, options?: { limit?: number }) {
  const [mentioners, setMentioners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('mentions').select('mentioner_user_id').eq('mentioned_user_id', userId).order('created_at', { ascending: false }).limit(100)
      const uniqueIds = [...new Set(data?.map(m => m.mentioner_user_id) || [])].slice(0, options?.limit || 10)
      if (uniqueIds.length === 0) { setMentioners([]); setIsLoading(false); return }
      const { data: users } = await supabase.from('users').select('id, name, avatar_url').in('id', uniqueIds)
      setMentioners(users || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { mentioners, isLoading, refresh: fetch }
}
