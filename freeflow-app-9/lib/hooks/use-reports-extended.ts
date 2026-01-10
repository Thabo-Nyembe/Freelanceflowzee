'use client'

/**
 * Extended Reports Hooks
 * Tables: reports, report_templates, report_schedules, report_exports, report_widgets, report_permissions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReport(reportId?: string) {
  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!reportId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('reports').select('*, report_templates(*), report_widgets(*), users(*), report_exports(*)').eq('id', reportId).single(); setReport(data) } finally { setIsLoading(false) }
  }, [reportId])
  useEffect(() => { fetch() }, [fetch])
  return { report, isLoading, refresh: fetch }
}

export function useReports(options?: { user_id?: string; organization_id?: string; type?: string; template_id?: string; status?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('reports').select('*, report_templates(*), users(*), report_widgets(count)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.template_id) query = query.eq('template_id', options.template_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.organization_id, options?.type, options?.template_id, options?.status, options?.is_public, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useMyReports(userId?: string, options?: { type?: string; status?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('reports').select('*, report_templates(*), report_widgets(count)').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useReportTemplates(options?: { type?: string; category?: string; is_active?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('report_templates').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.category, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useReportWidgets(reportId?: string) {
  const [widgets, setWidgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!reportId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('report_widgets').select('*').eq('report_id', reportId).order('order', { ascending: true }); setWidgets(data || []) } finally { setIsLoading(false) }
  }, [reportId])
  useEffect(() => { fetch() }, [fetch])
  return { widgets, isLoading, refresh: fetch }
}

export function useReportSchedules(reportId?: string) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!reportId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('report_schedules').select('*').eq('report_id', reportId).order('created_at', { ascending: false }); setSchedules(data || []) } finally { setIsLoading(false) }
  }, [reportId])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useReportExports(reportId?: string, options?: { limit?: number }) {
  const [exports, setExports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!reportId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('report_exports').select('*, users(*)').eq('report_id', reportId).order('created_at', { ascending: false }).limit(options?.limit || 20); setExports(data || []) } finally { setIsLoading(false) }
  }, [reportId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { exports, isLoading, refresh: fetch }
}

export function usePublicReports(options?: { type?: string; search?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('reports').select('*, report_templates(*), users(*)').eq('is_public', true).eq('status', 'published')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('run_count', { ascending: false }).limit(options?.limit || 20)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useRecentReports(userId?: string, options?: { limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reports').select('*, report_templates(*)').eq('user_id', userId).not('last_run_at', 'is', null).order('last_run_at', { ascending: false }).limit(options?.limit || 10)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useScheduledReports(options?: { is_active?: boolean; limit?: number }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('report_schedules').select('*, reports(*)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('next_run_at', { ascending: true }).limit(options?.limit || 50)
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}
