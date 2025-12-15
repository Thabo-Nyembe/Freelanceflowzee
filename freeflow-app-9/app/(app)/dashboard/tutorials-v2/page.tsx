import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import TutorialsClient from './tutorials-client'

export const dynamic = 'force-dynamic'

async function getTutorials() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { tutorials: [], stats: { total: 0, published: 0, draft: 0, scheduled: 0, totalEnrollments: 0, avgCompletionRate: 0 } }
  }

  const { data: tutorials, error } = await supabase
    .from('tutorials')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tutorials:', error)
    return { tutorials: [], stats: { total: 0, published: 0, draft: 0, scheduled: 0, totalEnrollments: 0, avgCompletionRate: 0 } }
  }

  const tutorialList = tutorials || []
  const withEnrollments = tutorialList.filter(t => (t.enrollments_count || 0) > 0)

  const stats = {
    total: tutorialList.length,
    published: tutorialList.filter(t => t.status === 'published').length,
    draft: tutorialList.filter(t => t.status === 'draft').length,
    scheduled: tutorialList.filter(t => t.status === 'scheduled').length,
    totalEnrollments: tutorialList.reduce((sum, t) => sum + (t.enrollments_count || 0), 0),
    avgCompletionRate: withEnrollments.length > 0
      ? withEnrollments.reduce((sum, t) => {
          const completions = t.completions_count || 0
          const enrollments = t.enrollments_count || 1
          return sum + (completions / enrollments)
        }, 0) / withEnrollments.length * 100
      : 0
  }

  return { tutorials: tutorialList, stats }
}

export default async function TutorialsPage() {
  const { tutorials, stats } = await getTutorials()
  return <TutorialsClient initialTutorials={tutorials} initialStats={stats} />
}
