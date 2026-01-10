'use client'

/**
 * Extended Posts Hooks
 * Tables: posts, post_comments, post_likes, post_shares, post_tags, post_media, post_reactions, post_mentions, post_drafts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePost(postId?: string) {
  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!postId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('posts').select('*, users(*), post_comments(count), post_likes(count), post_shares(count), post_media(*), post_tags(*)').eq('id', postId).single(); setPost(data) } finally { setIsLoading(false) }
  }, [postId])
  useEffect(() => { fetch() }, [fetch])
  return { post, isLoading, refresh: fetch }
}

export function usePosts(options?: { author_id?: string; type?: string; visibility?: string; status?: string; search?: string; limit?: number }) {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('posts').select('*, users(*), post_comments(count), post_likes(count), post_media(*)')
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.visibility) query = query.eq('visibility', options.visibility)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.ilike('content', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPosts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.author_id, options?.type, options?.visibility, options?.status, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { posts, isLoading, refresh: fetch }
}

export function usePostComments(postId?: string, options?: { parent_id?: string; limit?: number }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!postId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('post_comments').select('*, users(*), post_comments(count)').eq('post_id', postId)
      if (options?.parent_id) { query = query.eq('parent_id', options.parent_id) } else { query = query.is('parent_id', null) }
      const { data } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100)
      setComments(data || [])
    } finally { setIsLoading(false) }
  }, [postId, options?.parent_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { comments, isLoading, refresh: fetch }
}

export function usePostLikes(postId?: string) {
  const [likes, setLikes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!postId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('post_likes').select('*, users(*)').eq('post_id', postId).order('created_at', { ascending: false }); setLikes(data || []) } finally { setIsLoading(false) }
  }, [postId])
  useEffect(() => { fetch() }, [fetch])
  return { likes, isLoading, refresh: fetch }
}

export function useHasLiked(postId?: string, userId?: string) {
  const [hasLiked, setHasLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!postId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('post_likes').select('id').eq('post_id', postId).eq('user_id', userId).single(); setHasLiked(!!data) } finally { setIsLoading(false) }
  }, [postId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { hasLiked, isLoading, refresh: fetch }
}

export function usePostReactions(postId?: string) {
  const [reactions, setReactions] = useState<{ [key: string]: number }>({})
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!postId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('post_reactions').select('reaction_type').eq('post_id', postId)
      const counts: { [key: string]: number } = {}
      data?.forEach(r => { counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1 })
      setReactions(counts)
    } finally { setIsLoading(false) }
  }, [postId])
  useEffect(() => { fetch() }, [fetch])
  return { reactions, userReaction, isLoading, refresh: fetch }
}

export function usePostShares(postId?: string) {
  const [shares, setShares] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!postId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('post_shares').select('*, users(*)').eq('post_id', postId).order('created_at', { ascending: false }); setShares(data || []) } finally { setIsLoading(false) }
  }, [postId])
  useEffect(() => { fetch() }, [fetch])
  return { shares, isLoading, refresh: fetch }
}

export function usePostDrafts(userId?: string) {
  const [drafts, setDrafts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('post_drafts').select('*').eq('author_id', userId).order('updated_at', { ascending: false }); setDrafts(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { drafts, isLoading, refresh: fetch }
}

export function useFeed(userId?: string, options?: { limit?: number }) {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('posts').select('*, users(*), post_comments(count), post_likes(count), post_media(*)').eq('status', 'published').in('visibility', ['public', 'followers']).order('created_at', { ascending: false }).limit(options?.limit || 20)
      setPosts(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { posts, isLoading, refresh: fetch }
}

export function usePostsByTag(tag?: string, options?: { limit?: number }) {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tag) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: taggedPosts } = await supabase.from('post_tags').select('post_id').eq('tag', tag)
      const postIds = taggedPosts?.map(t => t.post_id) || []
      if (postIds.length === 0) { setPosts([]); setIsLoading(false); return }
      const { data } = await supabase.from('posts').select('*, users(*), post_media(*)').in('id', postIds).eq('status', 'published').order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPosts(data || [])
    } finally { setIsLoading(false) }
  }, [tag, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { posts, isLoading, refresh: fetch }
}

export function useMyPosts(userId?: string, options?: { status?: string; limit?: number }) {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('posts').select('*, post_comments(count), post_likes(count), post_media(*)').eq('author_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPosts(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { posts, isLoading, refresh: fetch }
}
