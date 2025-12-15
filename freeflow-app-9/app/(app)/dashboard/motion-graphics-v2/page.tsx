import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import MotionGraphicsClient from './motion-graphics-client'

export const dynamic = 'force-dynamic'

export default async function MotionGraphicsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let animations: any[] = []
  let stats = {
    total: 0,
    draft: 0,
    rendering: 0,
    ready: 0,
    templates: 0,
    totalLikes: 0,
    totalDownloads: 0,
    totalViews: 0,
    avgRenderTime: 0
  }

  if (user) {
    const { data: animationsData } = await supabase
      .from('animations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (animationsData) {
      animations = animationsData

      const totalDuration = animationsData.reduce((sum, a) => sum + (a.duration_seconds || 0), 0)

      stats = {
        total: animationsData.length,
        draft: animationsData.filter(a => a.status === 'draft').length,
        rendering: animationsData.filter(a => a.status === 'rendering').length,
        ready: animationsData.filter(a => a.status === 'ready').length,
        templates: animationsData.filter(a => a.is_template).length,
        totalLikes: animationsData.reduce((sum, a) => sum + (a.likes_count || 0), 0),
        totalDownloads: animationsData.reduce((sum, a) => sum + (a.downloads_count || 0), 0),
        totalViews: animationsData.reduce((sum, a) => sum + (a.views_count || 0), 0),
        avgRenderTime: animationsData.length > 0 ? totalDuration / animationsData.length : 0
      }
    }
  }

  return <MotionGraphicsClient initialAnimations={animations} initialStats={stats} />
}
