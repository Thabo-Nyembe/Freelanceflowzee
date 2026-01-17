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
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Verify automation belongs to user
    const { data: automation } = await supabase
      .from('automations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
    }

    // Fetch execution logs from workflow_executions table
    const { data: executions, error } = await supabase
      .from('workflow_executions')
      .select(`
        id,
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
      .eq('workflow_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching execution logs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to API format
    const logs = (executions || []).map(exec => ({
      id: exec.id,
      automation_id: id,
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
      .eq('workflow_id', id)

    return NextResponse.json({
      data: logs,
      pagination: {
        total: count || 0,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Error in GET /api/kazi/automations/[id]/logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
