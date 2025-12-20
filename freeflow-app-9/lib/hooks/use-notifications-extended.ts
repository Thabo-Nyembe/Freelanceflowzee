'use client'

/**
 * Extended Notifications Hooks - Covers all Notification-related tables
 * Tables: notifications, notification_preferences, notification_settings, notification_templates, etc.
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useNotification(notificationId?: string) {
  const [notification, setNotification] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!notificationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('notifications').select('*').eq('id', notificationId).single()
      setNotification(data)
    } finally { setIsLoading(false) }
  }, [notificationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { notification, isLoading, refresh: fetch }
}

export function useNotifications(userId?: string, options?: { type?: string; isRead?: boolean; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('notifications').select('*', { count: 'exact' }).eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.isRead !== undefined) query = query.eq('is_read', options.isRead)
      const { data: result, count } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
      setTotal(count || 0)
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.isRead, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, total, isLoading, refresh: fetch }
}

export function useUnreadNotificationCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useNotificationPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('notification_preferences').select('*').eq('user_id', userId)
      const prefs: Record<string, any> = {}
      data?.forEach(p => { prefs[p.notification_type] = { email: p.email_enabled, push: p.push_enabled, in_app: p.in_app_enabled }; })
      setPreferences(prefs)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { preferences, isLoading, refresh: fetch }
}

export function useNotificationSettings(userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('notification_settings').select('*').eq('user_id', userId).single()
      setSettings(data)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useNotificationTemplates(options?: { type?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('notification_templates').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationsRealtime(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    })
    const channel = supabase.channel(`notifications_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 50))
        setUnreadCount(prev => prev + 1)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
        setNotifications(prev => prev.map(n => n.id === (payload.new as any).id ? payload.new : n))
        if ((payload.new as any).is_read && !(payload.old as any).is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
        setNotifications(prev => prev.filter(n => n.id !== (payload.old as any).id))
        if (!(payload.old as any).is_read) setUnreadCount(prev => Math.max(0, prev - 1))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])
  return { notifications, unreadCount }
}

export function useNotificationStats(userId?: string, options?: { startDate?: string; endDate?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('notification_stats').select('*').eq('user_id', userId)
      if (options?.startDate) query = query.gte('period_start', options.startDate)
      if (options?.endDate) query = query.lte('period_end', options.endDate)
      const { data: result } = await query.order('period_start', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.startDate, options?.endDate, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useNotificationBadge(userId?: string) {
  const [badge, setBadge] = useState<{ count: number; hasNew: boolean }>({ count: 0, hasNew: false })
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    const updateBadge = async () => {
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)
      setBadge({ count: count || 0, hasNew: (count || 0) > 0 })
    }
    updateBadge()
    const channel = supabase.channel(`notification_badge_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, updateBadge)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])
  return badge
}
