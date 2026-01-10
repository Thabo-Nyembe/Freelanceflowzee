'use client'

/**
 * Extended Comments Hooks
 * Tables: comments, comment_replies, comment_reactions, comment_mentions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useComment(commentId?: string) {
  const [comment, setComment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('comments').select('*, comment_replies(*), comment_reactions(*)').eq('id', commentId).single(); setComment(data) } finally { setIsLoading(false) }
  }, [commentId])
  useEffect(() => { fetch() }, [fetch])
  return { comment, isLoading, refresh: fetch }
}

export function useComments(targetType?: string, targetId?: string, options?: { parent_id?: string; limit?: number }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!targetType || !targetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('comments').select('*, comment_reactions(*)').eq('target_type', targetType).eq('target_id', targetId)
      if (options?.parent_id) query = query.eq('parent_id', options.parent_id)
      else query = query.is('parent_id', null)
      const { data } = await query.order('created_at', { ascending: true }).limit(options?.limit || 50)
      setComments(data || [])
    } finally { setIsLoading(false) }
  }, [targetType, targetId, options?.parent_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { comments, isLoading, refresh: fetch }
}

export function useCommentsRealtime(targetType?: string, targetId?: string) {
  const [comments, setComments] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!targetType || !targetId) return
    supabase.from('comments').select('*, comment_reactions(*)').eq('target_type', targetType).eq('target_id', targetId).is('parent_id', null).order('created_at', { ascending: true }).then(({ data }) => setComments(data || []))
    const channel = supabase.channel(`comments_${targetType}_${targetId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `target_id=eq.${targetId}` }, () => {
        supabase.from('comments').select('*, comment_reactions(*)').eq('target_type', targetType).eq('target_id', targetId).is('parent_id', null).order('created_at', { ascending: true }).then(({ data }) => setComments(data || []))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [targetType, targetId])
  return { comments }
}

export function useCommentReplies(parentId?: string) {
  const [replies, setReplies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!parentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('comments').select('*, comment_reactions(*)').eq('parent_id', parentId).order('created_at', { ascending: true }); setReplies(data || []) } finally { setIsLoading(false) }
  }, [parentId])
  useEffect(() => { fetch() }, [fetch])
  return { replies, isLoading, refresh: fetch }
}

export function useCommentReactions(commentId?: string) {
  const [reactions, setReactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('comment_reactions').select('*').eq('comment_id', commentId); setReactions(data || []) } finally { setIsLoading(false) }
  }, [commentId])
  useEffect(() => { fetch() }, [fetch])
  return { reactions, isLoading, refresh: fetch }
}

export function useCommentCount(targetType?: string, targetId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!targetType || !targetId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { count: total } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('target_type', targetType).eq('target_id', targetId); setCount(total || 0) } finally { setIsLoading(false) }
  }, [targetType, targetId])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useUserComments(userId?: string, options?: { limit?: number }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('comments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); setComments(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { comments, isLoading, refresh: fetch }
}

export function useReactionSummary(commentId?: string) {
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('comment_reactions').select('reaction_type').eq('comment_id', commentId)
      const counts = data?.reduce((acc: Record<string, number>, r) => { acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1; return acc }, {}) || {}
      setSummary(counts)
    } finally { setIsLoading(false) }
  }, [commentId])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}
