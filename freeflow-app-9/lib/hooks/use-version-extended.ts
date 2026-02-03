'use client'

/**
 * Extended Version Hooks - Covers all Version-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useVersion(versionId?: string) {
  const [version, setVersion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!versionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('versions').select('*').eq('id', versionId).single()
      setVersion(data)
    } finally { setIsLoading(false) }
  }, [versionId])
  useEffect(() => { loadData() }, [loadData])
  return { version, isLoading, refresh: loadData }
}

export function useVersionHistory(entityType?: string, entityId?: string, limit = 20) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('versions').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useCurrentVersion(entityType?: string, entityId?: string) {
  const [version, setVersion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('versions').select('*').eq('entity_type', entityType).eq('entity_id', entityId).eq('is_current', true).single()
      setVersion(data)
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { loadData() }, [loadData])
  return { version, isLoading, refresh: loadData }
}

export function useVersionCount(entityType?: string, entityId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('versions').select('*', { count: 'exact', head: true }).eq('entity_type', entityType).eq('entity_id', entityId)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { loadData() }, [loadData])
  return { count, isLoading, refresh: loadData }
}
