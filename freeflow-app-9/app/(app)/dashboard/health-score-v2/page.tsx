import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HealthScoreClient from './health-score-client'

export const dynamic = 'force-dynamic'

export default async function HealthScorePage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: healthScores } = await supabase
    .from('health_scores')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('overall_score', { ascending: false })
    .limit(100)

  return <HealthScoreClient initialHealthScores={healthScores || []} />
}
