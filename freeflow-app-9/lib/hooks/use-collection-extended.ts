'use client'

/**
 * Extended Collection Hooks
 * Tables: collections, collection_items, collection_shares, collection_tags
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCollection(collectionId?: string) {
  const [collection, setCollection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!collectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('collections').select('*, collection_items(*), collection_tags(*)').eq('id', collectionId).single(); setCollection(data) } finally { setIsLoading(false) }
  }, [collectionId])
  useEffect(() => { fetch() }, [fetch])
  return { collection, isLoading, refresh: fetch }
}

export function useCollections(options?: { user_id?: string; type?: string; visibility?: string; limit?: number }) {
  const [collections, setCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('collections').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.visibility) query = query.eq('visibility', options.visibility)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setCollections(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.visibility, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { collections, isLoading, refresh: fetch }
}

export function useCollectionItems(collectionId?: string, options?: { item_type?: string; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!collectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('collection_items').select('*').eq('collection_id', collectionId)
      if (options?.item_type) query = query.eq('item_type', options.item_type)
      const { data } = await query.order('position', { ascending: true }).limit(options?.limit || 100)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [collectionId, options?.item_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useCollectionTags(collectionId?: string) {
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!collectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('collection_tags').select('tag').eq('collection_id', collectionId); setTags(data?.map(t => t.tag) || []) } finally { setIsLoading(false) }
  }, [collectionId])
  useEffect(() => { fetch() }, [fetch])
  return { tags, isLoading, refresh: fetch }
}

export function useSharedCollections(userId?: string) {
  const [collections, setCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('collection_shares').select('*, collections(*)').eq('shared_with_id', userId); setCollections(data?.map(s => ({ ...s.collections, permission: s.permission })) || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { collections, isLoading, refresh: fetch }
}

export function usePublicCollections(options?: { type?: string; limit?: number }) {
  const [collections, setCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('collections').select('*').eq('visibility', 'public')
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('item_count', { ascending: false }).limit(options?.limit || 50)
      setCollections(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { collections, isLoading, refresh: fetch }
}

export function useCollectionStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; totalItems: number; byType: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('collections').select('type, item_count').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const total = data.length
      const totalItems = data.reduce((sum, c) => sum + (c.item_count || 0), 0)
      const byType = data.reduce((acc: Record<string, number>, c) => { acc[c.type || 'other'] = (acc[c.type || 'other'] || 0) + 1; return acc }, {})
      setStats({ total, totalItems, byType })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
