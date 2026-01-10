'use client'

/**
 * Extended Task Hooks - Covers all Task-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTasks(projectId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (projectId) query = query.eq('project_id', projectId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId, status])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTaskAssignments(taskId?: string, userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('task_assignments').select('*').order('assigned_at', { ascending: false })
      if (taskId) query = query.eq('task_id', taskId)
      if (userId) query = query.eq('user_id', userId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [taskId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
