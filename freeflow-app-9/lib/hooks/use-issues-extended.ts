'use client'

/**
 * Extended Issues Hooks
 * Tables: issues, issue_comments, issue_labels, issue_assignees, issue_milestones, issue_attachments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useIssue(issueId?: string) {
  const [issue, setIssue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!issueId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('issues').select('*, issue_comments(*), issue_labels(*), issue_assignees(*), issue_attachments(*)').eq('id', issueId).single(); setIssue(data) } finally { setIsLoading(false) }
  }, [issueId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { issue, isLoading, refresh: fetch }
}

export function useIssues(options?: { project_id?: string; status?: string; priority?: string; type?: string; milestone_id?: string; created_by?: string; limit?: number }) {
  const [issues, setIssues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('issues').select('*, issue_labels(*), issue_assignees(*)')
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.milestone_id) query = query.eq('milestone_id', options.milestone_id)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setIssues(data || [])
    } finally { setIsLoading(false) }
  }, [options?.project_id, options?.status, options?.priority, options?.type, options?.milestone_id, options?.created_by, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { issues, isLoading, refresh: fetch }
}

export function useProjectIssues(projectId?: string, options?: { status?: string }) {
  const [issues, setIssues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('issues').select('*, issue_labels(*), issue_assignees(*)').eq('project_id', projectId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setIssues(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { issues, isLoading, refresh: fetch }
}

export function useIssueComments(issueId?: string) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!issueId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('issue_comments').select('*').eq('issue_id', issueId).order('created_at', { ascending: true }); setComments(data || []) } finally { setIsLoading(false) }
  }, [issueId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { comments, isLoading, refresh: fetch }
}

export function useIssueLabels(issueId?: string) {
  const [labels, setLabels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!issueId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('issue_labels').select('*, labels(*)').eq('issue_id', issueId); setLabels(data || []) } finally { setIsLoading(false) }
  }, [issueId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { labels, isLoading, refresh: fetch }
}

export function useIssueAssignees(issueId?: string) {
  const [assignees, setAssignees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!issueId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('issue_assignees').select('*').eq('issue_id', issueId); setAssignees(data || []) } finally { setIsLoading(false) }
  }, [issueId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { assignees, isLoading, refresh: fetch }
}

export function useIssueMilestones(projectId?: string, options?: { is_open?: boolean }) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('issue_milestones').select('*').eq('project_id', projectId)
      if (options?.is_open !== undefined) query = query.eq('is_open', options.is_open)
      const { data } = await query.order('due_date', { ascending: true })
      setMilestones(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.is_open, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { milestones, isLoading, refresh: fetch }
}

export function useIssueAttachments(issueId?: string) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!issueId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('issue_attachments').select('*').eq('issue_id', issueId).order('uploaded_at', { ascending: false }); setAttachments(data || []) } finally { setIsLoading(false) }
  }, [issueId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { attachments, isLoading, refresh: fetch }
}

export function useOpenIssues(projectId?: string) {
  const [issues, setIssues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('issues').select('*, issue_labels(*), issue_assignees(*)').eq('project_id', projectId).eq('status', 'open').order('created_at', { ascending: false }); setIssues(data || []) } finally { setIsLoading(false) }
  }, [projectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { issues, isLoading, refresh: fetch }
}

export function useMyAssignedIssues(userId?: string, options?: { status?: string }) {
  const [issues, setIssues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: assignments } = await supabase.from('issue_assignees').select('issue_id').eq('user_id', userId)
      const issueIds = assignments?.map(a => a.issue_id) || []
      if (issueIds.length === 0) { setIssues([]); setIsLoading(false); return }
      let query = supabase.from('issues').select('*, issue_labels(*)').in('id', issueIds)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setIssues(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { issues, isLoading, refresh: fetch }
}
