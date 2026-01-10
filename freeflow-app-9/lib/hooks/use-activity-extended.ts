'use client'

/**
 * Extended Activity Hooks - Covers all Activity-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useActivities(userId?: string, itemType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(50)
      if (userId) query = query.eq('user_id', userId)
      if (itemType) query = query.eq('item_type', itemType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, itemType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useActivityFeed(userId?: string, followingIds: string[] = []) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const allIds = [userId, ...followingIds]
      const { data: result } = await supabase.from('activities').select('*').in('user_id', allIds).order('created_at', { ascending: false }).limit(50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, followingIds])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useActivityStats(userId?: string) {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('activities').select('action').eq('user_id', userId)
      const counts: Record<string, number> = {}
      data?.forEach(a => { counts[a.action] = (counts[a.action] || 0) + 1 })
      setStats(counts)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
