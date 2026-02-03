'use client'

/**
 * Extended Cloud Hooks
 * Tables: cloud_providers, cloud_resources, cloud_costs, cloud_monitoring
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCloudProvider(providerId?: string) {
  const [provider, setProvider] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!providerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('cloud_providers').select('*, cloud_resources(*)').eq('id', providerId).single(); setProvider(data) } finally { setIsLoading(false) }
  }, [providerId])
  useEffect(() => { loadData() }, [loadData])
  return { provider, isLoading, refresh: loadData }
}

export function useCloudProviders(options?: { user_id?: string; type?: string; status?: string }) {
  const [providers, setProviders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('cloud_providers').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true })
      setProviders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { providers, isLoading, refresh: loadData }
}

export function useCloudResources(providerId?: string, options?: { type?: string; status?: string }) {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!providerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('cloud_resources').select('*').eq('provider_id', providerId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true })
      setResources(data || [])
    } finally { setIsLoading(false) }
  }, [providerId, options?.type, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { resources, isLoading, refresh: loadData }
}

export function useCloudCosts(providerId?: string, options?: { date_from?: string; date_to?: string }) {
  const [costs, setCosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!providerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('cloud_costs').select('*').eq('provider_id', providerId)
      if (options?.date_from) query = query.gte('period', options.date_from)
      if (options?.date_to) query = query.lte('period', options.date_to)
      const { data } = await query.order('period', { ascending: false })
      setCosts(data || [])
    } finally { setIsLoading(false) }
  }, [providerId, options?.date_from, options?.date_to])
  useEffect(() => { loadData() }, [loadData])
  return { costs, isLoading, refresh: loadData }
}

export function useCloudMonitoring(resourceId?: string) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!resourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('cloud_monitoring').select('*').eq('resource_id', resourceId).eq('is_active', true).order('created_at', { ascending: false }); setAlerts(data || []) } finally { setIsLoading(false) }
  }, [resourceId])
  useEffect(() => { loadData() }, [loadData])
  return { alerts, isLoading, refresh: loadData }
}

export function useCloudCostSummary(userId?: string, period?: string) {
  const [summary, setSummary] = useState<{ total: number; byProvider: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: providers } = await supabase.from('cloud_providers').select('id, name').eq('user_id', userId)
      if (!providers?.length) { setSummary({ total: 0, byProvider: {} }); return }
      let query = supabase.from('cloud_costs').select('provider_id, amount').in('provider_id', providers.map(p => p.id))
      if (period) query = query.eq('period', period)
      const { data: costs } = await query
      const total = costs?.reduce((sum, c) => sum + c.amount, 0) || 0
      const byProvider: Record<string, number> = {}
      costs?.forEach(c => {
        const provider = providers.find(p => p.id === c.provider_id)
        const name = provider?.name || 'Unknown'
        byProvider[name] = (byProvider[name] || 0) + c.amount
      })
      setSummary({ total, byProvider })
    } finally { setIsLoading(false) }
  }, [userId, period])
  useEffect(() => { loadData() }, [loadData])
  return { summary, isLoading, refresh: loadData }
}

export function useResourceStatus(resourceId?: string) {
  const [resource, setResource] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!resourceId) return
    supabase.from('cloud_resources').select('*').eq('id', resourceId).single().then(({ data }) => setResource(data))
    const channel = supabase.channel(`cloud_resource_${resourceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cloud_resources', filter: `id=eq.${resourceId}` }, (payload) => {
        setResource(payload.new)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [resourceId])
  return { resource }
}

export function useActiveResources(userId?: string) {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: providers } = await supabase.from('cloud_providers').select('id').eq('user_id', userId).eq('status', 'active')
      if (!providers?.length) { setResources([]); return }
      const { data } = await supabase.from('cloud_resources').select('*, cloud_providers(name)').in('provider_id', providers.map(p => p.id)).eq('status', 'running').order('name', { ascending: true })
      setResources(data || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { resources, isLoading, refresh: loadData }
}
