'use client'

/**
 * Extended Bug Hooks - Covers all Bug-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBugReports(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('bug_reports').select('*').order('created_at', { ascending: false })
      if (projectId) query = query.eq('project_id', projectId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBugComments(bugId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!bugId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('bug_comments').select('*').eq('bug_id', bugId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [bugId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
