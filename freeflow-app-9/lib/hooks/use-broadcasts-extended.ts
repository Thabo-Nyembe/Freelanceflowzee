'use client'

/**
 * Extended Broadcasts Hooks
 * Tables: broadcasts, broadcast_recipients, broadcast_templates, broadcast_schedules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBroadcast(broadcastId?: string) {
  const [broadcast, setBroadcast] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!broadcastId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('broadcasts').select('*, broadcast_recipients(*)').eq('id', broadcastId).single(); setBroadcast(data) } finally { setIsLoading(false) }
  }, [broadcastId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { broadcast, isLoading, refresh: fetch }
}

export function useBroadcasts(options?: { user_id?: string; status?: string; channel?: string; limit?: number }) {
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('broadcasts').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.channel) query = query.eq('channel', options.channel)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setBroadcasts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.channel, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { broadcasts, isLoading, refresh: fetch }
}

export function useBroadcastRecipients(broadcastId?: string) {
  const [recipients, setRecipients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!broadcastId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('broadcast_recipients').select('*').eq('broadcast_id', broadcastId).order('created_at', { ascending: true }); setRecipients(data || []) } finally { setIsLoading(false) }
  }, [broadcastId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { recipients, isLoading, refresh: fetch }
}

export function useBroadcastTemplates(options?: { user_id?: string; type?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('broadcast_templates').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useScheduledBroadcasts(userId?: string) {
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('broadcasts').select('*').eq('user_id', userId).eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }); setBroadcasts(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { broadcasts, isLoading, refresh: fetch }
}

export function useBroadcastStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('broadcasts').select('status').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const total = data.length
      const byStatus = data.reduce((acc: Record<string, number>, b) => { acc[b.status || 'unknown'] = (acc[b.status || 'unknown'] || 0) + 1; return acc }, {})
      setStats({ total, byStatus })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
