'use client'

/**
 * Extended Page Hooks
 * Tables: pages, page_versions, page_components, page_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePage(pageId?: string) {
  const [page, setPage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pages').select('*').eq('id', pageId).single(); setPage(data) } finally { setIsLoading(false) }
  }, [pageId])
  useEffect(() => { loadData() }, [loadData])
  return { page, isLoading, refresh: loadData }
}

export function usePageBySlug(slug?: string) {
  const [page, setPage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!slug) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pages').select('*').eq('slug', slug).single(); setPage(data) } finally { setIsLoading(false) }
  }, [slug])
  useEffect(() => { loadData() }, [loadData])
  return { page, isLoading, refresh: loadData }
}

export function usePages(options?: { user_id?: string; is_published?: boolean; template_id?: string; limit?: number }) {
  const [pages, setPages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('pages').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published)
      if (options?.template_id) query = query.eq('template_id', options.template_id)
      const { data } = await query.order('title', { ascending: true }).limit(options?.limit || 50)
      setPages(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.is_published, options?.template_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { pages, isLoading, refresh: loadData }
}

export function usePageVersions(pageId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('page_versions').select('*').eq('page_id', pageId).order('version', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [pageId])
  useEffect(() => { loadData() }, [loadData])
  return { versions, isLoading, refresh: loadData }
}

export function usePublishedPages(options?: { limit?: number }) {
  const [pages, setPages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('pages').select('*').eq('is_published', true).order('title', { ascending: true }).limit(options?.limit || 50); setPages(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { pages, isLoading, refresh: loadData }
}

export function useMyPages(userId?: string, options?: { limit?: number }) {
  const [pages, setPages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pages').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(options?.limit || 50); setPages(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { pages, isLoading, refresh: loadData }
}
