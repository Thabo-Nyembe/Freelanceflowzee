import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import LearningClient from './learning-client'

export const dynamic = 'force-dynamic'

export default async function LearningPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let courses: any[] = []
  let stats = {
    total: 0,
    published: 0,
    draft: 0,
    totalStudents: 0,
    completionRate: 0,
    avgRating: 0
  }

  if (user) {
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (coursesData) {
      courses = coursesData

      const totalEnrolled = coursesData.reduce((sum, c) => sum + (c.total_enrolled || 0), 0)
      const totalCompleted = coursesData.reduce((sum, c) => sum + (c.completed_count || 0), 0)
      const totalRatings = coursesData.reduce((sum, c) => sum + ((c.average_rating || 0) * (c.total_reviews || 0)), 0)
      const totalReviews = coursesData.reduce((sum, c) => sum + (c.total_reviews || 0), 0)

      stats = {
        total: coursesData.length,
        published: coursesData.filter(c => c.status === 'published').length,
        draft: coursesData.filter(c => c.status === 'draft').length,
        totalStudents: totalEnrolled,
        completionRate: totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0,
        avgRating: totalReviews > 0 ? Number((totalRatings / totalReviews).toFixed(1)) : 0
      }
    }
  }

  return <LearningClient initialCourses={courses} initialStats={stats} />
}
