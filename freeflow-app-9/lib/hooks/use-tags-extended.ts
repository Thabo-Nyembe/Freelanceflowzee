'use client'

/**
 * Extended Tags Hooks
 * Tables: tags, tag_groups, tag_assignments, tag_rules, tag_suggestions, tag_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTag(tagId?: string) {
  const [tag, setTag] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tagId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tags').select('*, tag_groups(*), tag_assignments(count)').eq('id', tagId).single(); setTag(data) } finally { setIsLoading(false) }
  }, [tagId])
  useEffect(() => { fetch() }, [fetch])
  return { tag, isLoading, refresh: fetch }
}

export function useTags(options?: { group_id?: string; is_system?: boolean; search?: string; limit?: number }) {
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tags').select('*, tag_groups(*), tag_assignments(count)')
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      if (options?.is_system !== undefined) query = query.eq('is_system', options.is_system)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setTags(data || [])
    } finally { setIsLoading(false) }
  }, [options?.group_id, options?.is_system, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { tags, isLoading, refresh: fetch }
}

export function useTagGroups(options?: { is_exclusive?: boolean }) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tag_groups').select('*, tags(count)')
      if (options?.is_exclusive !== undefined) query = query.eq('is_exclusive', options.is_exclusive)
      const { data } = await query.order('name', { ascending: true })
      setGroups(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_exclusive])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useEntityTags(entityType?: string, entityId?: string) {
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tag_assignments').select('*, tags(*, tag_groups(*))').eq('entity_type', entityType).eq('entity_id', entityId)
      setTags((data || []).map(a => a.tags))
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { tags, isLoading, refresh: fetch }
}

export function usePopularTags(options?: { entity_type?: string; limit?: number }) {
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tags').select('*, tag_groups(*)').order('usage_count', { ascending: false }).limit(options?.limit || 20)
      setTags(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { tags, isLoading, refresh: fetch }
}

export function useTagsByGroup() {
  const [groupedTags, setGroupedTags] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tags').select('*, tag_groups(*)').order('name', { ascending: true })
      const grouped: Record<string, any[]> = { Ungrouped: [] }
      data?.forEach(tag => {
        const groupName = tag.tag_groups?.name || 'Ungrouped'
        if (!grouped[groupName]) grouped[groupName] = []
        grouped[groupName].push(tag)
      })
      setGroupedTags(grouped)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { groupedTags, isLoading, refresh: fetch }
}

export function useEntitiesByTag(tagId?: string, entityType?: string, options?: { limit?: number }) {
  const [entities, setEntities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!tagId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tag_assignments').select('entity_type, entity_id, assigned_at').eq('tag_id', tagId)
      if (entityType) query = query.eq('entity_type', entityType)
      const { data } = await query.order('assigned_at', { ascending: false }).limit(options?.limit || 100)
      setEntities(data || [])
    } finally { setIsLoading(false) }
  }, [tagId, entityType, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { entities, isLoading, refresh: fetch }
}

export function useTagSearch(searchTerm: string, options?: { group_id?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tags').select('*, tag_groups(*)').ilike('name', `%${searchTerm}%`)
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      const { data } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 10)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [searchTerm, options?.group_id, options?.limit])
  useEffect(() => { const timeout = setTimeout(search, 300); return () => clearTimeout(timeout) }, [search])
  return { results, isLoading }
}

export function useRecentlyUsedTags(userId?: string, options?: { limit?: number }) {
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tag_assignments').select('tag_id, assigned_at, tags(*)').eq('assigned_by', userId).order('assigned_at', { ascending: false }).limit(options?.limit || 20)
      const uniqueTags = new Map()
      data?.forEach(a => { if (!uniqueTags.has(a.tag_id)) uniqueTags.set(a.tag_id, a.tags) })
      setTags(Array.from(uniqueTags.values()))
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { tags, isLoading, refresh: fetch }
}

