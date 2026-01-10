'use client'

/**
 * Extended Limit Hooks - Covers all Limit-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLimit(entityId?: string, entityType?: string, limitType?: string) {
  const [limit, setLimit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !limitType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('limits').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('limit_type', limitType).single()
      setLimit(data)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, limitType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { limit, isLoading, refresh: fetch }
}

export function useLimits(entityId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('limits').select('*').eq('entity_id', entityId).eq('entity_type', entityType)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLimitCheck(entityId?: string, entityType?: string, limitType?: string, currentValue?: number) {
  const [allowed, setAllowed] = useState(true)
  const [remaining, setRemaining] = useState<number>(Infinity)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!entityId || !entityType || !limitType || currentValue === undefined) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('limits').select('max_value').eq('entity_id', entityId).eq('entity_type', entityType).eq('limit_type', limitType).single()
      if (data) {
        setAllowed(currentValue < data.max_value)
        setRemaining(Math.max(0, data.max_value - currentValue))
      }
    } finally { setIsLoading(false) }
  }, [entityId, entityType, limitType, currentValue, supabase])
  useEffect(() => { check() }, [check])
  return { allowed, remaining, isLoading, refresh: check }
}
