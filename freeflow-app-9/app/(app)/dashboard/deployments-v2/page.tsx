import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DeploymentsClient from './deployments-client'

export default async function DeploymentsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: deployments, error } = await supabase
    .from('deployments')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('started_at', { ascending: false })
    .limit(50)

  return <DeploymentsClient initialDeployments={deployments || []} />
}
