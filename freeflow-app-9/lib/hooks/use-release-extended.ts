'use client'

/**
 * Extended Release Hooks - Covers all Release-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReleases(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('releases').select('*').order('release_date', { ascending: false })
      if (projectId) query = query.eq('project_id', projectId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReleaseNotes(releaseId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!releaseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('release_notes').select('*').eq('release_id', releaseId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [releaseId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
