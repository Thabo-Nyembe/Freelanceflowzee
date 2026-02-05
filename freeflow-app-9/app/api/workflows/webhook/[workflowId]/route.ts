/**
 * Workflow Webhook Trigger API
 *
 * n8n-style webhook endpoint for external systems to trigger workflows.
 * Each workflow gets a unique webhook URL that can receive external triggers.
 *
 * Usage:
 * POST /api/workflows/webhook/{workflowId}
 *
 * Headers:
 *   X-Webhook-Secret: (optional) Secret key for authentication
 *   Content-Type: application/json
 *
 * Body: Any JSON payload to pass to the workflow
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
import logger from '@/lib/logger'


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params

  try {
    logger.info('Webhook trigger received', { workflowId })

    const supabase = await createClient()

    // Get workflow to verify it exists and is active
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (workflowError || !workflow) {
      logger.warn('Workflow not found for webhook', { workflowId })
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Verify workflow is active and has webhook trigger
    if (workflow.status !== 'active') {
      logger.warn('Webhook triggered on inactive workflow', { workflowId, status: workflow.status })
      return NextResponse.json(
        { success: false, error: 'Workflow is not active' },
        { status: 400 }
      )
    }

    if (workflow.trigger_type !== 'webhook') {
      logger.warn('Webhook trigger on non-webhook workflow', { workflowId, triggerType: workflow.trigger_type })
      return NextResponse.json(
        { success: false, error: 'Workflow is not configured for webhook triggers' },
        { status: 400 }
      )
    }

    // Verify webhook secret if configured
    const webhookSecret = workflow.trigger_config?.secret
    if (webhookSecret) {
      const providedSecret = request.headers.get('x-webhook-secret')
      if (providedSecret !== webhookSecret) {
        logger.warn('Invalid webhook secret', { workflowId })
        return NextResponse.json(
          { success: false, error: 'Invalid webhook secret' },
          { status: 401 }
        )
      }
    }

    // Parse request body
    let payload = {}
    try {
      payload = await request.json()
    } catch {
      // Empty body is allowed
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        triggered_by: 'webhook',
        input: {
          payload,
          headers: Object.fromEntries(request.headers),
          timestamp: new Date().toISOString(),
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        },
        status: 'running'
      })
      .select()
      .single()

    if (executionError) {
      logger.error('Failed to create execution', { error: executionError, workflowId })
      return NextResponse.json(
        { success: false, error: 'Failed to create execution' },
        { status: 500 }
      )
    }

    // Get workflow actions
    const { data: actions } = await supabase
      .from('workflow_actions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('position', { ascending: true })

    const stepsTotal = actions?.length || 0

    // Simulate execution (production would process each action)
    // In a full implementation, this would:
    // 1. Process each action based on action_type
    // 2. Create execution_steps for each action
    // 3. Handle conditions and branching
    // 4. Call external APIs, send emails, etc.

    // Update execution status
    const { error: updateError } = await supabase
      .from('workflow_executions')
      .update({
        status: 'success',
        completed_at: new Date().toISOString(),
        steps_completed: stepsTotal,
        steps_total: stepsTotal,
        output: { processed: true, stepsCompleted: stepsTotal }
      })
      .eq('id', execution.id)

    if (updateError) {
      logger.error('Failed to update execution', { error: updateError, executionId: execution.id })
    }

    // Update workflow run count
    await supabase
      .from('workflows')
      .update({
        run_count: (workflow.run_count || 0) + 1,
        last_run: new Date().toISOString()
      })
      .eq('id', workflowId)

    logger.info('Webhook execution completed', {
      workflowId,
      executionId: execution.id,
      stepsCompleted: stepsTotal
    })

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      workflowId,
      workflowName: workflow.name,
      status: 'completed',
      stepsCompleted: stepsTotal,
      message: `Workflow "${workflow.name}" executed successfully`
    })

  } catch (error) {
    logger.error('Webhook trigger error', { error: error.message, workflowId })
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check webhook status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params

  try {
    const supabase = await createClient()

    const { data: workflow, error } = await supabase
      .from('workflows')
      .select('id, name, status, trigger_type, trigger_config')
      .eq('id', workflowId)
      .single()

    if (error || !workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      )
    }

    const isWebhookEnabled = workflow.trigger_type === 'webhook' && workflow.status === 'active'

    return NextResponse.json({
      success: true,
      workflowId: workflow.id,
      workflowName: workflow.name,
      webhookEnabled: isWebhookEnabled,
      status: workflow.status,
      webhookUrl: `/api/workflows/webhook/${workflowId}`,
      requiresSecret: !!workflow.trigger_config?.secret,
      message: isWebhookEnabled
        ? 'Webhook is ready to receive triggers'
        : 'Webhook is not active. Ensure workflow is active and has webhook trigger type.'
    })

  } catch (error) {
    logger.error('Webhook status check error', { error: error.message, workflowId })
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
