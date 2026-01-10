'use client'

/**
 * Extended Video Hooks - Covers all 29 Video-related tables
 * Auto-generated for comprehensive table coverage
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ============================================
// VIDEO ANALYTICS
// ============================================

export function useVideoAnalytics(videoId?: string) {
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_analytics')
        .select('*')
        .eq('video_id', videoId)
        .single()
      setData(result)
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useVideoAnalyticsCountries(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_analytics_countries')
        .select('*')
        .eq('video_id', videoId)
        .order('view_count', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useVideoAnalyticsDevices(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_analytics_devices')
        .select('*')
        .eq('video_id', videoId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useVideoDailyAnalytics(videoId?: string, days = 30) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_daily_analytics')
        .select('*')
        .eq('video_id', videoId)
        .order('date', { ascending: false })
        .limit(days)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId, days])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO ANNOTATIONS
// ============================================

export function useVideoAnnotations(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, error: err } = await supabase
        .from('video_annotations')
        .select('*')
        .eq('video_id', videoId)
        .order('timestamp', { ascending: true })
      if (err) throw err
      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  const create = useCallback(async (input: { timestamp: number; content: string; type?: string }) => {
    try {
      const { data: result, error: err } = await supabase
        .from('video_annotations')
        .insert({ ...input, video_id: videoId })
        .select()
        .single()
      if (err) throw err
      setData(prev => [...prev, result].sort((a, b) => a.timestamp - b.timestamp))
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      return null
    }
  }, [videoId])

  return { data, isLoading, error, create, refresh: fetch }
}

// ============================================
// VIDEO ASSETS
// ============================================

export function useVideoAssets(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO CAPTIONS
// ============================================

export function useVideoCaptions(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_captions')
        .select('*')
        .eq('video_id', videoId)
        .order('language', { ascending: true })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO CLIPS
// ============================================

export function useVideoClips(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_clips')
        .select('*')
        .eq('video_id', videoId)
        .order('start_time', { ascending: true })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO COLLABORATORS
// ============================================

export function useVideoCollaborators(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_collaborators')
        .select('*')
        .eq('video_id', videoId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO COMMENTS
// ============================================

export function useVideoComments(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  const create = useCallback(async (userId: string, content: string, timestamp?: number) => {
    try {
      const { data: result } = await supabase
        .from('video_comments')
        .insert({ video_id: videoId, user_id: userId, content, timestamp })
        .select()
        .single()
      if (result) setData(prev => [result, ...prev])
      return result
    } catch {
      return null
    }
  }, [videoId])

  return { data, isLoading, create, refresh: fetch }
}

// ============================================
// VIDEO EFFECTS
// ============================================

export function useVideoEffects() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_effects')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO ENCODING JOBS
// ============================================

export function useVideoEncodingJobs(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_encoding_jobs')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO ENGAGEMENT
// ============================================

export function useVideoEngagementEvents(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_engagement_events')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
        .limit(100)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useVideoEvents(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_events')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO EXPORTS
// ============================================

export function useVideoExports(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_exports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO FOLDERS
// ============================================

export function useVideoFolders(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_folders')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const create = useCallback(async (name: string, parentId?: string) => {
    try {
      const { data: result } = await supabase
        .from('video_folders')
        .insert({ user_id: userId, name, parent_id: parentId })
        .select()
        .single()
      if (result) setData(prev => [...prev, result])
      return result
    } catch {
      return null
    }
  }, [userId])

  return { data, isLoading, create, refresh: fetch }
}

// ============================================
// VIDEO LIKES
// ============================================

export function useVideoLikes(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, count: total } = await supabase
        .from('video_likes')
        .select('*', { count: 'exact' })
        .eq('video_id', videoId)
      setData(result || [])
      setCount(total || 0)
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  const toggle = useCallback(async (userId: string) => {
    const existing = data.find(l => l.user_id === userId)
    if (existing) {
      await supabase.from('video_likes').delete().eq('id', existing.id)
      setData(prev => prev.filter(l => l.id !== existing.id))
      setCount(prev => prev - 1)
      return false
    } else {
      const { data: result } = await supabase
        .from('video_likes')
        .insert({ video_id: videoId, user_id: userId })
        .select()
        .single()
      if (result) {
        setData(prev => [...prev, result])
        setCount(prev => prev + 1)
      }
      return true
    }
  }, [videoId, data])

  return { data, count, isLoading, toggle, refresh: fetch }
}

// ============================================
// VIDEO METADATA
// ============================================

export function useVideoMetadata(videoId?: string) {
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_metadata')
        .select('*')
        .eq('video_id', videoId)
        .single()
      setData(result)
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO RENDER JOBS
// ============================================

export function useVideoRenderJobs(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_render_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO SHARES
// ============================================

export function useVideoShares(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_shares')
        .select('*')
        .eq('video_id', videoId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO TEMPLATES
// ============================================

export function useVideoTemplates(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('video_templates').select('*')
      if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      else query = query.eq('is_public', true)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO TIMELINE
// ============================================

export function useVideoTimelineItems(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_timeline_items')
        .select('*')
        .eq('project_id', projectId)
        .order('track_index', { ascending: true })
        .order('start_time', { ascending: true })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO TRACKS
// ============================================

export function useVideoTracks(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_tracks')
        .select('*')
        .eq('project_id', projectId)
        .order('index', { ascending: true })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO TRANSCRIPTS
// ============================================

export function useVideoTranscripts(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_transcripts')
        .select('*')
        .eq('video_id', videoId)
        .order('language', { ascending: true })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO TRANSITIONS
// ============================================

export function useVideoTransitions() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_transitions')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO USAGE LOGS
// ============================================

export function useVideoUsageLogs(userId?: string, limit = 100) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_usage_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId, limit])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO VERSIONS
// ============================================

export function useVideoVersions(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_versions')
        .select('*')
        .eq('video_id', videoId)
        .order('version', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// VIDEO VIEWS
// ============================================

export function useVideoViews(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, count: total } = await supabase
        .from('video_views')
        .select('*', { count: 'exact' })
        .eq('video_id', videoId)
      setData(result || [])
      setCount(total || 0)
    } finally {
      setIsLoading(false)
    }
  }, [videoId])

  useEffect(() => { fetch() }, [fetch])

  const recordView = useCallback(async (userId?: string) => {
    await supabase.from('video_views').insert({ video_id: videoId, user_id: userId })
    setCount(prev => prev + 1)
  }, [videoId])

  return { data, count, isLoading, recordView, refresh: fetch }
}

// ============================================
// VIDEO WATCH TIME
// ============================================

export function useVideoWatchTime(videoId?: string, userId?: string) {
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!videoId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('video_watch_time')
        .select('*')
        .eq('video_id', videoId)
        .eq('user_id', userId)
        .single()
      setData(result)
    } finally {
      setIsLoading(false)
    }
  }, [videoId, userId])

  useEffect(() => { fetch() }, [fetch])

  const updateWatchTime = useCallback(async (watchedSeconds: number, totalDuration: number) => {
    if (!videoId || !userId) return
    await supabase.from('video_watch_time').upsert({
      video_id: videoId,
      user_id: userId,
      watched_seconds: watchedSeconds,
      total_duration: totalDuration,
      last_position: watchedSeconds,
    }, { onConflict: 'video_id,user_id' })
  }, [videoId, userId])

  return { data, isLoading, updateWatchTime, refresh: fetch }
}
