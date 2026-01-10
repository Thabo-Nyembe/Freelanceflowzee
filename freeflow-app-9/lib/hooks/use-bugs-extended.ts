'use client'

/**
 * Extended Bugs Hooks
 * Tables: bugs, bug_comments, bug_attachments, bug_assignments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBug(bugId?: string) {
  const [bug, setBug] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!bugId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('bugs').select('*, bug_comments(*), bug_attachments(*)').eq('id', bugId).single(); setBug(data) } finally { setIsLoading(false) }
  }, [bugId])
  useEffect(() => { fetch() }, [fetch])
  return { bug, isLoading, refresh: fetch }
}

export function useBugs(options?: { project_id?: string; reporter_id?: string; assignee_id?: string; status?: string; severity?: string; limit?: number }) {
  const [bugs, setBugs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('bugs').select('*')
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.reporter_id) query = query.eq('reporter_id', options.reporter_id)
      if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.severity) query = query.eq('severity', options.severity)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setBugs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.project_id, options?.reporter_id, options?.assignee_id, options?.status, options?.severity, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { bugs, isLoading, refresh: fetch }
}

export function useBugComments(bugId?: string) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!bugId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('bug_comments').select('*').eq('bug_id', bugId).order('created_at', { ascending: true }); setComments(data || []) } finally { setIsLoading(false) }
  }, [bugId])
  useEffect(() => { fetch() }, [fetch])
  return { comments, isLoading, refresh: fetch }
}

export function useOpenBugs(projectId?: string) {
  const [bugs, setBugs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('bugs').select('*').in('status', ['open', 'assigned', 'in_progress', 'reopened'])
      if (projectId) query = query.eq('project_id', projectId)
      const { data } = await query.order('severity', { ascending: true }).order('created_at', { ascending: false })
      setBugs(data || [])
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { bugs, isLoading, refresh: fetch }
}

export function useMyAssignedBugs(userId?: string) {
  const [bugs, setBugs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('bugs').select('*').eq('assignee_id', userId).neq('status', 'closed').order('priority', { ascending: true }); setBugs(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { bugs, isLoading, refresh: fetch }
}

export function useBugStats(projectId?: string) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; bySeverity: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('bugs').select('status, severity')
      if (projectId) query = query.eq('project_id', projectId)
      const { data } = await query
      if (!data) { setStats(null); return }
      const total = data.length
      const byStatus = data.reduce((acc: Record<string, number>, b) => { acc[b.status || 'unknown'] = (acc[b.status || 'unknown'] || 0) + 1; return acc }, {})
      const bySeverity = data.reduce((acc: Record<string, number>, b) => { acc[b.severity || 'unknown'] = (acc[b.severity || 'unknown'] || 0) + 1; return acc }, {})
      setStats({ total, byStatus, bySeverity })
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useBugCommentsRealtime(bugId?: string) {
  const [comments, setComments] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!bugId) return
    supabase.from('bug_comments').select('*').eq('bug_id', bugId).order('created_at', { ascending: true }).then(({ data }) => setComments(data || []))
    const channel = supabase.channel(`bug_comments_${bugId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bug_comments', filter: `bug_id=eq.${bugId}` }, () => {
        supabase.from('bug_comments').select('*').eq('bug_id', bugId).order('created_at', { ascending: true }).then(({ data }) => setComments(data || []))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [bugId])
  return { comments }
}
