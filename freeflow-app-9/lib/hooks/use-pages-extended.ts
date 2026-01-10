'use client'

/**
 * Extended Pages Hooks
 * Tables: pages, page_versions, page_blocks, page_seo, page_permissions, page_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePage(pageId?: string) {
  const [page, setPage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pages').select('*, page_blocks(*), page_seo(*), page_versions(*)').eq('id', pageId).single(); setPage(data) } finally { setIsLoading(false) }
  }, [pageId])
  useEffect(() => { fetch() }, [fetch])
  return { page, isLoading, refresh: fetch }
}

export function usePageBySlug(slug?: string, options?: { organization_id?: string }) {
  const [page, setPage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!slug) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('pages').select('*, page_blocks(*), page_seo(*)').eq('slug', slug).eq('status', 'published')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query.single()
      setPage(data)
    } finally { setIsLoading(false) }
  }, [slug, options?.organization_id])
  useEffect(() => { fetch() }, [fetch])
  return { page, isLoading, refresh: fetch }
}

export function usePages(options?: { organization_id?: string; author_id?: string; type?: string; status?: string; parent_id?: string | null; search?: string; limit?: number }) {
  const [pages, setPages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('pages').select('*, page_seo(*)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.parent_id !== undefined) { options.parent_id ? query = query.eq('parent_id', options.parent_id) : query = query.is('parent_id', null) }
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPages(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.author_id, options?.type, options?.status, options?.parent_id, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { pages, isLoading, refresh: fetch }
}

export function usePageBlocks(pageId?: string) {
  const [blocks, setBlocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('page_blocks').select('*').eq('page_id', pageId).order('order', { ascending: true }); setBlocks(data || []) } finally { setIsLoading(false) }
  }, [pageId])
  useEffect(() => { fetch() }, [fetch])
  return { blocks, isLoading, refresh: fetch }
}

export function usePageVersions(pageId?: string, options?: { limit?: number }) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('page_versions').select('*').eq('page_id', pageId).order('created_at', { ascending: false }).limit(options?.limit || 20); setVersions(data || []) } finally { setIsLoading(false) }
  }, [pageId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function usePageSeo(pageId?: string) {
  const [seo, setSeo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('page_seo').select('*').eq('page_id', pageId).single(); setSeo(data) } finally { setIsLoading(false) }
  }, [pageId])
  useEffect(() => { fetch() }, [fetch])
  return { seo, isLoading, refresh: fetch }
}

export function usePagePermissions(pageId?: string) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('page_permissions').select('*').eq('page_id', pageId); setPermissions(data || []) } finally { setIsLoading(false) }
  }, [pageId])
  useEffect(() => { fetch() }, [fetch])
  return { permissions, isLoading, refresh: fetch }
}

export function usePageAnalytics(pageId?: string, options?: { from_date?: string; to_date?: string }) {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('page_analytics').select('*').eq('page_id', pageId)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      const { data } = await query.order('recorded_at', { ascending: false })
      setAnalytics(data || [])
    } finally { setIsLoading(false) }
  }, [pageId, options?.from_date, options?.to_date])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}

export function useChildPages(parentId?: string) {
  const [pages, setPages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!parentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pages').select('*').eq('parent_id', parentId).order('title', { ascending: true }); setPages(data || []) } finally { setIsLoading(false) }
  }, [parentId])
  useEffect(() => { fetch() }, [fetch])
  return { pages, isLoading, refresh: fetch }
}

export function usePublishedPages(organizationId?: string, options?: { type?: string; limit?: number }) {
  const [pages, setPages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('pages').select('*, page_seo(*)').eq('status', 'published')
      if (organizationId) query = query.eq('organization_id', organizationId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('published_at', { ascending: false }).limit(options?.limit || 50)
      setPages(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { pages, isLoading, refresh: fetch }
}
