import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import BuildsClient from './builds-client'

export default async function BuildsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [buildsResult, pipelinesResult] = await Promise.all([
    supabase
      .from('builds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('build_pipelines')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('pipeline_name', { ascending: true })
      .limit(20)
  ])

  return (
    <BuildsClient
      initialBuilds={buildsResult.data || []}
      initialPipelines={pipelinesResult.data || []}
    />
  )
}
