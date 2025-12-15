import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TimeTrackingClient from './time-tracking-client'

export default async function TimeTrackingPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: timeEntries, error } = await supabase
    .from('time_tracking')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('start_time', { ascending: false })
    .limit(50)

  return <TimeTrackingClient initialTimeEntries={timeEntries || []} />
}
