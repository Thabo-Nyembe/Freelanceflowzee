'use client'

/**
 * Extended Log Hooks - Covers all Log-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLogs(logType?: string, level?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(100)
      if (logType) query = query.eq('log_type', logType)
      if (level) query = query.eq('level', level)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [logType, level])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLogEntries(logId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!logId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('log_entries').select('*').eq('log_id', logId).order('timestamp', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [logId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
