import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ReleasesClient from './releases-client'

export default async function ReleasesPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [releasesResult] = await Promise.all([
    supabase
      .from('releases')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50)
  ])

  return (
    <ReleasesClient
      initialReleases={releasesResult.data || []}
    />
  )
}
