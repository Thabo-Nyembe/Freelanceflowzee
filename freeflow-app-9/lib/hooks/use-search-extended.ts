'use client'

/**
 * Extended Search Hooks - Covers all Search-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSearchHistory(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('search_queries').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSavedSearches(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('saved_searches').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!query || query.length < 2) { setSuggestions([]); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('search_queries').select('query').ilike('query', `${query}%`).limit(5)
      const unique = [...new Set(data?.map(s => s.query) || [])]
      setSuggestions(unique)
    } finally { setIsLoading(false) }
  }, [query])
  useEffect(() => { fetch() }, [fetch])
  return { suggestions, isLoading }
}
