'use client'

/**
 * Extended Vote Hooks - Covers all Vote-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useVotes(itemId?: string, itemType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('votes').select('*').order('created_at', { ascending: false })
      if (itemId) query = query.eq('item_id', itemId)
      if (itemType) query = query.eq('item_type', itemType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [itemId, itemType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useVoteScore(itemId?: string, itemType?: string) {
  const [score, setScore] = useState(0)
  const [upvotes, setUpvotes] = useState(0)
  const [downvotes, setDownvotes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('votes').select('vote_type').eq('item_id', itemId).eq('item_type', itemType)
      const ups = data?.filter(v => v.vote_type === 'up').length || 0
      const downs = data?.filter(v => v.vote_type === 'down').length || 0
      setUpvotes(ups)
      setDownvotes(downs)
      setScore(ups - downs)
    } finally { setIsLoading(false) }
  }, [itemId, itemType])
  useEffect(() => { fetch() }, [fetch])
  return { score, upvotes, downvotes, isLoading, refresh: fetch }
}

export function useUserVote(userId?: string, itemId?: string, itemType?: string) {
  const [vote, setVote] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('votes').select('vote_type').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single()
      setVote(data?.vote_type || null)
    } finally { setIsLoading(false) }
  }, [userId, itemId, itemType])
  useEffect(() => { fetch() }, [fetch])
  return { vote, isLoading, refresh: fetch }
}
