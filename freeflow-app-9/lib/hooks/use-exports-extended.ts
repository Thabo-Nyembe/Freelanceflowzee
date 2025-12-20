'use client'

/**
 * Extended Exports Hooks
 * Tables: exports, export_jobs, export_templates, export_schedules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useExport(exportId?: string) {
  const [exportData, setExportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!exportId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('exports').select('*').eq('id', exportId).single(); setExportData(data) } finally { setIsLoading(false) }
  }, [exportId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { export: exportData, isLoading, refresh: fetch }
}

export function useUserExports(userId?: string, options?: { type?: string; status?: string; limit?: number }) {
  const [exports, setExports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('exports').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setExports(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { exports, isLoading, refresh: fetch }
}

export function useRecentExports(userId?: string, limit?: number) {
  const [exports, setExports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('exports').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit || 10); setExports(data || []) } finally { setIsLoading(false) }
  }, [userId, limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { exports, isLoading, refresh: fetch }
}

export function useExportJob(jobId?: string) {
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!jobId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('export_jobs').select('*').eq('id', jobId).single(); setJob(data) } finally { setIsLoading(false) }
  }, [jobId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { job, isLoading, refresh: fetch }
}

export function useExportTemplates(options?: { type?: string; is_public?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('export_templates').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_public, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useExportSchedules(userId?: string, options?: { is_active?: boolean }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('export_schedules').select('*, export_templates(*)').eq('user_id', userId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function usePendingExports(userId?: string) {
  const [exports, setExports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('exports').select('*').eq('user_id', userId).in('status', ['pending', 'processing']).order('created_at', { ascending: false }); setExports(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { exports, isLoading, refresh: fetch }
}

export function useExportStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; completed: number; failed: number; totalSize: number; byType: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('exports').select('status, type, file_size').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const total = data.length
      const completed = data.filter(e => e.status === 'completed').length
      const failed = data.filter(e => e.status === 'failed').length
      const totalSize = data.reduce((sum, e) => sum + (e.file_size || 0), 0)
      const byType = data.reduce((acc: Record<string, number>, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc }, {})
      setStats({ total, completed, failed, totalSize, byType })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
