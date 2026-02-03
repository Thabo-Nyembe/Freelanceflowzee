'use client'

/**
 * Extended State Hooks - Covers all State-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useEntityState(entityId?: string, entityType?: string) {
  const [state, setState] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('states').select('state').eq('entity_id', entityId).eq('entity_type', entityType).single()
      setState(data?.state || {})
    } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { loadData() }, [loadData])
  return { state, isLoading, refresh: loadData }
}

export function useStateValue(entityId?: string, entityType?: string, key?: string) {
  const [value, setValue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !key) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('states').select('state').eq('entity_id', entityId).eq('entity_type', entityType).single()
      setValue(data?.state?.[key] || null)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, key])
  useEffect(() => { loadData() }, [loadData])
  return { value, isLoading, refresh: loadData }
}

export function useStatesByType(entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('states').select('*').eq('entity_type', entityType).order('updated_at', { ascending: false }).limit(50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
