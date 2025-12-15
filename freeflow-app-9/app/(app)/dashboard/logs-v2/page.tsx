import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogsClient from './logs-client'

export default async function LogsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: logs, error } = await supabase
    .from('system_logs')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('logged_at', { ascending: false })
    .limit(100)

  return <LogsClient initialLogs={logs || []} />
}
