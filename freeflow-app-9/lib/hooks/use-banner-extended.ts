'use client'

/**
 * Extended Banner Hooks - Covers all Banner-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBanners(location?: string, isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('banners').select('*').order('priority', { ascending: false })
      if (location) query = query.eq('location', location)
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [location, isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useActiveBanners(location?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      let query = supabase.from('banners').select('*').eq('is_active', true).or(`start_date.is.null,start_date.lte.${now}`).or(`end_date.is.null,end_date.gte.${now}`).order('priority', { ascending: false })
      if (location) query = query.eq('location', location)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [location])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBannerStats(bannerId?: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!bannerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('banners').select('view_count, click_count').eq('id', bannerId).single()
      const ctr = result?.view_count > 0 ? (result.click_count / result.view_count) * 100 : 0
      setStats({ ...result, ctr })
    } finally { setIsLoading(false) }
  }, [bannerId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
