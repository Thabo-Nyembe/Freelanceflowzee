'use client'

/**
 * Extended URLs Hooks
 * Tables: urls, url_clicks, url_analytics, url_groups, url_redirects, url_qr_codes
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUrl(urlId?: string) {
  const [url, setUrl] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!urlId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('urls').select('*, url_groups(*), users(*)').eq('id', urlId).single(); setUrl(data) } finally { setIsLoading(false) }
  }, [urlId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { url, isLoading, refresh: fetch }
}

export function useUrlByShortCode(shortCode?: string) {
  const [url, setUrl] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!shortCode) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('urls').select('*, url_groups(*)').eq('short_code', shortCode).single(); setUrl(data) } finally { setIsLoading(false) }
  }, [shortCode, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { url, isLoading, refresh: fetch }
}

export function useUrls(options?: { created_by?: string; group_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [urls, setUrls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('urls').select('*, url_groups(*), users(*)')
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`title.ilike.%${options.search}%,original_url.ilike.%${options.search}%,short_code.ilike.%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setUrls(data || [])
    } finally { setIsLoading(false) }
  }, [options?.created_by, options?.group_id, options?.is_active, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { urls, isLoading, refresh: fetch }
}

export function useMyUrls(userId?: string, options?: { group_id?: string; is_active?: boolean; limit?: number }) {
  const [urls, setUrls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('urls').select('*, url_groups(*)').eq('created_by', userId)
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setUrls(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.group_id, options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { urls, isLoading, refresh: fetch }
}

export function useUrlClicks(urlId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [clicks, setClicks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!urlId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('url_clicks').select('*').eq('url_id', urlId)
      if (options?.from_date) query = query.gte('clicked_at', options.from_date)
      if (options?.to_date) query = query.lte('clicked_at', options.to_date)
      const { data } = await query.order('clicked_at', { ascending: false }).limit(options?.limit || 100)
      setClicks(data || [])
    } finally { setIsLoading(false) }
  }, [urlId, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { clicks, isLoading, refresh: fetch }
}

export function useUrlAnalytics(urlId?: string, options?: { from_date?: string; to_date?: string }) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!urlId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('url_clicks').select('country, city, device_type, browser, os, referer').eq('url_id', urlId)
      if (options?.from_date) query = query.gte('clicked_at', options.from_date)
      if (options?.to_date) query = query.lte('clicked_at', options.to_date)
      const { data } = await query
      const clicks = data || []
      const byCountry: Record<string, number> = {}
      const byDevice: Record<string, number> = {}
      const byBrowser: Record<string, number> = {}
      const byReferer: Record<string, number> = {}
      clicks.forEach(c => {
        if (c.country) byCountry[c.country] = (byCountry[c.country] || 0) + 1
        if (c.device_type) byDevice[c.device_type] = (byDevice[c.device_type] || 0) + 1
        if (c.browser) byBrowser[c.browser] = (byBrowser[c.browser] || 0) + 1
        if (c.referer) byReferer[c.referer] = (byReferer[c.referer] || 0) + 1
      })
      setAnalytics({
        total_clicks: clicks.length,
        by_country: byCountry,
        by_device: byDevice,
        by_browser: byBrowser,
        by_referer: byReferer
      })
    } finally { setIsLoading(false) }
  }, [urlId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}

export function useUrlGroups(options?: { created_by?: string; is_public?: boolean }) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('url_groups').select('*, urls(count)')
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('name', { ascending: true })
      setGroups(data || [])
    } finally { setIsLoading(false) }
  }, [options?.created_by, options?.is_public, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useUrlRedirects(urlId?: string) {
  const [redirects, setRedirects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!urlId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('url_redirects').select('*').eq('url_id', urlId).order('priority', { ascending: false }); setRedirects(data || []) } finally { setIsLoading(false) }
  }, [urlId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { redirects, isLoading, refresh: fetch }
}

export function useUrlQrCodes(urlId?: string) {
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!urlId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('url_qr_codes').select('*').eq('url_id', urlId).order('created_at', { ascending: false }); setQrCodes(data || []) } finally { setIsLoading(false) }
  }, [urlId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { qrCodes, isLoading, refresh: fetch }
}

export function useTopUrls(userId?: string, options?: { limit?: number }) {
  const [urls, setUrls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('urls').select('*').eq('created_by', userId).eq('is_active', true).order('click_count', { ascending: false }).limit(options?.limit || 10); setUrls(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { urls, isLoading, refresh: fetch }
}

export function useRecentUrls(userId?: string, options?: { days?: number; limit?: number }) {
  const [urls, setUrls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const days = options?.days || 7
      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - days)
      const { data } = await supabase.from('urls').select('*').eq('created_by', userId).gte('created_at', sinceDate.toISOString()).order('created_at', { ascending: false }).limit(options?.limit || 20)
      setUrls(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.days, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { urls, isLoading, refresh: fetch }
}

export function useExpiredUrls(userId?: string, options?: { limit?: number }) {
  const [urls, setUrls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('urls').select('*').eq('created_by', userId).lt('expires_at', new Date().toISOString()).order('expires_at', { ascending: false }).limit(options?.limit || 20); setUrls(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { urls, isLoading, refresh: fetch }
}

export function useUrlStats(userId?: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('urls').select('click_count, is_active, expires_at').eq('created_by', userId)
      const urls = data || []
      const now = new Date()
      setStats({
        total_urls: urls.length,
        active_urls: urls.filter(u => u.is_active && (!u.expires_at || new Date(u.expires_at) > now)).length,
        total_clicks: urls.reduce((sum, u) => sum + (u.click_count || 0), 0),
        expired_urls: urls.filter(u => u.expires_at && new Date(u.expires_at) < now).length
      })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
