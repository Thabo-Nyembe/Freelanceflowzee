'use client'

/**
 * Extended Time Hooks - Covers all Time-related tables
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

export function useTimeEntries(userId?: string, projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('time_entries').select('*').order('start_time', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (projectId) query = query.eq('project_id', projectId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, projectId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTimeSheets(userId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('time_sheets').select('*').order('period_start', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, status])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
