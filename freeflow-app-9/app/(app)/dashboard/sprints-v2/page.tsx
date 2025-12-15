import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SprintsClient from './sprints-client'

export const dynamic = 'force-dynamic'

export default async function SprintsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: sprints } = await supabase
    .from('sprints')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })
    .limit(50)

  const { data: tasks } = await supabase
    .from('sprint_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <SprintsClient
      initialSprints={sprints || []}
      initialTasks={tasks || []}
    />
  )
}
