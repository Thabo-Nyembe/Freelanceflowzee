'use client'

/**
 * Extended Schedule Hooks - Covers all Schedule-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSchedule(scheduleId?: string) {
  const [schedule, setSchedule] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scheduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('schedules').select('*').eq('id', scheduleId).single()
      setSchedule(data)
    } finally { setIsLoading(false) }
  }, [scheduleId])
  useEffect(() => { fetch() }, [fetch])
  return { schedule, isLoading, refresh: fetch }
}

export function useSchedules(options?: { userId?: string; isActive?: boolean; entityType?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('schedules').select('*')
      if (options?.userId) query = query.eq('user_id', options.userId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      const { data: result } = await query.order('next_run_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.userId, options?.isActive, options?.entityType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useScheduleRuns(scheduleId?: string, limit = 20) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scheduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('schedule_runs').select('*').eq('schedule_id', scheduleId).order('executed_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [scheduleId, limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUpcomingSchedules(userId?: string, limit = 10) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('schedules').select('*').eq('is_active', true).gte('next_run_at', new Date().toISOString())
      if (userId) query = query.eq('user_id', userId)
      const { data: result } = await query.order('next_run_at', { ascending: true }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
