'use client'

/**
 * Extended Agent Hooks - Covers all Agent-related tables
 * Tables: agent_configuration, agent_configurations, agent_executions, agent_logs, agent_metrics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAgentConfiguration(configId?: string) {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!configId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('agent_configurations').select('*').eq('id', configId).single()
      setConfig(data)
    } finally { setIsLoading(false) }
  }, [configId])
  useEffect(() => { loadData() }, [loadData])
  return { config, isLoading, refresh: loadData }
}

export function useAgentConfigurations(options?: { agentType?: string; isActive?: boolean; userId?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('agent_configurations').select('*')
      if (options?.agentType) query = query.eq('agent_type', options.agentType)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      if (options?.userId) query = query.eq('user_id', options.userId)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.agentType, options?.isActive, options?.userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useAgentExecution(executionId?: string) {
  const [execution, setExecution] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!executionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('agent_executions').select('*, agent_configurations(name, agent_type)').eq('id', executionId).single()
      setExecution(data)
    } finally { setIsLoading(false) }
  }, [executionId])
  useEffect(() => { loadData() }, [loadData])
  return { execution, isLoading, refresh: loadData }
}

export function useAgentExecutions(options?: { agentConfigId?: string; status?: string; userId?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('agent_executions').select('*, agent_configurations(name, agent_type)')
      if (options?.agentConfigId) query = query.eq('agent_config_id', options.agentConfigId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.userId) query = query.eq('user_id', options.userId)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.agentConfigId, options?.status, options?.userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useAgentLogs(executionId?: string, options?: { level?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!executionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('agent_logs').select('*').eq('agent_execution_id', executionId)
      if (options?.level) query = query.eq('level', options.level)
      const { data: result } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [executionId, options?.level, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useAgentMetrics(agentConfigId?: string, options?: { startDate?: string; endDate?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!agentConfigId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('agent_metrics').select('*').eq('agent_config_id', agentConfigId)
      if (options?.startDate) query = query.gte('period_start', options.startDate)
      if (options?.endDate) query = query.lte('period_end', options.endDate)
      const { data: result } = await query.order('period_start', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [agentConfigId, options?.startDate, options?.endDate])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useAgentStats(agentConfigId?: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!agentConfigId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: executions } = await supabase.from('agent_executions').select('status').eq('agent_config_id', agentConfigId)
      const total = executions?.length || 0
      const completed = executions?.filter(e => e.status === 'completed').length || 0
      const failed = executions?.filter(e => e.status === 'failed').length || 0
      const pending = executions?.filter(e => e.status === 'pending' || e.status === 'running').length || 0
      setStats({ total, completed, failed, pending, successRate: total > 0 ? (completed / total * 100).toFixed(1) : '0' })
    } finally { setIsLoading(false) }
  }, [agentConfigId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useAgentExecutionRealtime(executionId?: string) {
  const [execution, setExecution] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!executionId) return
    supabase.from('agent_executions').select('*, agent_configurations(name, agent_type)').eq('id', executionId).single().then(({ data }) => setExecution(data))
    supabase.from('agent_logs').select('*').eq('agent_execution_id', executionId).order('created_at', { ascending: true }).then(({ data }) => setLogs(data || []))
    const channel = supabase.channel(`agent_execution_${executionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'agent_executions', filter: `id=eq.${executionId}` }, (payload) => setExecution(payload.new))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_logs', filter: `agent_execution_id=eq.${executionId}` }, (payload) => setLogs(prev => [...prev, payload.new]))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [executionId])
  return { execution, logs }
}
