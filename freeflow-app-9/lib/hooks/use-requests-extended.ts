'use client'

/**
 * Extended Requests Hooks
 * Tables: requests, request_types, request_comments, request_attachments, request_approvals, request_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRequest(requestId?: string) {
  const [request, setRequest] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!requestId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('requests').select('*, request_types(*), request_comments(*), request_attachments(*), request_approvals(*), requester:requester_id(*), assignee:assignee_id(*)').eq('id', requestId).single(); setRequest(data) } finally { setIsLoading(false) }
  }, [requestId])
  useEffect(() => { loadData() }, [loadData])
  return { request, isLoading, refresh: loadData }
}

export function useRequests(options?: { requester_id?: string; assignee_id?: string; type_id?: string; status?: string; priority?: string; category?: string; search?: string; limit?: number }) {
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('requests').select('*, request_types(*), requester:requester_id(*), assignee:assignee_id(*), request_comments(count)')
      if (options?.requester_id) query = query.eq('requester_id', options.requester_id)
      if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id)
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.search) query = query.or(`title.ilike.%${options.search}%,request_number.ilike.%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRequests(data || [])
    } finally { setIsLoading(false) }
  }, [options?.requester_id, options?.assignee_id, options?.type_id, options?.status, options?.priority, options?.category, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { requests, isLoading, refresh: loadData }
}

export function useMyRequests(userId?: string, options?: { status?: string; limit?: number }) {
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('requests').select('*, request_types(*), assignee:assignee_id(*)').eq('requester_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRequests(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { requests, isLoading, refresh: loadData }
}

export function useAssignedRequests(userId?: string, options?: { status?: string; priority?: string; limit?: number }) {
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('requests').select('*, request_types(*), requester:requester_id(*)').eq('assignee_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('priority', { ascending: false }).order('created_at', { ascending: true }).limit(options?.limit || 50)
      setRequests(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.priority, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { requests, isLoading, refresh: loadData }
}

export function useRequestTypes(options?: { category?: string; is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('request_types').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { types, isLoading, refresh: loadData }
}

export function useRequestComments(requestId?: string, options?: { is_internal?: boolean }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!requestId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('request_comments').select('*, users(*)').eq('request_id', requestId)
      if (options?.is_internal !== undefined) query = query.eq('is_internal', options.is_internal)
      const { data } = await query.order('created_at', { ascending: true })
      setComments(data || [])
    } finally { setIsLoading(false) }
  }, [requestId, options?.is_internal])
  useEffect(() => { loadData() }, [loadData])
  return { comments, isLoading, refresh: loadData }
}

export function useRequestAttachments(requestId?: string) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!requestId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('request_attachments').select('*, users(*)').eq('request_id', requestId).order('created_at', { ascending: false }); setAttachments(data || []) } finally { setIsLoading(false) }
  }, [requestId])
  useEffect(() => { loadData() }, [loadData])
  return { attachments, isLoading, refresh: loadData }
}

export function useRequestHistory(requestId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!requestId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('request_history').select('*, users(*)').eq('request_id', requestId).order('created_at', { ascending: false }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [requestId])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function useRequestApprovals(requestId?: string) {
  const [approvals, setApprovals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!requestId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('request_approvals').select('*, approver:approver_id(*)').eq('request_id', requestId).order('level', { ascending: true }); setApprovals(data || []) } finally { setIsLoading(false) }
  }, [requestId])
  useEffect(() => { loadData() }, [loadData])
  return { approvals, isLoading, refresh: loadData }
}

export function usePendingApprovals(approverId?: string, options?: { limit?: number }) {
  const [approvals, setApprovals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!approverId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('request_approvals').select('*, requests(*, requester:requester_id(*))').eq('approver_id', approverId).eq('status', 'pending').order('created_at', { ascending: true }).limit(options?.limit || 20)
      setApprovals(data || [])
    } finally { setIsLoading(false) }
  }, [approverId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { approvals, isLoading, refresh: loadData }
}

export function useRequestStats(options?: { requester_id?: string; assignee_id?: string; type_id?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; open: number; inProgress: number; completed: number; closed: number; byPriority: { [key: string]: number } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('requests').select('status, priority')
      if (options?.requester_id) query = query.eq('requester_id', options.requester_id)
      if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id)
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const requests = data || []
      const total = requests.length
      const open = requests.filter(r => r.status === 'open').length
      const inProgress = requests.filter(r => r.status === 'in_progress').length
      const completed = requests.filter(r => r.status === 'completed').length
      const closed = requests.filter(r => r.status === 'closed').length
      const byPriority: { [key: string]: number } = {}
      requests.forEach(r => { byPriority[r.priority || 'medium'] = (byPriority[r.priority || 'medium'] || 0) + 1 })
      setStats({ total, open, inProgress, completed, closed, byPriority })
    } finally { setIsLoading(false) }
  }, [options?.requester_id, options?.assignee_id, options?.type_id, options?.from_date, options?.to_date])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
