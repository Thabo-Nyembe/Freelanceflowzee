import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AlertsClient from './alerts-client'

export const dynamic = 'force-dynamic'

export default async function AlertsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('triggered_at', { ascending: false })
    .limit(200)

  return <AlertsClient initialAlerts={alerts || []} />
}
