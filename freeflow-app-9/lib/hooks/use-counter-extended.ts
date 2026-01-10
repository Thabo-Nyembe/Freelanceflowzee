'use client'

/**
 * Extended Counter Hooks - Covers all Counter-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCounter(entityId?: string, entityType?: string, counterName?: string) {
  const [value, setValue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !counterName) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('counters').select('value').eq('entity_id', entityId).eq('entity_type', entityType).eq('counter_name', counterName).single()
      setValue(data?.value || 0)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, counterName])
  useEffect(() => { fetch() }, [fetch])
  return { value, isLoading, refresh: fetch }
}

export function useCounters(entityId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('counters').select('*').eq('entity_id', entityId).eq('entity_type', entityType)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTopCounters(counterName?: string, entityType?: string, limit = 10) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!counterName || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('counters').select('entity_id, value').eq('counter_name', counterName).eq('entity_type', entityType).order('value', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [counterName, entityType, limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
