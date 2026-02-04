import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('kazi-workflows')

// Demo user for unauthenticated access
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || DEMO_USER_ID
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('workflows')
      .select(`
        *,
        workflow_actions (id, action_type, position, config)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching workflows', { error })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logger.error('Error in GET /api/kazi/workflows', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const body = await request.json()
    const {
      name,
      description,
      trigger_type = 'manual',
      trigger_config = {},
      actions = [],
      category = null,
      tags = [],
      status = 'draft',
      userId = DEMO_USER_ID
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        user_id: userId,
        name,
        description,
        trigger_type,
        trigger_config,
        category,
        tags,
        status
      })
      .select()
      .single()

    if (workflowError || !workflow) {
      logger.error('Error creating workflow', { error: workflowError })
      return NextResponse.json({ error: workflowError?.message || 'Failed to create workflow' }, { status: 500 })
    }

    // Create workflow actions
    if (actions.length > 0) {
      const actionRecords = actions.map((action: { action_type: string; config: Record<string, unknown>; conditions?: Record<string, unknown>[] }, index: number) => ({
        workflow_id: workflow.id,
        action_type: action.action_type,
        position: index,
        config: action.config || {},
        conditions: action.conditions || []
      }))

      const { error: actionsError } = await supabase
        .from('workflow_actions')
        .insert(actionRecords)

      if (actionsError) {
        logger.error('Error creating workflow actions', { error: actionsError })
        // Rollback workflow creation
        await supabase.from('workflows').delete().eq('id', workflow.id)
        return NextResponse.json({ error: 'Failed to create workflow actions' }, { status: 500 })
      }
    }

    // Fetch complete workflow with actions
    const { data: completeWorkflow } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_actions (id, action_type, position, config)
      `)
      .eq('id', workflow.id)
      .single()

    return NextResponse.json({ data: completeWorkflow }, { status: 201 })
  } catch (error) {
    logger.error('Error in POST /api/kazi/workflows', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
