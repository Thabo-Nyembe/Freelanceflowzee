'use client'

/**
 * Extended Automations Hooks - Covers all Automation-related tables
 * Tables: automation, automations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAutomation(automationId?: string) {
  const [automation, setAutomation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!automationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('automations').select('*').eq('id', automationId).single()
      setAutomation(data)
    } finally { setIsLoading(false) }
  }, [automationId])
  useEffect(() => { fetch() }, [fetch])
  return { automation, isLoading, refresh: fetch }
}

export function useAutomations(userId?: string, options?: { isActive?: boolean; triggerType?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('automations').select('*').eq('user_id', userId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      if (options?.triggerType) query = query.eq('trigger_type', options.triggerType)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.isActive, options?.triggerType, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAutomationRuns(automationId?: string, options?: { status?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!automationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('automation_runs').select('*').eq('automation_id', automationId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [automationId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAutomationStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; active: number; inactive: number; totalRuns: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: automations } = await supabase.from('automations').select('id, is_active, run_count').eq('user_id', userId)
      const total = automations?.length || 0
      const active = automations?.filter(a => a.is_active).length || 0
      const totalRuns = automations?.reduce((sum, a) => sum + (a.run_count || 0), 0) || 0
      setStats({ total, active, inactive: total - active, totalRuns })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useActiveAutomations(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('automations').select('*').eq('user_id', userId).eq('is_active', true).order('last_run_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAutomationRunsRealtime(automationId?: string) {
  const [runs, setRuns] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!automationId) return
    supabase.from('automation_runs').select('*').eq('automation_id', automationId).order('started_at', { ascending: false }).limit(20).then(({ data }) => setRuns(data || []))
    const channel = supabase.channel(`automation_runs_${automationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'automation_runs', filter: `automation_id=eq.${automationId}` }, (payload) => setRuns(prev => [payload.new, ...prev].slice(0, 20)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'automation_runs', filter: `automation_id=eq.${automationId}` }, (payload) => setRuns(prev => prev.map(r => r.id === (payload.new as any).id ? payload.new : r)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [automationId])
  return { runs }
}

export function useAutomationWithRuns(automationId?: string) {
  const [automation, setAutomation] = useState<any>(null)
  const [runs, setRuns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!automationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [automationRes, runsRes] = await Promise.all([
        supabase.from('automations').select('*').eq('id', automationId).single(),
        supabase.from('automation_runs').select('*').eq('automation_id', automationId).order('started_at', { ascending: false }).limit(10)
      ])
      setAutomation(automationRes.data)
      setRuns(runsRes.data || [])
    } finally { setIsLoading(false) }
  }, [automationId])
  useEffect(() => { fetch() }, [fetch])
  return { automation, runs, isLoading, refresh: fetch }
}
