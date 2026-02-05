import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DEMO_USER_ID } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('kazi-workflow-executions')

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || DEMO_USER_ID
    const workflowId = searchParams.get('workflowId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // First get the user's workflow IDs to filter executions
    const { data: userWorkflows } = await supabase
      .from('workflows')
      .select('id')
      .eq('user_id', userId)

    if (!userWorkflows || userWorkflows.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const workflowIds = userWorkflows.map(w => w.id)

    let query = supabase
      .from('workflow_executions')
      .select(`
        *,
        workflows:workflow_id (name)
      `)
      .in('workflow_id', workflowIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (workflowId) {
      query = query.eq('workflow_id', workflowId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching workflow executions', { error })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to include workflow name directly
    const transformedData = (data || []).map(execution => ({
      ...execution,
      workflow_name: execution.workflows?.name || 'Unknown Workflow',
      // Map fields to match expected format
      started_at: execution.created_at,
      actions_completed: execution.steps_completed || 0,
      actions_total: execution.steps_total || 0,
      trigger_type: execution.triggered_by || 'manual',
      execution_time_ms: execution.duration_ms
    }))

    return NextResponse.json({ data: transformedData })
  } catch (error) {
    logger.error('Error in GET /api/kazi/workflows/executions', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
