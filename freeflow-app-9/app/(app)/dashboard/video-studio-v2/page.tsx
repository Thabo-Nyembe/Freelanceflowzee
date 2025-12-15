import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import VideoStudioClient from './video-studio-client'

export const dynamic = 'force-dynamic'

export default async function VideoStudioV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let projects: any[] = []
  let stats = {
    total: 0,
    draft: 0,
    processing: 0,
    ready: 0,
    totalViews: 0,
    totalLikes: 0,
    avgDuration: 0
  }

  if (user) {
    // Fetch video projects
    const { data: projectsData } = await supabase
      .from('video_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (projectsData) {
      projects = projectsData

      // Calculate stats
      const totalDuration = projectsData.reduce((sum, p) => sum + (p.duration_seconds || 0), 0)
      stats = {
        total: projectsData.length,
        draft: projectsData.filter(p => p.status === 'draft').length,
        processing: projectsData.filter(p => p.status === 'processing').length,
        ready: projectsData.filter(p => p.status === 'ready').length,
        totalViews: projectsData.reduce((sum, p) => sum + (p.views_count || 0), 0),
        totalLikes: projectsData.reduce((sum, p) => sum + (p.likes_count || 0), 0),
        avgDuration: projectsData.length > 0 ? Math.round(totalDuration / projectsData.length) : 0
      }
    }
  }

  return <VideoStudioClient initialProjects={projects} initialStats={stats} />
}
