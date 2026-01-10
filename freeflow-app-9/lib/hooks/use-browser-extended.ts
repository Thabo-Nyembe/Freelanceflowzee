'use client'

/**
 * Extended Browser Hooks - Covers all Browser-related tables
 * Tables: browser_extension_installations, browser_info
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBrowserInfo(infoId?: string) {
  const [info, setInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!infoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('browser_info').select('*').eq('id', infoId).single()
      setInfo(data)
    } finally { setIsLoading(false) }
  }, [infoId])
  useEffect(() => { fetch() }, [fetch])
  return { info, isLoading, refresh: fetch }
}

export function useUserBrowserHistory(userId?: string, options?: { limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('browser_info').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBrowserStats(options?: { startDate?: string; endDate?: string }) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('browser_info').select('browser_name, os, device_type')
      if (options?.startDate) query = query.gte('created_at', options.startDate)
      if (options?.endDate) query = query.lte('created_at', options.endDate)
      const { data } = await query
      const result = { total: data?.length || 0, byBrowser: {} as Record<string, number>, byOS: {} as Record<string, number>, byDevice: {} as Record<string, number> }
      data?.forEach(b => {
        result.byBrowser[b.browser_name] = (result.byBrowser[b.browser_name] || 0) + 1
        result.byOS[b.os] = (result.byOS[b.os] || 0) + 1
        if (b.device_type) result.byDevice[b.device_type] = (result.byDevice[b.device_type] || 0) + 1
      })
      setStats(result)
    } finally { setIsLoading(false) }
  }, [options?.startDate, options?.endDate])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useCurrentBrowserInfo() {
  const [info, setInfo] = useState<any>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const ua = navigator.userAgent
    const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/)
    const osMatch = ua.match(/(Windows|Mac OS|Linux|Android|iOS)/)
    setInfo({
      browser_name: browserMatch?.[1] || 'Unknown',
      browser_version: browserMatch?.[2] || 'Unknown',
      os: osMatch?.[1] || 'Unknown',
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      user_agent: ua
    })
  }, [])
  return { info }
}

export function useExtensionInstallation(installationId?: string) {
  const [installation, setInstallation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!installationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('browser_extension_installations').select('*').eq('id', installationId).single()
      setInstallation(data)
    } finally { setIsLoading(false) }
  }, [installationId])
  useEffect(() => { fetch() }, [fetch])
  return { installation, isLoading, refresh: fetch }
}

export function useUserExtensions(userId?: string, options?: { isActive?: boolean; browser?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('browser_extension_installations').select('*').eq('user_id', userId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      if (options?.browser) query = query.eq('browser', options.browser)
      const { data: result } = await query.order('installed_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.isActive, options?.browser])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useExtensionStats(extensionId?: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!extensionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('browser_extension_installations').select('browser, is_active').eq('extension_id', extensionId)
      const result = { total: data?.length || 0, active: data?.filter(e => e.is_active).length || 0, byBrowser: {} as Record<string, number> }
      data?.forEach(e => { result.byBrowser[e.browser] = (result.byBrowser[e.browser] || 0) + 1 })
      setStats(result)
    } finally { setIsLoading(false) }
  }, [extensionId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useActiveExtensions(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('browser_extension_installations').select('*').eq('user_id', userId).eq('is_active', true).order('last_used_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
