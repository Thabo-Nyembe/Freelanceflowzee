import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('kazi-automations')

// Demo user for unauthenticated access
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

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

// Transform API request to database format
function transformToDbFormat(apiData: Record<string, unknown>, userId: string): Record<string, unknown> {
  const dbRecord: Record<string, unknown> = {
    user_id: userId,
    workflow_name: apiData.name,
    description: apiData.description,
    trigger_type: apiData.trigger_type || 'manual',
    trigger_config: apiData.trigger_config || {},
    steps: apiData.actions || [],
    status: apiData.status === 'active' ? 'active' : (apiData.status || 'draft'),
    is_enabled: apiData.status === 'active',
    category: apiData.category || 'general',
    tags: apiData.tags || [],
    workflow_type: 'sequential',
    step_count: Array.isArray(apiData.actions) ? apiData.actions.length : 0,
    metadata: {
      icon: apiData.icon || 'Zap',
      color: apiData.color || 'blue',
      time_saved: apiData.time_saved || 0
    }
  }
  return dbRecord
}

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
      .from('automations')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      if (status === 'active') {
        query = query.eq('is_enabled', true)
      } else if (status === 'paused') {
        query = query.eq('is_enabled', false).eq('status', 'paused')
      } else {
        query = query.eq('status', status)
      }
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching automations', { error })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to API format
    const transformedData = (data || []).map(transformToApiFormat)

    return NextResponse.json({ data: transformedData })
  } catch (error) {
    logger.error('Error in GET /api/kazi/automations', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const body = await request.json()
    const userId = body.userId || DEMO_USER_ID

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const dbRecord = transformToDbFormat(body, userId)

    const { data, error } = await supabase
      .from('automations')
      .insert(dbRecord)
      .select()
      .single()

    if (error) {
      logger.error('Error creating automation', { error })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform back to API format
    const transformedData = transformToApiFormat(data)

    return NextResponse.json({ data: transformedData }, { status: 201 })
  } catch (error) {
    logger.error('Error in POST /api/kazi/automations', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
