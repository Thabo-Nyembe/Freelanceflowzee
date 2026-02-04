import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
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

const logger = createFeatureLogger('kazi-workflow')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data, error } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_actions (id, action_type, position, config, conditions)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Error fetching workflow', { error })
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logger.error('Error in GET /api/kazi/workflows/[id]', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { actions, ...workflowUpdates } = body

    // Validate the workflow belongs to user
    const { data: existing } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Update workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .update({
        ...workflowUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (workflowError) {
      logger.error('Error updating workflow', { error: workflowError })
      return NextResponse.json({ error: workflowError.message }, { status: 500 })
    }

    // Update actions if provided
    if (actions && Array.isArray(actions)) {
      // Delete existing actions
      await supabase
        .from('workflow_actions')
        .delete()
        .eq('workflow_id', id)

      // Insert new actions
      if (actions.length > 0) {
        const actionRecords = actions.map((action: { action_type: string; config: Record<string, unknown>; conditions?: Record<string, unknown>[] }, index: number) => ({
          workflow_id: id,
          action_type: action.action_type,
          position: index,
          config: action.config || {},
          conditions: action.conditions || []
        }))

        const { error: actionsError } = await supabase
          .from('workflow_actions')
          .insert(actionRecords)

        if (actionsError) {
          logger.error('Error updating workflow actions', { error: actionsError })
        }
      }
    }

    // Fetch complete workflow with actions
    const { data: completeWorkflow } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_actions (id, action_type, position, config)
      `)
      .eq('id', id)
      .single()

    return NextResponse.json({ data: completeWorkflow })
  } catch (error) {
    logger.error('Error in PATCH /api/kazi/workflows/[id]', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Actions will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Error deleting workflow', { error })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error in DELETE /api/kazi/workflows/[id]', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
