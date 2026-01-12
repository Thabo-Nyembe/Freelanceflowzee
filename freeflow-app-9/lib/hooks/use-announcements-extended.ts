'use client'

/**
 * Extended Announcements Hooks
 * Tables: announcements, announcement_reads, announcement_targets
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAnnouncement(announcementId?: string) {
  const [announcement, setAnnouncement] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!announcementId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('announcements').select('*').eq('id', announcementId).single(); setAnnouncement(data) } finally { setIsLoading(false) }
  }, [announcementId])
  useEffect(() => { fetch() }, [fetch])
  return { announcement, isLoading, refresh: fetch }
}

export function useAnnouncements(options?: { user_id?: string; type?: string; status?: string; priority?: string; is_pinned?: boolean; limit?: number }) {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('announcements').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      if (options?.is_pinned !== undefined) query = query.eq('is_pinned', options.is_pinned)
      const { data } = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(options?.limit || 50)
      setAnnouncements(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.priority, options?.is_pinned, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { announcements, isLoading, refresh: fetch }
}

export function useActiveAnnouncements(options?: { target_audience?: string; limit?: number }) {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      const query = supabase.from('announcements').select('*').eq('status', 'published')
      const { data } = await query.order('is_pinned', { ascending: false }).order('priority', { ascending: false }).limit(options?.limit || 20)
      const filtered = (data || []).filter(a => {
        if (a.starts_at && new Date(a.starts_at) > new Date(now)) return false
        if (a.expires_at && new Date(a.expires_at) < new Date(now)) return false
        if (options?.target_audience && a.target_audience && a.target_audience !== options.target_audience) return false
        return true
      })
      setAnnouncements(filtered)
    } finally { setIsLoading(false) }
  }, [options?.target_audience, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { announcements, isLoading, refresh: fetch }
}

export function usePinnedAnnouncements(options?: { limit?: number }) {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('announcements').select('*').eq('status', 'published').eq('is_pinned', true).order('created_at', { ascending: false }).limit(options?.limit || 10); setAnnouncements(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { announcements, isLoading, refresh: fetch }
}

export function useUnreadAnnouncementCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: readIds } = await supabase.from('announcement_reads').select('announcement_id').eq('user_id', userId)
      const readList = (readIds || []).map(r => r.announcement_id)
      const { count: total } = await supabase.from('announcements').select('*', { count: 'exact', head: true }).eq('status', 'published')
      setCount(Math.max(0, (total || 0) - readList.length))
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useAnnouncementsRealtime() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    supabase.from('announcements').select('*').eq('status', 'published').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(20).then(({ data }) => setAnnouncements(data || []))
    const channel = supabase.channel('announcements_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => { if ((payload.new as any).status === 'published') setAnnouncements(prev => [payload.new, ...prev].slice(0, 20)) })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'announcements' }, (payload) => setAnnouncements(prev => prev.map(a => a.id === (payload.new as any).id ? payload.new : a)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'announcements' }, (payload) => setAnnouncements(prev => prev.filter(a => a.id !== (payload.old as any).id)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])
  return { announcements }
}
