'use client'

/**
 * Extended Engagement Hooks
 * Tables: engagement_metrics, engagement_campaigns, engagement_events, engagement_scores, engagement_surveys
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useEngagementMetrics(entityId?: string, entityType?: string) {
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('engagement_metrics').select('*').eq('entity_id', entityId).eq('entity_type', entityType).single(); setMetrics(data) } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useEngagementCampaigns(options?: { status?: string; type?: string; limit?: number }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('engagement_campaigns').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCampaigns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { campaigns, isLoading, refresh: fetch }
}

export function useEngagementEvents(options?: { user_id?: string; event_type?: string; entity_id?: string; limit?: number }) {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('engagement_events').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.event_type) query = query.eq('event_type', options.event_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 100)
      setEvents(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.event_type, options?.entity_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { events, isLoading, refresh: fetch }
}

export function useUserEngagementScore(userId?: string) {
  const [score, setScore] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('engagement_scores').select('*').eq('user_id', userId).single(); setScore(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { score, isLoading, refresh: fetch }
}

export function useEngagementSurveys(options?: { status?: string; limit?: number }) {
  const [surveys, setSurveys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('engagement_surveys').select('*')
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setSurveys(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { surveys, isLoading, refresh: fetch }
}

export function useSurveyResponses(surveyId?: string, options?: { limit?: number }) {
  const [responses, setResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!surveyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('engagement_survey_responses').select('*').eq('survey_id', surveyId).order('submitted_at', { ascending: false }).limit(options?.limit || 100); setResponses(data || []) } finally { setIsLoading(false) }
  }, [surveyId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { responses, isLoading, refresh: fetch }
}

export function useEngagementTrends(options?: { entity_type?: string; days?: number }) {
  const [trends, setTrends] = useState<{ date: string; views: number; clicks: number; shares: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const daysAgo = options?.days || 30
      const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      let query = supabase.from('engagement_events').select('event_type, occurred_at')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      const { data } = await query.gte('occurred_at', startDate)
      const byDate: Record<string, { views: number; clicks: number; shares: number }> = {}
      data?.forEach(e => {
        const date = e.occurred_at.split('T')[0]
        if (!byDate[date]) byDate[date] = { views: 0, clicks: 0, shares: 0 }
        if (e.event_type === 'view') byDate[date].views++
        if (e.event_type === 'click') byDate[date].clicks++
        if (e.event_type === 'share') byDate[date].shares++
      })
      setTrends(Object.entries(byDate).map(([date, stats]) => ({ date, ...stats })).sort((a, b) => a.date.localeCompare(b.date)))
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.days])
  useEffect(() => { fetch() }, [fetch])
  return { trends, isLoading, refresh: fetch }
}

export function useTopEngagedContent(options?: { entity_type?: string; metric?: string; limit?: number }) {
  const [content, setContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('engagement_metrics').select('*')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      const { data } = await query.order(options?.metric || 'views', { ascending: false }).limit(options?.limit || 10)
      setContent(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.metric, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { content, isLoading, refresh: fetch }
}

export function useActiveCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      const { data } = await supabase.from('engagement_campaigns').select('*').eq('status', 'active').lte('start_date', now).or(`end_date.is.null,end_date.gte.${now}`).order('start_date', { ascending: false })
      setCampaigns(data || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { campaigns, isLoading, refresh: fetch }
}
