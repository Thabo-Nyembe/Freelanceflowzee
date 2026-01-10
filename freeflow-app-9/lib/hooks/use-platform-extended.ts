'use client'

/**
 * Extended Platform Hooks
 * Tables: platforms, platform_settings, platform_features, platform_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePlatform(platformId?: string) {
  const [platform, setPlatform] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!platformId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('platforms').select('*').eq('id', platformId).single(); setPlatform(data) } finally { setIsLoading(false) }
  }, [platformId])
  useEffect(() => { fetch() }, [fetch])
  return { platform, isLoading, refresh: fetch }
}

export function usePlatforms(options?: { type?: string; status?: string; limit?: number }) {
  const [platforms, setPlatforms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('platforms').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setPlatforms(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { platforms, isLoading, refresh: fetch }
}

export function usePlatformSettings(platformId?: string) {
  const [settings, setSettings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!platformId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('platform_settings').select('*').eq('platform_id', platformId); setSettings(data || []) } finally { setIsLoading(false) }
  }, [platformId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function usePlatformFeatures(platformId?: string) {
  const [features, setFeatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!platformId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('platform_features').select('*').eq('platform_id', platformId).order('name', { ascending: true }); setFeatures(data || []) } finally { setIsLoading(false) }
  }, [platformId])
  useEffect(() => { fetch() }, [fetch])
  return { features, isLoading, refresh: fetch }
}

export function usePlatformAnalytics(platformId?: string, options?: { date_from?: string; date_to?: string }) {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!platformId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('platform_analytics').select('*').eq('platform_id', platformId)
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      const { data } = await query.order('date', { ascending: false })
      setAnalytics(data || [])
    } finally { setIsLoading(false) }
  }, [platformId, options?.date_from, options?.date_to, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}
