'use client'

/**
 * Extended Alerts Hooks
 * Tables: alerts, alert_rules, alert_notifications
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAlert(alertId?: string) {
  const [alert, setAlert] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!alertId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('alerts').select('*').eq('id', alertId).single(); setAlert(data) } finally { setIsLoading(false) }
  }, [alertId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alert, isLoading, refresh: fetch }
}

export function useAlerts(options?: { user_id?: string; type?: string; severity?: string; status?: string; is_read?: boolean; limit?: number }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('alerts').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.severity) query = query.eq('severity', options.severity)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_read !== undefined) query = query.eq('is_read', options.is_read)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.severity, options?.status, options?.is_read, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useUnreadAlerts(userId?: string, options?: { limit?: number }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('alerts').select('*').eq('user_id', userId).eq('is_read', false).eq('status', 'active').order('created_at', { ascending: false }).limit(options?.limit || 50); setAlerts(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useUnreadAlertCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { count: total } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false).eq('status', 'active'); setCount(total || 0) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useCriticalAlerts(userId?: string) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('alerts').select('*').eq('user_id', userId).in('severity', ['high', 'critical']).eq('status', 'active').order('created_at', { ascending: false }); setAlerts(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useAlertsRealtime(userId?: string) {
  const [alerts, setAlerts] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    supabase.from('alerts').select('*').eq('user_id', userId).eq('status', 'active').order('created_at', { ascending: false }).limit(50).then(({ data }) => setAlerts(data || []))
    const channel = supabase.channel(`alerts_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts', filter: `user_id=eq.${userId}` }, (payload) => setAlerts(prev => [payload.new, ...prev].slice(0, 50)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'alerts', filter: `user_id=eq.${userId}` }, (payload) => setAlerts(prev => prev.map(a => a.id === (payload.new as any).id ? payload.new : a)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'alerts', filter: `user_id=eq.${userId}` }, (payload) => setAlerts(prev => prev.filter(a => a.id !== (payload.old as any).id)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])
  return { alerts }
}

export function useAlertsByType(userId?: string) {
  const [byType, setByType] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('alerts').select('type').eq('user_id', userId).eq('status', 'active')
      const counts = (data || []).reduce((acc: Record<string, number>, a) => { acc[a.type || 'unknown'] = (acc[a.type || 'unknown'] || 0) + 1; return acc }, {})
      setByType(counts)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { byType, isLoading, refresh: fetch }
}
