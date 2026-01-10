'use client'

/**
 * Extended Like Hooks - Covers all Like-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLikes(itemId?: string, itemType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('likes').select('*').order('created_at', { ascending: false })
      if (itemId) query = query.eq('item_id', itemId)
      if (itemType) query = query.eq('item_type', itemType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [itemId, itemType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useIsLiked(userId?: string, itemId?: string, itemType?: string) {
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('likes').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single()
      setIsLiked(!!data)
    } finally { setIsLoading(false) }
  }, [userId, itemId, itemType, supabase])
  useEffect(() => { check() }, [check])
  return { isLiked, isLoading, refresh: check }
}

export function useLikeCount(itemId?: string, itemType?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('item_id', itemId).eq('item_type', itemType)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [itemId, itemType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
