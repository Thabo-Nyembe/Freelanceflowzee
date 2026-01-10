'use client'

/**
 * Extended Macros Hooks
 * Tables: macros, macro_steps, macro_triggers, macro_executions, macro_variables, macro_schedules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMacro(macroId?: string) {
  const [macro, setMacro] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!macroId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('macros').select('*, macro_steps(*), macro_triggers(*), macro_variables(*)').eq('id', macroId).single(); setMacro(data) } finally { setIsLoading(false) }
  }, [macroId])
  useEffect(() => { fetch() }, [fetch])
  return { macro, isLoading, refresh: fetch }
}

export function useMacros(options?: { user_id?: string; organization_id?: string; category?: string; is_enabled?: boolean; limit?: number }) {
  const [macros, setMacros] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('macros').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setMacros(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.organization_id, options?.category, options?.is_enabled, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { macros, isLoading, refresh: fetch }
}

export function useMacroSteps(macroId?: string) {
  const [steps, setSteps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!macroId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('macro_steps').select('*').eq('macro_id', macroId).order('order', { ascending: true }); setSteps(data || []) } finally { setIsLoading(false) }
  }, [macroId])
  useEffect(() => { fetch() }, [fetch])
  return { steps, isLoading, refresh: fetch }
}

export function useMacroTriggers(macroId?: string) {
  const [triggers, setTriggers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!macroId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('macro_triggers').select('*').eq('macro_id', macroId); setTriggers(data || []) } finally { setIsLoading(false) }
  }, [macroId])
  useEffect(() => { fetch() }, [fetch])
  return { triggers, isLoading, refresh: fetch }
}

export function useMacroExecutions(macroId?: string, options?: { status?: string; limit?: number }) {
  const [executions, setExecutions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!macroId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('macro_executions').select('*').eq('macro_id', macroId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setExecutions(data || [])
    } finally { setIsLoading(false) }
  }, [macroId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { executions, isLoading, refresh: fetch }
}

export function useMacroVariables(macroId?: string) {
  const [variables, setVariables] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!macroId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('macro_variables').select('*').eq('macro_id', macroId).order('name', { ascending: true }); setVariables(data || []) } finally { setIsLoading(false) }
  }, [macroId])
  useEffect(() => { fetch() }, [fetch])
  return { variables, isLoading, refresh: fetch }
}

export function useMacroSchedules(macroId?: string) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!macroId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('macro_schedules').select('*').eq('macro_id', macroId); setSchedules(data || []) } finally { setIsLoading(false) }
  }, [macroId])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useEnabledMacros(userId?: string) {
  const [macros, setMacros] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('macros').select('*').eq('user_id', userId).eq('is_enabled', true).order('name', { ascending: true }); setMacros(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { macros, isLoading, refresh: fetch }
}

export function useRecentExecutions(userId?: string, options?: { limit?: number }) {
  const [executions, setExecutions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: macros } = await supabase.from('macros').select('id').eq('user_id', userId)
      const macroIds = macros?.map(m => m.id) || []
      if (macroIds.length === 0) { setExecutions([]); setIsLoading(false); return }
      const { data } = await supabase.from('macro_executions').select('*, macros(name)').in('macro_id', macroIds).order('started_at', { ascending: false }).limit(options?.limit || 20)
      setExecutions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { executions, isLoading, refresh: fetch }
}

export function useMacroStats(macroId?: string) {
  const [stats, setStats] = useState<{ total: number; successful: number; failed: number; avgDuration: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!macroId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('macro_executions').select('status, started_at, completed_at').eq('macro_id', macroId)
      const total = data?.length || 0
      const successful = data?.filter(e => e.status === 'completed').length || 0
      const failed = data?.filter(e => e.status === 'failed').length || 0
      const durations = data?.filter(e => e.completed_at).map(e => new Date(e.completed_at).getTime() - new Date(e.started_at).getTime()) || []
      const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
      setStats({ total, successful, failed, avgDuration })
    } finally { setIsLoading(false) }
  }, [macroId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
