'use client'

/**
 * Extended Milestone Hooks - Covers all Milestone-related tables
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

export function useMilestones(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('milestones').select('*').order('due_date', { ascending: true })
      if (projectId) query = query.eq('project_id', projectId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMilestoneTasks(milestoneId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!milestoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('milestone_tasks').select('*').eq('milestone_id', milestoneId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [milestoneId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
