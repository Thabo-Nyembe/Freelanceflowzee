import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OnboardingClient from './onboarding-client'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch onboarding programs data
  const { data: programs } = await supabase
    .from('onboarding_programs')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })
    .limit(50)

  // Fetch recent onboarding tasks
  const { data: tasks } = await supabase
    .from('onboarding_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('order_index', { ascending: true })
    .limit(50)

  return <OnboardingClient initialPrograms={programs || []} initialTasks={tasks || []} />
}
