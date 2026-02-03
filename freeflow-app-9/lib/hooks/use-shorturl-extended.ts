'use client'

/**
 * Extended Short URL Hooks - Covers all Short URL-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useShortUrl(shortUrlId?: string) {
  const [shortUrl, setShortUrl] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!shortUrlId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('short_urls').select('*').eq('id', shortUrlId).single()
      setShortUrl(data)
    } finally { setIsLoading(false) }
  }, [shortUrlId])
  useEffect(() => { loadData() }, [loadData])
  return { shortUrl, isLoading, refresh: loadData }
}

export function useShortUrlByCode(code?: string) {
  const [shortUrl, setShortUrl] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!code) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('short_urls').select('*').eq('code', code).single()
      setShortUrl(data)
    } finally { setIsLoading(false) }
  }, [code])
  useEffect(() => { loadData() }, [loadData])
  return { shortUrl, isLoading, refresh: loadData }
}

export function useUserShortUrls(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('short_urls').select('*').eq('user_id', userId).eq('is_active', true).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useShortUrlClicks(shortUrlId?: string) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!shortUrlId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('short_url_clicks').select('*').eq('short_url_id', shortUrlId).order('clicked_at', { ascending: false }).limit(100)
      setData(result || [])
      setTotal(result?.length || 0)
    } finally { setIsLoading(false) }
  }, [shortUrlId])
  useEffect(() => { loadData() }, [loadData])
  return { data, total, isLoading, refresh: loadData }
}

export function useShortUrlStats(shortUrlId?: string) {
  const [clickCount, setClickCount] = useState(0)
  const [lastClickedAt, setLastClickedAt] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!shortUrlId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('short_urls').select('click_count, last_clicked_at, is_active, expires_at, max_clicks').eq('id', shortUrlId).single()
      if (data) {
        setClickCount(data.click_count || 0)
        setLastClickedAt(data.last_clicked_at)
        setIsActive(data.is_active && (!data.expires_at || new Date(data.expires_at) > new Date()) && (!data.max_clicks || data.click_count < data.max_clicks))
      }
    } finally { setIsLoading(false) }
  }, [shortUrlId])
  useEffect(() => { loadData() }, [loadData])
  return { clickCount, lastClickedAt, isActive, isLoading, refresh: loadData }
}
