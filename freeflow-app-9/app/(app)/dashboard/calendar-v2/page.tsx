import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CalendarClient from './calendar-client'

export default async function CalendarPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: events, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('start_time', { ascending: true })
    .limit(50)

  return <CalendarClient initialEvents={events || []} />
}
