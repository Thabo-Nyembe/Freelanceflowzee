import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ThreeDModelingClient from './3d-modeling-client'

export const dynamic = 'force-dynamic'

export default async function ThreeDModelingPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: models } = await supabase
    .from('three_d_models')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  return <ThreeDModelingClient initialModels={models || []} />
}
