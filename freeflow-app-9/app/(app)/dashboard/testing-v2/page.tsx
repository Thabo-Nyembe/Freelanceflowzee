import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TestingClient from './testing-client'

export const dynamic = 'force-dynamic'

export default async function TestingPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch test runs data
  const { data: runs } = await supabase
    .from('test_runs')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time', { ascending: false })
    .limit(50)

  return <TestingClient initialRuns={runs || []} />
}
