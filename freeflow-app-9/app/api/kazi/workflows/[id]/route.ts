import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
      console.error('Error fetching workflow:', error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/kazi/workflows/[id]:', error)
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
      console.error('Error updating workflow:', workflowError)
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
          console.error('Error updating workflow actions:', actionsError)
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
    console.error('Error in PATCH /api/kazi/workflows/[id]:', error)
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
      console.error('Error deleting workflow:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/kazi/workflows/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
