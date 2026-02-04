import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('kazi-metrics')

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get workflow metrics
    const { data: workflows } = await supabase
      .from('workflows')
      .select('id, status, run_count, success_count, error_count')
      .eq('user_id', user.id)

    // Get automation metrics
    const { data: automations } = await supabase
      .from('automations')
      .select('id, status, run_count, success_count, error_count, time_saved')
      .eq('user_id', user.id)

    // Calculate workflow metrics
    const workflowMetrics = {
      total: workflows?.length || 0,
      active: workflows?.filter(w => w.status === 'active').length || 0,
      totalRuns: workflows?.reduce((sum, w) => sum + (w.run_count || 0), 0) || 0,
      successRate: 0,
      errorCount: workflows?.reduce((sum, w) => sum + (w.error_count || 0), 0) || 0
    }

    const workflowTotalSuccess = workflows?.reduce((sum, w) => sum + (w.success_count || 0), 0) || 0
    workflowMetrics.successRate = workflowMetrics.totalRuns > 0
      ? Math.round((workflowTotalSuccess / workflowMetrics.totalRuns) * 100)
      : 0

    // Calculate automation metrics
    const automationMetrics = {
      total: automations?.length || 0,
      active: automations?.filter(a => a.status === 'active').length || 0,
      totalRuns: automations?.reduce((sum, a) => sum + (a.run_count || 0), 0) || 0,
      successRate: 0,
      errorCount: automations?.reduce((sum, a) => sum + (a.error_count || 0), 0) || 0,
      timeSaved: automations?.reduce((sum, a) => sum + (a.time_saved || 0), 0) || 0
    }

    const automationTotalSuccess = automations?.reduce((sum, a) => sum + (a.success_count || 0), 0) || 0
    automationMetrics.successRate = automationMetrics.totalRuns > 0
      ? Math.round((automationTotalSuccess / automationMetrics.totalRuns) * 100)
      : 0

    // Get recent executions
    const { data: recentWorkflowExecutions } = await supabase
      .from('workflow_executions')
      .select(`
        id,
        workflow_id,
        status,
        started_at,
        duration_ms,
        workflows!inner (name)
      `)
      .eq('workflows.user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(5)

    const { data: recentAutomationExecutions } = await supabase
      .from('automation_executions')
      .select(`
        id,
        automation_id,
        status,
        started_at,
        duration_ms,
        automations!inner (name)
      `)
      .eq('automations.user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      workflows: workflowMetrics,
      automations: automationMetrics,
      combined: {
        totalWorkflowsAndAutomations: workflowMetrics.total + automationMetrics.total,
        totalActive: workflowMetrics.active + automationMetrics.active,
        totalRuns: workflowMetrics.totalRuns + automationMetrics.totalRuns,
        overallSuccessRate: Math.round(
          ((workflowTotalSuccess + automationTotalSuccess) /
            Math.max(workflowMetrics.totalRuns + automationMetrics.totalRuns, 1)) * 100
        ),
        totalTimeSaved: automationMetrics.timeSaved
      },
      recentExecutions: {
        workflows: recentWorkflowExecutions || [],
        automations: recentAutomationExecutions || []
      }
    })
  } catch (error) {
    logger.error('Error in GET /api/kazi/metrics', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
