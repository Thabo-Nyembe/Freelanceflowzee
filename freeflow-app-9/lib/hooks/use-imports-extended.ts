'use client'

/**
 * Extended Imports Hooks
 * Tables: imports, import_jobs, import_mappings, import_errors, import_templates, import_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useImport(importId?: string) {
  const [importData, setImportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!importId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('imports').select('*, import_jobs(*), import_errors(*)').eq('id', importId).single(); setImportData(data) } finally { setIsLoading(false) }
  }, [importId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { importData, isLoading, refresh: fetch }
}

export function useImports(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  const [imports, setImports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('imports').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setImports(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { imports, isLoading, refresh: fetch }
}

export function useUserImports(userId?: string, options?: { type?: string; status?: string }) {
  const [imports, setImports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('imports').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setImports(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { imports, isLoading, refresh: fetch }
}

export function useImportJobs(importId?: string) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!importId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('import_jobs').select('*').eq('import_id', importId).order('batch_number', { ascending: true }); setJobs(data || []) } finally { setIsLoading(false) }
  }, [importId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { jobs, isLoading, refresh: fetch }
}

export function useImportMappings(importId?: string) {
  const [mappings, setMappings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!importId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('import_mappings').select('*').eq('import_id', importId).order('source_field', { ascending: true }); setMappings(data || []) } finally { setIsLoading(false) }
  }, [importId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { mappings, isLoading, refresh: fetch }
}

export function useImportErrors(importId?: string, options?: { limit?: number }) {
  const [errors, setErrors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!importId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('import_errors').select('*').eq('import_id', importId).order('created_at', { ascending: false }).limit(options?.limit || 100); setErrors(data || []) } finally { setIsLoading(false) }
  }, [importId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { errors, isLoading, refresh: fetch }
}

export function useImportTemplates(options?: { type?: string }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('import_templates').select('*')
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useImportHistory(userId?: string, options?: { type?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('import_history').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useActiveImports(userId?: string) {
  const [imports, setImports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('imports').select('*').eq('user_id', userId).in('status', ['pending', 'processing']).order('created_at', { ascending: false }); setImports(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { imports, isLoading, refresh: fetch }
}

export function useImportProgress(importId?: string) {
  const [progress, setProgress] = useState<{ total: number; processed: number; errors: number; percentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!importId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('imports').select('total_records, processed_records, error_count').eq('id', importId).single()
      if (data) {
        const percentage = data.total_records > 0 ? Math.round((data.processed_records / data.total_records) * 100) : 0
        setProgress({ total: data.total_records, processed: data.processed_records, errors: data.error_count, percentage })
      }
    } finally { setIsLoading(false) }
  }, [importId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}
