'use client'

/**
 * Extended Export Hooks - Covers all Export-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useExport(exportId?: string) {
  const [exportData, setExportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!exportId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('exports').select('*').eq('id', exportId).single()
      setExportData(data)
    } finally { setIsLoading(false) }
  }, [exportId])
  useEffect(() => { loadData() }, [loadData])
  return { exportData, isLoading, refresh: loadData }
}

export function useExportProgress(exportId?: string) {
  const [status, setStatus] = useState<string>('pending')
  const [progress, setProgress] = useState(0)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!exportId) { setIsLoading(false); return }
    setIsLoading(true)

    const fetchInitial = async () => {
      const { data } = await supabase.from('exports').select('status, progress, file_url').eq('id', exportId).single()
      if (data) {
        setStatus(data.status)
        setProgress(data.progress || 0)
        setFileUrl(data.file_url)
      }
      setIsLoading(false)
    }

    fetchInitial()

    const channel = supabase.channel(`export-${exportId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'exports', filter: `id=eq.${exportId}` }, (payload) => {
      setStatus(payload.new.status)
      setProgress(payload.new.progress || 0)
      setFileUrl(payload.new.file_url)
    }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [exportId])

  return { status, progress, fileUrl, isComplete: status === 'completed', isFailed: status === 'failed', isLoading }
}

export function useUserExports(userId?: string, options?: { status?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('exports').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useScheduledExports(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('scheduled_exports').select('*').eq('user_id', userId).eq('is_active', true).order('next_run_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
