'use client'

/**
 * Extended KB (Knowledge Base) Hooks - Covers all 12 KB-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useKBArticles(categoryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('kb_articles').select('*').order('created_at', { ascending: false })
      if (categoryId) query = query.eq('category_id', categoryId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [categoryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBArticleFeedback(articleId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!articleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('kb_article_feedback').select('*').eq('article_id', articleId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [articleId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBArticleVersions(articleId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!articleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('kb_article_versions').select('*').eq('article_id', articleId).order('version_number', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [articleId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBArticleViews(articleId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!articleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('kb_article_views').select('*').eq('article_id', articleId).order('viewed_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [articleId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBBookmarks(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('kb_bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBCategories() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data: result } = await supabase.from('kb_categories').select('*').order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBFaqs(categoryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('kb_faqs').select('*').order('order_index', { ascending: true })
      if (categoryId) query = query.eq('category_id', categoryId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [categoryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBSearchQueries(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('kb_search_queries').select('*').eq('user_id', userId).order('searched_at', { ascending: false }).limit(50); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBSuggestedTopics() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data: result } = await supabase.from('kb_suggested_topics').select('*').eq('is_active', true).order('priority', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBVideoFeedback(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('kb_video_feedback').select('*').eq('video_id', videoId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [videoId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBVideoTutorials(categoryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('kb_video_tutorials').select('*').order('created_at', { ascending: false })
      if (categoryId) query = query.eq('category_id', categoryId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [categoryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useKBVideoViews(videoId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!videoId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('kb_video_views').select('*').eq('video_id', videoId).order('viewed_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [videoId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
