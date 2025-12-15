import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import WorkflowBuilderClient from './workflow-builder-client'

export const dynamic = 'force-dynamic'

export default async function WorkflowBuilderV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let workflows: any[] = []
  let stats = {
    total: 0,
    active: 0,
    paused: 0,
    completed: 0,
    draft: 0,
    failed: 0,
    totalSteps: 0,
    completedSteps: 0,
    avgCompletionRate: 0
  }

  if (user) {
    // Fetch workflows
    const { data: workflowsData } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (workflowsData) {
      workflows = workflowsData

      // Calculate stats
      const totalSteps = workflowsData.reduce((sum, w) => sum + (w.total_steps || 0), 0)
      const completedSteps = workflowsData.reduce((sum, w) => sum + (w.current_step || 0), 0)
      const totalCompletionRate = workflowsData.reduce((sum, w) => sum + (w.completion_rate || 0), 0)

      stats = {
        total: workflowsData.length,
        active: workflowsData.filter(w => w.status === 'active').length,
        paused: workflowsData.filter(w => w.status === 'paused').length,
        completed: workflowsData.filter(w => w.status === 'completed').length,
        draft: workflowsData.filter(w => w.status === 'draft').length,
        failed: workflowsData.filter(w => w.status === 'failed').length,
        totalSteps,
        completedSteps,
        avgCompletionRate: workflowsData.length > 0 ? totalCompletionRate / workflowsData.length : 0
      }
    }
  }

  return <WorkflowBuilderClient initialWorkflows={workflows} initialStats={stats} />
}
