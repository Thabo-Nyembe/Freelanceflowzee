import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PerformanceClient from './performance-client'

export default async function PerformancePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [reviewsResult] = await Promise.all([
    supabase
      .from('performance_reviews')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('review_date', { ascending: false, nullsFirst: false })
      .limit(50)
  ])

  return (
    <PerformanceClient
      initialReviews={reviewsResult.data || []}
    />
  )
}
