'use client'

/**
 * Extended Revision Hooks - Covers all Revision-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRevisions(entityId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('revisions').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('revision_number', { ascending: false }).limit(50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLatestRevision(entityId?: string, entityType?: string) {
  const [revision, setRevision] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('revisions').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('revision_number', { ascending: false }).limit(1).single()
      setRevision(data)
    } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { loadData() }, [loadData])
  return { revision, isLoading, refresh: loadData }
}

export function useRevisionCount(entityId?: string, entityType?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('revisions').select('*', { count: 'exact', head: true }).eq('entity_id', entityId).eq('entity_type', entityType)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { loadData() }, [loadData])
  return { count, isLoading, refresh: loadData }
}

export function useRevisionByNumber(entityId?: string, entityType?: string, revisionNumber?: number) {
  const [revision, setRevision] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || revisionNumber === undefined) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('revisions').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('revision_number', revisionNumber).single()
      setRevision(data)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, revisionNumber])
  useEffect(() => { loadData() }, [loadData])
  return { revision, isLoading, refresh: loadData }
}
