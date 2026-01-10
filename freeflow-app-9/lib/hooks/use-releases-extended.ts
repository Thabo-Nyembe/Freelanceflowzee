'use client'

/**
 * Extended Releases Hooks
 * Tables: releases, release_notes, release_assets, release_deployments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRelease(releaseId?: string) {
  const [release, setRelease] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!releaseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('releases').select('*, release_notes(*), release_assets(*)').eq('id', releaseId).single(); setRelease(data) } finally { setIsLoading(false) }
  }, [releaseId])
  useEffect(() => { fetch() }, [fetch])
  return { release, isLoading, refresh: fetch }
}

export function useReleases(options?: { project_id?: string; status?: string; is_prerelease?: boolean; limit?: number }) {
  const [releases, setReleases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('releases').select('*')
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_prerelease !== undefined) query = query.eq('is_prerelease', options.is_prerelease)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReleases(data || [])
    } finally { setIsLoading(false) }
  }, [options?.project_id, options?.status, options?.is_prerelease, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { releases, isLoading, refresh: fetch }
}

export function useReleaseNotes(releaseId?: string) {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!releaseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('release_notes').select('*').eq('release_id', releaseId).order('order', { ascending: true }); setNotes(data || []) } finally { setIsLoading(false) }
  }, [releaseId])
  useEffect(() => { fetch() }, [fetch])
  return { notes, isLoading, refresh: fetch }
}

export function useReleaseAssets(releaseId?: string) {
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!releaseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('release_assets').select('*').eq('release_id', releaseId).order('name', { ascending: true }); setAssets(data || []) } finally { setIsLoading(false) }
  }, [releaseId])
  useEffect(() => { fetch() }, [fetch])
  return { assets, isLoading, refresh: fetch }
}

export function useLatestRelease(projectId?: string) {
  const [release, setRelease] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('releases').select('*').eq('project_id', projectId).eq('status', 'published').order('published_at', { ascending: false }).limit(1).single(); setRelease(data) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { release, isLoading, refresh: fetch }
}
