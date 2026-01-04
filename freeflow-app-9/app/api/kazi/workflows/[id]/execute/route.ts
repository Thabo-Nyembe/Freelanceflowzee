import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Action executor functions
const actionExecutors: Record<string, (config: Record<string, unknown>, context: Record<string, unknown>) => Promise<{ success: boolean; output?: unknown; error?: string }>> = {
  'email': async (config, context) => {
    console.log('Sending email:', config)
    return { success: true, output: { sent: true, to: config.to || context.user_email } }
  },
  'notification': async (config) => {
    console.log('Creating notification:', config)
    return { success: true, output: { notified: true, message: config.message } }
  },
  'create-task': async (config) => {
    console.log('Creating task:', config)
    return { success: true, output: { task_created: true, title: config.title } }
  },
  'update-record': async (config) => {
    console.log('Updating record:', config)
    return { success: true, output: { updated: true } }
  },
  'api-call': async (config) => {
    console.log('Making API call:', config)
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
      console.error('Error creating execution:', execError)
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
    console.error('Error in POST /api/kazi/workflows/[id]/execute:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
