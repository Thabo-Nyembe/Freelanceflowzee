'use client'

/**
 * Extended Stat Hooks - Covers all Stat-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStats(entityId?: string, entityType?: string, period?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('stats').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('recorded_at', { ascending: false })
      if (period) query = query.eq('period', period)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType, period, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useStatSummary(entityId?: string, entityType?: string, statName?: string) {
  const [summary, setSummary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !statName) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('stats').select('value').eq('entity_id', entityId).eq('entity_type', entityType).eq('stat_name', statName)
      const values = data?.map(s => s.value) || []
      const sum = values.reduce((a, b) => a + b, 0)
      const avg = values.length > 0 ? sum / values.length : 0
      setSummary({ sum, avg, max: Math.max(...values, 0), min: Math.min(...values, 0), count: values.length })
    } finally { setIsLoading(false) }
  }, [entityId, entityType, statName, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useStatsByPeriod(entityId?: string, entityType?: string, period?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !period) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('stats').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('period', period).order('recorded_at', { ascending: false }).limit(30)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType, period, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
