'use client'

/**
 * Extended Automation Hooks
 * Tables: automation_workflows, automation_triggers, automation_actions, automation_logs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAutomationWorkflow(workflowId?: string) {
  const [workflow, setWorkflow] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('automation_workflows').select('*, automation_triggers(*), automation_actions(*)').eq('id', workflowId).single(); setWorkflow(data) } finally { setIsLoading(false) }
  }, [workflowId])
  useEffect(() => { fetch() }, [fetch])
  return { workflow, isLoading, refresh: fetch }
}

export function useAutomationWorkflows(options?: { user_id?: string; is_active?: boolean; limit?: number }) {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('automation_workflows').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setWorkflows(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { workflows, isLoading, refresh: fetch }
}

export function useActiveAutomations(userId?: string) {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('automation_workflows').select('*').eq('user_id', userId).eq('is_active', true).order('last_run_at', { ascending: false }); setWorkflows(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { workflows, isLoading, refresh: fetch }
}

export function useAutomationLogs(workflowId?: string, options?: { status?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('automation_logs').select('*').eq('workflow_id', workflowId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [workflowId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useAutomationStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; active: number; inactive: number; totalRuns: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('automation_workflows').select('is_active, run_count').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const total = data.length
      const active = data.filter(w => w.is_active).length
      const inactive = total - active
      const totalRuns = data.reduce((sum, w) => sum + (w.run_count || 0), 0)
      setStats({ total, active, inactive, totalRuns })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useRecentAutomationRuns(userId?: string, options?: { limit?: number }) {
  const [runs, setRuns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: workflows } = await supabase.from('automation_workflows').select('id').eq('user_id', userId)
      if (!workflows || workflows.length === 0) { setRuns([]); return }
      const workflowIds = workflows.map(w => w.id)
      const { data } = await supabase.from('automation_logs').select('*, automation_workflows(name)').in('workflow_id', workflowIds).order('started_at', { ascending: false }).limit(options?.limit || 20)
      setRuns(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { runs, isLoading, refresh: fetch }
}

export function useAutomationLogsRealtime(workflowId?: string) {
  const [logs, setLogs] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!workflowId) return
    supabase.from('automation_logs').select('*').eq('workflow_id', workflowId).order('started_at', { ascending: false }).limit(50).then(({ data }) => setLogs(data || []))
    const channel = supabase.channel(`automation_logs_${workflowId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'automation_logs', filter: `workflow_id=eq.${workflowId}` }, (payload) => setLogs(prev => [payload.new, ...prev].slice(0, 50)))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'automation_logs', filter: `workflow_id=eq.${workflowId}` }, (payload) => setLogs(prev => prev.map(l => l.id === (payload.new as any).id ? payload.new : l)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [workflowId])
  return { logs }
}
