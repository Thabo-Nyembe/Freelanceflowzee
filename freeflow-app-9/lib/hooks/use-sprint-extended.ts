'use client'

/**
 * Extended Sprint Hooks - Covers all Sprint-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSprints(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sprints').select('*').order('start_date', { ascending: false })
      if (projectId) query = query.eq('project_id', projectId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useSprintTasks(sprintId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!sprintId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('sprint_tasks').select('*').eq('sprint_id', sprintId).order('priority', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [sprintId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
