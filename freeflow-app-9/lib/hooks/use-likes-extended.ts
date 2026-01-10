'use client'

/**
 * Extended Likes Hooks
 * Tables: likes, like_counts, like_notifications, like_reactions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLikeStatus(userId?: string, entityType?: string, entityId?: string) {
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('likes').select('id').eq('user_id', userId).eq('entity_type', entityType).eq('entity_id', entityId).single(); setIsLiked(!!data) } finally { setIsLoading(false) }
  }, [userId, entityType, entityId])
  useEffect(() => { check() }, [check])
  return { isLiked, isLoading, recheck: check }
}

export function useLikeCount(entityType?: string, entityId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('like_counts').select('count').eq('entity_type', entityType).eq('entity_id', entityId).single(); setCount(data?.count || 0) } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useLikesForEntity(entityType?: string, entityId?: string, options?: { limit?: number }) {
  const [likes, setLikes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('likes').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false }).limit(options?.limit || 50); setLikes(data || []) } finally { setIsLoading(false) }
  }, [entityType, entityId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { likes, isLoading, refresh: fetch }
}

export function useUserLikes(userId?: string, options?: { entity_type?: string; limit?: number }) {
  const [likes, setLikes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('likes').select('*').eq('user_id', userId)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setLikes(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.entity_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { likes, isLoading, refresh: fetch }
}

export function useReactions(entityType?: string, entityId?: string) {
  const [reactions, setReactions] = useState<any[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('like_reactions').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false })
      setReactions(data || [])
      const reactionCounts: Record<string, number> = {}
      data?.forEach(r => { reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1 })
      setCounts(reactionCounts)
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { reactions, counts, isLoading, refresh: fetch }
}

export function useUserReaction(userId?: string, entityType?: string, entityId?: string) {
  const [reaction, setReaction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('like_reactions').select('*').eq('user_id', userId).eq('entity_type', entityType).eq('entity_id', entityId).single(); setReaction(data) } finally { setIsLoading(false) }
  }, [userId, entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { reaction, isLoading, refresh: fetch }
}

export function useMostLiked(entityType?: string, options?: { limit?: number; period?: string }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('like_counts').select('*').eq('entity_type', entityType)
      if (options?.period) {
        const since = new Date()
        if (options.period === 'day') since.setDate(since.getDate() - 1)
        else if (options.period === 'week') since.setDate(since.getDate() - 7)
        else if (options.period === 'month') since.setMonth(since.getMonth() - 1)
        query = query.gte('updated_at', since.toISOString())
      }
      const { data } = await query.order('count', { ascending: false }).limit(options?.limit || 10)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, options?.limit, options?.period])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useLikeAndReaction(userId?: string, entityType?: string, entityId?: string) {
  const [state, setState] = useState<{ isLiked: boolean; reaction: any; likeCount: number }>({ isLiked: false, reaction: null, likeCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [likeResult, reactionResult, countResult] = await Promise.all([
        userId ? supabase.from('likes').select('id').eq('user_id', userId).eq('entity_type', entityType).eq('entity_id', entityId).single() : { data: null },
        userId ? supabase.from('like_reactions').select('*').eq('user_id', userId).eq('entity_type', entityType).eq('entity_id', entityId).single() : { data: null },
        supabase.from('like_counts').select('count').eq('entity_type', entityType).eq('entity_id', entityId).single()
      ])
      setState({
        isLiked: !!likeResult.data,
        reaction: reactionResult.data,
        likeCount: countResult.data?.count || 0
      })
    } finally { setIsLoading(false) }
  }, [userId, entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { ...state, isLoading, refresh: fetch }
}
