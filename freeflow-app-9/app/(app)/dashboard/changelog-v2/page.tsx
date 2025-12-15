import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ChangelogClient from './changelog-client'

export default async function ChangelogPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: changelog, error } = await supabase
    .from('changelog')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('version', { ascending: false })
    .limit(50)

  return <ChangelogClient initialChangelog={changelog || []} />
}
