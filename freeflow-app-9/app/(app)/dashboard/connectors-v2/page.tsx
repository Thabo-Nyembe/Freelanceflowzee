import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ConnectorsClient from './connectors-client'

export default async function ConnectorsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: connectors, error } = await supabase
    .from('connectors')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  return <ConnectorsClient initialConnectors={connectors || []} />
}
