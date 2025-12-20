'use client'

/**
 * Extended Priority Hooks - Covers all Priority-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePriority(priorityId?: string) {
  const [priority, setPriority] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!priorityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('priorities').select('*').eq('id', priorityId).single()
      setPriority(data)
    } finally { setIsLoading(false) }
  }, [priorityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { priority, isLoading, refresh: fetch }
}

export function usePriorities(options?: { entityType?: string; workspaceId?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('priorities').select('*')
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId)
      const { data: result } = await query.order('level', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.entityType, options?.workspaceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEntityPriority(entityType?: string, entityId?: string) {
  const [priority, setPriority] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('entity_priorities').select('priority_id, priorities(*)').eq('entity_type', entityType).eq('entity_id', entityId).single()
      setPriority(data?.priorities || null)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { priority, isLoading, refresh: fetch }
}

export function useDefaultPriority(entityType?: string) {
  const [priority, setPriority] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('priorities').select('*').eq('is_default', true)
      if (entityType) query = query.eq('entity_type', entityType)
      const { data } = await query.single()
      setPriority(data)
    } finally { setIsLoading(false) }
  }, [entityType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { priority, isLoading, refresh: fetch }
}
