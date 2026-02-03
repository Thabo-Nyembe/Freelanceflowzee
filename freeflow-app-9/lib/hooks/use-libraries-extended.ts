'use client'

/**
 * Extended Libraries Hooks
 * Tables: libraries, library_items, library_collections, library_shares, library_favorites, library_tags
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLibrary(libraryId?: string) {
  const [library, setLibrary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!libraryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('libraries').select('*, library_collections(*)').eq('id', libraryId).single(); setLibrary(data) } finally { setIsLoading(false) }
  }, [libraryId])
  useEffect(() => { loadData() }, [loadData])
  return { library, isLoading, refresh: loadData }
}

export function useUserLibraries(userId?: string, options?: { type?: string; is_public?: boolean }) {
  const [libraries, setLibraries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('libraries').select('*').eq('owner_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('name', { ascending: true })
      setLibraries(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.is_public])
  useEffect(() => { loadData() }, [loadData])
  return { libraries, isLoading, refresh: loadData }
}

export function useLibraryItems(libraryId?: string, options?: { type?: string; collection_id?: string; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!libraryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('library_items').select('*, library_tags(*)').eq('library_id', libraryId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.collection_id) query = query.eq('collection_id', options.collection_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [libraryId, options?.type, options?.collection_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function useLibraryItem(itemId?: string) {
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('library_items').select('*, libraries(*), library_tags(*)').eq('id', itemId).single(); setItem(data) } finally { setIsLoading(false) }
  }, [itemId])
  useEffect(() => { loadData() }, [loadData])
  return { item, isLoading, refresh: loadData }
}

export function useLibraryCollections(libraryId?: string) {
  const [collections, setCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!libraryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('library_collections').select('*').eq('library_id', libraryId).order('name', { ascending: true }); setCollections(data || []) } finally { setIsLoading(false) }
  }, [libraryId])
  useEffect(() => { loadData() }, [loadData])
  return { collections, isLoading, refresh: loadData }
}

export function useSharedLibraries(userId?: string) {
  const [libraries, setLibraries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('library_shares').select('*, libraries(*)').eq('shared_with', userId).order('shared_at', { ascending: false }); setLibraries(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { libraries, isLoading, refresh: loadData }
}

export function useLibraryFavorites(userId?: string, options?: { limit?: number }) {
  const [favorites, setFavorites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('library_favorites').select('*, library_items(*, libraries(*))').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); setFavorites(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { favorites, isLoading, refresh: loadData }
}

export function useIsFavorite(userId?: string, itemId?: string) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('library_favorites').select('id').eq('user_id', userId).eq('item_id', itemId).single(); setIsFavorite(!!data) } finally { setIsLoading(false) }
  }, [userId, itemId])
  useEffect(() => { check() }, [check])
  return { isFavorite, isLoading, recheck: check }
}

export function useLibrarySearch(libraryId?: string, query?: string, options?: { limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!libraryId || !query || query.length < 2) { setResults([]); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('library_items').select('*').eq('library_id', libraryId).ilike('title', `%${query}%`).order('created_at', { ascending: false }).limit(options?.limit || 20); setResults(data || []) } finally { setIsLoading(false) }
  }, [libraryId, query, options?.limit])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function usePublicLibraries(options?: { type?: string; limit?: number }) {
  const [libraries, setLibraries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('libraries').select('*').eq('is_public', true)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('item_count', { ascending: false }).limit(options?.limit || 20)
      setLibraries(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { libraries, isLoading, refresh: loadData }
}

export function useLibraryTags(libraryId?: string) {
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!libraryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('library_tags').select('tag, count').eq('library_id', libraryId).order('count', { ascending: false }); setTags(data || []) } finally { setIsLoading(false) }
  }, [libraryId])
  useEffect(() => { loadData() }, [loadData])
  return { tags, isLoading, refresh: loadData }
}
