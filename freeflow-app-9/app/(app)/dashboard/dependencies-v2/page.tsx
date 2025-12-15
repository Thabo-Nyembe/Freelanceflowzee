import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DependenciesClient from './dependencies-client'

export default async function DependenciesPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: dependencies, error } = await supabase
    .from('dependencies')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_date', { ascending: false })
    .limit(50)

  return <DependenciesClient initialDependencies={dependencies || []} />
}
