'use client'

/**
 * Extended Report Hooks - Covers all 7 Report-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReportExports(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('report_exports').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReportFilters(reportId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!reportId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('report_filters').select('*').eq('report_id', reportId); setData(result || []) } finally { setIsLoading(false) }
  }, [reportId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReportSchedules(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('report_schedules').select('*').eq('user_id', userId).eq('is_active', true); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReportShares(reportId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!reportId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('report_shares').select('*').eq('report_id', reportId).eq('is_active', true); setData(result || []) } finally { setIsLoading(false) }
  }, [reportId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReportTemplates(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('report_templates').select('*').order('name', { ascending: true })
      if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReportViews(reportId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!reportId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('report_views').select('*').eq('report_id', reportId).order('viewed_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [reportId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReportWidgets(reportId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!reportId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('report_widgets').select('*').eq('report_id', reportId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [reportId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
