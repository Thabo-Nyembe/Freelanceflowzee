'use client'

/**
 * Extended Triggers Hooks
 * Tables: triggers, trigger_conditions, trigger_actions, trigger_executions, trigger_logs, trigger_schedules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTrigger(triggerId?: string) {
  const [trigger, setTrigger] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!triggerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('triggers').select('*, trigger_conditions(*), trigger_actions(*)').eq('id', triggerId).single(); setTrigger(data) } finally { setIsLoading(false) }
  }, [triggerId])
  useEffect(() => { fetch() }, [fetch])
  return { trigger, isLoading, refresh: fetch }
}

export function useTriggers(options?: { trigger_type?: string; event_type?: string; entity_type?: string; is_active?: boolean; created_by?: string; search?: string; limit?: number }) {
  const [triggers, setTriggers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('triggers').select('*, trigger_conditions(count), trigger_actions(count)')
      if (options?.trigger_type) query = query.eq('trigger_type', options.trigger_type)
      if (options?.event_type) query = query.eq('event_type', options.event_type)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('priority', { ascending: false }).order('name', { ascending: true }).limit(options?.limit || 50)
      setTriggers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.trigger_type, options?.event_type, options?.entity_type, options?.is_active, options?.created_by, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { triggers, isLoading, refresh: fetch }
}

export function useMyTriggers(userId?: string, options?: { trigger_type?: string; is_active?: boolean }) {
  const [triggers, setTriggers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('triggers').select('*, trigger_conditions(count), trigger_actions(count)').eq('created_by', userId)
      if (options?.trigger_type) query = query.eq('trigger_type', options.trigger_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('updated_at', { ascending: false })
      setTriggers(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.trigger_type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { triggers, isLoading, refresh: fetch }
}

export function useTriggerConditions(triggerId?: string) {
  const [conditions, setConditions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!triggerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('trigger_conditions').select('*').eq('trigger_id', triggerId).order('order_index', { ascending: true }); setConditions(data || []) } finally { setIsLoading(false) }
  }, [triggerId])
  useEffect(() => { fetch() }, [fetch])
  return { conditions, isLoading, refresh: fetch }
}

export function useTriggerActions(triggerId?: string) {
  const [actions, setActions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!triggerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('trigger_actions').select('*').eq('trigger_id', triggerId).order('order_index', { ascending: true }); setActions(data || []) } finally { setIsLoading(false) }
  }, [triggerId])
  useEffect(() => { fetch() }, [fetch])
  return { actions, isLoading, refresh: fetch }
}

export function useTriggerExecutions(triggerId?: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [executions, setExecutions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!triggerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('trigger_executions').select('*').eq('trigger_id', triggerId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('executed_at', options.from_date)
      if (options?.to_date) query = query.lte('executed_at', options.to_date)
      const { data } = await query.order('executed_at', { ascending: false }).limit(options?.limit || 50)
      setExecutions(data || [])
    } finally { setIsLoading(false) }
  }, [triggerId, options?.status, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { executions, isLoading, refresh: fetch }
}

export function useTriggerLogs(triggerId?: string, options?: { status?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!triggerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('trigger_logs').select('*, users(*)').eq('trigger_id', triggerId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [triggerId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useTriggerSchedules(triggerId?: string) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [activeSchedule, setActiveSchedule] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!triggerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('trigger_schedules').select('*').eq('trigger_id', triggerId).order('created_at', { ascending: false })
      setSchedules(data || [])
      setActiveSchedule(data?.find(s => s.is_active) || null)
    } finally { setIsLoading(false) }
  }, [triggerId])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, activeSchedule, isLoading, refresh: fetch }
}

export function useTriggerStats(triggerId?: string, options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!triggerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('trigger_executions').select('status').eq('trigger_id', triggerId)
      if (options?.from_date) query = query.gte('executed_at', options.from_date)
      if (options?.to_date) query = query.lte('executed_at', options.to_date)
      const { data } = await query
      const executions = data || []
      setStats({
        total: executions.length,
        completed: executions.filter(e => e.status === 'completed').length,
        failed: executions.filter(e => e.status === 'failed').length,
        skipped: executions.filter(e => e.status === 'skipped').length
      })
    } finally { setIsLoading(false) }
  }, [triggerId, options?.from_date, options?.to_date])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useEventTriggers(eventType?: string, entityType?: string) {
  const [triggers, setTriggers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!eventType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('triggers').select('*, trigger_conditions(*), trigger_actions(*)').eq('is_active', true).eq('event_type', eventType)
      if (entityType) query = query.eq('entity_type', entityType)
      const { data } = await query.order('priority', { ascending: false })
      setTriggers(data || [])
    } finally { setIsLoading(false) }
  }, [eventType, entityType])
  useEffect(() => { fetch() }, [fetch])
  return { triggers, isLoading, refresh: fetch }
}

export function useTriggerTypes() {
  const [types, setTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('triggers').select('trigger_type').not('trigger_type', 'is', null)
      const unique = [...new Set(data?.map(t => t.trigger_type).filter(Boolean))]
      setTypes(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}
