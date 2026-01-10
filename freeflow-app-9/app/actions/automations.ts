'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import type { AutomationWorkflow } from '@/lib/hooks/use-automations'

const logger = createFeatureLogger('automations-actions')

export async function createWorkflow(data: Partial<AutomationWorkflow>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: workflow, error } = await supabase
      .from('automations')
      .insert([{ ...data, user_id: user.id, created_by: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create workflow', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Workflow created successfully', { workflowId: workflow.id })
    revalidatePath('/dashboard/automations-v2')
    return actionSuccess(workflow, 'Workflow created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating workflow', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateWorkflow(id: string, data: Partial<AutomationWorkflow>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: workflow, error } = await supabase
      .from('automations')
      .update({ ...data, updated_by: user.id })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update workflow', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Workflow updated successfully', { workflowId: id })
    revalidatePath('/dashboard/automations-v2')
    return actionSuccess(workflow, 'Workflow updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating workflow', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteWorkflow(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('automations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete workflow', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Workflow deleted successfully', { workflowId: id })
    revalidatePath('/dashboard/automations-v2')
    return actionSuccess({ success: true }, 'Workflow deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting workflow', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishWorkflow(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get current version
    const { data: currentWorkflow } = await supabase
      .from('automations')
      .select('version')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!currentWorkflow) {
      return actionError('Workflow not found', 'NOT_FOUND')
    }

    const { data: workflow, error } = await supabase
      .from('automations')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        published_version: currentWorkflow.version,
        status: 'active',
        updated_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish workflow', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Workflow published successfully', { workflowId: id })
    revalidatePath('/dashboard/automations-v2')
    return actionSuccess(workflow, 'Workflow published successfully')
  } catch (error: any) {
    logger.error('Unexpected error publishing workflow', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function executeWorkflow(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const startTime = Date.now()

    const { data: workflow, error } = await supabase
      .from('automations')
      .update({
        is_running: true,
        status: 'running',
        last_execution_at: new Date().toISOString(),
        total_executions: supabase.raw('total_executions + 1'),
        updated_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start workflow execution', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Simulate workflow execution (in real app, this would execute the steps)
    const executionTime = Math.floor((Date.now() - startTime) / 1000)

    // Update with completion status
    const { data: completedWorkflow, error: updateError } = await supabase
      .from('automations')
      .update({
        is_running: false,
        status: 'active',
        last_execution_status: 'completed',
        successful_executions: supabase.raw('successful_executions + 1'),
        total_duration_seconds: supabase.raw(`total_duration_seconds + ${executionTime}`),
        avg_duration_seconds: supabase.raw(`(total_duration_seconds + ${executionTime}) / total_executions`)
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to complete workflow execution', { error: updateError.message, id })
      return actionError(updateError.message, 'DATABASE_ERROR')
    }

    logger.info('Workflow execution completed successfully', { workflowId: id, executionTime })
    revalidatePath('/dashboard/automations-v2')
    return actionSuccess(completedWorkflow, 'Workflow execution completed successfully')
  } catch (error: any) {
    logger.error('Unexpected error executing workflow', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function toggleWorkflow(id: string, enabled: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: workflow, error } = await supabase
      .from('automations')
      .update({
        is_enabled: enabled,
        status: enabled ? 'active' : 'paused',
        updated_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle workflow', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Workflow toggled successfully', { workflowId: id, enabled })
    revalidatePath('/dashboard/automations-v2')
    return actionSuccess(workflow, `Workflow ${enabled ? 'enabled' : 'paused'} successfully`)
  } catch (error: any) {
    logger.error('Unexpected error toggling workflow', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function approveWorkflow(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: workflow, error } = await supabase
      .from('automations')
      .update({
        approved: true,
        approved_at: new Date().toISOString(),
        approved_by: user.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to approve workflow', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Workflow approved successfully', { workflowId: id })
    revalidatePath('/dashboard/automations-v2')
    return actionSuccess(workflow, 'Workflow approved successfully')
  } catch (error: any) {
    logger.error('Unexpected error approving workflow', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
