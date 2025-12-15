import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import WidgetLibraryClient from './widget-library-client'

export const dynamic = 'force-dynamic'

export default async function WidgetLibraryPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let widgets: any[] = []
  let stats = {
    total: 0,
    active: 0,
    beta: 0,
    totalInstalls: 0,
    totalActiveUsers: 0,
    avgRating: 0
  }

  if (user) {
    const { data: widgetsData } = await supabase
      .from('widgets')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (widgetsData) {
      widgets = widgetsData

      const totalRatings = widgetsData.reduce((sum, w) => sum + ((w.rating || 0) * (w.total_ratings || 0)), 0)
      const totalReviews = widgetsData.reduce((sum, w) => sum + (w.total_ratings || 0), 0)

      stats = {
        total: widgetsData.length,
        active: widgetsData.filter(w => w.status === 'active').length,
        beta: widgetsData.filter(w => w.status === 'beta').length,
        totalInstalls: widgetsData.reduce((sum, w) => sum + (w.installs_count || 0), 0),
        totalActiveUsers: widgetsData.reduce((sum, w) => sum + (w.active_users_count || 0), 0),
        avgRating: totalReviews > 0 ? Number((totalRatings / totalReviews).toFixed(1)) : 0
      }
    }
  }

  return <WidgetLibraryClient initialWidgets={widgets} initialStats={stats} />
}
