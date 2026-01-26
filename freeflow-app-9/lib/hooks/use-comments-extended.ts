'use client'

/**
 * Extended Comments Hooks
 * Tables: comments, comment_replies, comment_reactions, comment_mentions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

/**
 * Comment reaction record from the comment_reactions table
 */
export interface CommentReactionRecord {
  id: string
  comment_id: string
  user_id: string
  reaction_type: string
  created_at: string
}

/**
 * Comment reply record from the comment_replies table
 */
export interface CommentReplyRecord {
  id: string
  comment_id: string
  user_id: string
  content: string
  created_at: string
  updated_at?: string
}

/**
 * Extended comment record with relations
 */
export interface ExtendedCommentRecord {
  id: string
  user_id: string
  target_type: string
  target_id: string
  parent_id?: string | null
  content: string
  created_at: string
  updated_at?: string
  metadata?: Record<string, JsonValue>
  comment_replies?: CommentReplyRecord[]
  comment_reactions?: CommentReactionRecord[]
}

/**
 * Comment with reactions for list views
 */
export interface CommentWithReactions {
  id: string
  user_id: string
  target_type: string
  target_id: string
  parent_id?: string | null
  content: string
  created_at: string
  updated_at?: string
  metadata?: Record<string, JsonValue>
  comment_reactions?: CommentReactionRecord[]
}

export function useComment(commentId?: string) {
  const [comment, setComment] = useState<ExtendedCommentRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('comments').select('*, comment_replies(*), comment_reactions(*)').eq('id', commentId).single(); setComment(data as ExtendedCommentRecord | null) } finally { setIsLoading(false) }
  }, [commentId])
  useEffect(() => { fetch() }, [fetch])
  return { comment, isLoading, refresh: fetch }
}

export function useComments(targetType?: string, targetId?: string, options?: { parent_id?: string; limit?: number }) {
  const [comments, setComments] = useState<CommentWithReactions[]>([])
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
      setComments((data as CommentWithReactions[]) || [])
    } finally { setIsLoading(false) }
  }, [targetType, targetId, options?.parent_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { comments, isLoading, refresh: fetch }
}

export function useCommentsRealtime(targetType?: string, targetId?: string) {
  const [comments, setComments] = useState<CommentWithReactions[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!targetType || !targetId) return
    supabase.from('comments').select('*, comment_reactions(*)').eq('target_type', targetType).eq('target_id', targetId).is('parent_id', null).order('created_at', { ascending: true }).then(({ data }) => setComments((data as CommentWithReactions[]) || []))
    const channel = supabase.channel(`comments_${targetType}_${targetId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `target_id=eq.${targetId}` }, () => {
        supabase.from('comments').select('*, comment_reactions(*)').eq('target_type', targetType).eq('target_id', targetId).is('parent_id', null).order('created_at', { ascending: true }).then(({ data }) => setComments((data as CommentWithReactions[]) || []))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [targetType, targetId])
  return { comments }
}

export function useCommentReplies(parentId?: string) {
  const [replies, setReplies] = useState<CommentWithReactions[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!parentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('comments').select('*, comment_reactions(*)').eq('parent_id', parentId).order('created_at', { ascending: true }); setReplies((data as CommentWithReactions[]) || []) } finally { setIsLoading(false) }
  }, [parentId])
  useEffect(() => { fetch() }, [fetch])
  return { replies, isLoading, refresh: fetch }
}

export function useCommentReactions(commentId?: string) {
  const [reactions, setReactions] = useState<CommentReactionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!commentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('comment_reactions').select('*').eq('comment_id', commentId); setReactions((data as CommentReactionRecord[]) || []) } finally { setIsLoading(false) }
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

/**
 * User comment record for user-specific queries
 */
export interface UserCommentRecord {
  id: string
  user_id: string
  target_type?: string
  target_id?: string
  resource_type?: string
  resource_id?: string
  parent_id?: string | null
  content: string
  created_at: string
  updated_at?: string
  metadata?: Record<string, JsonValue>
}

export function useUserComments(userId?: string, options?: { limit?: number }) {
  const [comments, setComments] = useState<UserCommentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('comments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); setComments((data as UserCommentRecord[]) || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { comments, isLoading, refresh: fetch }
}

/**
 * Reaction type from query result
 */
interface ReactionTypeResult {
  reaction_type: string
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
      const counts = (data as ReactionTypeResult[] | null)?.reduce((acc: Record<string, number>, r: ReactionTypeResult) => { acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1; return acc }, {}) || {}
      setSummary(counts)
    } finally { setIsLoading(false) }
  }, [commentId])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}
