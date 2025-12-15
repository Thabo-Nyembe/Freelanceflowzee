import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ActivityLogsClient from './activity-logs-client'

export const dynamic = 'force-dynamic'

export default async function ActivityLogsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  return <ActivityLogsClient initialLogs={logs || []} />
}
