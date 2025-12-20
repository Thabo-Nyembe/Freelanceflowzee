'use client'

/**
 * Extended Reactions Hooks
 * Tables: reactions, reaction_types, reaction_summaries, reaction_history, reaction_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReaction(reactionId?: string) {
  const [reaction, setReaction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!reactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('reactions').select('*, reaction_types(*), users(*)').eq('id', reactionId).single(); setReaction(data) } finally { setIsLoading(false) }
  }, [reactionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reaction, isLoading, refresh: fetch }
}

export function useReactions(options: { entity_type: string; entity_id: string; reaction_type?: string; limit?: number }) {
  const [reactions, setReactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('reactions').select('*, users(*)').eq('entity_type', options.entity_type).eq('entity_id', options.entity_id)
      if (options.reaction_type) query = query.eq('reaction_type', options.reaction_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options.limit || 100)
      setReactions(data || [])
    } finally { setIsLoading(false) }
  }, [options.entity_type, options.entity_id, options.reaction_type, options.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reactions, isLoading, refresh: fetch }
}

export function useReactionSummary(entityType?: string, entityId?: string) {
  const [summary, setSummary] = useState<{ total_reactions: number; reaction_counts: { [key: string]: number } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reaction_summaries').select('*').eq('entity_type', entityType).eq('entity_id', entityId).single()
      setSummary(data || { total_reactions: 0, reaction_counts: {} })
    } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useUserReaction(entityType?: string, entityId?: string, userId?: string) {
  const [reaction, setReaction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reactions').select('reaction_type').eq('entity_type', entityType).eq('entity_id', entityId).eq('user_id', userId).single()
      setReaction(data?.reaction_type || null)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reaction, isLoading, refresh: fetch }
}

export function useReactionTypes(options?: { category?: string; is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('reaction_types').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('order', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}

export function useBulkReactions(entityType?: string, entityIds?: string[]) {
  const [summaryMap, setSummaryMap] = useState<{ [key: string]: any }>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityIds || entityIds.length === 0) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reaction_summaries').select('*').eq('entity_type', entityType).in('entity_id', entityIds)
      const map: { [key: string]: any } = {}
      data?.forEach(s => { map[s.entity_id] = s })
      setSummaryMap(map)
    } finally { setIsLoading(false) }
  }, [entityType, entityIds?.join(','), supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summaryMap, isLoading, refresh: fetch }
}

export function useBulkUserReactions(entityType?: string, entityIds?: string[], userId?: string) {
  const [reactionMap, setReactionMap] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityIds || entityIds.length === 0 || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reactions').select('entity_id, reaction_type').eq('entity_type', entityType).in('entity_id', entityIds).eq('user_id', userId)
      const map: { [key: string]: string } = {}
      data?.forEach(r => { map[r.entity_id] = r.reaction_type })
      setReactionMap(map)
    } finally { setIsLoading(false) }
  }, [entityType, entityIds?.join(','), userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reactionMap, isLoading, refresh: fetch }
}

export function useReactors(entityType?: string, entityId?: string, reactionType?: string, options?: { limit?: number }) {
  const [reactors, setReactors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId || !reactionType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reactions').select('*, users(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('reaction_type', reactionType).order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReactors(data?.map(r => r.users) || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, reactionType, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reactors, isLoading, refresh: fetch }
}

export function useMyReactions(userId?: string, options?: { entity_type?: string; limit?: number }) {
  const [reactions, setReactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('reactions').select('*').eq('user_id', userId)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setReactions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.entity_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reactions, isLoading, refresh: fetch }
}

export function useMostReacted(entityType?: string, options?: { limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reaction_summaries').select('*').eq('entity_type', entityType).order('total_reactions', { ascending: false }).limit(options?.limit || 10)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useReactionCounts(entityType?: string, entityId?: string) {
  const [counts, setCounts] = useState<{ [key: string]: number }>({})
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reaction_summaries').select('total_reactions, reaction_counts').eq('entity_type', entityType).eq('entity_id', entityId).single()
      setCounts(data?.reaction_counts || {})
      setTotal(data?.total_reactions || 0)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { counts, total, isLoading, refresh: fetch }
}

export function useTopReactionTypes(entityType?: string, options?: { limit?: number }) {
  const [types, setTypes] = useState<{ type: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reactions').select('reaction_type').eq('entity_type', entityType)
      const counts: { [key: string]: number } = {}
      data?.forEach(r => { counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1 })
      const sorted = Object.entries(counts).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count).slice(0, options?.limit || 10)
      setTypes(sorted)
    } finally { setIsLoading(false) }
  }, [entityType, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}
