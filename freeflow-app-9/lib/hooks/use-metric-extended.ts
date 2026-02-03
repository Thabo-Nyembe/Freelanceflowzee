'use client'

/**
 * Extended Metric Hooks - Covers all Metric-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMetrics(entityId?: string, entityType?: string, metricName?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('metrics').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('timestamp', { ascending: false }).limit(100)
      if (metricName) query = query.eq('metric_name', metricName)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType, metricName])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useLatestMetric(entityId?: string, entityType?: string, metricName?: string) {
  const [metric, setMetric] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !metricName) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('metrics').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('metric_name', metricName).order('timestamp', { ascending: false }).limit(1).single()
      setMetric(data)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, metricName])
  useEffect(() => { loadData() }, [loadData])
  return { metric, isLoading, refresh: loadData }
}

export function useMetricTimeSeries(entityId?: string, entityType?: string, metricName?: string, since?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType || !metricName || !since) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('metrics').select('value, timestamp').eq('entity_id', entityId).eq('entity_type', entityType).eq('metric_name', metricName).gte('timestamp', since).order('timestamp', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType, metricName, since])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
