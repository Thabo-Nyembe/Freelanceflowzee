'use client'

/**
 * Extended Campaigns Hooks
 * Tables: campaigns, campaign_audiences, campaign_metrics, campaign_content
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCampaign(campaignId?: string) {
  const [campaign, setCampaign] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('campaigns').select('*, campaign_audiences(*), campaign_metrics(*)').eq('id', campaignId).single(); setCampaign(data) } finally { setIsLoading(false) }
  }, [campaignId])
  useEffect(() => { loadData() }, [loadData])
  return { campaign, isLoading, refresh: loadData }
}

export function useCampaigns(options?: { user_id?: string; status?: string; type?: string; limit?: number }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('campaigns').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCampaigns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { campaigns, isLoading, refresh: loadData }
}

export function useCampaignAudiences(campaignId?: string) {
  const [audiences, setAudiences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('campaign_audiences').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false }); setAudiences(data || []) } finally { setIsLoading(false) }
  }, [campaignId])
  useEffect(() => { loadData() }, [loadData])
  return { audiences, isLoading, refresh: loadData }
}

export function useCampaignMetrics(campaignId?: string, options?: { metric_name?: string; date_from?: string; date_to?: string }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('campaign_metrics').select('*').eq('campaign_id', campaignId)
      if (options?.metric_name) query = query.eq('metric_name', options.metric_name)
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      const { data } = await query.order('date', { ascending: true })
      setMetrics(data || [])
    } finally { setIsLoading(false) }
  }, [campaignId, options?.metric_name, options?.date_from, options?.date_to])
  useEffect(() => { loadData() }, [loadData])
  return { metrics, isLoading, refresh: loadData }
}

export function useActiveCampaigns(userId?: string) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('campaigns').select('*').eq('user_id', userId).eq('status', 'active').order('launched_at', { ascending: false }); setCampaigns(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { campaigns, isLoading, refresh: loadData }
}

export function useCampaignStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; totalBudget: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('campaigns').select('status, budget').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const total = data.length
      const byStatus = data.reduce((acc: Record<string, number>, c) => { acc[c.status || 'unknown'] = (acc[c.status || 'unknown'] || 0) + 1; return acc }, {})
      const totalBudget = data.reduce((sum, c) => sum + (c.budget || 0), 0)
      setStats({ total, byStatus, totalBudget })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useCampaignPerformance(campaignId?: string) {
  const [performance, setPerformance] = useState<Record<string, number> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('campaign_metrics').select('metric_name, value').eq('campaign_id', campaignId)
      if (!data) { setPerformance(null); return }
      const perf = data.reduce((acc: Record<string, number>, m) => { acc[m.metric_name] = (acc[m.metric_name] || 0) + m.value; return acc }, {})
      setPerformance(perf)
    } finally { setIsLoading(false) }
  }, [campaignId])
  useEffect(() => { loadData() }, [loadData])
  return { performance, isLoading, refresh: loadData }
}
