'use client'

/**
 * Extended Activity Hooks - Covers all Activity-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

/** Activity record from the activities table */
export interface Activity {
  id: string
  user_id: string
  item_type: string
  item_id: string
  action: string
  metadata?: Record<string, JsonValue>
  created_at: string
  updated_at?: string
}

export function useActivities(userId?: string, itemType?: string) {
  const [data, setData] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useActivityFeed(userId?: string, followingIds: string[] = []) {
  const [data, setData] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const allIds = [userId, ...followingIds]
      const { data: result } = await supabase.from('activities').select('*').in('user_id', allIds).order('created_at', { ascending: false }).limit(50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, followingIds])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useActivityStats(userId?: string) {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
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
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
