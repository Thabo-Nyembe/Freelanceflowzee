'use client'

/**
 * Extended Label Hooks - Covers all Label-related tables
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
    try {
      const { data } = await supabase.from('labels').select('*').eq('id', labelId).single()
      setLabel(data)
    } finally { setIsLoading(false) }
  }, [labelId])
  useEffect(() => { loadData() }, [loadData])
  return { label, isLoading, refresh: loadData }
}

export function useLabels(options?: { labelType?: string; workspaceId?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('labels').select('*')
      if (options?.labelType) query = query.eq('label_type', options.labelType)
      if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.labelType, options?.workspaceId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useEntityLabels(entityType?: string, entityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('entity_labels').select('label_id, labels(*)').eq('entity_type', entityType).eq('entity_id', entityId)
      setData(result?.map(el => el.labels) || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLabelSearch(query?: string, labelType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 1) { setData([]); return }
    setIsLoading(true)
    try {
      let dbQuery = supabase.from('labels').select('*').ilike('name', `%${query}%`)
      if (labelType) dbQuery = dbQuery.eq('label_type', labelType)
      const { data: result } = await dbQuery.order('usage_count', { ascending: false }).limit(10)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [query, labelType])
  useEffect(() => { search() }, [search])
  return { data, isLoading, search }
}
