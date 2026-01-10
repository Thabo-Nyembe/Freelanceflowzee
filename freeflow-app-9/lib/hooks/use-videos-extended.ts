'use client'

/**
 * Extended Videos Hooks
 * Tables: videos, video_chapters, video_thumbnails, video_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useVideo(videoId?: string) {
  const [video, setVideo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('videos').select('*, video_chapters(*), video_thumbnails(*)').eq('id', videoId).single(); setVideo(data) } finally { setIsLoading(false) }
  }, [videoId])
  useEffect(() => { fetch() }, [fetch])
  return { video, isLoading, refresh: fetch }
}

export function useVideos(options?: { user_id?: string; status?: string; is_public?: boolean; limit?: number }) {
  const [videos, setVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('videos').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setVideos(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.is_public, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { videos, isLoading, refresh: fetch }
}

export function useVideoChapters(videoId?: string) {
  const [chapters, setChapters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('video_chapters').select('*').eq('video_id', videoId).order('start_time', { ascending: true }); setChapters(data || []) } finally { setIsLoading(false) }
  }, [videoId])
  useEffect(() => { fetch() }, [fetch])
  return { chapters, isLoading, refresh: fetch }
}

export function useUserVideos(userId?: string) {
  const [videos, setVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('videos').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setVideos(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { videos, isLoading, refresh: fetch }
}

export function usePublicVideos(options?: { limit?: number }) {
  const [videos, setVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('videos').select('*').eq('is_public', true).eq('status', 'published').order('created_at', { ascending: false }).limit(options?.limit || 50); setVideos(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { videos, isLoading, refresh: fetch }
}
