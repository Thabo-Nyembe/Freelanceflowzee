import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SurveysClient from './surveys-client'

export const dynamic = 'force-dynamic'

export default async function SurveysPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  return <SurveysClient initialSurveys={surveys || []} />
}
