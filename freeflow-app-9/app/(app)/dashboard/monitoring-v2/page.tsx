import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MonitoringClient from './monitoring-client'

export default async function MonitoringPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [serversResult, alertsResult] = await Promise.all([
    supabase
      .from('servers')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('server_name', { ascending: true })
      .limit(50),
    supabase
      .from('system_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
  ])

  return (
    <MonitoringClient
      initialServers={serversResult.data || []}
      initialAlerts={alertsResult.data || []}
    />
  )
}
