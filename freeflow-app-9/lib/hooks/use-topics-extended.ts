'use client'

/**
 * Extended Topics Hooks
 * Tables: topics, topic_posts, topic_followers, topic_moderators, topic_tags, topic_statistics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTopic(topicId?: string) {
  const [topic, setTopic] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!topicId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('topics').select('*, topic_tags(*), topic_moderators(*, users(*)), topic_statistics(*)').eq('id', topicId).single(); setTopic(data) } finally { setIsLoading(false) }
  }, [topicId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { topic, isLoading, refresh: fetch }
}

export function useTopicBySlug(slug?: string) {
  const [topic, setTopic] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!slug) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('topics').select('*, topic_tags(*), topic_statistics(*)').eq('slug', slug).single(); setTopic(data) } finally { setIsLoading(false) }
  }, [slug, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { topic, isLoading, refresh: fetch }
}

export function useTopics(options?: { category?: string; parent_id?: string | null; status?: string; is_private?: boolean; search?: string; limit?: number }) {
  const [topics, setTopics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('topics').select('*, topic_statistics(*)')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.parent_id !== undefined) {
        if (options.parent_id === null) query = query.is('parent_id', null)
        else query = query.eq('parent_id', options.parent_id)
      }
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_private !== undefined) query = query.eq('is_private', options.is_private)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setTopics(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.parent_id, options?.status, options?.is_private, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { topics, isLoading, refresh: fetch }
}

export function useTopicPosts(topicId?: string, options?: { post_type?: string; author_id?: string; is_pinned?: boolean; limit?: number }) {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!topicId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('topic_posts').select('*, users(*)').eq('topic_id', topicId)
      if (options?.post_type) query = query.eq('post_type', options.post_type)
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.is_pinned !== undefined) query = query.eq('is_pinned', options.is_pinned)
      const { data } = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPosts(data || [])
    } finally { setIsLoading(false) }
  }, [topicId, options?.post_type, options?.author_id, options?.is_pinned, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { posts, isLoading, refresh: fetch }
}

export function useTopicFollowers(topicId?: string, options?: { limit?: number }) {
  const [followers, setFollowers] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!topicId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data, count: totalCount } = await supabase.from('topic_followers').select('*, users(*)', { count: 'exact' }).eq('topic_id', topicId).order('followed_at', { ascending: false }).limit(options?.limit || 50)
      setFollowers(data || [])
      setCount(totalCount || 0)
    } finally { setIsLoading(false) }
  }, [topicId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { followers, count, isLoading, refresh: fetch }
}

export function useIsFollowing(topicId?: string, userId?: string) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!topicId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('topic_followers').select('id').eq('topic_id', topicId).eq('user_id', userId).single(); setIsFollowing(!!data) } finally { setIsLoading(false) }
  }, [topicId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { isFollowing, isLoading, refresh: fetch }
}

export function useUserFollowedTopics(userId?: string, options?: { category?: string; limit?: number }) {
  const [topics, setTopics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: follows } = await supabase.from('topic_followers').select('topic_id').eq('user_id', userId)
      if (!follows || follows.length === 0) { setTopics([]); return }
      const topicIds = follows.map(f => f.topic_id)
      let query = supabase.from('topics').select('*, topic_statistics(*)').in('id', topicIds)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setTopics(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.category, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { topics, isLoading, refresh: fetch }
}

export function useTopicModerators(topicId?: string) {
  const [moderators, setModerators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!topicId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('topic_moderators').select('*, users(*)').eq('topic_id', topicId).order('added_at', { ascending: true }); setModerators(data || []) } finally { setIsLoading(false) }
  }, [topicId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { moderators, isLoading, refresh: fetch }
}

export function useIsModerator(topicId?: string, userId?: string) {
  const [isModerator, setIsModerator] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!topicId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('topic_moderators').select('role').eq('topic_id', topicId).eq('user_id', userId).single(); setIsModerator(!!data); setRole(data?.role || null) } finally { setIsLoading(false) }
  }, [topicId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { isModerator, role, isLoading, refresh: fetch }
}

export function useTopicTags(topicId?: string) {
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!topicId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('topic_tags').select('tag').eq('topic_id', topicId); setTags((data || []).map(t => t.tag)) } finally { setIsLoading(false) }
  }, [topicId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tags, isLoading, refresh: fetch }
}

export function usePopularTopics(options?: { category?: string; limit?: number }) {
  const [topics, setTopics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('topics').select('*, topic_statistics(*)').eq('status', 'active').eq('is_private', false)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('follower_count', { ascending: false }).limit(options?.limit || 20)
      setTopics(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { topics, isLoading, refresh: fetch }
}

export function useTopicCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('topics').select('category').not('category', 'is', null).eq('status', 'active')
      const unique = [...new Set(data?.map(t => t.category).filter(Boolean))]
      setCategories(unique)
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useSubTopics(parentId?: string) {
  const [topics, setTopics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!parentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('topics').select('*, topic_statistics(*)').eq('parent_id', parentId).order('name', { ascending: true }); setTopics(data || []) } finally { setIsLoading(false) }
  }, [parentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { topics, isLoading, refresh: fetch }
}
