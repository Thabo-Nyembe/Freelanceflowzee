import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SupportClient from './support-client'

export const dynamic = 'force-dynamic'

/**
 * Support V2 - Customer Support Dashboard
 * Server-side rendered with real-time client updates
 */
export default async function SupportV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let tickets: any[] = []
  let stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    pending: 0,
    resolved: 0,
    urgent: 0,
    avgResponseTime: 2.4,
    satisfactionRate: 0
  }

  if (user) {
    // Fetch support tickets
    const { data: ticketsData } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    tickets = ticketsData || []

    if (tickets.length > 0) {
      const satisfactionTickets = tickets.filter(t => t.satisfaction_rating)
      const avgSatisfaction = satisfactionTickets.reduce((sum, t) => sum + (t.satisfaction_rating || 0), 0)

      stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        pending: tickets.filter(t => t.status === 'pending').length,
        resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
        avgResponseTime: 2.4,
        satisfactionRate: satisfactionTickets.length > 0 ? avgSatisfaction / satisfactionTickets.length : 0
      }
    }
  }

  return (
    <SupportClient
      initialTickets={tickets}
      initialStats={stats}
    />
  )
}
