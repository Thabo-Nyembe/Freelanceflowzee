import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('kazi-automation')

// Transform database record to API format
function transformToApiFormat(record: Record<string, unknown>): Record<string, unknown> {
  return {
    id: record.id,
    name: record.workflow_name,
    description: record.description,
    trigger_type: record.trigger_type || 'manual',
    trigger_config: record.trigger_config || {},
    actions: record.steps || [],
    status: record.is_enabled ? 'active' : (record.status as string || 'draft'),
    category: record.category || 'general',
    tags: record.tags || [],
    icon: (record.metadata as Record<string, unknown>)?.icon || 'Zap',
    color: (record.metadata as Record<string, unknown>)?.color || 'blue',
    run_count: record.total_executions || 0,
    success_count: record.successful_executions || 0,
    error_count: record.failed_executions || 0,
    success_rate: (record.total_executions as number) > 0
      ? Math.round(((record.successful_executions as number) / (record.total_executions as number)) * 100)
      : 0,
    time_saved: (record.metadata as Record<string, unknown>)?.time_saved || 0,
    last_triggered_at: record.last_execution_at,
    next_scheduled_at: record.next_scheduled_run,
    created_at: record.created_at,
    updated_at: record.updated_at
  }
}

// Transform API update request to database format
function transformUpdateToDbFormat(apiData: Record<string, unknown>): Record<string, unknown> {
  const dbRecord: Record<string, unknown> = {}

  if (apiData.name !== undefined) dbRecord.workflow_name = apiData.name
  if (apiData.description !== undefined) dbRecord.description = apiData.description
  if (apiData.trigger_type !== undefined) dbRecord.trigger_type = apiData.trigger_type
  if (apiData.trigger_config !== undefined) dbRecord.trigger_config = apiData.trigger_config
  if (apiData.actions !== undefined) {
    dbRecord.steps = apiData.actions
    dbRecord.step_count = Array.isArray(apiData.actions) ? apiData.actions.length : 0
  }
  if (apiData.status !== undefined) {
    dbRecord.status = apiData.status
    dbRecord.is_enabled = apiData.status === 'active'
  }
  if (apiData.category !== undefined) dbRecord.category = apiData.category
  if (apiData.tags !== undefined) dbRecord.tags = apiData.tags

  // Handle metadata fields
  if (apiData.icon !== undefined || apiData.color !== undefined || apiData.time_saved !== undefined) {
    dbRecord.metadata = {
      icon: apiData.icon || 'Zap',
      color: apiData.color || 'blue',
      time_saved: apiData.time_saved || 0
    }
  }

  return dbRecord
}

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
      .from('automations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (error) {
      logger.error('Error fetching automation', { error })
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ data: transformToApiFormat(data) })
  } catch (error) {
    logger.error('Error in GET /api/kazi/automations/[id]', { error })
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

    // Validate the automation belongs to user
    const { data: existing } = await supabase
      .from('automations')
      .select('id, metadata')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
    }

    // Transform API format to DB format
    const dbUpdate = transformUpdateToDbFormat(body)

    // Merge existing metadata with new metadata
    if (dbUpdate.metadata) {
      dbUpdate.metadata = {
        ...((existing.metadata as Record<string, unknown>) || {}),
        ...(dbUpdate.metadata as Record<string, unknown>)
      }
    }

    const { data, error } = await supabase
      .from('automations')
      .update({
        ...dbUpdate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating automation', { error })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: transformToApiFormat(data) })
  } catch (error) {
    logger.error('Error in PATCH /api/kazi/automations/[id]', { error })
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

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('automations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Error deleting automation', { error })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error in DELETE /api/kazi/automations/[id]', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
