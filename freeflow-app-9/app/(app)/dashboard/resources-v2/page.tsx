import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ResourcesClient from './resources-client'

export const dynamic = 'force-dynamic'

export default async function ResourcesPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch resources from database
  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('name', { ascending: true })
    .limit(200)

  return (
    <ResourcesClient
      initialResources={resources || []}
    />
  )
}
