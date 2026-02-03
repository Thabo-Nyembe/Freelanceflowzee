'use client'

/**
 * Extended Callback Hooks - Covers all Callback-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCallbackConfig(callbackId?: string) {
  const [callbackConfig, setCallbackConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!callbackId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('callbacks').select('*').eq('id', callbackId).single()
      setCallbackConfig(data)
    } finally { setIsLoading(false) }
  }, [callbackId])
  useEffect(() => { loadData() }, [loadData])
  return { callbackConfig, isLoading, refresh: loadData }
}

export function useUserCallbacks(userId?: string, options?: { isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('callbacks').select('*').eq('user_id', userId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.isActive])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useCallbackLogs(callbackId?: string, options?: { status?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!callbackId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('callback_logs').select('*').eq('callback_id', callbackId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('executed_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [callbackId, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useCallbackStats(callbackId?: string) {
  const [callCount, setCallCount] = useState(0)
  const [failureCount, setFailureCount] = useState(0)
  const [successRate, setSuccessRate] = useState(100)
  const [lastCalledAt, setLastCalledAt] = useState<string | null>(null)
  const [lastStatus, setLastStatus] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!callbackId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('callbacks').select('call_count, failure_count, last_called_at, last_status, is_active').eq('id', callbackId).single()
      if (data) {
        setCallCount(data.call_count || 0)
        setFailureCount(data.failure_count || 0)
        setSuccessRate(data.call_count > 0 ? ((data.call_count - data.failure_count) / data.call_count) * 100 : 100)
        setLastCalledAt(data.last_called_at)
        setLastStatus(data.last_status)
        setIsActive(data.is_active)
      }
    } finally { setIsLoading(false) }
  }, [callbackId])
  useEffect(() => { loadData() }, [loadData])
  return { callCount, failureCount, successRate, lastCalledAt, lastStatus, isActive, isLoading, refresh: loadData }
}

export function useCallbacksByType(callbackType?: string, userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!callbackType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('callbacks').select('*').eq('callback_type', callbackType).eq('is_active', true)
      if (userId) query = query.eq('user_id', userId)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [callbackType, userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
