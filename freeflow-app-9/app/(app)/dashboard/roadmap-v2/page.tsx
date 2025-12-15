import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RoadmapClient from './roadmap-client'

export default async function RoadmapPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [initiativesResult, milestonesResult] = await Promise.all([
    supabase
      .from('roadmap_initiatives')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('priority', { ascending: false })
      .order('target_date', { ascending: true, nullsFirst: false })
      .limit(50),
    supabase
      .from('roadmap_milestones')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('target_date', { ascending: true })
      .limit(20)
  ])

  return (
    <RoadmapClient
      initialInitiatives={initiativesResult.data || []}
      initialMilestones={milestonesResult.data || []}
    />
  )
}
