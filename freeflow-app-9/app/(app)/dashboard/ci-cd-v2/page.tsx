import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CiCdClient from './ci-cd-client'

export default async function CiCdPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: pipelines, error } = await supabase
    .from('ci_cd')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('last_run_at', { ascending: false, nullsFirst: false })
    .limit(50)

  return <CiCdClient initialPipelines={pipelines || []} />
}
