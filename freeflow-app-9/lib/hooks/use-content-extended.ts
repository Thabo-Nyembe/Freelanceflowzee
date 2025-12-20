'use client'

/**
 * Extended Content Hooks - Covers all Content-related tables
 * Tables: content, content_blocks, content_versions, content_categories
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useContent(contentId?: string) {
  const [content, setContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!contentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('content').select('*, content_blocks(*), content_categories(*)').eq('id', contentId).single()
      setContent(data)
    } finally { setIsLoading(false) }
  }, [contentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { content, isLoading, refresh: fetch }
}

export function useContentBySlug(slug?: string) {
  const [content, setContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!slug) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('content').select('*, content_blocks(*), content_categories(*)').eq('slug', slug).single()
      setContent(data)
    } finally { setIsLoading(false) }
  }, [slug, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { content, isLoading, refresh: fetch }
}

export function useContents(filters?: { user_id?: string; content_type?: string; status?: string; category_id?: string; tag?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('content').select('*, content_categories(*)')
      if (filters?.user_id) query = query.eq('user_id', filters.user_id)
      if (filters?.content_type) query = query.eq('content_type', filters.content_type)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.category_id) query = query.eq('category_id', filters.category_id)
      if (filters?.tag) query = query.contains('tags', [filters.tag])
      const { data: result } = await query.order('created_at', { ascending: false }).limit(filters?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [filters?.user_id, filters?.content_type, filters?.status, filters?.category_id, filters?.tag, filters?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePublishedContent(options?: { content_type?: string; category_id?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('content').select('*, content_categories(*)').eq('status', 'published')
      if (options?.content_type) query = query.eq('content_type', options.content_type)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      const { data: result } = await query.order('published_at', { ascending: false }).limit(options?.limit || 20)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.content_type, options?.category_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useContentBlocks(contentId?: string) {
  const [blocks, setBlocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!contentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('content_blocks').select('*').eq('content_id', contentId).order('order', { ascending: true })
      setBlocks(data || [])
    } finally { setIsLoading(false) }
  }, [contentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { blocks, isLoading, refresh: fetch }
}

export function useContentVersions(contentId?: string, options?: { limit?: number }) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!contentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('content_versions').select('*').eq('content_id', contentId).order('version_number', { ascending: false }).limit(options?.limit || 20)
      setVersions(data || [])
    } finally { setIsLoading(false) }
  }, [contentId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useContentCategories(options?: { parent_id?: string | null }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('content_categories').select('*')
      if (options?.parent_id === null) {
        query = query.is('parent_id', null)
      } else if (options?.parent_id) {
        query = query.eq('parent_id', options.parent_id)
      }
      const { data } = await query.order('name', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.parent_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useContentCategory(categoryId?: string) {
  const [category, setCategory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!categoryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('content_categories').select('*').eq('id', categoryId).single()
      setCategory(data)
    } finally { setIsLoading(false) }
  }, [categoryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { category, isLoading, refresh: fetch }
}

export function useContentSearch(searchTerm: string, options?: { content_type?: string; status?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let query = supabase.from('content').select('*, content_categories(*)').or(`title.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
      if (options?.content_type) query = query.eq('content_type', options.content_type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [searchTerm, options?.content_type, options?.status, options?.limit, supabase])
  useEffect(() => {
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [search])
  return { results, isLoading }
}

export function useContentStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; published: number; draft: number; totalViews: number; totalLikes: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: contents } = await supabase.from('content').select('status, view_count, like_count').eq('user_id', userId)
      if (!contents) { setStats(null); return }
      const total = contents.length
      const published = contents.filter(c => c.status === 'published').length
      const draft = contents.filter(c => c.status === 'draft').length
      const totalViews = contents.reduce((sum, c) => sum + (c.view_count || 0), 0)
      const totalLikes = contents.reduce((sum, c) => sum + (c.like_count || 0), 0)
      setStats({ total, published, draft, totalViews, totalLikes })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function usePopularContent(options?: { content_type?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('content').select('*, content_categories(*)').eq('status', 'published')
      if (options?.content_type) query = query.eq('content_type', options.content_type)
      const { data: result } = await query.order('view_count', { ascending: false }).limit(options?.limit || 10)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.content_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useRelatedContent(contentId?: string, options?: { limit?: number }) {
  const [related, setRelated] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!contentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: current } = await supabase.from('content').select('category_id, tags, content_type').eq('id', contentId).single()
      if (!current) { setRelated([]); return }
      let query = supabase.from('content').select('*, content_categories(*)').neq('id', contentId).eq('status', 'published')
      if (current.category_id) query = query.eq('category_id', current.category_id)
      if (current.content_type) query = query.eq('content_type', current.content_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 5)
      setRelated(data || [])
    } finally { setIsLoading(false) }
  }, [contentId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { related, isLoading, refresh: fetch }
}
