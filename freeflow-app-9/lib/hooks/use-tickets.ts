'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useMemo } from 'react'

export interface SupportTicket {
  id: string
  user_id: string
  ticket_number: string
  subject: string
  description: string | null
  customer_name: string | null
  customer_email: string | null
  priority: string
  status: string
  category: string | null
  assigned_to: string | null
  assigned_name: string | null
  sla_status: string
  first_response_at: string | null
  resolved_at: string | null
  closed_at: string | null
  satisfaction_score: number | null
  message_count: number
  attachment_count: number
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TicketMessage {
  id: string
  ticket_id: string
  user_id: string
  message_type: string
  content: string
  is_internal: boolean
  sender_name: string | null
  sender_email: string | null
  attachments: unknown[]
  created_at: string
}

export interface TicketFilters {
  status?: string
  priority?: string
  category?: string
  assignedTo?: string
}

export function useTickets(initialData?: SupportTicket[], filters?: TicketFilters) {
  const query = useSupabaseQuery<SupportTicket>({
    table: 'support_tickets',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  })

  const filteredTickets = useMemo(() => {
    if (!query.data) return []

    return query.data.filter(ticket => {
      if (filters?.status && filters.status !== 'all' && ticket.status !== filters.status) return false
      if (filters?.priority && filters.priority !== 'all' && ticket.priority !== filters.priority) return false
      if (filters?.category && filters.category !== 'all' && ticket.category !== filters.category) return false
      if (filters?.assignedTo && filters.assignedTo !== 'all' && ticket.assigned_to !== filters.assignedTo) return false
      return true
    })
  }, [query.data, filters])

  const stats = useMemo(() => {
    if (!query.data) return {
      total: 0,
      open: 0,
      inProgress: 0,
      pending: 0,
      resolved: 0,
      closed: 0,
      urgent: 0,
      high: 0,
      atRisk: 0,
      avgResponseTime: 0
    }

    const open = query.data.filter(t => t.status === 'open').length
    const inProgress = query.data.filter(t => t.status === 'in-progress').length
    const pending = query.data.filter(t => t.status === 'pending').length
    const resolved = query.data.filter(t => t.status === 'resolved').length
    const closed = query.data.filter(t => t.status === 'closed').length
    const urgent = query.data.filter(t => t.priority === 'urgent').length
    const high = query.data.filter(t => t.priority === 'high').length
    const atRisk = query.data.filter(t => t.sla_status === 'at_risk').length

    return {
      total: query.data.length,
      open,
      inProgress,
      pending,
      resolved,
      closed,
      urgent,
      high,
      atRisk,
      avgResponseTime: 0
    }
  }, [query.data])

  return {
    ...query,
    tickets: filteredTickets,
    stats,
    isLoading: query.loading
  }
}

export function useTicketMessages(ticketId?: string) {
  return useSupabaseQuery<TicketMessage>({
    table: 'ticket_messages',
    select: '*',
    filters: ticketId ? { ticket_id: ticketId } : {},
    orderBy: { column: 'created_at', ascending: true }
  })
}

export function useTicketMutations() {
  const ticketMutation = useSupabaseMutation<SupportTicket>({
    table: 'support_tickets'
  })

  return {
    createTicket: (data: Partial<SupportTicket>) => ticketMutation.mutate(data),
    updateTicket: (data: Partial<SupportTicket> & { id: string }) => ticketMutation.mutate(data, data.id),
    deleteTicket: (id: string) => ticketMutation.remove(id),
    assignTicket: (id: string, assignedTo: string, assignedName: string) =>
      ticketMutation.mutate({
        assigned_to: assignedTo,
        assigned_name: assignedName,
        status: 'in-progress'
      }, id),
    isCreating: ticketMutation.loading,
    isUpdating: ticketMutation.loading,
    isDeleting: ticketMutation.loading
  }
}

export function useTicketMessageMutations() {
  const messageMutation = useSupabaseMutation<TicketMessage>({
    table: 'ticket_messages'
  })

  return {
    createMessage: (data: Partial<TicketMessage>) => messageMutation.mutate(data),
    isCreating: messageMutation.loading
  }
}
