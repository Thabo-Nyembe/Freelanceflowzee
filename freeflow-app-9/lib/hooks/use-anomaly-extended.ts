'use client'

/**
 * Extended Anomaly Hooks
 * Tables: anomaly_detections, anomaly_rules, anomaly_alerts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAnomaly(anomalyId?: string) {
  const [anomaly, setAnomaly] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!anomalyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('anomaly_detections').select('*').eq('id', anomalyId).single(); setAnomaly(data) } finally { setIsLoading(false) }
  }, [anomalyId])
  useEffect(() => { fetch() }, [fetch])
  return { anomaly, isLoading, refresh: fetch }
}

export function useAnomalies(options?: { user_id?: string; source?: string; type?: string; severity?: string; status?: string; limit?: number }) {
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('anomaly_detections').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.source) query = query.eq('source', options.source)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.severity) query = query.eq('severity', options.severity)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('detected_at', { ascending: false }).limit(options?.limit || 50)
      setAnomalies(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.source, options?.type, options?.severity, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { anomalies, isLoading, refresh: fetch }
}

export function useActiveAnomalies(userId?: string) {
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('anomaly_detections').select('*').eq('user_id', userId).in('status', ['detected', 'acknowledged']).order('severity', { ascending: false }).order('detected_at', { ascending: false }); setAnomalies(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { anomalies, isLoading, refresh: fetch }
}

export function useCriticalAnomalies(userId?: string) {
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('anomaly_detections').select('*').eq('user_id', userId).in('severity', ['high', 'critical']).in('status', ['detected', 'acknowledged']).order('detected_at', { ascending: false }); setAnomalies(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { anomalies, isLoading, refresh: fetch }
}

export function useAnomalyStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; bySeverity: Record<string, number>; byStatus: Record<string, number>; byType: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('anomaly_detections').select('severity, status, type').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const bySeverity = data.reduce((acc: Record<string, number>, a) => { acc[a.severity || 'unknown'] = (acc[a.severity || 'unknown'] || 0) + 1; return acc }, {})
      const byStatus = data.reduce((acc: Record<string, number>, a) => { acc[a.status || 'unknown'] = (acc[a.status || 'unknown'] || 0) + 1; return acc }, {})
      const byType = data.reduce((acc: Record<string, number>, a) => { acc[a.type || 'unknown'] = (acc[a.type || 'unknown'] || 0) + 1; return acc }, {})
      setStats({ total: data.length, bySeverity, byStatus, byType })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useAnomaliesRealtime(userId?: string) {
  const [anomalies, setAnomalies] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    supabase.from('anomaly_detections').select('*').eq('user_id', userId).in('status', ['detected', 'acknowledged']).order('detected_at', { ascending: false }).limit(50).then(({ data }) => setAnomalies(data || []))
    const channel = supabase.channel(`anomalies_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'anomaly_detections', filter: `user_id=eq.${userId}` }, (payload) => setAnomalies(prev => [payload.new, ...prev].slice(0, 50)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'anomaly_detections', filter: `user_id=eq.${userId}` }, (payload) => setAnomalies(prev => prev.map(a => a.id === (payload.new as Record<string, unknown>).id ? payload.new : a)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])
  return { anomalies }
}
