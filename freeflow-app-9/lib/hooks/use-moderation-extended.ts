'use client'

/**
 * Extended Moderation Hooks
 * Tables: moderation_queue, moderation_actions, moderation_rules, moderation_appeals, moderation_logs, moderation_reports
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useModerationQueue(options?: { status?: string; content_type?: string; priority?: string; assigned_to?: string; limit?: number }) {
  const [queue, setQueue] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('moderation_queue').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.content_type) query = query.eq('content_type', options.content_type)
      if (options?.priority) query = query.eq('priority', options.priority)
      if (options?.assigned_to) query = query.eq('assigned_to', options.assigned_to)
      const { data } = await query.order('created_at', { ascending: true }).limit(options?.limit || 50)
      setQueue(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.content_type, options?.priority, options?.assigned_to, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { queue, isLoading, refresh: fetch }
}

export function useQueueItem(itemId?: string) {
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('moderation_queue').select('*, moderation_actions(*), moderation_reports(*)').eq('id', itemId).single(); setItem(data) } finally { setIsLoading(false) }
  }, [itemId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { item, isLoading, refresh: fetch }
}

export function usePendingQueue(moderatorId?: string) {
  const [queue, setQueue] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('moderation_queue').select('*').eq('status', 'pending')
      if (moderatorId) query = query.or(`assigned_to.is.null,assigned_to.eq.${moderatorId}`)
      const { data } = await query.order('priority', { ascending: false }).order('created_at', { ascending: true })
      setQueue(data || [])
    } finally { setIsLoading(false) }
  }, [moderatorId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { queue, isLoading, refresh: fetch }
}

export function useModerationActions(itemId?: string) {
  const [actions, setActions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('moderation_actions').select('*').eq('queue_item_id', itemId).order('created_at', { ascending: false }); setActions(data || []) } finally { setIsLoading(false) }
  }, [itemId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { actions, isLoading, refresh: fetch }
}

export function useModerationRules(options?: { rule_type?: string; is_active?: boolean }) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('moderation_rules').select('*')
      if (options?.rule_type) query = query.eq('rule_type', options.rule_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('priority', { ascending: false })
      setRules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.rule_type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function useModerationAppeals(options?: { status?: string; user_id?: string; limit?: number }) {
  const [appeals, setAppeals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('moderation_appeals').select('*, moderation_actions(*)')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      const { data } = await query.order('submitted_at', { ascending: true }).limit(options?.limit || 50)
      setAppeals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.user_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { appeals, isLoading, refresh: fetch }
}

export function useModerationLogs(options?: { moderator_id?: string; action_type?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('moderation_logs').select('*')
      if (options?.moderator_id) query = query.eq('moderator_id', options.moderator_id)
      if (options?.action_type) query = query.eq('action_type', options.action_type)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [options?.moderator_id, options?.action_type, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useModerationReports(options?: { status?: string; report_type?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('moderation_reports').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.report_type) query = query.eq('report_type', options.report_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.report_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useModerationStats() {
  const [stats, setStats] = useState<{ pending: number; inReview: number; resolved: number; appeals: number; todayActions: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const [queueRes, appealsRes, actionsRes] = await Promise.all([
        supabase.from('moderation_queue').select('status'),
        supabase.from('moderation_appeals').select('status').eq('status', 'pending'),
        supabase.from('moderation_actions').select('id').gte('created_at', today.toISOString())
      ])
      const pending = queueRes.data?.filter(q => q.status === 'pending').length || 0
      const inReview = queueRes.data?.filter(q => q.status === 'in_review').length || 0
      const resolved = queueRes.data?.filter(q => q.status === 'resolved').length || 0
      setStats({ pending, inReview, resolved, appeals: appealsRes.data?.length || 0, todayActions: actionsRes.data?.length || 0 })
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useUserModerationHistory(userId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: reports } = await supabase.from('moderation_reports').select('*, moderation_queue(*, moderation_actions(*))').eq('reporter_id', userId).order('created_at', { ascending: false })
      setHistory(reports || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}
