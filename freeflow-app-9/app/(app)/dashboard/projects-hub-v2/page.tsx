import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ProjectsHubClient from './projects-hub-client'

export const dynamic = 'force-dynamic'

/**
 * Projects Hub V2 - Groundbreaking Project Management
 * Server-side rendered with real-time client updates
 */
export default async function ProjectsHubV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let projects: any[] = []
  let stats = {
    total: 0,
    active: 0,
    completed: 0,
    totalBudget: 0,
    totalSpent: 0,
    avgProgress: 0
  }

  if (user) {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .is('archived_at', null)
      .order('updated_at', { ascending: false })

    projects = data || []

    if (projects.length > 0) {
      stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        totalSpent: projects.reduce((sum, p) => sum + (p.spent || 0), 0),
        avgProgress: Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
      }
    }
  }

  return (
    <ProjectsHubClient
      initialProjects={projects}
      initialStats={stats}
    />
  )
}
