'use client'

/**
 * Extended Ticket Hooks
 * Tables: tickets, ticket_comments, ticket_attachments, ticket_history
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
    try { const { data } = await supabase.from('tickets').select('*, ticket_comments(*), ticket_attachments(*)').eq('id', ticketId).single(); setTicket(data) } finally { setIsLoading(false) }
  }, [ticketId])
  useEffect(() => { loadData() }, [loadData])
  return { ticket, isLoading, refresh: loadData }
}

export function useTickets(options?: { user_id?: string; status?: string; priority?: string; assigned_to?: string; limit?: number }) {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tickets').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      if (options?.assigned_to) query = query.eq('assigned_to', options.assigned_to)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setTickets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.priority, options?.assigned_to, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { tickets, isLoading, refresh: loadData }
}

export function useTicketComments(ticketId?: string) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!ticketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ticket_comments').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }); setComments(data || []) } finally { setIsLoading(false) }
  }, [ticketId])
  useEffect(() => { loadData() }, [loadData])
  return { comments, isLoading, refresh: loadData }
}

export function useTicketHistory(ticketId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!ticketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ticket_history').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [ticketId])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function useOpenTickets(userId?: string) {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tickets').select('*').eq('user_id', userId).neq('status', 'closed').order('created_at', { ascending: false }); setTickets(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { tickets, isLoading, refresh: loadData }
}

export function useAssignedTickets(userId?: string) {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tickets').select('*').eq('assigned_to', userId).neq('status', 'closed').order('priority', { ascending: true }); setTickets(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { tickets, isLoading, refresh: loadData }
}
