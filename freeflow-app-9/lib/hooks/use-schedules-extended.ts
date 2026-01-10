'use client'

/**
 * Extended Schedules Hooks
 * Tables: schedules, schedule_entries, schedule_exceptions, schedule_templates, schedule_assignments, schedule_conflicts
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
    try { const { data } = await supabase.from('schedules').select('*, schedule_entries(*), schedule_exceptions(*), schedule_assignments(*), users(*)').eq('id', scheduleId).single(); setSchedule(data) } finally { setIsLoading(false) }
  }, [scheduleId])
  useEffect(() => { fetch() }, [fetch])
  return { schedule, isLoading, refresh: fetch }
}

export function useSchedules(options?: { owner_id?: string; entity_type?: string; entity_id?: string; type?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('schedules').select('*, schedule_entries(count), schedule_assignments(count), users(*)')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.entity_type, options?.entity_id, options?.type, options?.is_active, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useScheduleEntries(scheduleId?: string, options?: { from_date?: string; to_date?: string; day_of_week?: number }) {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scheduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('schedule_entries').select('*').eq('schedule_id', scheduleId)
      if (options?.from_date) query = query.gte('start_time', options.from_date)
      if (options?.to_date) query = query.lte('end_time', options.to_date)
      if (options?.day_of_week !== undefined) query = query.eq('day_of_week', options.day_of_week)
      const { data } = await query.order('start_time', { ascending: true })
      setEntries(data || [])
    } finally { setIsLoading(false) }
  }, [scheduleId, options?.from_date, options?.to_date, options?.day_of_week])
  useEffect(() => { fetch() }, [fetch])
  return { entries, isLoading, refresh: fetch }
}

export function useScheduleExceptions(scheduleId?: string, options?: { from_date?: string; to_date?: string; type?: string }) {
  const [exceptions, setExceptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scheduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('schedule_exceptions').select('*').eq('schedule_id', scheduleId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.from_date) query = query.gte('date', options.from_date)
      if (options?.to_date) query = query.lte('date', options.to_date)
      const { data } = await query.order('date', { ascending: true })
      setExceptions(data || [])
    } finally { setIsLoading(false) }
  }, [scheduleId, options?.type, options?.from_date, options?.to_date])
  useEffect(() => { fetch() }, [fetch])
  return { exceptions, isLoading, refresh: fetch }
}

export function useScheduleConflicts(scheduleId?: string) {
  const [conflicts, setConflicts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scheduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('schedule_conflicts').select('*, entry1:entry1_id(*), entry2:entry2_id(*)').eq('schedule_id', scheduleId).is('resolved_at', null); setConflicts(data || []) } finally { setIsLoading(false) }
  }, [scheduleId])
  useEffect(() => { fetch() }, [fetch])
  return { conflicts, isLoading, refresh: fetch }
}

export function useScheduleAssignments(scheduleId?: string) {
  const [assignments, setAssignments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scheduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('schedule_assignments').select('*, users(*)').eq('schedule_id', scheduleId); setAssignments(data || []) } finally { setIsLoading(false) }
  }, [scheduleId])
  useEffect(() => { fetch() }, [fetch])
  return { assignments, isLoading, refresh: fetch }
}

export function useUserSchedules(userId?: string, options?: { type?: string; is_active?: boolean }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: assignments } = await supabase.from('schedule_assignments').select('schedule_id').eq('user_id', userId)
      if (!assignments || assignments.length === 0) { setSchedules([]); return }
      const scheduleIds = assignments.map(a => a.schedule_id)
      let query = supabase.from('schedules').select('*, schedule_entries(count)').in('id', scheduleIds)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useScheduleTemplates(options?: { type?: string; is_active?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('schedule_templates').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useScheduleStats() {
  const [stats, setStats] = useState<{ total: number; active: number; totalEntries: number; conflicts: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const [total, active, entries, conflicts] = await Promise.all([
        supabase.from('schedules').select('*', { count: 'exact', head: true }),
        supabase.from('schedules').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('schedule_entries').select('*', { count: 'exact', head: true }),
        supabase.from('schedule_conflicts').select('*', { count: 'exact', head: true }).is('resolved_at', null)
      ])
      setStats({ total: total.count || 0, active: active.count || 0, totalEntries: entries.count || 0, conflicts: conflicts.count || 0 })
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useTodayEntries(scheduleId?: string) {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scheduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase.from('schedule_entries').select('*').eq('schedule_id', scheduleId).gte('start_time', today).lt('start_time', today + 'T23:59:59').order('start_time', { ascending: true })
      setEntries(data || [])
    } finally { setIsLoading(false) }
  }, [scheduleId])
  useEffect(() => { fetch() }, [fetch])
  return { entries, isLoading, refresh: fetch }
}

