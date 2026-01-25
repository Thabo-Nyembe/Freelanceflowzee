'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ReleaseNote {
  id: string
  user_id: string
  version: string
  title: string
  description: string | null
  status: 'published' | 'draft' | 'scheduled' | 'archived'
  release_type: 'major' | 'minor' | 'patch' | 'hotfix'
  platform: 'web' | 'mobile' | 'api' | 'desktop' | 'all'
  published_at: string | null
  scheduled_at: string | null
  author: string | null
  highlights: string[]
  features: string[]
  improvements: string[]
  bug_fixes: string[]
  breaking_changes: string[]
  downloads_count: number
  views_count: number
  likes_count: number
  comments_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ReleaseNotesStats {
  total: number
  published: number
  draft: number
  scheduled: number
  totalDownloads: number
  avgLikes: number
}

export function useReleaseNotes(initialReleases?: ReleaseNote[], initialStats?: ReleaseNotesStats) {
  const [releases, setReleases] = useState<ReleaseNote[]>(initialReleases || [])
  const [stats, setStats] = useState<ReleaseNotesStats>(initialStats || {
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    totalDownloads: 0,
    avgLikes: 0
  })
  const [loading, setLoading] = useState(!initialReleases || initialReleases.length === 0)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  // Fetch release notes from Supabase
  const fetchReleaseNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('release_notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setReleases(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch release notes'))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Initial fetch if no initial data provided
  useEffect(() => {
    if (!initialReleases || initialReleases.length === 0) {
      fetchReleaseNotes()
    }
  }, [initialReleases, fetchReleaseNotes])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('release_notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'release_notes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setReleases(prev => [payload.new as ReleaseNote, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setReleases(prev => prev.map(r => r.id === payload.new.id ? payload.new as ReleaseNote : r))
        } else if (payload.eventType === 'DELETE') {
          setReleases(prev => prev.filter(r => r.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  // Update stats when releases change
  useEffect(() => {
    const published = releases.filter(r => r.status === 'published').length
    const draft = releases.filter(r => r.status === 'draft').length
    const scheduled = releases.filter(r => r.status === 'scheduled').length
    const totalDownloads = releases.reduce((sum, r) => sum + (r.downloads_count || 0), 0)
    const avgLikes = releases.length > 0
      ? releases.reduce((sum, r) => sum + (r.likes_count || 0), 0) / releases.length
      : 0

    setStats({
      total: releases.length,
      published,
      draft,
      scheduled,
      totalDownloads,
      avgLikes
    })
  }, [releases])

  return { releases, stats, loading, error, refetch: fetchReleaseNotes }
}
