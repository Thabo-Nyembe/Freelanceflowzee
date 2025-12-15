import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import TeamHubClient from './team-hub-client'

export const dynamic = 'force-dynamic'

export default async function TeamHubV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let members: any[] = []
  let stats = {
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    onLeave: 0,
    leads: 0,
    avgPerformance: 0
  }

  if (user) {
    const { data: membersData } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    members = membersData || []

    const active = members.filter(m => m.status === 'active')
    stats = {
      total: members.length,
      active: active.length,
      inactive: members.filter(m => m.status === 'inactive').length,
      pending: members.filter(m => m.status === 'pending').length,
      onLeave: members.filter(m => m.status === 'on_leave').length,
      leads: members.filter(m => m.is_lead).length,
      avgPerformance: active.length > 0
        ? Math.round(active.reduce((sum, m) => sum + (m.performance_score || 0), 0) / active.length)
        : 0
    }
  }

  return <TeamHubClient initialMembers={members} initialStats={stats} />
}
