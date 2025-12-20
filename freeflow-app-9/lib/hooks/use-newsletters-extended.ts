'use client'

/**
 * Extended Newsletters Hooks
 * Tables: newsletters, newsletter_subscribers, newsletter_campaigns, newsletter_templates, newsletter_analytics, newsletter_segments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useNewsletter(newsletterId?: string) {
  const [newsletter, setNewsletter] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!newsletterId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('newsletters').select('*, newsletter_templates(*), newsletter_segments(*)').eq('id', newsletterId).single(); setNewsletter(data) } finally { setIsLoading(false) }
  }, [newsletterId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { newsletter, isLoading, refresh: fetch }
}

export function useNewsletters(options?: { organization_id?: string; status?: string }) {
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('newsletters').select('*')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true })
      setNewsletters(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { newsletters, isLoading, refresh: fetch }
}

export function useNewsletterSubscribers(newsletterId?: string, options?: { status?: string; limit?: number }) {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!newsletterId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('newsletter_subscribers').select('*').eq('newsletter_id', newsletterId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('subscribed_at', { ascending: false }).limit(options?.limit || 100)
      setSubscribers(data || [])
    } finally { setIsLoading(false) }
  }, [newsletterId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { subscribers, isLoading, refresh: fetch }
}

export function useNewsletterCampaigns(newsletterId?: string, options?: { status?: string; limit?: number }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!newsletterId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('newsletter_campaigns').select('*').eq('newsletter_id', newsletterId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCampaigns(data || [])
    } finally { setIsLoading(false) }
  }, [newsletterId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { campaigns, isLoading, refresh: fetch }
}

export function useNewsletterTemplates(newsletterId?: string) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!newsletterId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('newsletter_templates').select('*').eq('newsletter_id', newsletterId).order('name', { ascending: true }); setTemplates(data || []) } finally { setIsLoading(false) }
  }, [newsletterId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useNewsletterSegments(newsletterId?: string) {
  const [segments, setSegments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!newsletterId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('newsletter_segments').select('*').eq('newsletter_id', newsletterId).order('name', { ascending: true }); setSegments(data || []) } finally { setIsLoading(false) }
  }, [newsletterId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { segments, isLoading, refresh: fetch }
}

export function useCampaignAnalytics(campaignId?: string) {
  const [analytics, setAnalytics] = useState<{ sent: number; delivered: number; opened: number; clicked: number; bounced: number; unsubscribed: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!campaignId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('newsletter_analytics').select('event_type').eq('campaign_id', campaignId)
      const stats = { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }
      data?.forEach(a => { if (stats[a.event_type as keyof typeof stats] !== undefined) stats[a.event_type as keyof typeof stats]++ })
      setAnalytics(stats)
    } finally { setIsLoading(false) }
  }, [campaignId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}

export function useNewsletterStats(newsletterId?: string) {
  const [stats, setStats] = useState<{ totalSubscribers: number; activeSubscribers: number; totalCampaigns: number; sentCampaigns: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!newsletterId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [subscribersRes, campaignsRes] = await Promise.all([
        supabase.from('newsletter_subscribers').select('status').eq('newsletter_id', newsletterId),
        supabase.from('newsletter_campaigns').select('status').eq('newsletter_id', newsletterId)
      ])
      const totalSubscribers = subscribersRes.data?.length || 0
      const activeSubscribers = subscribersRes.data?.filter(s => s.status === 'active').length || 0
      const totalCampaigns = campaignsRes.data?.length || 0
      const sentCampaigns = campaignsRes.data?.filter(c => c.status === 'sent').length || 0
      setStats({ totalSubscribers, activeSubscribers, totalCampaigns, sentCampaigns })
    } finally { setIsLoading(false) }
  }, [newsletterId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useSubscriptionStatus(email?: string, newsletterId?: string) {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!email || !newsletterId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('newsletter_subscribers').select('*').eq('newsletter_id', newsletterId).eq('email', email).single(); setSubscription(data) } finally { setIsLoading(false) }
  }, [email, newsletterId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { subscription, isLoading, refresh: fetch }
}
