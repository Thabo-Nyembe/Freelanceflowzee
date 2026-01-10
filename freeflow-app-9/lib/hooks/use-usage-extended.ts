'use client'

/**
 * Extended Usage Hooks - Covers all Usage-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUsage(entityId?: string, entityType?: string, usageType?: string) {
  const [usage, setUsage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !usageType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('usage').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('usage_type', usageType).order('recorded_at', { ascending: false }).limit(1).single()
      setUsage(data)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, usageType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { usage, isLoading, refresh: fetch }
}

export function useUsageHistory(entityId?: string, entityType?: string, usageType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !usageType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('usage').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('usage_type', usageType).order('recorded_at', { ascending: false }).limit(30)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType, usageType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUsageSummary(entityId?: string, entityType?: string, usageType?: string) {
  const [total, setTotal] = useState(0)
  const [average, setAverage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !usageType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('usage').select('amount').eq('entity_id', entityId).eq('entity_type', entityType).eq('usage_type', usageType)
      const sum = data?.reduce((s, u) => s + u.amount, 0) || 0
      const count = data?.length || 0
      setTotal(sum)
      setAverage(count > 0 ? sum / count : 0)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, usageType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { total, average, isLoading, refresh: fetch }
}
