import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import WorkflowsClient from './workflows-client'

export const dynamic = 'force-dynamic'

/**
 * Workflows V2 - Business Process Management
 * Server-side rendered with real-time client updates
 */
export default async function WorkflowsV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let workflows: any[] = []
  let stats = {
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
    paused: 0,
    failed: 0,
    avgCompletionRate: 0,
    totalSteps: 0,
    completedSteps: 0
  }

  if (user) {
    // Fetch workflows
    const { data: workflowsData } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    workflows = workflowsData || []

    if (workflows.length > 0) {
      stats = {
        total: workflows.length,
        active: workflows.filter(w => w.status === 'active').length,
        completed: workflows.filter(w => w.status === 'completed').length,
        draft: workflows.filter(w => w.status === 'draft').length,
        paused: workflows.filter(w => w.status === 'paused').length,
        failed: workflows.filter(w => w.status === 'failed').length,
        avgCompletionRate: workflows.reduce((sum, w) => sum + (w.completion_rate || 0), 0) / workflows.length,
        totalSteps: workflows.reduce((sum, w) => sum + (w.total_steps || 0), 0),
        completedSteps: workflows.reduce((sum, w) => sum + (w.current_step || 0), 0)
      }
    }
  }

  return (
    <WorkflowsClient
      initialWorkflows={workflows}
      initialStats={stats}
    />
  )
}
