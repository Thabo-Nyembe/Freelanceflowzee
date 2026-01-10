'use client'

/**
 * Extended Semantic Hooks
 * Tables: semantic_embeddings, semantic_indexes, semantic_searches, semantic_clusters
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSemanticEmbedding(embeddingId?: string) {
  const [embedding, setEmbedding] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!embeddingId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('semantic_embeddings').select('*').eq('id', embeddingId).single(); setEmbedding(data) } finally { setIsLoading(false) }
  }, [embeddingId])
  useEffect(() => { fetch() }, [fetch])
  return { embedding, isLoading, refresh: fetch }
}

export function useSemanticEmbeddings(options?: { content_type?: string; limit?: number }) {
  const [embeddings, setEmbeddings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('semantic_embeddings').select('*')
      if (options?.content_type) query = query.eq('content_type', options.content_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setEmbeddings(data || [])
    } finally { setIsLoading(false) }
  }, [options?.content_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { embeddings, isLoading, refresh: fetch }
}

export function useSemanticIndexes(options?: { index_type?: string; is_active?: boolean }) {
  const [indexes, setIndexes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('semantic_indexes').select('*')
      if (options?.index_type) query = query.eq('index_type', options.index_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setIndexes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.index_type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { indexes, isLoading, refresh: fetch }
}

export function useSemanticSearches(options?: { user_id?: string; limit?: number }) {
  const [searches, setSearches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('semantic_searches').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setSearches(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { searches, isLoading, refresh: fetch }
}

export function useSemanticClusters(options?: { index_id?: string; is_active?: boolean }) {
  const [clusters, setClusters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('semantic_clusters').select('*')
      if (options?.index_id) query = query.eq('index_id', options.index_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setClusters(data || [])
    } finally { setIsLoading(false) }
  }, [options?.index_id, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { clusters, isLoading, refresh: fetch }
}
