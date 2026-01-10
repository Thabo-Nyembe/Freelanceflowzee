'use client'

/**
 * Extended Podcasts Hooks
 * Tables: podcasts, podcast_episodes, podcast_subscriptions, podcast_downloads, podcast_analytics, podcast_categories
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePodcast(podcastId?: string) {
  const [podcast, setPodcast] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!podcastId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('podcasts').select('*, podcast_episodes(*), podcast_categories(*)').eq('id', podcastId).single(); setPodcast(data) } finally { setIsLoading(false) }
  }, [podcastId])
  useEffect(() => { fetch() }, [fetch])
  return { podcast, isLoading, refresh: fetch }
}

export function usePodcasts(options?: { author_id?: string; category_id?: string; status?: string; search?: string; limit?: number }) {
  const [podcasts, setPodcasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('podcasts').select('*, podcast_categories(*)')
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('subscriber_count', { ascending: false }).limit(options?.limit || 50)
      setPodcasts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.author_id, options?.category_id, options?.status, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { podcasts, isLoading, refresh: fetch }
}

export function usePodcastEpisodes(podcastId?: string, options?: { status?: string; season_number?: number; limit?: number }) {
  const [episodes, setEpisodes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!podcastId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('podcast_episodes').select('*').eq('podcast_id', podcastId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.season_number) query = query.eq('season_number', options.season_number)
      const { data } = await query.order('episode_number', { ascending: false }).limit(options?.limit || 50)
      setEpisodes(data || [])
    } finally { setIsLoading(false) }
  }, [podcastId, options?.status, options?.season_number, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { episodes, isLoading, refresh: fetch }
}

export function useEpisode(episodeId?: string) {
  const [episode, setEpisode] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!episodeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('podcast_episodes').select('*, podcasts(*)').eq('id', episodeId).single(); setEpisode(data) } finally { setIsLoading(false) }
  }, [episodeId])
  useEffect(() => { fetch() }, [fetch])
  return { episode, isLoading, refresh: fetch }
}

export function usePodcastSubscriptions(userId?: string) {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('podcast_subscriptions').select('*, podcasts(*)').eq('user_id', userId).order('subscribed_at', { ascending: false }); setSubscriptions(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { subscriptions, isLoading, refresh: fetch }
}

export function useIsSubscribed(podcastId?: string, userId?: string) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!podcastId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('podcast_subscriptions').select('id').eq('podcast_id', podcastId).eq('user_id', userId).single(); setIsSubscribed(!!data) } finally { setIsLoading(false) }
  }, [podcastId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { isSubscribed, isLoading, refresh: fetch }
}

export function usePodcastCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('podcast_categories').select('*').order('name', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useLatestEpisodes(options?: { limit?: number }) {
  const [episodes, setEpisodes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('podcast_episodes').select('*, podcasts(*)').eq('status', 'published').order('publish_date', { ascending: false }).limit(options?.limit || 20); setEpisodes(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { episodes, isLoading, refresh: fetch }
}

export function useTrendingPodcasts(options?: { limit?: number }) {
  const [podcasts, setPodcasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('podcasts').select('*, podcast_categories(*)').eq('status', 'active').order('subscriber_count', { ascending: false }).limit(options?.limit || 20); setPodcasts(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { podcasts, isLoading, refresh: fetch }
}

export function usePodcastAnalytics(podcastId?: string, options?: { from_date?: string; to_date?: string }) {
  const [analytics, setAnalytics] = useState<{ totalPlays: number; totalDownloads: number; uniqueListeners: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!podcastId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: episodes } = await supabase.from('podcast_episodes').select('id, play_count, download_count').eq('podcast_id', podcastId)
      const totalPlays = episodes?.reduce((sum, e) => sum + (e.play_count || 0), 0) || 0
      const totalDownloads = episodes?.reduce((sum, e) => sum + (e.download_count || 0), 0) || 0
      const episodeIds = episodes?.map(e => e.id) || []
      let uniqueListeners = 0
      if (episodeIds.length > 0) {
        const { data: analytics } = await supabase.from('podcast_analytics').select('user_id').in('episode_id', episodeIds).eq('action', 'play')
        uniqueListeners = new Set(analytics?.filter(a => a.user_id).map(a => a.user_id)).size
      }
      setAnalytics({ totalPlays, totalDownloads, uniqueListeners })
    } finally { setIsLoading(false) }
  }, [podcastId])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}

export function useSubscribedEpisodes(userId?: string, options?: { limit?: number }) {
  const [episodes, setEpisodes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: subs } = await supabase.from('podcast_subscriptions').select('podcast_id').eq('user_id', userId)
      const podcastIds = subs?.map(s => s.podcast_id) || []
      if (podcastIds.length === 0) { setEpisodes([]); setIsLoading(false); return }
      const { data } = await supabase.from('podcast_episodes').select('*, podcasts(*)').in('podcast_id', podcastIds).eq('status', 'published').order('publish_date', { ascending: false }).limit(options?.limit || 20)
      setEpisodes(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { episodes, isLoading, refresh: fetch }
}
