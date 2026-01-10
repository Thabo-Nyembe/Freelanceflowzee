'use client'

/**
 * Extended Redirect Hooks - Covers all Redirect-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRedirect(redirectId?: string) {
  const [redirect, setRedirect] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!redirectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('redirects').select('*').eq('id', redirectId).single()
      setRedirect(data)
    } finally { setIsLoading(false) }
  }, [redirectId])
  useEffect(() => { fetch() }, [fetch])
  return { redirect, isLoading, refresh: fetch }
}

export function useRedirectByPath(path?: string) {
  const [redirect, setRedirect] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!path) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('redirects').select('*').eq('source_path', path).eq('is_active', true).single()
      setRedirect(data)
    } finally { setIsLoading(false) }
  }, [path])
  useEffect(() => { fetch() }, [fetch])
  return { redirect, isLoading, refresh: fetch }
}

export function useRedirects(filters?: { userId?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('redirects').select('*')
      if (filters?.userId) query = query.eq('user_id', filters.userId)
      if (filters?.isActive !== undefined) query = query.eq('is_active', filters.isActive)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [filters?.userId, filters?.isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useRedirectStats(redirectId?: string) {
  const [hitCount, setHitCount] = useState(0)
  const [lastHitAt, setLastHitAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!redirectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('redirects').select('hit_count, last_hit_at').eq('id', redirectId).single()
      if (data) {
        setHitCount(data.hit_count || 0)
        setLastHitAt(data.last_hit_at)
      }
    } finally { setIsLoading(false) }
  }, [redirectId])
  useEffect(() => { fetch() }, [fetch])
  return { hitCount, lastHitAt, isLoading, refresh: fetch }
}
