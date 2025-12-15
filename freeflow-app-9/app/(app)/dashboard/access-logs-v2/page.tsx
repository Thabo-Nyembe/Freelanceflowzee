import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AccessLogsClient from './access-logs-client'

export const dynamic = 'force-dynamic'

export default async function AccessLogsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: logs } = await supabase
    .from('access_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  return <AccessLogsClient initialLogs={logs || []} />
}
