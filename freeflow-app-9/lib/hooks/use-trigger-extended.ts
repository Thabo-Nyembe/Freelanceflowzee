'use client'

/**
 * Extended Trigger Hooks - Covers all Trigger-related tables
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
    try {
      const { data } = await supabase.from('triggers').select('*').eq('id', triggerId).single()
      setTrigger(data)
    } finally { setIsLoading(false) }
  }, [triggerId])
  useEffect(() => { fetch() }, [fetch])
  return { trigger, isLoading, refresh: fetch }
}

export function useUserTriggers(userId?: string, options?: { isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('triggers').select('*').eq('user_id', userId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.isActive])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTriggersForEvent(eventType?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!eventType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('triggers').select('*').eq('event_type', eventType).eq('is_active', true)
      if (entityType) query = query.eq('entity_type', entityType)
      const { data: result } = await query.order('priority', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [eventType, entityType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTriggerExecutions(triggerId?: string, limit = 20) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!triggerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('trigger_executions').select('*').eq('trigger_id', triggerId).order('executed_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [triggerId, limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTriggerStats(triggerId?: string) {
  const [executionCount, setExecutionCount] = useState(0)
  const [lastExecutedAt, setLastExecutedAt] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!triggerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('triggers').select('execution_count, last_executed_at, is_active').eq('id', triggerId).single()
      if (data) {
        setExecutionCount(data.execution_count || 0)
        setLastExecutedAt(data.last_executed_at)
        setIsActive(data.is_active)
      }
    } finally { setIsLoading(false) }
  }, [triggerId])
  useEffect(() => { fetch() }, [fetch])
  return { executionCount, lastExecutedAt, isActive, isLoading, refresh: fetch }
}
