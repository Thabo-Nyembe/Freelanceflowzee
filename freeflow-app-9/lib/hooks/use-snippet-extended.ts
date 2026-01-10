'use client'

/**
 * Extended Snippet Hooks - Covers all Snippet-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSnippet(snippetId?: string) {
  const [snippet, setSnippet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!snippetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('snippets').select('*').eq('id', snippetId).single()
      setSnippet(data)
    } finally { setIsLoading(false) }
  }, [snippetId])
  useEffect(() => { fetch() }, [fetch])
  return { snippet, isLoading, refresh: fetch }
}

export function useSnippets(options?: { language?: string; category?: string; isPublic?: boolean; tags?: string[] }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('snippets').select('*')
      if (options?.language) query = query.eq('language', options.language)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.isPublic !== undefined) query = query.eq('is_public', options.isPublic)
      if (options?.tags?.length) query = query.overlaps('tags', options.tags)
      const { data: result } = await query.order('usage_count', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.language, options?.category, options?.isPublic, options?.tags, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePopularSnippets(limit = 20, language?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('snippets').select('*').eq('is_public', true)
      if (language) query = query.eq('language', language)
      const { data: result } = await query.order('usage_count', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [limit, language, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSnippetSearch(searchTerm: string, language?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setData([]); return }
    setIsLoading(true)
    try {
      let query = supabase.from('snippets').select('*').or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
      if (language) query = query.eq('language', language)
      const { data: result } = await query.order('usage_count', { ascending: false }).limit(50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [searchTerm, language, supabase])
  useEffect(() => { const timer = setTimeout(search, 300); return () => clearTimeout(timer) }, [search])
  return { data, isLoading }
}

export function useMySnippets(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('snippets').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
