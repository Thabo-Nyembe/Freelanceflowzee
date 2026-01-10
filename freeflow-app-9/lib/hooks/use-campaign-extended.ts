'use client'

/**
 * Extended Campaign Hooks - Covers all Campaign-related tables
 * Tables: campaigns, campaign_contacts, campaign_metrics, campaign_templates
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCampaign(campaignId?: string) {
  const [campaign, setCampaign] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('campaigns').select('*, campaign_contacts(*), campaign_metrics(*)').eq('id', campaignId).single()
      setCampaign(data)
    } finally { setIsLoading(false) }
  }, [campaignId])
  useEffect(() => { fetch() }, [fetch])
  return { campaign, isLoading, refresh: fetch }
}

export function useCampaigns(userId?: string, options?: { status?: string; campaign_type?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('campaigns').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.campaign_type) query = query.eq('campaign_type', options.campaign_type)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.campaign_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useActiveCampaigns(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('campaigns').select('*').eq('user_id', userId).eq('status', 'active').order('launched_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCampaignContacts(campaignId?: string, options?: { status?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('campaign_contacts').select('*').eq('campaign_id', campaignId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [campaignId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCampaignMetrics(campaignId?: string, options?: { startDate?: string; endDate?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('campaign_metrics').select('*').eq('campaign_id', campaignId)
      if (options?.startDate) query = query.gte('date', options.startDate)
      if (options?.endDate) query = query.lte('date', options.endDate)
      const { data: result } = await query.order('date', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [campaignId, options?.startDate, options?.endDate, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCampaignStats(campaignId?: string) {
  const [stats, setStats] = useState<{ campaign: any; contactStats: Record<string, number>; totalContacts: number; openRate: number; clickRate: number; bounceRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [campaignRes, contactsRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', campaignId).single(),
        supabase.from('campaign_contacts').select('status').eq('campaign_id', campaignId)
      ])
      const campaign = campaignRes.data
      if (!campaign) { setStats(null); return }
      const contacts = contactsRes.data || []
      const contactStats = contacts.reduce((acc: Record<string, number>, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc }, {})
      const openRate = campaign.sent_count > 0 ? (campaign.open_count / campaign.sent_count) * 100 : 0
      const clickRate = campaign.open_count > 0 ? (campaign.click_count / campaign.open_count) * 100 : 0
      const bounceRate = campaign.sent_count > 0 ? (campaign.bounce_count / campaign.sent_count) * 100 : 0
      setStats({ campaign, contactStats, totalContacts: contacts.length, openRate, clickRate, bounceRate })
    } finally { setIsLoading(false) }
  }, [campaignId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useCampaignTemplates(userId?: string, options?: { category?: string; is_public?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('campaign_templates').select('*')
      if (options?.is_public) {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      } else {
        query = query.eq('user_id', userId)
      }
      if (options?.category) query = query.eq('category', options.category)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.category, options?.is_public, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCampaignTemplate(templateId?: string) {
  const [template, setTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!templateId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('campaign_templates').select('*').eq('id', templateId).single()
      setTemplate(data)
    } finally { setIsLoading(false) }
  }, [templateId])
  useEffect(() => { fetch() }, [fetch])
  return { template, isLoading, refresh: fetch }
}

export function useCampaignRealtime(campaignId?: string) {
  const [campaign, setCampaign] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!campaignId) return
    supabase.from('campaigns').select('*').eq('id', campaignId).single().then(({ data }) => setCampaign(data))
    const channel = supabase.channel(`campaign_${campaignId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'campaigns', filter: `id=eq.${campaignId}` }, (payload) => setCampaign(payload.new))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [campaignId])
  return { campaign }
}

export function useCampaignOverview(userId?: string) {
  const [overview, setOverview] = useState<{ total: number; draft: number; active: number; paused: number; completed: number; totalSent: number; totalOpens: number; totalClicks: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: campaigns } = await supabase.from('campaigns').select('status, sent_count, open_count, click_count').eq('user_id', userId)
      if (!campaigns) { setOverview(null); return }
      const total = campaigns.length
      const draft = campaigns.filter(c => c.status === 'draft').length
      const active = campaigns.filter(c => c.status === 'active').length
      const paused = campaigns.filter(c => c.status === 'paused').length
      const completed = campaigns.filter(c => c.status === 'completed').length
      const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0)
      const totalOpens = campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0)
      const totalClicks = campaigns.reduce((sum, c) => sum + (c.click_count || 0), 0)
      setOverview({ total, draft, active, paused, completed, totalSent, totalOpens, totalClicks })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { overview, isLoading, refresh: fetch }
}

export function useScheduledCampaigns(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('campaigns').select('*').eq('user_id', userId).eq('status', 'scheduled').not('scheduled_at', 'is', null).order('scheduled_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
