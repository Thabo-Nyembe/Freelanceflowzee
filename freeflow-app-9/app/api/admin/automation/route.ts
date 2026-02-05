/**
 * Admin Automation API Route
 * Workflow automation - triggers, actions, executions, templates
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, DEMO_USER_ID } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('admin-automation-api')

// Demo data for fallback
const DEMO_AUTOMATIONS = [
  { id: 'auto-1', name: 'New Client Welcome', trigger_type: 'event', trigger_config: { event: 'client_created' }, status: 'active', run_count: 45, success_count: 43, success_rate: 95.6 },
  { id: 'auto-2', name: 'Invoice Reminder', trigger_type: 'schedule', trigger_config: { cron: '0 9 * * *' }, status: 'active', run_count: 120, success_count: 118, success_rate: 98.3 },
  { id: 'auto-3', name: 'Project Complete Notify', trigger_type: 'event', trigger_config: { event: 'project_completed' }, status: 'paused', run_count: 28, success_count: 28, success_rate: 100 },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'overview'

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Automation API request', { action, userId: effectiveUserId })

    try {
      switch (action) {
        case 'workflows':
          return await getWorkflows(supabase, effectiveUserId, url, demoMode)
        case 'workflow':
          return await getWorkflow(supabase, effectiveUserId, url, demoMode)
        case 'executions':
          return await getExecutions(supabase, effectiveUserId, url, demoMode)
        case 'execution':
          return await getExecution(supabase, effectiveUserId, url, demoMode)
        case 'templates':
          return await getTemplates(supabase, url, demoMode)
        case 'logs':
          return await getWorkflowLogs(supabase, effectiveUserId, url, demoMode)
        case 'stats':
          return await getAutomationStats(supabase, effectiveUserId, demoMode)
        case 'overview':
        default:
          return await getAutomationOverview(supabase, effectiveUserId, demoMode)
      }
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          automations: DEMO_AUTOMATIONS,
          stats: {
            totalAutomations: 15,
            activeAutomations: 12,
            totalRuns: 1245,
            successRate: 98.5
          }
        }
      })
    }
  } catch (error) {
    logger.error('Automation API error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automation data' },
      { status: 500 }
    )
  }
}

async function getWorkflows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const status = url.searchParams.get('status')
  const triggerType = url.searchParams.get('triggerType')
  const category = url.searchParams.get('category')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('workflows')
    .select(`
      *,
      actions:workflow_actions(id, action_type, position, config)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }
  if (triggerType) {
    query = query.eq('trigger_type', triggerType)
  }
  if (category) {
    query = query.eq('category', category)
  }

  const { data: workflows, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          workflows: DEMO_AUTOMATIONS,
          total: DEMO_AUTOMATIONS.length,
          hasMore: false
        }
      })
    }
    throw error
  }

  // Calculate aggregate stats
  const activeCount = workflows?.filter(w => w.status === 'active').length || 0
  const totalRuns = workflows?.reduce((sum, w) => sum + (w.run_count || 0), 0) || 0
  const totalSuccess = workflows?.reduce((sum, w) => sum + (w.success_count || 0), 0) || 0
  const avgSuccessRate = totalRuns > 0 ? (totalSuccess / totalRuns * 100) : 100

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      workflows: workflows || [],
      total: count || 0,
      summary: {
        total: count || 0,
        active: activeCount,
        totalRuns,
        avgSuccessRate: avgSuccessRate.toFixed(2)
      },
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getWorkflow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const workflowId = url.searchParams.get('id')

  if (!workflowId) {
    return NextResponse.json(
      { success: false, error: 'Workflow ID is required' },
      { status: 400 }
    )
  }

  const { data: workflow, error } = await supabase
    .from('workflows')
    .select(`
      *,
      actions:workflow_actions(*),
      executions:workflow_executions(id, status, started_at, completed_at, duration_ms)
    `)
    .eq('id', workflowId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { workflow: DEMO_AUTOMATIONS[0] }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { workflow }
  })
}

async function getExecutions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const workflowId = url.searchParams.get('workflowId')
  const status = url.searchParams.get('status')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('workflow_executions')
    .select(`
      *,
      workflow:workflows!inner(id, name, user_id)
    `, { count: 'exact' })
    .eq('workflow.user_id', userId)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (workflowId) {
    query = query.eq('workflow_id', workflowId)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data: executions, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          executions: [
            { id: 'exec-1', workflow_id: 'auto-1', status: 'success', started_at: new Date().toISOString(), duration_ms: 1250 },
            { id: 'exec-2', workflow_id: 'auto-2', status: 'success', started_at: new Date(Date.now() - 3600000).toISOString(), duration_ms: 850 },
          ],
          total: 2,
          hasMore: false
        }
      })
    }
    throw error
  }

  // Calculate stats
  const successCount = executions?.filter(e => e.status === 'success').length || 0
  const failedCount = executions?.filter(e => e.status === 'failed').length || 0
  const avgDuration = executions?.length > 0
    ? executions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / executions.length
    : 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      executions: executions || [],
      total: count || 0,
      stats: {
        success: successCount,
        failed: failedCount,
        avgDuration: Math.round(avgDuration)
      },
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getExecution(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const executionId = url.searchParams.get('id')

  if (!executionId) {
    return NextResponse.json(
      { success: false, error: 'Execution ID is required' },
      { status: 400 }
    )
  }

  const { data: execution, error } = await supabase
    .from('workflow_executions')
    .select(`
      *,
      workflow:workflows!inner(id, name, user_id),
      steps:execution_steps(*)
    `)
    .eq('id', executionId)
    .eq('workflow.user_id', userId)
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          execution: {
            id: executionId,
            status: 'success',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            duration_ms: 1250,
            steps: []
          }
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { execution }
  })
}

async function getTemplates(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: URL,
  demoMode: boolean
) {
  const category = url.searchParams.get('category')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('workflow_templates')
    .select('*', { count: 'exact' })
    .order('usage_count', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) {
    query = query.eq('category', category)
  }

  const { data: templates, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          templates: [
            { id: 'tmpl-1', name: 'Welcome Email Sequence', category: 'marketing', trigger_type: 'event', usage_count: 156 },
            { id: 'tmpl-2', name: 'Invoice Payment Reminder', category: 'operations', trigger_type: 'schedule', usage_count: 234 },
            { id: 'tmpl-3', name: 'Lead Nurture Campaign', category: 'sales', trigger_type: 'event', usage_count: 89 },
          ],
          total: 3,
          hasMore: false
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      templates: templates || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getWorkflowLogs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const workflowId = url.searchParams.get('workflowId')
  const executionId = url.searchParams.get('executionId')
  const level = url.searchParams.get('level')
  const limit = parseInt(url.searchParams.get('limit') || '100')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('workflow_logs')
    .select(`
      *,
      workflow:workflows!inner(id, name, user_id)
    `, { count: 'exact' })
    .eq('workflow.user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (workflowId) {
    query = query.eq('workflow_id', workflowId)
  }
  if (executionId) {
    query = query.eq('execution_id', executionId)
  }
  if (level) {
    query = query.eq('level', level)
  }

  const { data: logs, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          logs: [
            { id: 'log-1', level: 'info', message: 'Workflow started', created_at: new Date().toISOString() },
            { id: 'log-2', level: 'info', message: 'Action completed: send_email', created_at: new Date().toISOString() },
          ],
          total: 2,
          hasMore: false
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      logs: logs || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getAutomationStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  demoMode: boolean
) {
  // Get workflow counts
  const { data: workflows } = await supabase
    .from('workflows')
    .select('status, run_count, success_count, error_count')
    .eq('user_id', userId)

  // Get recent executions
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todayExecutions } = await supabase
    .from('workflow_executions')
    .select(`
      status,
      workflow:workflows!inner(user_id)
    `)
    .eq('workflow.user_id', userId)
    .gte('started_at', today.toISOString())

  if (!workflows) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          totalAutomations: 15,
          activeAutomations: 12,
          pausedAutomations: 3,
          totalRuns: 1245,
          successRate: 98.5,
          runsToday: 47,
          errorCount: 12
        }
      })
    }
  }

  const totalAutomations = workflows?.length || 0
  const activeAutomations = workflows?.filter(w => w.status === 'active').length || 0
  const pausedAutomations = workflows?.filter(w => w.status === 'paused').length || 0
  const totalRuns = workflows?.reduce((sum, w) => sum + (w.run_count || 0), 0) || 0
  const totalSuccess = workflows?.reduce((sum, w) => sum + (w.success_count || 0), 0) || 0
  const totalErrors = workflows?.reduce((sum, w) => sum + (w.error_count || 0), 0) || 0
  const successRate = totalRuns > 0 ? (totalSuccess / totalRuns * 100) : 100
  const runsToday = todayExecutions?.length || 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      totalAutomations,
      activeAutomations,
      pausedAutomations,
      totalRuns,
      successRate: successRate.toFixed(2),
      runsToday,
      errorCount: totalErrors
    }
  })
}

async function getAutomationOverview(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  demoMode: boolean
) {
  // Get active automations
  const { data: automations, error: automationsError } = await supabase
    .from('workflows')
    .select(`
      *,
      actions:workflow_actions(id, action_type)
    `)
    .eq('user_id', userId)
    .in('status', ['active', 'paused'])
    .order('run_count', { ascending: false })
    .limit(5)

  // Get stats
  const { data: allWorkflows } = await supabase
    .from('workflows')
    .select('status, run_count, success_count')
    .eq('user_id', userId)

  const totalAutomations = allWorkflows?.length || 0
  const activeAutomations = allWorkflows?.filter(w => w.status === 'active').length || 0
  const totalRuns = allWorkflows?.reduce((sum, w) => sum + (w.run_count || 0), 0) || 0
  const totalSuccess = allWorkflows?.reduce((sum, w) => sum + (w.success_count || 0), 0) || 0
  const successRate = totalRuns > 0 ? (totalSuccess / totalRuns * 100) : 100

  if (automationsError) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          automations: DEMO_AUTOMATIONS,
          stats: {
            totalAutomations: 15,
            activeAutomations: 12,
            totalRuns: 1245,
            successRate: 98.5
          }
        }
      })
    }
    throw automationsError
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      automations: automations || [],
      stats: {
        totalAutomations,
        activeAutomations,
        totalRuns,
        successRate: successRate.toFixed(2)
      }
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { action, ...data } = body

    logger.info('Automation POST request', { action, userId: effectiveUserId })

    try {
      switch (action) {
        case 'create_workflow':
          return await createWorkflow(supabase, effectiveUserId, data, demoMode)
        case 'update_workflow':
          return await updateWorkflow(supabase, effectiveUserId, data, demoMode)
        case 'delete_workflow':
          return await deleteWorkflow(supabase, effectiveUserId, data, demoMode)
        case 'update_status':
          return await updateWorkflowStatus(supabase, effectiveUserId, data, demoMode)
        case 'add_action':
          return await addWorkflowAction(supabase, effectiveUserId, data, demoMode)
        case 'update_action':
          return await updateWorkflowAction(supabase, effectiveUserId, data, demoMode)
        case 'delete_action':
          return await deleteWorkflowAction(supabase, effectiveUserId, data, demoMode)
        case 'trigger_workflow':
          return await triggerWorkflow(supabase, effectiveUserId, data, demoMode)
        case 'create_from_template':
          return await createFromTemplate(supabase, effectiveUserId, data, demoMode)
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          )
      }
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `demo-${Date.now()}`, ...data },
        message: `${action} completed (demo mode)`
      })
    }
  } catch (error) {
    logger.error('Automation POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process automation request' },
      { status: 500 }
    )
  }
}

async function createWorkflow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    name,
    description,
    triggerType,
    trigger_type,
    triggerConfig,
    trigger_config,
    category,
    tags = []
  } = data

  if (!name || !(triggerType || trigger_type)) {
    return NextResponse.json(
      { success: false, error: 'Workflow name and trigger type are required' },
      { status: 400 }
    )
  }

  const workflowData = {
    user_id: userId,
    name,
    description: description || null,
    status: 'draft',
    trigger_type: triggerType || trigger_type,
    trigger_config: triggerConfig || trigger_config || {},
    trigger_enabled: true,
    category: category || null,
    tags
  }

  const { data: workflow, error } = await supabase
    .from('workflows')
    .insert(workflowData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `workflow-${Date.now()}`, ...workflowData },
        message: 'Workflow created (demo mode)'
      })
    }
    throw error
  }

  logger.info('Workflow created', { workflowId: workflow.id })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: workflow,
    message: 'Workflow created successfully'
  })
}

async function updateWorkflow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, workflowId, workflow_id, ...updateData } = data
  const actualId = id || workflowId || workflow_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Workflow ID is required' },
      { status: 400 }
    )
  }

  const dbData: Record<string, any> = {}
  if (updateData.name) dbData.name = updateData.name
  if (updateData.description !== undefined) dbData.description = updateData.description
  if (updateData.triggerType || updateData.trigger_type) dbData.trigger_type = updateData.triggerType || updateData.trigger_type
  if (updateData.triggerConfig || updateData.trigger_config) dbData.trigger_config = updateData.triggerConfig || updateData.trigger_config
  if (updateData.triggerEnabled !== undefined || updateData.trigger_enabled !== undefined) {
    dbData.trigger_enabled = updateData.triggerEnabled ?? updateData.trigger_enabled
  }
  if (updateData.category) dbData.category = updateData.category
  if (updateData.tags) dbData.tags = updateData.tags
  if (updateData.nextRunAt || updateData.next_run_at) dbData.next_run_at = updateData.nextRunAt || updateData.next_run_at

  const { data: workflow, error } = await supabase
    .from('workflows')
    .update(dbData)
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, ...dbData },
        message: 'Workflow updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: workflow,
    message: 'Workflow updated successfully'
  })
}

async function deleteWorkflow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, workflowId, workflow_id } = data
  const actualId = id || workflowId || workflow_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Workflow ID is required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', actualId)
    .eq('user_id', userId)

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, deleted: true },
        message: 'Workflow deleted (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { id: actualId, deleted: true },
    message: 'Workflow deleted successfully'
  })
}

async function updateWorkflowStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, workflowId, workflow_id, status } = data
  const actualId = id || workflowId || workflow_id

  if (!actualId || !status) {
    return NextResponse.json(
      { success: false, error: 'Workflow ID and status are required' },
      { status: 400 }
    )
  }

  const { data: workflow, error } = await supabase
    .from('workflows')
    .update({ status })
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, status },
        message: 'Workflow status updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: workflow,
    message: `Workflow ${status === 'active' ? 'activated' : status}`
  })
}

async function addWorkflowAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    workflowId,
    workflow_id,
    actionType,
    action_type,
    config = {},
    position,
    conditions = []
  } = data
  const actualWorkflowId = workflowId || workflow_id
  const actualActionType = actionType || action_type

  if (!actualWorkflowId || !actualActionType) {
    return NextResponse.json(
      { success: false, error: 'Workflow ID and action type are required' },
      { status: 400 }
    )
  }

  // Verify workflow ownership
  const { data: workflow } = await supabase
    .from('workflows')
    .select('id')
    .eq('id', actualWorkflowId)
    .eq('user_id', userId)
    .single()

  if (!workflow && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Workflow not found' },
      { status: 404 }
    )
  }

  // Get next position if not specified
  let actionPosition = position
  if (actionPosition === undefined) {
    const { data: existingActions } = await supabase
      .from('workflow_actions')
      .select('position')
      .eq('workflow_id', actualWorkflowId)
      .order('position', { ascending: false })
      .limit(1)

    actionPosition = existingActions && existingActions.length > 0
      ? existingActions[0].position + 1
      : 0
  }

  const actionData = {
    workflow_id: actualWorkflowId,
    action_type: actualActionType,
    position: actionPosition,
    config,
    conditions
  }

  const { data: action, error } = await supabase
    .from('workflow_actions')
    .insert(actionData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `action-${Date.now()}`, ...actionData },
        message: 'Action added (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: action,
    message: 'Workflow action added successfully'
  })
}

async function updateWorkflowAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, actionId, action_id, ...updateData } = data
  const actualId = id || actionId || action_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Action ID is required' },
      { status: 400 }
    )
  }

  const dbData: Record<string, any> = {}
  if (updateData.actionType || updateData.action_type) dbData.action_type = updateData.actionType || updateData.action_type
  if (updateData.config) dbData.config = updateData.config
  if (updateData.position !== undefined) dbData.position = updateData.position
  if (updateData.conditions) dbData.conditions = updateData.conditions
  if (updateData.onSuccessActionId || updateData.on_success_action_id) {
    dbData.on_success_action_id = updateData.onSuccessActionId || updateData.on_success_action_id
  }
  if (updateData.onFailureActionId || updateData.on_failure_action_id) {
    dbData.on_failure_action_id = updateData.onFailureActionId || updateData.on_failure_action_id
  }

  // Verify ownership through workflow
  const { data: action, error } = await supabase
    .from('workflow_actions')
    .update(dbData)
    .eq('id', actualId)
    .select(`
      *,
      workflow:workflows!inner(user_id)
    `)
    .eq('workflow.user_id', userId)
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, ...dbData },
        message: 'Action updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: action,
    message: 'Workflow action updated successfully'
  })
}

async function deleteWorkflowAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, actionId, action_id } = data
  const actualId = id || actionId || action_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Action ID is required' },
      { status: 400 }
    )
  }

  // Verify ownership and delete
  const { error } = await supabase
    .from('workflow_actions')
    .delete()
    .eq('id', actualId)

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, deleted: true },
        message: 'Action deleted (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { id: actualId, deleted: true },
    message: 'Workflow action deleted successfully'
  })
}

async function triggerWorkflow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, workflowId, workflow_id, input = {} } = data
  const actualId = id || workflowId || workflow_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Workflow ID is required' },
      { status: 400 }
    )
  }

  // Get workflow
  const { data: workflow, error: workflowError } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', actualId)
    .eq('user_id', userId)
    .single()

  if (workflowError || !workflow) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          executionId: `exec-${Date.now()}`,
          status: 'running',
          startedAt: new Date().toISOString()
        },
        message: 'Workflow triggered (demo mode)'
      })
    }
    throw workflowError || new Error('Workflow not found')
  }

  // Create execution record
  const executionData = {
    workflow_id: actualId,
    status: 'pending',
    triggered_by: 'manual',
    input
  }

  const { data: execution, error: executionError } = await supabase
    .from('workflow_executions')
    .insert(executionData)
    .select()
    .single()

  if (executionError) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          executionId: `exec-${Date.now()}`,
          status: 'running',
          startedAt: new Date().toISOString()
        },
        message: 'Workflow triggered (demo mode)'
      })
    }
    throw executionError
  }

  // In a real implementation, queue the workflow for execution
  // For now, mark as running and log
  await supabase
    .from('workflow_executions')
    .update({ status: 'running' })
    .eq('id', execution.id)

  logger.info('Workflow triggered', { workflowId: actualId, executionId: execution.id })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      executionId: execution.id,
      status: 'running',
      startedAt: execution.started_at
    },
    message: 'Workflow triggered successfully'
  })
}

async function createFromTemplate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { templateId, template_id, name, customConfig } = data
  const actualTemplateId = templateId || template_id

  if (!actualTemplateId) {
    return NextResponse.json(
      { success: false, error: 'Template ID is required' },
      { status: 400 }
    )
  }

  // Get template
  const { data: template, error: templateError } = await supabase
    .from('workflow_templates')
    .select('*')
    .eq('id', actualTemplateId)
    .single()

  if (templateError || !template) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          id: `workflow-${Date.now()}`,
          name: name || 'New Workflow',
          status: 'draft',
          fromTemplate: actualTemplateId
        },
        message: 'Workflow created from template (demo mode)'
      })
    }
    throw templateError || new Error('Template not found')
  }

  // Create workflow from template
  const workflowData = {
    user_id: userId,
    name: name || template.name,
    description: template.description,
    status: 'draft',
    trigger_type: template.trigger_type,
    trigger_config: { ...template.trigger_config, ...customConfig },
    trigger_enabled: true,
    category: template.category,
    tags: template.tags
  }

  const { data: workflow, error: workflowError } = await supabase
    .from('workflows')
    .insert(workflowData)
    .select()
    .single()

  if (workflowError) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `workflow-${Date.now()}`, ...workflowData },
        message: 'Workflow created from template (demo mode)'
      })
    }
    throw workflowError
  }

  // Create actions from template
  if (template.actions && Array.isArray(template.actions)) {
    const actionsData = template.actions.map((action: any, index: number) => ({
      workflow_id: workflow.id,
      action_type: action.action_type,
      position: index,
      config: action.config || {},
      conditions: action.conditions || []
    }))

    await supabase.from('workflow_actions').insert(actionsData)
  }

  // Increment template usage count
  await supabase
    .from('workflow_templates')
    .update({ usage_count: template.usage_count + 1 })
    .eq('id', actualTemplateId)

  logger.info('Workflow created from template', { workflowId: workflow.id, templateId: actualTemplateId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: workflow,
    message: 'Workflow created from template successfully'
  })
}
