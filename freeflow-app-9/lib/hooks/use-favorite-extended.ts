'use client'

/**
 * Extended Favorite Hooks - Covers all Favorite-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFavorites(userId?: string, itemType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('favorites').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (itemType) query = query.eq('item_type', itemType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, itemType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useIsFavorited(userId?: string, itemId?: string, itemType?: string) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single()
      setIsFavorited(!!data)
    } finally { setIsLoading(false) }
  }, [userId, itemId, itemType, supabase])
  useEffect(() => { check() }, [check])
  return { isFavorited, isLoading, refresh: check }
}

export function useFavoriteCount(itemId?: string, itemType?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('item_id', itemId).eq('item_type', itemType)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [itemId, itemType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
