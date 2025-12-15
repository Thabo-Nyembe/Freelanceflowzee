import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ApiKeysClient from './api-keys-client'

export const dynamic = 'force-dynamic'

export default async function ApiKeysPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  return <ApiKeysClient initialKeys={apiKeys || []} />
}
