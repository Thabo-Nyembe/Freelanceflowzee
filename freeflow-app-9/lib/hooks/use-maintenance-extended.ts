'use client'

/**
 * Extended Maintenance Hooks - Covers all Maintenance-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMaintenanceWindows() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data: result } = await supabase.from('maintenance_windows').select('*').order('scheduled_start', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMaintenanceTasks(windowId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!windowId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('maintenance_tasks').select('*').eq('window_id', windowId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [windowId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
