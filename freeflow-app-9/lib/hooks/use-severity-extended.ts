'use client'

/**
 * Extended Severity Hooks - Covers all Severity-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSeverity(severityId?: string) {
  const [severity, setSeverity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!severityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('severities').select('*').eq('id', severityId).single()
      setSeverity(data)
    } finally { setIsLoading(false) }
  }, [severityId])
  useEffect(() => { fetch() }, [fetch])
  return { severity, isLoading, refresh: fetch }
}

export function useSeverities(options?: { entityType?: string; workspaceId?: string; isCritical?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('severities').select('*')
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId)
      if (options?.isCritical !== undefined) query = query.eq('is_critical', options.isCritical)
      const { data: result } = await query.order('level', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.entityType, options?.workspaceId, options?.isCritical])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEntitySeverity(entityType?: string, entityId?: string) {
  const [severity, setSeverity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('entity_severities').select('severity_id, severities(*)').eq('entity_type', entityType).eq('entity_id', entityId).single()
      setSeverity(data?.severities || null)
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { severity, isLoading, refresh: fetch }
}

export function useCriticalSeverities(entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('severities').select('*').eq('is_critical', true)
      if (entityType) query = query.eq('entity_type', entityType)
      const { data: result } = await query.order('level', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
