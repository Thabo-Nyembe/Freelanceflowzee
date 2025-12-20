'use client'

/**
 * Extended Feed Hooks - Covers all Feed-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFeedItems(userId?: string, feedType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('feed_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
      if (feedType) query = query.eq('feed_type', feedType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, feedType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUnreadFeedCount(userId?: string, feedType?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('feed_items').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)
      if (feedType) query = query.eq('feed_type', feedType)
      const { count: result } = await query
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [userId, feedType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useFeedSettings(userId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('feed_settings').select('*').eq('user_id', userId).single()
      setSettings(data)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}
