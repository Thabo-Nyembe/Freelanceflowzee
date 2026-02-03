'use client'

/**
 * Extended Tickets Hooks
 * Tables: tickets, ticket_comments, ticket_assignments, ticket_tags, ticket_history, ticket_attachments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTicket(ticketId?: string) {
  const [ticket, setTicket] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!ticketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tickets').select('*, ticket_comments(*, users(*)), ticket_assignments(*, users(*)), ticket_tags(*), ticket_attachments(*)').eq('id', ticketId).single(); setTicket(data) } finally { setIsLoading(false) }
  }, [ticketId])
  useEffect(() => { loadData() }, [loadData])
  return { ticket, isLoading, refresh: loadData }
}

export function useTickets(options?: { ticket_type?: string; status?: string; priority?: string; category?: string; department?: string; created_by?: string; overdue?: boolean; search?: string; limit?: number }) {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tickets').select('*, ticket_assignments(*, users(*)), ticket_tags(*)')
      if (options?.ticket_type) query = query.eq('ticket_type', options.ticket_type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.department) query = query.eq('department', options.department)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.overdue) query = query.lt('due_date', new Date().toISOString()).not('status', 'in', '(resolved,closed)')
      if (options?.search) query = query.or(`title.ilike.%${options.search}%,ticket_number.ilike.%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setTickets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.ticket_type, options?.status, options?.priority, options?.category, options?.department, options?.created_by, options?.overdue, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { tickets, isLoading, refresh: loadData }
}

export function useMyTickets(userId?: string, options?: { status?: string; priority?: string; limit?: number }) {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tickets').select('*, ticket_assignments(*, users(*)), ticket_tags(*)').eq('created_by', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setTickets(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.priority, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { tickets, isLoading, refresh: loadData }
}

export function useAssignedTickets(userId?: string, options?: { status?: string; priority?: string; limit?: number }) {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: assignments } = await supabase.from('ticket_assignments').select('ticket_id').eq('user_id', userId)
      if (!assignments || assignments.length === 0) { setTickets([]); return }
      const ticketIds = assignments.map(a => a.ticket_id)
      let query = supabase.from('tickets').select('*, ticket_assignments(*, users(*)), ticket_tags(*)').in('id', ticketIds)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setTickets(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.priority, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { tickets, isLoading, refresh: loadData }
}

export function useTicketComments(ticketId?: string, options?: { is_internal?: boolean; limit?: number }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!ticketId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('ticket_comments').select('*, users(*)').eq('ticket_id', ticketId)
      if (options?.is_internal !== undefined) query = query.eq('is_internal', options.is_internal)
      const { data } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100)
      setComments(data || [])
    } finally { setIsLoading(false) }
  }, [ticketId, options?.is_internal, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { comments, isLoading, refresh: loadData }
}

export function useTicketAssignments(ticketId?: string) {
  const [assignments, setAssignments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!ticketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ticket_assignments').select('*, users(*)').eq('ticket_id', ticketId).order('assigned_at', { ascending: true }); setAssignments(data || []) } finally { setIsLoading(false) }
  }, [ticketId])
  useEffect(() => { loadData() }, [loadData])
  return { assignments, isLoading, refresh: loadData }
}

export function useTicketTags(ticketId?: string) {
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!ticketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ticket_tags').select('tag').eq('ticket_id', ticketId); setTags((data || []).map(t => t.tag)) } finally { setIsLoading(false) }
  }, [ticketId])
  useEffect(() => { loadData() }, [loadData])
  return { tags, isLoading, refresh: loadData }
}

export function useTicketHistory(ticketId?: string, options?: { action?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!ticketId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('ticket_history').select('*, users(*)').eq('ticket_id', ticketId)
      if (options?.action) query = query.eq('action', options.action)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [ticketId, options?.action, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function useTicketAttachments(ticketId?: string) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!ticketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ticket_attachments').select('*, users(*)').eq('ticket_id', ticketId).order('created_at', { ascending: false }); setAttachments(data || []) } finally { setIsLoading(false) }
  }, [ticketId])
  useEffect(() => { loadData() }, [loadData])
  return { attachments, isLoading, refresh: loadData }
}

export function useTicketStats(options?: { department?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tickets').select('status, priority, created_at, resolved_at')
      if (options?.department) query = query.eq('department', options.department)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const tickets = data || []
      const result = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length,
        byPriority: {
          critical: tickets.filter(t => t.priority === 'critical').length,
          high: tickets.filter(t => t.priority === 'high').length,
          medium: tickets.filter(t => t.priority === 'medium').length,
          low: tickets.filter(t => t.priority === 'low').length
        },
        avgResolutionTime: 0
      }
      const resolvedTickets = tickets.filter(t => t.resolved_at)
      if (resolvedTickets.length > 0) {
        const totalTime = resolvedTickets.reduce((sum, t) => sum + (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()), 0)
        result.avgResolutionTime = totalTime / resolvedTickets.length / (1000 * 60 * 60)
      }
      setStats(result)
    } finally { setIsLoading(false) }
  }, [options?.department, options?.from_date, options?.to_date])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useOverdueTickets(options?: { department?: string; assigned_to?: string; limit?: number }) {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tickets').select('*, ticket_assignments(*, users(*))').lt('due_date', new Date().toISOString()).not('status', 'in', '(resolved,closed)')
      if (options?.department) query = query.eq('department', options.department)
      const { data } = await query.order('due_date', { ascending: true }).limit(options?.limit || 50)
      let result = data || []
      if (options?.assigned_to) {
        result = result.filter(t => t.ticket_assignments?.some((a: any) => a.user_id === options.assigned_to))
      }
      setTickets(result)
    } finally { setIsLoading(false) }
  }, [options?.department, options?.assigned_to, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { tickets, isLoading, refresh: loadData }
}
