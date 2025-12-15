import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MilestonesClient from './milestones-client'

export const dynamic = 'force-dynamic'

export default async function MilestonesPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch milestones from database
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('due_date', { ascending: true })
    .limit(100)

  return (
    <MilestonesClient
      initialMilestones={milestones || []}
    />
  )
}
