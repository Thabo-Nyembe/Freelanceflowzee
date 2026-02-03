'use client'

/**
 * Extended Labels Hooks
 * Tables: labels, label_assignments, label_groups, label_colors, label_rules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLabel(labelId?: string) {
  const [label, setLabel] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!labelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('labels').select('*, label_groups(*)').eq('id', labelId).single(); setLabel(data) } finally { setIsLoading(false) }
  }, [labelId])
  useEffect(() => { loadData() }, [loadData])
  return { label, isLoading, refresh: loadData }
}

export function useLabels(options?: { organization_id?: string; group_id?: string; search?: string }) {
  const [labels, setLabels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('labels').select('*, label_groups(*)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true })
      setLabels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.group_id, options?.search])
  useEffect(() => { loadData() }, [loadData])
  return { labels, isLoading, refresh: loadData }
}

export function useEntityLabels(entityType?: string, entityId?: string) {
  const [labels, setLabels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('label_assignments').select('*, labels(*)').eq('entity_type', entityType).eq('entity_id', entityId); setLabels(data || []) } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { loadData() }, [loadData])
  return { labels, isLoading, refresh: loadData }
}

export function useLabelGroups(organizationId?: string) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('label_groups').select('*, labels(*)')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('name', { ascending: true })
      setGroups(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { groups, isLoading, refresh: loadData }
}

export function useLabelColors() {
  const [colors, setColors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('label_colors').select('*').order('name', { ascending: true }); setColors(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { colors, isLoading, refresh: loadData }
}

export function usePopularLabels(organizationId?: string, options?: { limit?: number }) {
  const [labels, setLabels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('labels').select('*')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 10)
      setLabels(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { labels, isLoading, refresh: loadData }
}

export function useLabelRules(labelId?: string) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!labelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('label_rules').select('*').eq('label_id', labelId).order('created_at', { ascending: false }); setRules(data || []) } finally { setIsLoading(false) }
  }, [labelId])
  useEffect(() => { loadData() }, [loadData])
  return { rules, isLoading, refresh: loadData }
}

export function useLabelSearch(organizationId?: string, query?: string) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 1) { setResults([]); return }
    setIsLoading(true)
    try {
      let dbQuery = supabase.from('labels').select('*').ilike('name', `%${query}%`)
      if (organizationId) dbQuery = dbQuery.eq('organization_id', organizationId)
      const { data } = await dbQuery.order('usage_count', { ascending: false }).limit(10)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, query])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function useLabelsByEntity(entityType?: string, entityIds?: string[]) {
  const [labelMap, setLabelMap] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityIds?.length) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('label_assignments').select('*, labels(*)').eq('entity_type', entityType).in('entity_id', entityIds)
      const map: Record<string, any[]> = {}
      data?.forEach(assignment => {
        if (!map[assignment.entity_id]) map[assignment.entity_id] = []
        map[assignment.entity_id].push(assignment.labels)
      })
      setLabelMap(map)
    } finally { setIsLoading(false) }
  }, [entityType, entityIds])
  useEffect(() => { loadData() }, [loadData])
  return { labelMap, isLoading, refresh: loadData }
}
