/**
 * KAZI Workflow Automation API
 *
 * Comprehensive API for managing automated workflows,
 * triggers, executions, and scheduling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('workflows')
import { workflowEngine } from '@/lib/workflow/workflow-engine'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'

    switch (action) {
      case 'list': {
        const triggerType = searchParams.get('triggerType') as any
        const isActive = searchParams.get('isActive')
        const tags = searchParams.get('tags')?.split(',').filter(Boolean)
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        const { workflows, total } = await workflowEngine.listWorkflows(user.id, {
          triggerType,
          isActive: isActive ? isActive === 'true' : undefined,
          tags,
          limit,
          offset
        })

        return NextResponse.json({ workflows, total, limit, offset })
      }

      case 'get': {
        const workflowId = searchParams.get('workflowId')

        if (!workflowId) {
          return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 })
        }

        const workflow = await workflowEngine.getWorkflow(user.id, workflowId)

        if (!workflow) {
          return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
        }

        return NextResponse.json({ workflow })
      }

      case 'executions': {
        const workflowId = searchParams.get('workflowId')
        const status = searchParams.get('status') as any
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        const { executions, total } = await workflowEngine.getExecutionHistory(user.id, {
          workflowId: workflowId || undefined,
          status,
          limit,
          offset
        })

        return NextResponse.json({ executions, total, limit, offset })
      }

      case 'execution_details': {
        const executionId = searchParams.get('executionId')

        if (!executionId) {
          return NextResponse.json({ error: 'Execution ID required' }, { status: 400 })
        }

        const details = await workflowEngine.getExecutionDetails(user.id, executionId)

        if (!details) {
          return NextResponse.json({ error: 'Execution not found' }, { status: 404 })
        }

        return NextResponse.json(details)
      }

      case 'statistics': {
        const workflowId = searchParams.get('workflowId')

        const stats = await workflowEngine.getStatistics(user.id, workflowId || undefined)

        return NextResponse.json({ statistics: stats })
      }

      case 'templates': {
        // Get workflow templates/presets
        const category = searchParams.get('category')

        const templates = getWorkflowTemplates(category || undefined)

        return NextResponse.json({ templates })
      }

      case 'action_types': {
        // Get available action types
        const actionTypes = getActionTypes()

        return NextResponse.json({ actionTypes })
      }

      case 'schedules': {
        const { data: schedules, error } = await supabase
          .from('workflow_schedules')
          .select('*, workflow_templates(id, name)')
          .eq('user_id', user.id)
          .order('next_run_at', { ascending: true })

        if (error) throw error

        return NextResponse.json({ schedules })
      }

      case 'webhooks': {
        const { data: webhooks, error } = await supabase
          .from('workflow_webhooks')
          .select('*, workflow_templates(id, name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ webhooks })
      }

      case 'event_subscriptions': {
        const { data: subscriptions, error } = await supabase
          .from('workflow_event_subscriptions')
          .select('*, workflow_templates(id, name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ subscriptions })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Workflow API GET error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create': {
        const workflow = await workflowEngine.createWorkflow(user.id, {
          name: data.name,
          description: data.description,
          trigger_type: data.triggerType,
          trigger_config: data.triggerConfig || {},
          actions: data.actions || [],
          conditions: data.conditions,
          is_active: data.isActive ?? true,
          tags: data.tags || [],
          metadata: data.metadata || {}
        })

        // Create schedule if trigger type is schedule
        if (data.triggerType === 'schedule' && data.triggerConfig?.schedule) {
          await supabase
            .from('workflow_schedules')
            .insert({
              workflow_id: workflow.id,
              user_id: user.id,
              cron_expression: data.triggerConfig.schedule,
              timezone: data.triggerConfig.timezone || 'UTC',
              next_run_at: calculateNextRun(data.triggerConfig.schedule),
              is_active: true
            })
        }

        // Create webhook if trigger type is webhook
        if (data.triggerType === 'webhook') {
          const webhookId = crypto.randomUUID()
          await supabase
            .from('workflow_webhooks')
            .insert({
              id: webhookId,
              workflow_id: workflow.id,
              user_id: user.id,
              endpoint_url: `/api/workflows/webhook/${webhookId}`,
              secret_hash: data.triggerConfig?.webhook_secret || null,
              is_active: true
            })
        }

        // Create event subscription if trigger type is event
        if (data.triggerType === 'event' && data.triggerConfig?.event_type) {
          await supabase
            .from('workflow_event_subscriptions')
            .insert({
              workflow_id: workflow.id,
              user_id: user.id,
              event_type: data.triggerConfig.event_type,
              event_filters: data.triggerConfig.event_filters || {},
              is_active: true
            })
        }

        return NextResponse.json({ workflow }, { status: 201 })
      }

      case 'update': {
        const { workflowId, ...updates } = data

        if (!workflowId) {
          return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 })
        }

        const workflow = await workflowEngine.updateWorkflow(user.id, workflowId, {
          name: updates.name,
          description: updates.description,
          trigger_type: updates.triggerType,
          trigger_config: updates.triggerConfig,
          actions: updates.actions,
          conditions: updates.conditions,
          is_active: updates.isActive,
          tags: updates.tags,
          metadata: updates.metadata
        })

        return NextResponse.json({ workflow })
      }

      case 'delete': {
        const { workflowId } = data

        if (!workflowId) {
          return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 })
        }

        await workflowEngine.deleteWorkflow(user.id, workflowId)

        return NextResponse.json({ deleted: true })
      }

      case 'execute': {
        const { workflowId, triggerData } = data

        if (!workflowId) {
          return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 })
        }

        const execution = await workflowEngine.executeWorkflow(
          user.id,
          workflowId,
          triggerData || {}
        )

        return NextResponse.json({ execution })
      }

      case 'cancel_execution': {
        const { executionId } = data

        if (!executionId) {
          return NextResponse.json({ error: 'Execution ID required' }, { status: 400 })
        }

        await workflowEngine.cancelExecution(user.id, executionId)

        return NextResponse.json({ cancelled: true })
      }

      case 'toggle_active': {
        const { workflowId, isActive } = data

        if (!workflowId) {
          return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 })
        }

        const workflow = await workflowEngine.updateWorkflow(user.id, workflowId, {
          is_active: isActive
        })

        // Also toggle related schedule/webhook/subscription
        await supabase
          .from('workflow_schedules')
          .update({ is_active: isActive })
          .eq('workflow_id', workflowId)
          .eq('user_id', user.id)

        await supabase
          .from('workflow_webhooks')
          .update({ is_active: isActive })
          .eq('workflow_id', workflowId)
          .eq('user_id', user.id)

        await supabase
          .from('workflow_event_subscriptions')
          .update({ is_active: isActive })
          .eq('workflow_id', workflowId)
          .eq('user_id', user.id)

        return NextResponse.json({ workflow })
      }

      case 'duplicate': {
        const { workflowId, newName } = data

        if (!workflowId) {
          return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 })
        }

        const original = await workflowEngine.getWorkflow(user.id, workflowId)
        if (!original) {
          return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
        }

        const duplicate = await workflowEngine.createWorkflow(user.id, {
          name: newName || `${original.name} (Copy)`,
          description: original.description,
          trigger_type: original.trigger_type,
          trigger_config: original.trigger_config,
          actions: original.actions,
          conditions: original.conditions,
          is_active: false, // Start inactive
          tags: original.tags,
          metadata: { ...original.metadata, duplicated_from: workflowId }
        })

        return NextResponse.json({ workflow: duplicate })
      }

      case 'create_schedule': {
        const { workflowId, cronExpression, timezone, startsAt, endsAt } = data

        if (!workflowId || !cronExpression) {
          return NextResponse.json(
            { error: 'Workflow ID and cron expression required' },
            { status: 400 }
          )
        }

        const { data: schedule, error } = await supabase
          .from('workflow_schedules')
          .insert({
            workflow_id: workflowId,
            user_id: user.id,
            cron_expression: cronExpression,
            timezone: timezone || 'UTC',
            next_run_at: calculateNextRun(cronExpression),
            starts_at: startsAt,
            ends_at: endsAt,
            is_active: true
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ schedule }, { status: 201 })
      }

      case 'update_schedule': {
        const { scheduleId, ...updates } = data

        if (!scheduleId) {
          return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
        }

        const { data: schedule, error } = await supabase
          .from('workflow_schedules')
          .update({
            cron_expression: updates.cronExpression,
            timezone: updates.timezone,
            is_active: updates.isActive,
            starts_at: updates.startsAt,
            ends_at: updates.endsAt,
            next_run_at: updates.cronExpression
              ? calculateNextRun(updates.cronExpression)
              : undefined
          })
          .eq('id', scheduleId)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ schedule })
      }

      case 'delete_schedule': {
        const { scheduleId } = data

        if (!scheduleId) {
          return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
        }

        const { error } = await supabase
          .from('workflow_schedules')
          .delete()
          .eq('id', scheduleId)
          .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ deleted: true })
      }

      case 'create_webhook': {
        const { workflowId, description, secret } = data

        if (!workflowId) {
          return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 })
        }

        const webhookId = crypto.randomUUID()

        const { data: webhook, error } = await supabase
          .from('workflow_webhooks')
          .insert({
            id: webhookId,
            workflow_id: workflowId,
            user_id: user.id,
            endpoint_url: `/api/workflows/webhook/${webhookId}`,
            description,
            secret_hash: secret, // In production, hash this
            is_active: true
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ webhook }, { status: 201 })
      }

      case 'delete_webhook': {
        const { webhookId } = data

        if (!webhookId) {
          return NextResponse.json({ error: 'Webhook ID required' }, { status: 400 })
        }

        const { error } = await supabase
          .from('workflow_webhooks')
          .delete()
          .eq('id', webhookId)
          .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ deleted: true })
      }

      case 'subscribe_event': {
        const { workflowId, eventType, eventFilters } = data

        if (!workflowId || !eventType) {
          return NextResponse.json(
            { error: 'Workflow ID and event type required' },
            { status: 400 }
          )
        }

        const { data: subscription, error } = await supabase
          .from('workflow_event_subscriptions')
          .insert({
            workflow_id: workflowId,
            user_id: user.id,
            event_type: eventType,
            event_filters: eventFilters || {},
            is_active: true
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ subscription }, { status: 201 })
      }

      case 'unsubscribe_event': {
        const { subscriptionId } = data

        if (!subscriptionId) {
          return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })
        }

        const { error } = await supabase
          .from('workflow_event_subscriptions')
          .delete()
          .eq('id', subscriptionId)
          .eq('user_id', user.id)

        if (error) throw error

        return NextResponse.json({ deleted: true })
      }

      case 'set_variable': {
        const { workflowId, name, value, scope } = data

        if (!workflowId || !name) {
          return NextResponse.json(
            { error: 'Workflow ID and variable name required' },
            { status: 400 }
          )
        }

        const { data: variable, error } = await supabase
          .from('workflow_variables')
          .upsert({
            workflow_id: workflowId,
            user_id: user.id,
            name,
            value,
            scope: scope || 'workflow'
          }, {
            onConflict: 'workflow_id,name'
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ variable })
      }

      case 'test_workflow': {
        const { workflowId, testData } = data

        if (!workflowId) {
          return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 })
        }

        // Execute in test mode (limited actions, no side effects)
        const execution = await workflowEngine.executeWorkflow(
          user.id,
          workflowId,
          { ...testData, _test_mode: true }
        )

        return NextResponse.json({ execution, testMode: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Workflow API POST error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateNextRun(cronExpression: string): string {
  // Simple implementation - in production use a cron parser library
  const next = new Date()
  next.setMinutes(next.getMinutes() + 1)
  next.setSeconds(0)
  next.setMilliseconds(0)
  return next.toISOString()
}

function getWorkflowTemplates(category?: string) {
  const templates = [
    {
      id: 'new_client_onboarding',
      name: 'New Client Onboarding',
      description: 'Automatically send welcome email and create initial project when a new client is added',
      category: 'client_management',
      trigger_type: 'event',
      trigger_config: { event_type: 'client.created' },
      actions: [
        {
          id: 'a1',
          type: 'client.send_email',
          category: 'communication',
          name: 'Send Welcome Email',
          config: { template: 'welcome' },
          order: 1
        },
        {
          id: 'a2',
          type: 'notification.send',
          category: 'communication',
          name: 'Notify Team',
          config: { message: 'New client onboarded!' },
          order: 2
        }
      ]
    },
    {
      id: 'invoice_reminder',
      name: 'Invoice Payment Reminder',
      description: 'Send automatic reminders for overdue invoices',
      category: 'invoicing',
      trigger_type: 'schedule',
      trigger_config: { schedule: '0 9 * * *' }, // Daily at 9 AM
      actions: [
        {
          id: 'a1',
          type: 'invoice.send_reminder',
          category: 'invoicing',
          name: 'Send Reminder',
          config: { reminderType: 'overdue' },
          order: 1
        }
      ]
    },
    {
      id: 'project_completion',
      name: 'Project Completion Handler',
      description: 'Create invoice and archive files when project is marked complete',
      category: 'project_management',
      trigger_type: 'event',
      trigger_config: {
        event_type: 'project.status_changed',
        event_filters: { new_status: 'completed' }
      },
      actions: [
        {
          id: 'a1',
          type: 'invoice.create',
          category: 'invoicing',
          name: 'Create Final Invoice',
          config: {},
          order: 1
        },
        {
          id: 'a2',
          type: 'notification.send',
          category: 'communication',
          name: 'Notify Client',
          config: { message: 'Project completed!' },
          order: 2
        }
      ]
    },
    {
      id: 'task_assignment',
      name: 'Task Auto-Assignment',
      description: 'Automatically assign tasks based on team member availability',
      category: 'team',
      trigger_type: 'event',
      trigger_config: { event_type: 'task.created' },
      actions: [
        {
          id: 'a1',
          type: 'team.assign_task',
          category: 'team',
          name: 'Assign to Available Member',
          config: { strategy: 'least_busy' },
          order: 1
        },
        {
          id: 'a2',
          type: 'notification.send',
          category: 'communication',
          name: 'Notify Assignee',
          config: { message: 'You have been assigned a new task' },
          order: 2
        }
      ]
    },
    {
      id: 'weekly_report',
      name: 'Weekly Status Report',
      description: 'Generate and send weekly project status reports',
      category: 'reporting',
      trigger_type: 'schedule',
      trigger_config: { schedule: '0 9 * * 1' }, // Monday at 9 AM
      actions: [
        {
          id: 'a1',
          type: 'notification.send',
          category: 'communication',
          name: 'Send Weekly Summary',
          config: { type: 'weekly_report' },
          order: 1
        }
      ]
    },
    {
      id: 'file_organization',
      name: 'Automatic File Organization',
      description: 'Move uploaded files to appropriate folders based on type',
      category: 'file_management',
      trigger_type: 'event',
      trigger_config: { event_type: 'file.uploaded' },
      actions: [
        {
          id: 'a1',
          type: 'file.move',
          category: 'file_management',
          name: 'Organize by Type',
          config: { strategy: 'by_type' },
          order: 1
        }
      ]
    }
  ]

  if (category) {
    return templates.filter(t => t.category === category)
  }

  return templates
}

function getActionTypes() {
  return {
    client_management: [
      { type: 'client.create', name: 'Create Client', description: 'Create a new client record' },
      { type: 'client.update', name: 'Update Client', description: 'Update client information' },
      { type: 'client.send_email', name: 'Send Email to Client', description: 'Send an email to the client' }
    ],
    project_management: [
      { type: 'project.create', name: 'Create Project', description: 'Create a new project' },
      { type: 'project.update_status', name: 'Update Project Status', description: 'Change project status' },
      { type: 'project.create_task', name: 'Create Task', description: 'Add a new task to a project' }
    ],
    invoicing: [
      { type: 'invoice.create', name: 'Create Invoice', description: 'Generate a new invoice' },
      { type: 'invoice.send_reminder', name: 'Send Payment Reminder', description: 'Send invoice reminder' }
    ],
    communication: [
      { type: 'notification.send', name: 'Send Notification', description: 'Send an in-app notification' }
    ],
    team: [
      { type: 'team.assign_task', name: 'Assign Task', description: 'Assign a task to a team member' }
    ],
    file_management: [
      { type: 'file.move', name: 'Move File', description: 'Move file to a different folder' }
    ],
    control: [
      { type: 'control.delay', name: 'Delay', description: 'Wait for a specified duration' },
      { type: 'control.condition', name: 'Condition', description: 'Branch based on a condition' },
      { type: 'control.set_variable', name: 'Set Variable', description: 'Set a workflow variable' }
    ],
    custom: [
      { type: 'custom.webhook', name: 'Call Webhook', description: 'Make an HTTP request to an external service' }
    ]
  }
}
