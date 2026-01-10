'use client'

/**
 * Extended Forums Hooks
 * Tables: forums, forum_categories, forum_topics, forum_posts, forum_reactions, forum_moderators
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useForum(forumId?: string) {
  const [forum, setForum] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!forumId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forums').select('*, forum_categories(*), forum_moderators(*)').eq('id', forumId).single(); setForum(data) } finally { setIsLoading(false) }
  }, [forumId])
  useEffect(() => { fetch() }, [fetch])
  return { forum, isLoading, refresh: fetch }
}

export function useForums(options?: { is_active?: boolean; is_private?: boolean; limit?: number }) {
  const [forums, setForums] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('forums').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.is_private !== undefined) query = query.eq('is_private', options.is_private)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setForums(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.is_private, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { forums, isLoading, refresh: fetch }
}

export function useForumCategories(forumId?: string) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!forumId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forum_categories').select('*').eq('forum_id', forumId).order('order', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [forumId])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useTopic(topicId?: string) {
  const [topic, setTopic] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!topicId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forum_topics').select('*, forum_posts(*)').eq('id', topicId).single(); setTopic(data) } finally { setIsLoading(false) }
  }, [topicId])
  useEffect(() => { fetch() }, [fetch])
  return { topic, isLoading, refresh: fetch }
}

export function useTopics(options?: { forum_id?: string; category_id?: string; author_id?: string; is_pinned?: boolean; limit?: number }) {
  const [topics, setTopics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('forum_topics').select('*')
      if (options?.forum_id) query = query.eq('forum_id', options.forum_id)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.is_pinned !== undefined) query = query.eq('is_pinned', options.is_pinned)
      const { data } = await query.order('is_pinned', { ascending: false }).order('last_activity_at', { ascending: false }).limit(options?.limit || 50)
      setTopics(data || [])
    } finally { setIsLoading(false) }
  }, [options?.forum_id, options?.category_id, options?.author_id, options?.is_pinned, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { topics, isLoading, refresh: fetch }
}

export function useTopicPosts(topicId?: string, options?: { limit?: number; offset?: number }) {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!topicId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('forum_posts').select('*, forum_reactions(*)').eq('topic_id', topicId).order('created_at', { ascending: true }).range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1)
      setPosts(data || [])
    } finally { setIsLoading(false) }
  }, [topicId, options?.limit, options?.offset, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { posts, isLoading, refresh: fetch }
}

export function useForumModerators(forumId?: string) {
  const [moderators, setModerators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!forumId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forum_moderators').select('*').eq('forum_id', forumId); setModerators(data || []) } finally { setIsLoading(false) }
  }, [forumId])
  useEffect(() => { fetch() }, [fetch])
  return { moderators, isLoading, refresh: fetch }
}

export function useIsModerator(forumId?: string, userId?: string) {
  const [isModerator, setIsModerator] = useState(false)
  const [permissions, setPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!forumId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forum_moderators').select('*').eq('forum_id', forumId).eq('user_id', userId).single(); setIsModerator(!!data); setPermissions(data?.permissions || []) } finally { setIsLoading(false) }
  }, [forumId, userId, supabase])
  useEffect(() => { check() }, [check])
  return { isModerator, permissions, isLoading, recheck: check }
}

export function useRecentTopics(limit?: number) {
  const [topics, setTopics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('forum_topics').select('*, forums(*)').order('created_at', { ascending: false }).limit(limit || 20); setTopics(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { topics, isLoading, refresh: fetch }
}

export function usePopularTopics(limit?: number) {
  const [topics, setTopics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('forum_topics').select('*, forums(*)').order('view_count', { ascending: false }).limit(limit || 10); setTopics(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { topics, isLoading, refresh: fetch }
}

export function useUserTopics(userId?: string, options?: { limit?: number }) {
  const [topics, setTopics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forum_topics').select('*, forums(*)').eq('author_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 20); setTopics(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { topics, isLoading, refresh: fetch }
}
