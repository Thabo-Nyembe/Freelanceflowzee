'use client'

/**
 * Extended Desktop Hooks - Covers all Desktop-related tables
 * Tables: desktop_apps, desktop_notifications, desktop_shortcuts, desktop_preferences
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDesktopApp(appId?: string) {
  const [app, setApp] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!appId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('desktop_apps').select('*').eq('id', appId).single()
      setApp(data)
    } finally { setIsLoading(false) }
  }, [appId])
  useEffect(() => { loadData() }, [loadData])
  return { app, isLoading, refresh: loadData }
}

export function useDesktopApps(userId?: string, options?: { app_type?: string; is_installed?: boolean; limit?: number }) {
  const [apps, setApps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('desktop_apps').select('*').eq('user_id', userId)
      if (options?.app_type) query = query.eq('app_type', options.app_type)
      if (options?.is_installed !== undefined) query = query.eq('is_installed', options.is_installed)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setApps(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.app_type, options?.is_installed, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { apps, isLoading, refresh: loadData }
}

export function useInstalledApps(userId?: string) {
  const [apps, setApps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('desktop_apps').select('*').eq('user_id', userId).eq('is_installed', true).order('name', { ascending: true })
      setApps(data || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { apps, isLoading, refresh: loadData }
}

export function useRunningApps(userId?: string) {
  const [apps, setApps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('desktop_apps').select('*').eq('user_id', userId).eq('is_running', true).order('last_launched_at', { ascending: false })
      setApps(data || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { apps, isLoading, refresh: loadData }
}

export function useDesktopNotifications(userId?: string, options?: { is_read?: boolean; priority?: string; limit?: number }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('desktop_notifications').select('*').eq('user_id', userId)
      if (options?.is_read !== undefined) query = query.eq('is_read', options.is_read)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setNotifications(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_read, options?.priority, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { notifications, isLoading, refresh: loadData }
}

export function useUnreadNotificationCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: total } = await supabase.from('desktop_notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)
      setCount(total || 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { count, isLoading, refresh: loadData }
}

export function useDesktopNotificationsRealtime(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    supabase.from('desktop_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50).then(({ data }) => setNotifications(data || []))
    const channel = supabase.channel(`desktop_notifications_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'desktop_notifications', filter: `user_id=eq.${userId}` }, (payload) => setNotifications(prev => [payload.new, ...prev].slice(0, 50)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'desktop_notifications', filter: `user_id=eq.${userId}` }, (payload) => setNotifications(prev => prev.map(n => n.id === (payload.new as Record<string, unknown>).id ? payload.new : n)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'desktop_notifications', filter: `user_id=eq.${userId}` }, (payload) => setNotifications(prev => prev.filter(n => n.id !== (payload.old as Record<string, unknown>).id)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])
  return { notifications }
}

export function useDesktopShortcuts(userId?: string, options?: { folder_id?: string | null }) {
  const [shortcuts, setShortcuts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('desktop_shortcuts').select('*, desktop_apps(*)').eq('user_id', userId)
      if (options?.folder_id === null) {
        query = query.is('folder_id', null)
      } else if (options?.folder_id) {
        query = query.eq('folder_id', options.folder_id)
      }
      const { data } = await query.order('name', { ascending: true })
      setShortcuts(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.folder_id])
  useEffect(() => { loadData() }, [loadData])
  return { shortcuts, isLoading, refresh: loadData }
}

export function useDesktopPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('desktop_preferences').select('*').eq('user_id', userId).single()
      setPreferences(data)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { preferences, isLoading, refresh: loadData }
}

export function useRecentApps(userId?: string, options?: { limit?: number }) {
  const [apps, setApps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('desktop_apps').select('*').eq('user_id', userId).eq('is_installed', true).not('last_launched_at', 'is', null).order('last_launched_at', { ascending: false }).limit(options?.limit || 10)
      setApps(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { apps, isLoading, refresh: loadData }
}

export function useFrequentApps(userId?: string, options?: { limit?: number }) {
  const [apps, setApps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('desktop_apps').select('*').eq('user_id', userId).eq('is_installed', true).gt('launch_count', 0).order('launch_count', { ascending: false }).limit(options?.limit || 10)
      setApps(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { apps, isLoading, refresh: loadData }
}

export function useAppSearch(userId: string, searchTerm: string) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('desktop_apps').select('*').eq('user_id', userId).ilike('name', `%${searchTerm}%`).limit(20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [userId, searchTerm])
  useEffect(() => {
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [search])
  return { results, isLoading }
}
