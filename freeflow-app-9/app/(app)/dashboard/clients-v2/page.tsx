import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ClientsClient from './clients-client'

export const dynamic = 'force-dynamic'

export default async function ClientsV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let clients: any[] = []
  let stats = {
    total: 0,
    active: 0,
    prospects: 0,
    totalRevenue: 0,
    totalProjects: 0
  }

  if (user) {
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'archived')
      .order('name', { ascending: true })

    clients = clientsData || []

    stats = {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      prospects: clients.filter(c => c.status === 'prospect').length,
      totalRevenue: clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0),
      totalProjects: clients.reduce((sum, c) => sum + (c.total_projects || 0), 0)
    }
  }

  return <ClientsClient initialClients={clients} initialStats={stats} />
}
