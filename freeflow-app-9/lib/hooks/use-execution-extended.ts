'use client'

/**
 * Extended Execution Hooks
 * Tables: executions, execution_logs, execution_steps, execution_results
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useExecution(executionId?: string) {
  const [execution, setExecution] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!executionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('executions').select('*, execution_steps(*), execution_logs(*)').eq('id', executionId).single(); setExecution(data) } finally { setIsLoading(false) }
  }, [executionId])
  useEffect(() => { fetch() }, [fetch])
  return { execution, isLoading, refresh: fetch }
}

export function useExecutions(options?: { type?: string; status?: string; workflow_id?: string; triggered_by?: string; limit?: number }) {
  const [executions, setExecutions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('executions').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.workflow_id) query = query.eq('workflow_id', options.workflow_id)
      if (options?.triggered_by) query = query.eq('triggered_by', options.triggered_by)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setExecutions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.status, options?.workflow_id, options?.triggered_by, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { executions, isLoading, refresh: fetch }
}

export function useExecutionSteps(executionId?: string) {
  const [steps, setSteps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!executionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('execution_steps').select('*').eq('execution_id', executionId).order('order', { ascending: true }); setSteps(data || []) } finally { setIsLoading(false) }
  }, [executionId])
  useEffect(() => { fetch() }, [fetch])
  return { steps, isLoading, refresh: fetch }
}

export function useExecutionLogs(executionId?: string, options?: { step_id?: string; level?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!executionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('execution_logs').select('*').eq('execution_id', executionId)
      if (options?.step_id) query = query.eq('step_id', options.step_id)
      if (options?.level) query = query.eq('level', options.level)
      const { data } = await query.order('logged_at', { ascending: true }).limit(options?.limit || 500)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [executionId, options?.step_id, options?.level, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useExecutionResult(executionId?: string) {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!executionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('execution_results').select('*').eq('execution_id', executionId).single(); setResult(data) } finally { setIsLoading(false) }
  }, [executionId])
  useEffect(() => { fetch() }, [fetch])
  return { result, isLoading, refresh: fetch }
}

export function useActiveExecutions(options?: { type?: string }) {
  const [executions, setExecutions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('executions').select('*').in('status', ['pending', 'running'])
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('started_at', { ascending: false })
      setExecutions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type])
  useEffect(() => { fetch() }, [fetch])
  return { executions, isLoading, refresh: fetch }
}

export function useExecutionStats(options?: { type?: string; days?: number }) {
  const [stats, setStats] = useState<{ total: number; successful: number; failed: number; avgDuration: number; byType: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const daysAgo = options?.days || 7
      const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      let query = supabase.from('executions').select('status, type, duration_ms').gte('started_at', startDate)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query
      if (!data) { setStats(null); return }
      const total = data.length
      const successful = data.filter(e => e.status === 'completed').length
      const failed = data.filter(e => e.status === 'failed').length
      const durations = data.filter(e => e.duration_ms).map(e => e.duration_ms)
      const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
      const byType = data.reduce((acc: Record<string, number>, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc }, {})
      setStats({ total, successful, failed, avgDuration, byType })
    } finally { setIsLoading(false) }
  }, [options?.type, options?.days])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useRecentExecutions(limit?: number) {
  const [executions, setExecutions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('executions').select('*').order('started_at', { ascending: false }).limit(limit || 10); setExecutions(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { executions, isLoading, refresh: fetch }
}
