import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import EscrowClient from './escrow-client'

export const dynamic = 'force-dynamic'

export default async function EscrowV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let deposits: any[] = []
  let stats = {
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    totalInEscrow: 0,
    totalReleased: 0
  }

  if (user) {
    const { data: depositsData } = await supabase
      .from('escrow_deposits')
      .select(`
        *,
        milestones:escrow_milestones(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    deposits = depositsData || []

    stats = {
      total: deposits.length,
      pending: deposits.filter(d => d.status === 'pending').length,
      active: deposits.filter(d => d.status === 'active').length,
      completed: deposits.filter(d => d.status === 'completed').length,
      totalInEscrow: deposits.filter(d => d.status === 'active' || d.status === 'pending').reduce((sum, d) => sum + (d.amount || 0), 0),
      totalReleased: deposits.filter(d => d.status === 'completed').reduce((sum, d) => sum + (d.amount || 0), 0)
    }
  }

  return <EscrowClient initialDeposits={deposits} initialStats={stats} />
}
