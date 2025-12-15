import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TicketsClient from './tickets-client'

export const dynamic = 'force-dynamic'

export default async function TicketsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch tickets data
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  return <TicketsClient initialTickets={tickets || []} />
}
