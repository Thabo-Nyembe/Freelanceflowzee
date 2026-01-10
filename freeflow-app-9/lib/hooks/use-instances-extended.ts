'use client'

/**
 * Extended Instances Hooks
 * Tables: instances, instance_configs, instance_logs, instance_metrics, instance_snapshots, instance_scaling
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInstance(instanceId?: string) {
  const [instance, setInstance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!instanceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('instances').select('*, instance_configs(*), instance_metrics(*)').eq('id', instanceId).single(); setInstance(data) } finally { setIsLoading(false) }
  }, [instanceId])
  useEffect(() => { fetch() }, [fetch])
  return { instance, isLoading, refresh: fetch }
}

export function useInstances(options?: { owner_id?: string; type?: string; status?: string; region?: string; limit?: number }) {
  const [instances, setInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('instances').select('*')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.region) query = query.eq('region', options.region)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setInstances(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.type, options?.status, options?.region, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { instances, isLoading, refresh: fetch }
}

export function useUserInstances(userId?: string, options?: { status?: string }) {
  const [instances, setInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('instances').select('*').eq('owner_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setInstances(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { instances, isLoading, refresh: fetch }
}

export function useInstanceLogs(instanceId?: string, options?: { level?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!instanceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('instance_logs').select('*').eq('instance_id', instanceId)
      if (options?.level) query = query.eq('level', options.level)
      if (options?.from_date) query = query.gte('timestamp', options.from_date)
      if (options?.to_date) query = query.lte('timestamp', options.to_date)
      const { data } = await query.order('timestamp', { ascending: false }).limit(options?.limit || 100)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [instanceId, options?.level, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useInstanceMetrics(instanceId?: string, options?: { from_date?: string; to_date?: string; metric_type?: string }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!instanceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('instance_metrics').select('*').eq('instance_id', instanceId)
      if (options?.metric_type) query = query.eq('metric_type', options.metric_type)
      if (options?.from_date) query = query.gte('timestamp', options.from_date)
      if (options?.to_date) query = query.lte('timestamp', options.to_date)
      const { data } = await query.order('timestamp', { ascending: false }).limit(100)
      setMetrics(data || [])
    } finally { setIsLoading(false) }
  }, [instanceId, options?.from_date, options?.to_date, options?.metric_type])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useInstanceSnapshots(instanceId?: string) {
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!instanceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('instance_snapshots').select('*').eq('instance_id', instanceId).order('created_at', { ascending: false }); setSnapshots(data || []) } finally { setIsLoading(false) }
  }, [instanceId])
  useEffect(() => { fetch() }, [fetch])
  return { snapshots, isLoading, refresh: fetch }
}

export function useInstanceConfig(instanceId?: string) {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!instanceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('instance_configs').select('*').eq('instance_id', instanceId).single(); setConfig(data?.config || null) } finally { setIsLoading(false) }
  }, [instanceId])
  useEffect(() => { fetch() }, [fetch])
  return { config, isLoading, refresh: fetch }
}

export function useRunningInstances(userId?: string) {
  const [instances, setInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('instances').select('*').eq('owner_id', userId).eq('status', 'running').order('created_at', { ascending: false }); setInstances(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { instances, isLoading, refresh: fetch }
}

export function useInstancesByRegion() {
  const [byRegion, setByRegion] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('instances').select('*')
      const grouped: Record<string, any[]> = {}
      data?.forEach(i => { if (!grouped[i.region]) grouped[i.region] = []; grouped[i.region].push(i) })
      setByRegion(grouped)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { byRegion, isLoading, refresh: fetch }
}
