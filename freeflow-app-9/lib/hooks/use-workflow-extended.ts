'use client'

/**
 * Extended Workflow Hooks - Covers all 9 Workflow-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWorkflowActionLogs(workflowId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('workflow_action_logs').select('*').eq('workflow_id', workflowId).order('created_at', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [workflowId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkflowActions(workflowId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('workflow_actions').select('*').eq('workflow_id', workflowId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [workflowId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkflowEventSubscriptions(workflowId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('workflow_event_subscriptions').select('*').eq('workflow_id', workflowId).eq('is_active', true); setData(result || []) } finally { setIsLoading(false) }
  }, [workflowId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkflowExecutions(workflowId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('workflow_executions').select('*').eq('workflow_id', workflowId).order('started_at', { ascending: false }).limit(50); setData(result || []) } finally { setIsLoading(false) }
  }, [workflowId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkflowLogs(executionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!executionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('workflow_logs').select('*').eq('execution_id', executionId).order('timestamp', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [executionId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkflowSchedules(workflowId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('workflow_schedules').select('*').eq('workflow_id', workflowId).eq('is_active', true); setData(result || []) } finally { setIsLoading(false) }
  }, [workflowId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkflowTemplates(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('workflow_templates').select('*').order('name', { ascending: true })
      if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkflowVariables(workflowId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('workflow_variables').select('*').eq('workflow_id', workflowId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [workflowId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkflowWebhooks(workflowId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('workflow_webhooks').select('*').eq('workflow_id', workflowId).eq('is_active', true); setData(result || []) } finally { setIsLoading(false) }
  }, [workflowId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
