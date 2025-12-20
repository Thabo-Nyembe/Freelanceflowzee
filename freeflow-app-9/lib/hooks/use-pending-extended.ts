'use client'

/**
 * Extended Pending Hooks - Covers all Pending-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePendingItems(userId?: string, itemType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('pending_items').select('*').eq('user_id', userId).eq('status', 'pending').order('created_at', { ascending: false })
      if (itemType) query = query.eq('item_type', itemType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, itemType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePendingCount(userId?: string, itemType?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('pending_items').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'pending')
      if (itemType) query = query.eq('item_type', itemType)
      const { count: result } = await query
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [userId, itemType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function usePendingStats(userId?: string) {
  const [stats, setStats] = useState<Record<string, Record<string, number>>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('pending_items').select('item_type, status').eq('user_id', userId)
      const result: Record<string, Record<string, number>> = {}
      data?.forEach(item => {
        if (!result[item.item_type]) result[item.item_type] = {}
        result[item.item_type][item.status] = (result[item.item_type][item.status] || 0) + 1
      })
      setStats(result)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
