import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SupportTicketsClient from './support-tickets-client'

export const dynamic = 'force-dynamic'

async function getTickets() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { tickets: [], stats: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, urgent: 0, avgResponseTime: 0 } }
  }

  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tickets:', error)
    return { tickets: [], stats: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, urgent: 0, avgResponseTime: 0 } }
  }

  const ticketList = tickets || []
  const stats = {
    total: ticketList.length,
    open: ticketList.filter(t => t.status === 'open').length,
    inProgress: ticketList.filter(t => t.status === 'in_progress' || t.status === 'in-progress').length,
    resolved: ticketList.filter(t => t.status === 'resolved').length,
    closed: ticketList.filter(t => t.status === 'closed').length,
    urgent: ticketList.filter(t => t.priority === 'urgent').length,
    avgResponseTime: ticketList.length > 0
      ? ticketList.reduce((sum, t) => sum + (t.response_time || 0), 0) / ticketList.length
      : 0
  }

  return { tickets: ticketList, stats }
}

export default async function SupportTicketsPage() {
  const { tickets, stats } = await getTickets()
  return <SupportTicketsClient initialTickets={tickets} initialStats={stats} />
}
