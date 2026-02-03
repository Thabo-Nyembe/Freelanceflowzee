'use client'

/**
 * Extended Listener Hooks - Covers all Listener-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useListener(listenerId?: string) {
  const [listener, setListener] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!listenerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('listeners').select('*').eq('id', listenerId).single()
      setListener(data)
    } finally { setIsLoading(false) }
  }, [listenerId])
  useEffect(() => { loadData() }, [loadData])
  return { listener, isLoading, refresh: loadData }
}

export function useUserListeners(userId?: string, options?: { isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('listeners').select('*').eq('user_id', userId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.isActive])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useListenersForChannel(channel?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!channel) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('listeners').select('*').eq('channel', channel).eq('is_active', true).order('priority', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [channel])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useListenerEvents(listenerId?: string, limit = 50) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!listenerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('listener_events').select('*').eq('listener_id', listenerId).order('received_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [listenerId, limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useListenerStats(listenerId?: string) {
  const [eventsReceived, setEventsReceived] = useState(0)
  const [lastEventAt, setLastEventAt] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!listenerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('listeners').select('events_received, last_event_at, is_active').eq('id', listenerId).single()
      if (data) {
        setEventsReceived(data.events_received || 0)
        setLastEventAt(data.last_event_at)
        setIsActive(data.is_active)
      }
    } finally { setIsLoading(false) }
  }, [listenerId])
  useEffect(() => { loadData() }, [loadData])
  return { eventsReceived, lastEventAt, isActive, isLoading, refresh: loadData }
}

export function useRealtimeListener(channel?: string, onEvent?: (event: any) => void) {
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!channel || !onEvent) return

    const subscription = supabase.channel(channel).on('broadcast', { event: '*' }, (payload) => {
      onEvent(payload)
    }).subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED')
    })

    return () => { supabase.removeChannel(subscription) }
  }, [channel, onEvent])

  return { isConnected }
}
