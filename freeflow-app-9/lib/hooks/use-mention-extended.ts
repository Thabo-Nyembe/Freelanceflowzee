'use client'

/**
 * Extended Mention Hooks - Covers all Mention-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMentions(userId?: string, unreadOnly = false) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('mentions').select('*').eq('mentioned_user_id', userId).order('created_at', { ascending: false })
      if (unreadOnly) query = query.eq('is_read', false)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, unreadOnly])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUnreadMentionCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('mentions').select('*', { count: 'exact', head: true }).eq('mentioned_user_id', userId).eq('is_read', false)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useMentionsByItem(itemId?: string, itemType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('mentions').select('*').eq('item_id', itemId).eq('item_type', itemType).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [itemId, itemType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
