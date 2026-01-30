'use client'

/**
 * Extended Timesheets Hooks
 * Tables: timesheets, timesheet_entries, timesheet_approvals, timesheet_projects, timesheet_categories, timesheet_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function useTimesheet(timesheetId?: string) {
  const [timesheet, setTimesheet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!timesheetId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('timesheets').select('*, timesheet_entries(*, timesheet_projects(*), timesheet_categories(*)), timesheet_approvals(*, users(*))').eq('id', timesheetId).single(); setTimesheet(data) } finally { setIsLoading(false) }
  }, [timesheetId])
  useEffect(() => { fetch() }, [fetch])
  return { timesheet, isLoading, refresh: fetch }
}

export function useTimesheets(options?: { user_id?: string; status?: string; period_type?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [timesheets, setTimesheets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('timesheets').select('*, users(*)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.period_type) query = query.eq('period_type', options.period_type)
      if (options?.from_date) query = query.gte('period_start', options.from_date)
      if (options?.to_date) query = query.lte('period_end', options.to_date)
      const { data } = await query.order('period_start', { ascending: false }).limit(options?.limit || 50)
      setTimesheets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.period_type, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { timesheets, isLoading, refresh: fetch }
}

export function useMyTimesheets(userId?: string, options?: { status?: string; limit?: number }) {
  const [timesheets, setTimesheets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('timesheets').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('period_start', { ascending: false }).limit(options?.limit || 20)
      setTimesheets(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { timesheets, isLoading, refresh: fetch }
}

export function useTimesheetEntries(timesheetId?: string, options?: { date?: string; project_id?: string; is_billable?: boolean }) {
  const [entries, setEntries] = useState<any[]>([])
  const [totals, setTotals] = useState<{ total: number; billable: number; nonBillable: number }>({ total: 0, billable: 0, nonBillable: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!timesheetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('timesheet_entries').select('*, timesheet_projects(*), timesheet_categories(*)').eq('timesheet_id', timesheetId)
      if (options?.date) query = query.eq('date', options.date)
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.is_billable !== undefined) query = query.eq('is_billable', options.is_billable)
      const { data } = await query.order('date', { ascending: true })
      setEntries(data || [])
      const total = data?.reduce((sum, e) => sum + (e.hours || 0), 0) || 0
      const billable = data?.filter(e => e.is_billable).reduce((sum, e) => sum + (e.hours || 0), 0) || 0
      setTotals({ total, billable, nonBillable: total - billable })
    } finally { setIsLoading(false) }
  }, [timesheetId, options?.date, options?.project_id, options?.is_billable])
  useEffect(() => { fetch() }, [fetch])
  return { entries, totals, isLoading, refresh: fetch }
}

export function useTimesheetApprovals(timesheetId?: string) {
  const [approvals, setApprovals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!timesheetId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('timesheet_approvals').select('*, users(*)').eq('timesheet_id', timesheetId).order('created_at', { ascending: false }); setApprovals(data || []) } finally { setIsLoading(false) }
  }, [timesheetId])
  useEffect(() => { fetch() }, [fetch])
  return { approvals, isLoading, refresh: fetch }
}

export function usePendingApprovals(approverId?: string, options?: { limit?: number }) {
  const [timesheets, setTimesheets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!approverId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('timesheets').select('*, users(*), timesheet_entries(hours, is_billable)').eq('status', 'submitted').order('submitted_at', { ascending: true }).limit(options?.limit || 50)
      setTimesheets(data || [])
    } finally { setIsLoading(false) }
  }, [approverId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { timesheets, isLoading, refresh: fetch }
}

export function useTimesheetProjects(options?: { is_active?: boolean; search?: string }) {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('timesheet_projects').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true })
      setProjects(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.search])
  useEffect(() => { fetch() }, [fetch])
  return { projects, isLoading, refresh: fetch }
}

export function useTimesheetCategories(options?: { is_active?: boolean }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('timesheet_categories').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useTimesheetStats(userId?: string, options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('timesheets').select('*, timesheet_entries(hours, is_billable)').eq('user_id', userId)
      if (options?.from_date) query = query.gte('period_start', options.from_date)
      if (options?.to_date) query = query.lte('period_end', options.to_date)
      const { data } = await query
      let totalHours = 0, billableHours = 0
      data?.forEach(ts => {
        ts.timesheet_entries?.forEach((e: any) => {
          totalHours += e.hours || 0
          if (e.is_billable) billableHours += e.hours || 0
        })
      })
      setStats({
        totalHours,
        billableHours,
        nonBillableHours: totalHours - billableHours,
        billablePercentage: totalHours > 0 ? (billableHours / totalHours) * 100 : 0,
        timesheetCount: data?.length || 0
      })
    } finally { setIsLoading(false) }
  }, [userId, options?.from_date, options?.to_date])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useCurrentTimesheet(userId?: string, periodType: string = 'weekly') {
  const [timesheet, setTimesheet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date()
      let periodStart: Date
      if (periodType === 'weekly') {
        const dayOfWeek = now.getDay()
        periodStart = new Date(now)
        periodStart.setDate(now.getDate() - dayOfWeek)
        periodStart.setHours(0, 0, 0, 0)
      } else {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      }
      const { data } = await supabase.from('timesheets').select('*, timesheet_entries(*, timesheet_projects(*), timesheet_categories(*))').eq('user_id', userId).eq('period_start', periodStart.toISOString().split('T')[0]).single()
      setTimesheet(data)
    } finally { setIsLoading(false) }
  }, [userId, periodType])
  useEffect(() => { fetch() }, [fetch])
  return { timesheet, isLoading, refresh: fetch }
}

export function useDailyHours(timesheetId?: string) {
  const [dailyHours, setDailyHours] = useState<Record<string, { total: number; billable: number }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!timesheetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('timesheet_entries').select('date, hours, is_billable').eq('timesheet_id', timesheetId)
      const daily: Record<string, { total: number; billable: number }> = {}
      data?.forEach(e => {
        if (!daily[e.date]) daily[e.date] = { total: 0, billable: 0 }
        daily[e.date].total += e.hours || 0
        if (e.is_billable) daily[e.date].billable += e.hours || 0
      })
      setDailyHours(daily)
    } finally { setIsLoading(false) }
  }, [timesheetId])
  useEffect(() => { fetch() }, [fetch])
  return { dailyHours, isLoading, refresh: fetch }
}
