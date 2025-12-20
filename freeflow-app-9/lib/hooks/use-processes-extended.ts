'use client'

/**
 * Extended Processes Hooks
 * Tables: processes, process_steps, process_instances, process_tasks, process_variables, process_history, process_templates
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProcess(processId?: string) {
  const [process, setProcess] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!processId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('processes').select('*, process_steps(*), process_variables(*), process_instances(count)').eq('id', processId).single(); setProcess(data) } finally { setIsLoading(false) }
  }, [processId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { process, isLoading, refresh: fetch }
}

export function useProcesses(options?: { organization_id?: string; status?: string; category?: string; owner_id?: string; search?: string; limit?: number }) {
  const [processes, setProcesses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('processes').select('*, process_steps(count), process_instances(count)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setProcesses(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.status, options?.category, options?.owner_id, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { processes, isLoading, refresh: fetch }
}

export function useProcessSteps(processId?: string) {
  const [steps, setSteps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!processId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('process_steps').select('*').eq('process_id', processId).eq('is_active', true).order('order', { ascending: true }); setSteps(data || []) } finally { setIsLoading(false) }
  }, [processId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { steps, isLoading, refresh: fetch }
}

export function useProcessInstance(instanceId?: string) {
  const [instance, setInstance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!instanceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('process_instances').select('*, processes(*), process_steps(*), process_tasks(*)').eq('id', instanceId).single(); setInstance(data) } finally { setIsLoading(false) }
  }, [instanceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { instance, isLoading, refresh: fetch }
}

export function useProcessInstances(options?: { process_id?: string; status?: string; started_by?: string; limit?: number }) {
  const [instances, setInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('process_instances').select('*, processes(*), process_steps(*)')
      if (options?.process_id) query = query.eq('process_id', options.process_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.started_by) query = query.eq('started_by', options.started_by)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setInstances(data || [])
    } finally { setIsLoading(false) }
  }, [options?.process_id, options?.status, options?.started_by, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { instances, isLoading, refresh: fetch }
}

export function useProcessTasks(options?: { instance_id?: string; assignee_id?: string; status?: string; limit?: number }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('process_tasks').select('*, processes(*), process_instances(*), process_steps(*)')
      if (options?.instance_id) query = query.eq('instance_id', options.instance_id)
      if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTasks(data || [])
    } finally { setIsLoading(false) }
  }, [options?.instance_id, options?.assignee_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tasks, isLoading, refresh: fetch }
}

export function useMyProcessTasks(userId?: string, options?: { status?: string; limit?: number }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('process_tasks').select('*, processes(*), process_instances(*), process_steps(*)').eq('assignee_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('due_at', { ascending: true }).limit(options?.limit || 50)
      setTasks(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tasks, isLoading, refresh: fetch }
}

export function useProcessHistory(instanceId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!instanceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('process_history').select('*, process_steps(*), users(*)').eq('instance_id', instanceId).order('performed_at', { ascending: true }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [instanceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useProcessVariables(processId?: string) {
  const [variables, setVariables] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!processId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('process_variables').select('*').eq('process_id', processId).order('name', { ascending: true }); setVariables(data || []) } finally { setIsLoading(false) }
  }, [processId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { variables, isLoading, refresh: fetch }
}

export function useProcessTemplates(options?: { category?: string; search?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('process_templates').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useRunningInstances(processId?: string) {
  const [instances, setInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('process_instances').select('*, processes(*), process_steps(*)').eq('status', 'running')
      if (processId) query = query.eq('process_id', processId)
      const { data } = await query.order('started_at', { ascending: false })
      setInstances(data || [])
    } finally { setIsLoading(false) }
  }, [processId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { instances, isLoading, refresh: fetch }
}

export function useProcessStats(processId?: string) {
  const [stats, setStats] = useState<{ total: number; running: number; completed: number; failed: number; avgDuration: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('process_instances').select('status, started_at, completed_at')
      if (processId) query = query.eq('process_id', processId)
      const { data } = await query
      const total = data?.length || 0
      const running = data?.filter(i => i.status === 'running').length || 0
      const completed = data?.filter(i => i.status === 'completed').length || 0
      const failed = data?.filter(i => i.status === 'failed').length || 0
      const completedInstances = data?.filter(i => i.completed_at) || []
      const avgDuration = completedInstances.length > 0
        ? completedInstances.reduce((sum, i) => sum + (new Date(i.completed_at).getTime() - new Date(i.started_at).getTime()), 0) / completedInstances.length / (1000 * 60 * 60)
        : 0
      setStats({ total, running, completed, failed, avgDuration })
    } finally { setIsLoading(false) }
  }, [processId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
