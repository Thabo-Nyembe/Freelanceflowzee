'use client'

/**
 * Extended Traffic Hooks
 * Tables: traffic_sources, traffic_analytics, traffic_campaigns, traffic_conversions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTrafficSource(sourceId?: string) {
  const [source, setSource] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!sourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('traffic_sources').select('*').eq('id', sourceId).single(); setSource(data) } finally { setIsLoading(false) }
  }, [sourceId])
  useEffect(() => { loadData() }, [loadData])
  return { source, isLoading, refresh: loadData }
}

export function useTrafficSources(options?: { type?: string; campaign_id?: string; is_active?: boolean; limit?: number }) {
  const [sources, setSources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('traffic_sources').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setSources(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.campaign_id, options?.is_active, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { sources, isLoading, refresh: loadData }
}

export function useTrafficAnalytics(options?: { source_id?: string; page_path?: string; days?: number }) {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const since = new Date(); since.setDate(since.getDate() - (options?.days || 30)); let query = supabase.from('traffic_analytics').select('*').gte('created_at', since.toISOString()); if (options?.source_id) query = query.eq('source_id', options.source_id); if (options?.page_path) query = query.eq('page_path', options.page_path); const { data } = await query.order('created_at', { ascending: false }); setAnalytics(data || []) } finally { setIsLoading(false) }
  }, [options?.source_id, options?.page_path, options?.days])
  useEffect(() => { loadData() }, [loadData])
  return { analytics, isLoading, refresh: loadData }
}

export function useTrafficCampaigns(options?: { status?: string; is_active?: boolean; limit?: number }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('traffic_campaigns').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCampaigns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.is_active, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { campaigns, isLoading, refresh: loadData }
}

export function useTrafficConversions(options?: { source_id?: string; campaign_id?: string; days?: number }) {
  const [conversions, setConversions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const since = new Date(); since.setDate(since.getDate() - (options?.days || 30)); let query = supabase.from('traffic_conversions').select('*').gte('created_at', since.toISOString()); if (options?.source_id) query = query.eq('source_id', options.source_id); if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id); const { data } = await query.order('created_at', { ascending: false }); setConversions(data || []) } finally { setIsLoading(false) }
  }, [options?.source_id, options?.campaign_id, options?.days])
  useEffect(() => { loadData() }, [loadData])
  return { conversions, isLoading, refresh: loadData }
}
