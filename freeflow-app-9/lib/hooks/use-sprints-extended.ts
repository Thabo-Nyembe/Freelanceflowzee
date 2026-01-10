'use client'

/**
 * Extended Sprints Hooks
 * Tables: sprints, sprint_tasks, sprint_metrics, sprint_retrospectives
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSprint(sprintId?: string) {
  const [sprint, setSprint] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sprintId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('sprints').select('*, sprint_tasks(*)').eq('id', sprintId).single(); setSprint(data) } finally { setIsLoading(false) }
  }, [sprintId])
  useEffect(() => { fetch() }, [fetch])
  return { sprint, isLoading, refresh: fetch }
}

export function useSprints(options?: { project_id?: string; status?: string; limit?: number }) {
  const [sprints, setSprints] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('sprints').select('*')
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('start_date', { ascending: false }).limit(options?.limit || 20)
      setSprints(data || [])
    } finally { setIsLoading(false) }
  }, [options?.project_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { sprints, isLoading, refresh: fetch }
}

export function useSprintTasks(sprintId?: string, options?: { status?: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sprintId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('sprint_tasks').select('*').eq('sprint_id', sprintId); if (options?.status) query = query.eq('status', options.status); const { data } = await query.order('priority', { ascending: true }); setTasks(data || []) } finally { setIsLoading(false) }
  }, [sprintId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tasks, isLoading, refresh: fetch }
}

export function useSprintMetrics(sprintId?: string) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sprintId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('sprint_metrics').select('*').eq('sprint_id', sprintId).order('recorded_at', { ascending: false }); setMetrics(data || []) } finally { setIsLoading(false) }
  }, [sprintId])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useActiveSpring(projectId?: string) {
  const [sprint, setSprint] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('sprints').select('*').eq('project_id', projectId).eq('status', 'active').order('start_date', { ascending: false }).limit(1).single(); setSprint(data) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { sprint, isLoading, refresh: fetch }
}

export function useSprintRetrospective(sprintId?: string) {
  const [retrospective, setRetrospective] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!sprintId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('sprint_retrospectives').select('*').eq('sprint_id', sprintId).single(); setRetrospective(data) } finally { setIsLoading(false) }
  }, [sprintId])
  useEffect(() => { fetch() }, [fetch])
  return { retrospective, isLoading, refresh: fetch }
}
