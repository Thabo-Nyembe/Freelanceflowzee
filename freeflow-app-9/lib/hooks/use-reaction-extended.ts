'use client'

/**
 * Extended Reaction Hooks - Covers all Reaction-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReactions(itemId?: string, itemType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('reactions').select('*').order('created_at', { ascending: false })
      if (itemId) query = query.eq('item_id', itemId)
      if (itemType) query = query.eq('item_type', itemType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [itemId, itemType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useReactionCounts(itemId?: string, itemType?: string) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reactions').select('reaction_type').eq('item_id', itemId).eq('item_type', itemType)
      const counts: Record<string, number> = {}
      data?.forEach(r => { counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1 })
      setCounts(counts)
    } finally { setIsLoading(false) }
  }, [itemId, itemType])
  useEffect(() => { loadData() }, [loadData])
  return { counts, isLoading, refresh: loadData }
}

export function useUserReaction(userId?: string, itemId?: string, itemType?: string) {
  const [reaction, setReaction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reactions').select('reaction_type').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single()
      setReaction(data?.reaction_type || null)
    } finally { setIsLoading(false) }
  }, [userId, itemId, itemType])
  useEffect(() => { loadData() }, [loadData])
  return { reaction, isLoading, refresh: loadData }
}
