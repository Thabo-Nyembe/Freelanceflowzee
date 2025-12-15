import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TrainingClient from './training-client'

export const dynamic = 'force-dynamic'

export default async function TrainingPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch training programs data
  const { data: programs } = await supabase
    .from('training_programs')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })
    .limit(50)

  return <TrainingClient initialPrograms={programs || []} />
}
