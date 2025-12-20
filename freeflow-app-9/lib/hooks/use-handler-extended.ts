'use client'

/**
 * Extended Handler Hooks - Covers all Handler-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useHandler(handlerId?: string) {
  const [handler, setHandler] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!handlerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('handlers').select('*').eq('id', handlerId).single()
      setHandler(data)
    } finally { setIsLoading(false) }
  }, [handlerId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { handler, isLoading, refresh: fetch }
}

export function useUserHandlers(userId?: string, options?: { isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('handlers').select('*').eq('user_id', userId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useHandlersForEvent(eventType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!eventType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('handlers').select('*').contains('event_types', [eventType]).eq('is_active', true)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [eventType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useHandlerExecutions(handlerId?: string, limit = 20) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!handlerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('handler_executions').select('*').eq('handler_id', handlerId).order('executed_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [handlerId, limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useHandlerStats(handlerId?: string) {
  const [executionCount, setExecutionCount] = useState(0)
  const [failureCount, setFailureCount] = useState(0)
  const [successRate, setSuccessRate] = useState(100)
  const [lastExecutedAt, setLastExecutedAt] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!handlerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('handlers').select('execution_count, failure_count, last_executed_at, is_active').eq('id', handlerId).single()
      if (data) {
        setExecutionCount(data.execution_count || 0)
        setFailureCount(data.failure_count || 0)
        setSuccessRate(data.execution_count > 0 ? ((data.execution_count - data.failure_count) / data.execution_count) * 100 : 100)
        setLastExecutedAt(data.last_executed_at)
        setIsActive(data.is_active)
      }
    } finally { setIsLoading(false) }
  }, [handlerId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { executionCount, failureCount, successRate, lastExecutedAt, isActive, isLoading, refresh: fetch }
}
