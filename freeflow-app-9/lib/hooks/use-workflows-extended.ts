'use client'

/**
 * Extended Workflows Hooks
 * Tables: workflows, workflow_steps, workflow_runs, workflow_triggers
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWorkflow(workflowId?: string) {
  const [workflow, setWorkflow] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('workflows').select('*, workflow_steps(*), workflow_triggers(*)').eq('id', workflowId).single(); setWorkflow(data) } finally { setIsLoading(false) }
  }, [workflowId])
  useEffect(() => { loadData() }, [loadData])
  return { workflow, isLoading, refresh: loadData }
}

export function useWorkflows(options?: { user_id?: string; is_active?: boolean; limit?: number }) {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('workflows').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setWorkflows(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.is_active, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { workflows, isLoading, refresh: loadData }
}

export function useWorkflowSteps(workflowId?: string) {
  const [steps, setSteps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('workflow_steps').select('*').eq('workflow_id', workflowId).order('order', { ascending: true }); setSteps(data || []) } finally { setIsLoading(false) }
  }, [workflowId])
  useEffect(() => { loadData() }, [loadData])
  return { steps, isLoading, refresh: loadData }
}

export function useWorkflowRuns(workflowId?: string, options?: { status?: string; limit?: number }) {
  const [runs, setRuns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('workflow_runs').select('*').eq('workflow_id', workflowId); if (options?.status) query = query.eq('status', options.status); const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); setRuns(data || []) } finally { setIsLoading(false) }
  }, [workflowId, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { runs, isLoading, refresh: loadData }
}

export function useActiveWorkflows(userId?: string) {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('workflows').select('*').eq('user_id', userId).eq('is_active', true).order('name', { ascending: true }); setWorkflows(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { workflows, isLoading, refresh: loadData }
}

export function useUserWorkflows(userId?: string) {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('workflows').select('*').eq('user_id', userId).order('name', { ascending: true }); setWorkflows(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { workflows, isLoading, refresh: loadData }
}
