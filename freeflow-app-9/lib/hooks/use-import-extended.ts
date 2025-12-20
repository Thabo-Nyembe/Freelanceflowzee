'use client'

/**
 * Extended Import Hooks - Covers all Import-related tables
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
    try {
      const { data } = await supabase.from('imports').select('*').eq('id', importId).single()
      setImportData(data)
    } finally { setIsLoading(false) }
  }, [importId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { importData, isLoading, refresh: fetch }
}

export function useImportProgress(importId?: string) {
  const [status, setStatus] = useState<string>('pending')
  const [progress, setProgress] = useState(0)
  const [processedRows, setProcessedRows] = useState(0)
  const [failedRows, setFailedRows] = useState(0)
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!importId) { setIsLoading(false); return }
    setIsLoading(true)

    const fetchInitial = async () => {
      const { data } = await supabase.from('imports').select('status, progress, processed_rows, failed_rows, total_rows').eq('id', importId).single()
      if (data) {
        setStatus(data.status)
        setProgress(data.progress || 0)
        setProcessedRows(data.processed_rows || 0)
        setFailedRows(data.failed_rows || 0)
        setTotalRows(data.total_rows || 0)
      }
      setIsLoading(false)
    }

    fetchInitial()

    const channel = supabase.channel(`import-${importId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'imports', filter: `id=eq.${importId}` }, (payload) => {
      setStatus(payload.new.status)
      setProgress(payload.new.progress || 0)
      setProcessedRows(payload.new.processed_rows || 0)
      setFailedRows(payload.new.failed_rows || 0)
      setTotalRows(payload.new.total_rows || 0)
    }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [importId, supabase])

  return { status, progress, processedRows, failedRows, totalRows, isComplete: status === 'completed', isFailed: status === 'failed', isLoading }
}

export function useUserImports(userId?: string, options?: { status?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('imports').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useImportErrors(importId?: string) {
  const [errors, setErrors] = useState<any[]>([])
  const [failedRows, setFailedRows] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!importId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('imports').select('errors, failed_rows').eq('id', importId).single()
      setErrors(data?.errors || [])
      setFailedRows(data?.failed_rows || 0)
    } finally { setIsLoading(false) }
  }, [importId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { errors, failedRows, isLoading, refresh: fetch }
}
