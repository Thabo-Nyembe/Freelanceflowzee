import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('KaziAutomations')

// Action executor functions
const actionExecutors: Record<string, (config: Record<string, unknown>, context: Record<string, unknown>) => Promise<{ success: boolean; output?: unknown; error?: string }>> = {
  'email': async (config, context) => {
    // In production, integrate with email service (Resend, SendGrid, etc.)
    logger.info('Sending email', { to: config.to || context.user_email, subject: config.subject })
    return { success: true, output: { sent: true, to: config.to || context.user_email } }
  },
  'notification': async (config) => {
    // In production, create notification in database
    logger.info('Creating notification', { message: config.message })
    return { success: true, output: { notified: true, message: config.message } }
  },
  'create-task': async (config) => {
    // In production, create task in database
    logger.info('Creating task', { title: config.title })
    return { success: true, output: { task_created: true, title: config.title } }
  },
  'update-record': async (config) => {
    logger.info('Updating record', { table: config.table, id: config.id })
    return { success: true, output: { updated: true } }
  },
  'api-call': async (config) => {
    // In production, make actual API call
    logger.info('Making API call', { url: config.url, method: config.method })
    return { success: true, output: { response: 'OK' } }
  },
  'delay': async (config) => {
    const delayMs = (config.delay_seconds as number || 1) * 1000
    await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 5000))) // Max 5 second delay
    return { success: true, output: { delayed: true, duration: delayMs } }
  },
  'condition': async (config, context) => {
    // Evaluate condition
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
  },
  'slack-message': async (config) => {
    logger.info('Sending Slack message', { channel: config.channel })
    return { success: true, output: { sent: true, channel: config.channel } }
  },
  'discord-message': async (config) => {
    logger.info('Sending Discord message', { channel: config.channel })
    return { success: true, output: { sent: true } }
  },
  'send-sms': async (config) => {
    logger.info('Sending SMS', { to: config.to })
    return { success: true, output: { sent: true } }
  },
  'send-invoice': async (config) => {
    logger.info('Sending invoice', { invoiceId: config.invoice_id })
    return { success: true, output: { invoice_sent: true } }
  },
  'create-project': async (config) => {
    logger.info('Creating project', { name: config.name })
    return { success: true, output: { project_created: true } }
  },
  'create-event': async (config) => {
    logger.info('Creating event', { title: config.title })
    return { success: true, output: { event_created: true } }
  },
  'update-status': async (config) => {
    logger.info('Updating status', { newStatus: config.status })
    return { success: true, output: { status_updated: true, new_status: config.status } }
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

    // Get automation (using automations table with existing schema)
    const { data: automation, error: automationError } = await supabase
      .from('automations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (automationError || !automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
    }

    const startTime = Date.now()
    const steps = (automation.steps as Array<{ type: string; config: Record<string, unknown> }>) || []

    // Create execution record using workflow_executions table
    const { data: execution, error: execError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: id,
        user_id: user.id,
        status: 'running',
        triggered_by: 'manual',
        trigger_data: input,
        total_actions: steps.length,
        current_action_index: 0,
        variables: {},
        context: { automation_id: id }
      })
      .select()
      .single()

    if (execError || !execution) {
      console.error('Error creating execution:', execError)
      // If workflow_executions fails, continue without tracking
      // This allows the automation to run even without the execution table
    }

    // Execute actions (steps in DB schema)
    let actionsCompleted = 0
    let actionsFailed = 0
    const outputs: Record<string, unknown>[] = []
    const context = { ...input, user_id: user.id, user_email: user.email }

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const actionStartTime = Date.now()

      // Create action log if execution was created
      let actionLog: { id: string } | null = null
      if (execution) {
        const { data: log } = await supabase
          .from('workflow_action_logs')
          .insert({
            execution_id: execution.id,
            action_type: step.type,
            action_index: i,
            action_config: step.config,
            status: 'running',
            input_data: step.config,
            started_at: new Date().toISOString()
          })
          .select('id')
          .single()
        actionLog = log
      }

      try {
        const executor = actionExecutors[step.type]

        if (!executor) {
          throw new Error(`Unknown action type: ${step.type}`)
        }

        const result = await executor(step.config || {}, context)

        if (result.success) {
          actionsCompleted++
          outputs.push(result.output || {})

          // Update action log
          if (actionLog) {
            await supabase
              .from('workflow_action_logs')
              .update({
                status: 'success',
                output_data: result.output,
                completed_at: new Date().toISOString(),
                duration_ms: Date.now() - actionStartTime
              })
              .eq('id', actionLog.id)
          }
        } else {
          throw new Error(result.error || 'Action failed')
        }
      } catch (error) {
        actionsFailed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Update action log with error
        if (actionLog) {
          await supabase
            .from('workflow_action_logs')
            .update({
              status: 'failed',
              error_message: errorMessage,
              completed_at: new Date().toISOString(),
              duration_ms: Date.now() - actionStartTime
            })
            .eq('id', actionLog.id)
        }

        // For condition actions, continue even if they fail (condition not met)
        if (step.type !== 'condition') {
          break // Stop execution on non-condition failure
        }
      }
    }

    const duration = Date.now() - startTime
    const status = actionsFailed > 0 && steps.some(s => s.type !== 'condition')
      ? 'failed'
      : 'success'

    // Update execution record
    if (execution) {
      await supabase
        .from('workflow_executions')
        .update({
          status,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          actions_completed: actionsCompleted,
          actions_failed: actionsFailed,
          result: outputs,
          error_message: status === 'failed' ? 'One or more actions failed' : null
        })
        .eq('id', execution.id)
    }

    // Update automation stats
    await supabase
      .from('automations')
      .update({
        total_executions: (automation.total_executions || 0) + 1,
        successful_executions: status === 'success'
          ? (automation.successful_executions || 0) + 1
          : automation.successful_executions || 0,
        failed_executions: status === 'failed'
          ? (automation.failed_executions || 0) + 1
          : automation.failed_executions || 0,
        last_execution_at: new Date().toISOString(),
        last_execution_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    return NextResponse.json({
      success: status === 'success',
      execution_id: execution?.id,
      status,
      duration_ms: duration,
      actions_completed: actionsCompleted,
      actions_failed: actionsFailed,
      outputs
    })
  } catch (error) {
    console.error('Error in POST /api/kazi/automations/[id]/execute:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
