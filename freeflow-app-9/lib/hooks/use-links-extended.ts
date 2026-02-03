'use client'

/**
 * Extended Links Hooks
 * Tables: links, link_clicks, link_analytics, link_tags, short_links, link_groups
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLink(linkId?: string) {
  const [link, setLink] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!linkId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('links').select('*, link_tags(*)').eq('id', linkId).single(); setLink(data) } finally { setIsLoading(false) }
  }, [linkId])
  useEffect(() => { loadData() }, [loadData])
  return { link, isLoading, refresh: loadData }
}

export function useUserLinks(userId?: string, options?: { group_id?: string; is_active?: boolean; limit?: number }) {
  const [links, setLinks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('links').select('*, link_tags(*)').eq('user_id', userId)
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setLinks(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.group_id, options?.is_active, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { links, isLoading, refresh: loadData }
}

export function useLinkByShortCode(shortCode?: string) {
  const [link, setLink] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!shortCode) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('links').select('*').eq('short_code', shortCode).single()
      setLink(data)
      if (data) {
        const valid = data.is_active && (!data.expires_at || new Date(data.expires_at) > new Date())
        setIsValid(valid)
      }
    } finally { setIsLoading(false) }
  }, [shortCode])
  useEffect(() => { loadData() }, [loadData])
  return { link, isValid, isLoading, refresh: loadData }
}

export function useLinkClicks(linkId?: string, options?: { limit?: number }) {
  const [clicks, setClicks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!linkId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('link_clicks').select('*').eq('link_id', linkId).order('clicked_at', { ascending: false }).limit(options?.limit || 100); setClicks(data || []) } finally { setIsLoading(false) }
  }, [linkId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { clicks, isLoading, refresh: loadData }
}

export function useLinkAnalytics(linkId?: string) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!linkId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: clicks } = await supabase.from('link_clicks').select('country, device, referrer, clicked_at').eq('link_id', linkId)
      const result = {
        totalClicks: clicks?.length || 0,
        byCountry: {} as Record<string, number>,
        byDevice: {} as Record<string, number>,
        byReferrer: {} as Record<string, number>,
        clicksByDay: {} as Record<string, number>
      }
      clicks?.forEach(click => {
        if (click.country) result.byCountry[click.country] = (result.byCountry[click.country] || 0) + 1
        if (click.device) result.byDevice[click.device] = (result.byDevice[click.device] || 0) + 1
        if (click.referrer) result.byReferrer[click.referrer] = (result.byReferrer[click.referrer] || 0) + 1
        const day = new Date(click.clicked_at).toISOString().split('T')[0]
        result.clicksByDay[day] = (result.clicksByDay[day] || 0) + 1
      })
      setAnalytics(result)
    } finally { setIsLoading(false) }
  }, [linkId])
  useEffect(() => { loadData() }, [loadData])
  return { analytics, isLoading, refresh: loadData }
}

export function useLinkGroups(userId?: string) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('link_groups').select('*').eq('user_id', userId).order('name', { ascending: true }); setGroups(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { groups, isLoading, refresh: loadData }
}

export function useLinkSearch(userId?: string, query?: string, options?: { limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!userId || !query || query.length < 2) { setResults([]); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('links').select('*, link_tags(*)').eq('user_id', userId).or(`title.ilike.%${query}%,url.ilike.%${query}%`).order('created_at', { ascending: false }).limit(options?.limit || 20); setResults(data || []) } finally { setIsLoading(false) }
  }, [userId, query, options?.limit])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function useShortLinks(userId?: string) {
  const [links, setLinks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('short_links').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setLinks(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { links, isLoading, refresh: loadData }
}

export function useTopLinks(userId?: string, options?: { limit?: number }) {
  const [links, setLinks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('links').select('*').eq('user_id', userId).order('click_count', { ascending: false }).limit(options?.limit || 10); setLinks(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { links, isLoading, refresh: loadData }
}

export function useLinkTags(linkId?: string) {
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!linkId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('link_tags').select('*').eq('link_id', linkId); setTags(data || []) } finally { setIsLoading(false) }
  }, [linkId])
  useEffect(() => { loadData() }, [loadData])
  return { tags, isLoading, refresh: loadData }
}
