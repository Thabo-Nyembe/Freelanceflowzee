import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('automation-logs')

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // First get all user's automation IDs
    const { data: userAutomations } = await supabase
      .from('automations')
      .select('id, workflow_name')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (!userAutomations || userAutomations.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: { total: 0, limit, offset }
      })
    }

    const automationIds = userAutomations.map(a => a.id)
    const automationNames = new Map(userAutomations.map(a => [a.id, a.workflow_name]))

    // Fetch recent executions across all user's automations
    const { data: executions, error } = await supabase
      .from('workflow_executions')
      .select(`
        id,
        workflow_id,
        status,
        triggered_by,
        trigger_data,
        started_at,
        completed_at,
        duration_ms,
        actions_completed,
        actions_failed,
        error_message,
        result,
        created_at
      `)
      .in('workflow_id', automationIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.error('Error fetching execution logs', { error })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to API format with automation names
    const logs = (executions || []).map(exec => ({
      id: exec.id,
      automation_id: exec.workflow_id,
      automation_name: automationNames.get(exec.workflow_id) || 'Unknown',
      status: exec.status,
      triggered_by: exec.triggered_by || 'manual',
      started_at: exec.started_at || exec.created_at,
      completed_at: exec.completed_at,
      duration_ms: exec.duration_ms,
      actions_completed: exec.actions_completed || 0,
      actions_failed: exec.actions_failed || 0,
      error_message: exec.error_message,
      result: exec.result,
      created_at: exec.created_at
    }))

    // Get total count for pagination
    const { count } = await supabase
      .from('workflow_executions')
      .select('id', { count: 'exact', head: true })
      .in('workflow_id', automationIds)

    return NextResponse.json({
      data: logs,
      pagination: {
        total: count || 0,
        limit,
        offset
      }
    })
  } catch (error) {
    logger.error('Error in GET /api/kazi/automations/logs', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
