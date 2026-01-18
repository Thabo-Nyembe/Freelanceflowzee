'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface SupportTicket {
  id: string
  user_id: string
  ticket_code: string
  subject: string
  description: string | null
  category: 'general' | 'technical' | 'billing' | 'feature' | 'bug' | 'other'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  assigned_to: string | null
  assigned_at: string | null
  channel: 'email' | 'chat' | 'phone' | 'self_service' | 'social'
  resolution_notes: string | null
  resolved_at: string | null
  resolved_by: string | null
  first_response_at: string | null
  sla_due_at: string | null
  sla_breached: boolean
  satisfaction_rating: number | null
  satisfaction_feedback: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TicketReply {
  id: string
  ticket_id: string
  message: string
  is_internal: boolean
  reply_type: 'reply' | 'note' | 'system'
  author_id: string | null
  author_name: string | null
  author_type: 'agent' | 'customer' | 'system'
  attachments: any[]
  created_at: string
}

export interface SupportStats {
  total: number
  open: number
  inProgress: number
  pending: number
  resolved: number
  urgent: number
  avgResponseTime: number
  satisfactionRate: number
}

export function useSupportTickets() {
  const supabase = createClient()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (err: unknown) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch tickets', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  // Create ticket
  const createTicket = async (ticket: Partial<SupportTicket>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{ ...ticket, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setTickets(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Ticket created successfully' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Update ticket
  const updateTicket = async (id: string, updates: Partial<SupportTicket>) => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTickets(prev => prev.map(t => t.id === id ? data : t))
      toast({ title: 'Success', description: 'Ticket updated successfully' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Delete ticket (soft delete)
  const deleteTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setTickets(prev => prev.filter(t => t.id !== id))
      toast({ title: 'Success', description: 'Ticket deleted' })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Assign ticket
  const assignTicket = async (id: string, assignedTo: string) => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({
          assigned_to: assignedTo,
          assigned_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTickets(prev => prev.map(t => t.id === id ? data : t))
      toast({ title: 'Success', description: 'Ticket assigned' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Resolve ticket
  const resolveTicket = async (id: string, resolutionNotes: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('support_tickets')
        .update({
          status: 'resolved',
          resolution_notes: resolutionNotes,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTickets(prev => prev.map(t => t.id === id ? data : t))
      toast({ title: 'Success', description: 'Ticket resolved' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Close ticket
  const closeTicket = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTickets(prev => prev.map(t => t.id === id ? data : t))
      toast({ title: 'Success', description: 'Ticket closed' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Reopen ticket
  const reopenTicket = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status: 'open', resolved_at: null, resolved_by: null })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTickets(prev => prev.map(t => t.id === id ? data : t))
      toast({ title: 'Success', description: 'Ticket reopened' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  // Calculate stats
  const getStats = useCallback((): SupportStats => {
    const avgSatisfaction = tickets.filter(t => t.satisfaction_rating).reduce((sum, t) => sum + (t.satisfaction_rating || 0), 0)
    const satisfactionCount = tickets.filter(t => t.satisfaction_rating).length

    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      pending: tickets.filter(t => t.status === 'pending').length,
      resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length,
      avgResponseTime: 2.4, // Calculate from actual data
      satisfactionRate: satisfactionCount > 0 ? (avgSatisfaction / satisfactionCount) : 0
    }
  }, [tickets])

  // Real-time subscription
  useEffect(() => {
    fetchTickets()

    const channel = supabase
      .channel('support-tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTickets(prev => [payload.new as SupportTicket, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setTickets(prev => prev.map(t => t.id === payload.new.id ? payload.new as SupportTicket : t))
        } else if (payload.eventType === 'DELETE') {
          setTickets(prev => prev.filter(t => t.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTickets, supabase])

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    resolveTicket,
    closeTicket,
    reopenTicket,
    getStats
  }
}

// Hook for ticket replies
export function useTicketReplies(ticketId: string) {
  const supabase = createClient()
  const { toast } = useToast()
  const [replies, setReplies] = useState<TicketReply[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReplies = useCallback(async () => {
    if (!ticketId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('support_ticket_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setReplies(data || [])
    } catch (err) {
      console.error('Failed to fetch replies:', err)
    } finally {
      setLoading(false)
    }
  }, [ticketId, supabase])

  const addReply = async (message: string, isInternal: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('support_ticket_replies')
        .insert([{
          ticket_id: ticketId,
          message,
          is_internal: isInternal,
          author_id: user?.id,
          author_type: 'agent'
        }])
        .select()
        .single()

      if (error) throw error
      setReplies(prev => [...prev, data])
      toast({ title: 'Success', description: 'Reply added' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchReplies()

    if (ticketId) {
      const channel = supabase
        .channel(`ticket-replies-${ticketId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'support_ticket_replies',
          filter: `ticket_id=eq.${ticketId}`
        }, (payload) => {
          setReplies(prev => [...prev, payload.new as TicketReply])
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchReplies, ticketId, supabase])

  return { replies, loading, addReply }
}
