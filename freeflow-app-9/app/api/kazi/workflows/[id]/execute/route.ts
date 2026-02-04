import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('KaziWorkflows')

// Action executor functions
const actionExecutors: Record<string, (config: Record<string, unknown>, context: Record<string, unknown>) => Promise<{ success: boolean; output?: unknown; error?: string }>> = {
  'email': async (config, context) => {
    logger.info('Sending email', { to: config.to || context.user_email, subject: config.subject })
    return { success: true, output: { sent: true, to: config.to || context.user_email } }
  },
  'notification': async (config) => {
    logger.info('Creating notification', { message: config.message })
    return { success: true, output: { notified: true, message: config.message } }
  },
  'create-task': async (config) => {
    logger.info('Creating task', { title: config.title })
    return { success: true, output: { task_created: true, title: config.title } }
  },
  'update-record': async (config) => {
    logger.info('Updating record', { table: config.table, id: config.id })
    return { success: true, output: { updated: true } }
  },
  'api-call': async (config) => {
    logger.info('Making API call', { url: config.url, method: config.method })
    return { success: true, output: { response: 'OK' } }
  },
  'delay': async (config) => {
    const delayMs = (config.delay_seconds as number || 1) * 1000
    await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 5000)))
    return { success: true, output: { delayed: true, duration: delayMs } }
  },
  'condition': async (config, context) => {
    const { field, operator, value } = config as { field: string; operator: string; value: unknown }
    const contextValue = context[field]
    let result = false

    switch (operator) {
      case 'equals':
        result = contextValue === value
        break
      case 'not-equals':
        result = contextValue !== value
        break
      case 'contains':
        result = String(contextValue).includes(String(value))
        break
      case 'greater':
        result = Number(contextValue) > Number(value)
        break
      case 'less':
        result = Number(contextValue) < Number(value)
        break
      case 'exists':
        result = contextValue !== undefined && contextValue !== null
        break
      default:
        result = true
    }

    return { success: result, output: { condition_met: result } }
  }
}

export async function POST(
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
    const { input = {} } = body

    // Get workflow with actions
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_actions (id, action_type, position, config, conditions)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const startTime = Date.now()
    const actions = workflow.workflow_actions || []

    // Sort actions by position
    actions.sort((a: { position: number }, b: { position: number }) => a.position - b.position)

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: id,
        status: 'running',
        triggered_by: 'manual',
        input,
        steps_total: actions.length
      })
      .select()
      .single()

    if (execError || !execution) {
      logger.error('Error creating execution', { error: execError })
      return NextResponse.json({ error: 'Failed to create execution' }, { status: 500 })
    }

    // Execute actions
    let stepsCompleted = 0
    let stepsFailed = 0
    const outputs: Record<string, unknown>[] = []
    const context = { ...input, user_id: user.id, user_email: user.email }

    for (const action of actions as { id: string; action_type: string; config: Record<string, unknown>; position: number }[]) {
      const actionStartTime = Date.now()

      // Create execution step
      const { data: step } = await supabase
        .from('execution_steps')
        .insert({
          execution_id: execution.id,
          action_id: action.id,
          action_type: action.action_type,
          status: 'running',
          input: action.config
        })
        .select()
        .single()

      try {
        const executor = actionExecutors[action.action_type]

        if (!executor) {
          throw new Error(`Unknown action type: ${action.action_type}`)
        }

        const result = await executor(action.config || {}, context)

        if (result.success) {
          stepsCompleted++
          outputs.push(result.output || {})

          // Update step
          if (step) {
            await supabase
              .from('execution_steps')
              .update({
                status: 'success',
                output: result.output,
                completed_at: new Date().toISOString(),
                duration_ms: Date.now() - actionStartTime
              })
              .eq('id', step.id)
          }
        } else {
          throw new Error(result.error || 'Action failed')
        }
      } catch (error) {
        stepsFailed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Update step with error
        if (step) {
          await supabase
            .from('execution_steps')
            .update({
              status: 'failed',
              error_message: errorMessage,
              completed_at: new Date().toISOString(),
              duration_ms: Date.now() - actionStartTime
            })
            .eq('id', step.id)
        }

        // For condition actions, continue even if they fail
        if (action.action_type !== 'condition') {
          break
        }
      }
    }

    const duration = Date.now() - startTime
    const status = stepsFailed > 0 ? 'failed' : 'success'

    // Update execution record
    await supabase
      .from('workflow_executions')
      .update({
        status,
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        steps_completed: stepsCompleted,
        steps_failed: stepsFailed,
        output: outputs,
        error_message: status === 'failed' ? 'One or more steps failed' : null
      })
      .eq('id', execution.id)

    return NextResponse.json({
      success: status === 'success',
      execution_id: execution.id,
      status,
      duration_ms: duration,
      steps_completed: stepsCompleted,
      steps_failed: stepsFailed,
      outputs
    })
  } catch (error) {
    logger.error('Error in POST /api/kazi/workflows/[id]/execute', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
